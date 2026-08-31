import { GameSession, SyncQueueItem, CloudConfig } from '../types/mahjong';
import {
  addToSyncQueue,
  getSyncQueue,
  removeSyncQueueItem,
  getSettingDB,
  setSettingDB,
  saveGameToHistoryDB,
} from './db';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const CLOUD_CONFIG_KEY = 'cloud_config';

export const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  roomCode: 'PERSONAL',
  enabled: true, // Auto-enabled for Firebase
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

export async function getCloudConfig(): Promise<CloudConfig> {
  return await getSettingDB<CloudConfig>(CLOUD_CONFIG_KEY, DEFAULT_CLOUD_CONFIG);
}

export async function saveCloudConfig(config: CloudConfig): Promise<void> {
  await setSettingDB(CLOUD_CONFIG_KEY, config);
}

export function generateRoomCode(): string {
  return 'PERSONAL'; // Single user mode
}

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

  await addToSyncQueue(queueItem);
  const queue = await getSyncQueue();
  notifySyncStatus(false, queue.length, config.lastSyncedAt);

  if (isOnline) {
    return await processOfflineSyncQueue();
  }

  return false;
}

export async function processOfflineSyncQueue(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const queue = await getSyncQueue();
    notifySyncStatus(false, queue.length);
    return false;
  }

  const queue = await getSyncQueue();
  const config = await getCloudConfig();

  if (queue.length === 0) {
    notifySyncStatus(false, 0, config.lastSyncedAt);
    return true;
  }

  notifySyncStatus(true, queue.length, config.lastSyncedAt);

  try {
    for (const item of queue) {
      let success = await uploadToFirebase(item);
      if (success) {
        await removeSyncQueueItem(item.id);
        await saveGameToHistoryDB(item.data); // Keep local up to date
      }
    }

    const updatedConfig = { ...config, lastSyncedAt: Date.now() };
    await saveCloudConfig(updatedConfig);

    const remainingQueue = await getSyncQueue();
    notifySyncStatus(false, remainingQueue.length, updatedConfig.lastSyncedAt);
    return remainingQueue.length === 0;
  } catch (err) {
    console.error('Firebase auto sync failed:', err);
    const remainingQueue = await getSyncQueue();
    notifySyncStatus(false, remainingQueue.length, config.lastSyncedAt);
    return false;
  }
}

export function subscribeToRemoteSessions(callback: (sessions: GameSession[]) => void): () => void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return () => {};
  }

  const q = query(collection(db, 'mahjong_sessions'), orderBy('startTime', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sessions: GameSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as GameSession);
    });
    
    // Merge into local DB for offline access later
    sessions.forEach(session => saveGameToHistoryDB(session).catch(console.error));
    
    // Notify the UI
    callback(sessions);
  }, (err) => {
    console.warn('Failed to listen to Firebase:', err);
  });

  return unsubscribe;
}

async function uploadToFirebase(item: SyncQueueItem): Promise<boolean> {
  try {
    const docRef = doc(db, 'mahjong_sessions', item.data.id);
    // Firestore rejects `undefined` values. 
    // JSON.stringify strips undefined properties automatically.
    const cleanData = JSON.parse(JSON.stringify(item.data));
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (e) {
    console.error('Error uploading to Firebase:', e);
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineSyncQueue();
  });
  window.addEventListener('offline', () => {
    getSyncQueue().then((queue) => notifySyncStatus(false, queue.length));
  });
}
