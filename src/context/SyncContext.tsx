import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CloudConfig } from '../types/mahjong';
import {
  getCloudConfig,
  saveCloudConfig,
  subscribeSyncStatus,
  processOfflineSyncQueue,
  generateRoomCode,
} from '../services/syncService';
import { getSyncQueue } from '../services/db';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueCount: number;
  lastSyncedAt?: number;
  config: CloudConfig;
  updateCloudConfig: (config: Partial<CloudConfig>) => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  createNewRoom: () => Promise<string>;
  leaveRoom: () => Promise<void>;
  triggerSync: () => Promise<boolean>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | undefined>(undefined);
  const [config, setConfig] = useState<CloudConfig>({
    roomCode: '',
    enabled: false,
    supabaseUrl: '',
    supabaseAnonKey: '',
  });

  useEffect(() => {
    // Load initial config
    getCloudConfig().then((cfg) => {
      setConfig(cfg);
      setLastSyncedAt(cfg.lastSyncedAt);
    });

    // Check initial queue count
    getSyncQueue().then((q) => setQueueCount(q.length));

    // Online / Offline window listeners
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineSyncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync service status
    const unsubscribe = subscribeSyncStatus((status) => {
      setIsOnline(status.isOnline);
      setIsSyncing(status.isSyncing);
      setQueueCount(status.queueCount);
      if (status.lastSyncedAt) {
        setLastSyncedAt(status.lastSyncedAt);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const updateCloudConfig = useCallback(async (newFields: Partial<CloudConfig>) => {
    const updated = { ...config, ...newFields };
    setConfig(updated);
    await saveCloudConfig(updated);
    if (updated.enabled && updated.roomCode && isOnline) {
      await processOfflineSyncQueue();
    }
  }, [config, isOnline]);

  const joinRoom = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    await updateCloudConfig({
      roomCode: normalized,
      enabled: true,
    });
  }, [updateCloudConfig]);

  const createNewRoom = useCallback(async () => {
    const newCode = generateRoomCode();
    await updateCloudConfig({
      roomCode: newCode,
      enabled: true,
    });
    return newCode;
  }, [updateCloudConfig]);

  const leaveRoom = useCallback(async () => {
    await updateCloudConfig({
      roomCode: '',
      enabled: false,
    });
  }, [updateCloudConfig]);

  const triggerSync = useCallback(async () => {
    return await processOfflineSyncQueue();
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        queueCount,
        lastSyncedAt,
        config,
        updateCloudConfig,
        joinRoom,
        createNewRoom,
        leaveRoom,
        triggerSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
