import { createContext, useContext } from 'react';

export interface SyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: Error | null;
  isOnline: boolean | null;
  isSupabaseAvailable: boolean;
  manualSync: () => Promise<void>;
}

const defaultContext: SyncContextType = {
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  isOnline: null,
  isSupabaseAvailable: true,
  manualSync: async () => {},
};

export const SyncContext =
  createContext<SyncContextType>(defaultContext);

export function useSyncContext() {
  return useContext(SyncContext);
}
