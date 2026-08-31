import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { GameSession, SyncQueueItem } from '../types/mahjong';

interface MahjongDB extends DBSchema {
  currentGame: {
    key: string;
    value: GameSession;
  };
  gameHistory: {
    key: string;
    value: GameSession;
    indexes: { 'by-startTime': number };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': number };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'MahjongRecordDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MahjongDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MahjongDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MahjongDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('currentGame')) {
          db.createObjectStore('currentGame');
        }
        if (!db.objectStoreNames.contains('gameHistory')) {
          const historyStore = db.createObjectStore('gameHistory', { keyPath: 'id' });
          historyStore.createIndex('by-startTime', 'startTime');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// ---------------- CURRENT GAME STORAGE ----------------
export async function saveCurrentGameDB(game: GameSession): Promise<void> {
  try {
    const db = await getDB();
    await db.put('currentGame', game, 'active');
  } catch (err) {
    console.warn('IndexedDB saveCurrentGameDB failed, fallback to localStorage', err);
    localStorage.setItem('mahjong_active_game', JSON.stringify(game));
  }
}

export async function getCurrentGameDB(): Promise<GameSession | null> {
  try {
    const db = await getDB();
    const game = await db.get('currentGame', 'active');
    if (game) return game;
  } catch (err) {
    console.warn('IndexedDB getCurrentGameDB failed, reading localStorage', err);
  }

  const fallback = localStorage.getItem('mahjong_active_game');
  return fallback ? JSON.parse(fallback) : null;
}

export async function clearCurrentGameDB(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('currentGame', 'active');
  } catch (err) {
    console.warn('IndexedDB clearCurrentGameDB failed', err);
  }
  localStorage.removeItem('mahjong_active_game');
}

// ---------------- GAME HISTORY STORAGE ----------------
export async function saveGameToHistoryDB(game: GameSession): Promise<void> {
  try {
    const db = await getDB();
    await db.put('gameHistory', game);
  } catch (err) {
    console.warn('IndexedDB saveGameToHistoryDB failed', err);
    const existing = getGameHistoryLocal();
    const updated = [game, ...existing.filter((g) => g.id !== game.id)];
    localStorage.setItem('mahjong_history_fallback', JSON.stringify(updated));
  }
}

export async function getAllGameHistoryDB(): Promise<GameSession[]> {
  try {
    const db = await getDB();
    const history = await db.getAllFromIndex('gameHistory', 'by-startTime');
    return history.reverse(); // Newest first
  } catch (err) {
    console.warn('IndexedDB getAllGameHistoryDB failed, reading localStorage', err);
    return getGameHistoryLocal();
  }
}

export async function deleteGameFromHistoryDB(gameId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('gameHistory', gameId);
  } catch (err) {
    console.warn('IndexedDB deleteGameFromHistoryDB failed', err);
    const existing = getGameHistoryLocal();
    const filtered = existing.filter((g) => g.id !== gameId);
    localStorage.setItem('mahjong_history_fallback', JSON.stringify(filtered));
  }
}

function getGameHistoryLocal(): GameSession[] {
  try {
    const raw = localStorage.getItem('mahjong_history_fallback');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ---------------- OFFLINE SYNC QUEUE ----------------
export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put('syncQueue', item);
  } catch (err) {
    console.warn('IndexedDB addToSyncQueue failed', err);
    const queue = getSyncQueueLocal();
    queue.push(item);
    localStorage.setItem('mahjong_sync_queue', JSON.stringify(queue));
  }
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex('syncQueue', 'by-timestamp');
  } catch (err) {
    console.warn('IndexedDB getSyncQueue failed', err);
    return getSyncQueueLocal();
  }
}

export async function removeSyncQueueItem(itemId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('syncQueue', itemId);
  } catch (err) {
    console.warn('IndexedDB removeSyncQueueItem failed', err);
    const queue = getSyncQueueLocal().filter((item) => item.id !== itemId);
    localStorage.setItem('mahjong_sync_queue', JSON.stringify(queue));
  }
}

export async function clearAllSyncQueue(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('syncQueue');
  } catch (err) {
    console.warn('IndexedDB clearAllSyncQueue failed', err);
  }
  localStorage.removeItem('mahjong_sync_queue');
}

function getSyncQueueLocal(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem('mahjong_sync_queue');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ---------------- SETTINGS & CLOUD CONFIG ----------------
export async function getSettingDB<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    const val = await db.get('settings', key);
    return val !== undefined ? val : defaultValue;
  } catch {
    const local = localStorage.getItem(`mahjong_setting_${key}`);
    return local !== null ? JSON.parse(local) : defaultValue;
  }
}

export async function setSettingDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', value, key);
  } catch {
    // fallback
  }
  localStorage.setItem(`mahjong_setting_${key}`, JSON.stringify(value));
}
