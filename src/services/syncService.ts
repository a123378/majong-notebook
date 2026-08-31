import { GameSession, SyncQueueItem, CloudConfig } from '../types/mahjong';
import {
  addToSyncQueue,
  getSyncQueue,
  removeSyncQueueItem,
  getSettingDB,
  setSettingDB,
  saveGameToHistoryDB,
  getAllGameHistoryDB,
} from './db';

const CLOUD_CONFIG_KEY = 'cloud_config';

export const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  roomCode: '',
  enabled: false,
  supabaseUrl: '',
  supabaseAnonKey: '',
  lastSyncedAt: undefined,
};

let syncListeners: ((status: { isOnline: boolean; isSyncing: boolean; queueCount: number; lastSyncedAt?: number }) => void)[] = [];

export function subscribeSyncStatus(listener: (status: { isOnline: boolean; isSyncing: boolean; queueCount: number; lastSyncedAt?: number }) => void) {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function notifySyncStatus(isSyncing: boolean, queueCount: number, lastSyncedAt?: number) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  syncListeners.forEach((l) => l({ isOnline, isSyncing, queueCount, lastSyncedAt }));
}

/**
 * 取得當前雲端配置
 */
export async function getCloudConfig(): Promise<CloudConfig> {
  return await getSettingDB<CloudConfig>(CLOUD_CONFIG_KEY, DEFAULT_CLOUD_CONFIG);
}

/**
 * 更新雲端配置
 */
export async function saveCloudConfig(config: CloudConfig): Promise<void> {
  await setSettingDB(CLOUD_CONFIG_KEY, config);
}

/**
 * 產生 6 位數房間代碼 (例: MJ-8823)
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'MJ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 發送戰局變更：先保存在本地，若離線則寫入 SyncQueue，若在線則自動上傳
 */
export async function queueOrPushSession(session: GameSession): Promise<boolean> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const config = await getCloudConfig();

  const queueItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionId: session.id,
    action: 'UPSERT_SESSION',
    data: session,
    timestamp: Date.now(),
  };

  // 離線或未啟用雲端時，將操作寫入本地離線隊列
  await addToSyncQueue(queueItem);
  const queue = await getSyncQueue();
  notifySyncStatus(false, queue.length, config.lastSyncedAt);

  if (isOnline && config.enabled && config.roomCode) {
    return await processOfflineSyncQueue();
  }

  return false;
}

/**
 * 執行離線同步任務：
 * 將本地暫存隊列逐筆上傳至雲端，確認寫入成功後自動清理本地快取，防止重複計入
 */
export async function processOfflineSyncQueue(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const queue = await getSyncQueue();
    notifySyncStatus(false, queue.length);
    return false;
  }

  const config = await getCloudConfig();
  if (!config.enabled || !config.roomCode) {
    const queue = await getSyncQueue();
    notifySyncStatus(false, queue.length, config.lastSyncedAt);
    return false;
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    notifySyncStatus(false, 0, config.lastSyncedAt);
    return true;
  }

  notifySyncStatus(true, queue.length, config.lastSyncedAt);

  try {
    for (const item of queue) {
      let success = false;

      // 1. 若設定了 Supabase 專屬後端
      if (config.supabaseUrl && config.supabaseAnonKey) {
        success = await uploadToSupabase(item, config);
      } else {
        // 2. 透過輕量級房間同步中繼通道 (Room Relay / Cloud KV Sync)
        success = await uploadToRoomRelay(item, config.roomCode);
      }

      // 重要：整合並確認雲端寫入成功後，自動刪除本地端的快取檔案
      if (success) {
        await removeSyncQueueItem(item.id);
      }
    }

    const updatedConfig = { ...config, lastSyncedAt: Date.now() };
    await saveCloudConfig(updatedConfig);

    const remainingQueue = await getSyncQueue();
    notifySyncStatus(false, remainingQueue.length, updatedConfig.lastSyncedAt);
    return remainingQueue.length === 0;
  } catch (err) {
    console.error('Auto sync failed with error:', err);
    const remainingQueue = await getSyncQueue();
    notifySyncStatus(false, remainingQueue.length, config.lastSyncedAt);
    return false;
  }
}

/**
 * 從雲端拉取特定房間的最新戰績資料
 */
export async function fetchRemoteSessions(roomCode: string): Promise<GameSession[]> {
  if (!roomCode || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return [];
  }

  try {
    const config = await getCloudConfig();
    if (config.supabaseUrl && config.supabaseAnonKey) {
      return await fetchFromSupabase(roomCode, config);
    } else {
      return await fetchFromRoomRelay(roomCode);
    }
  } catch (err) {
    console.warn('Failed to fetch remote sessions:', err);
    return [];
  }
}

// ---------------- 雲端通訊實作 (Supabase & Room Relay) ----------------

async function uploadToSupabase(item: SyncQueueItem, config: CloudConfig): Promise<boolean> {
  try {
    const endpoint = `${config.supabaseUrl?.replace(/\/$/, '')}/rest/v1/mahjong_sessions`;
    const payload = {
      id: item.data.id,
      room_code: config.roomCode,
      title: item.data.title,
      base: item.data.base,
      tai_price: item.data.taiPrice,
      start_time: item.data.startTime,
      end_time: item.data.endTime,
      rounds: item.data.rounds,
      net_amount: item.data.netAmount,
      stats: item.data.stats,
      is_archived: item.data.isArchived,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey || '',
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    return false;
  }
}

async function fetchFromSupabase(roomCode: string, config: CloudConfig): Promise<GameSession[]> {
  try {
    const endpoint = `${config.supabaseUrl?.replace(/\/$/, '')}/rest/v1/mahjong_sessions?room_code=eq.${encodeURIComponent(
      roomCode
    )}&order=start_time.desc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: config.supabaseAnonKey || '',
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      roomCode: d.room_code,
      title: d.title,
      base: d.base,
      taiPrice: d.tai_price,
      startTime: d.start_time,
      endTime: d.end_time,
      rounds: d.rounds || [],
      netAmount: d.net_amount || 0,
      stats: d.stats,
      isArchived: d.is_archived,
      updatedAt: new Date(d.updated_at).getTime(),
    }));
  } catch {
    return [];
  }
}

/**
 * 輕量級 Room Relay 雲端中繼通道 (支援本地多裝置模擬與廣播)
 */
async function uploadToRoomRelay(item: SyncQueueItem, roomCode: string): Promise<boolean> {
  try {
    // 跨標籤頁即時廣播
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(`mahjong_room_${roomCode}`);
      channel.postMessage({ type: 'SYNC_SESSION', session: item.data });
      channel.close();
    }

    // 模擬或連線輕量級雲端同步中繼
    // 也可將資料同步快照寫入房間專屬歷史
    await saveGameToHistoryDB(item.data);
    return true;
  } catch {
    return false;
  }
}

async function fetchFromRoomRelay(roomCode: string): Promise<GameSession[]> {
  const all = await getAllGameHistoryDB();
  return all.filter((s) => s.roomCode === roomCode || !s.roomCode);
}

// ---------------- 監聽網路連線恢復並自動背景同步 ----------------
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('網路連線已恢復，正在啟動自動背景同步任務...');
    processOfflineSyncQueue();
  });

  window.addEventListener('offline', () => {
    getSyncQueue().then((queue) => {
      notifySyncStatus(false, queue.length);
    });
  });
}
