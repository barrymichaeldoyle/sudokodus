import { useNetInfo } from '@react-native-community/netinfo';
import { useUser } from '@supabase/auth-helpers-react';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useSQLiteContext } from 'expo-sqlite';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../db/supabase';
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
  SYNC_INTERVAL,
} from './constants';
import { SyncContext } from './context';
import { useDailyChallengeSync } from './hooks/useDailyChallengeSync';
import { useGameStateSync } from './hooks/useGameStateSync';
import { usePuzzleSync } from './hooks/usePuzzleSync';

export function NetworkSyncManager({
  children,
}: PropsWithChildren) {
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const user = useUser();
  const netInfo = useNetInfo();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] =
    useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isSupabaseAvailable, setIsSupabaseAvailable] =
    useState(true);

  const checkSupabaseClient = useCallback(async () => {
    if (!supabase?.from) {
      console.error(
        'Supabase client not properly initialized'
      );
      setIsSupabaseAvailable(false);
      return false;
    }
    return true;
  }, []);

  const handleRetry = useCallback(
    async (operation: () => Promise<void>) => {
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.error('Max retry attempts reached');
        setSyncError(
          new Error('Max retry attempts reached')
        );
        return;
      }

      try {
        await operation();
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Operation failed:', error);
        setRetryCount(prev => prev + 1);

        if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
          setTimeout(() => {
            handleRetry(operation);
          }, RETRY_DELAY);
        } else {
          setSyncError(
            error instanceof Error
              ? error
              : new Error('Operation failed')
          );
        }
      }
    },
    [retryCount]
  );

  const {
    syncGameStatesToSupabase,
    syncGameStatesFromSupabase,
  } = useGameStateSync(
    user,
    netInfo,
    isSupabaseAvailable,
    checkSupabaseClient
  );

  const { syncPuzzlesFromSupabase } =
    usePuzzleSync(netInfo);
  const { syncDailyChallengesFromSupabase } =
    useDailyChallengeSync(netInfo);

  const syncData = useCallback(async () => {
    if (
      isSyncing ||
      !netInfo.isConnected ||
      !isSupabaseAvailable
    )
      return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Check if we need to sync puzzles
      const [depletedResult, lastSyncResult] =
        await Promise.all([
          db.getAllAsync<{ value: string }>(
            `SELECT value FROM app_settings WHERE key = 'puzzle_database_depleted'`
          ),
          db.getAllAsync<{ value: string }>(
            `SELECT value FROM app_settings WHERE key = 'last_puzzle_sync'`
          ),
        ]);

      const isPuzzleDatabaseDepleted =
        depletedResult[0]?.value === 'true';
      const lastPuzzleSync = lastSyncResult[0]?.value
        ? new Date(lastSyncResult[0].value)
        : null;
      const shouldSyncPuzzles =
        !isPuzzleDatabaseDepleted &&
        (!lastPuzzleSync ||
          Date.now() - lastPuzzleSync.getTime() >
            SYNC_INTERVAL);

      const isSupabaseReady = await checkSupabaseClient();
      if (!isSupabaseReady) {
        console.error(
          'Supabase is not available, skipping sync'
        );
        return;
      }

      if (shouldSyncPuzzles) {
        await syncPuzzlesFromSupabase();
        await db.runAsync(
          `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
          ['last_puzzle_sync', new Date().toISOString()]
        );
      }

      // Always sync daily challenges
      await syncDailyChallengesFromSupabase();

      // Only sync game states if user is logged in
      if (user) {
        await syncGameStatesToSupabase();
        await syncGameStatesFromSupabase();
      }

      const now = new Date();
      setLastSyncTime(now);

      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
        ['last_sync_time', now.toISOString()]
      );
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(
        error instanceof Error
          ? error
          : new Error('Unknown sync error')
      );
    } finally {
      setIsSyncing(false);
    }
  }, [
    isSyncing,
    netInfo.isConnected,
    user,
    db,
    isSupabaseAvailable,
    checkSupabaseClient,
    syncGameStatesToSupabase,
    syncGameStatesFromSupabase,
    syncPuzzlesFromSupabase,
    syncDailyChallengesFromSupabase,
  ]);

  useEffect(() => {
    if (netInfo.isConnected && isSupabaseAvailable) {
      syncData();
    }
  }, [netInfo.isConnected, isSupabaseAvailable, syncData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (netInfo.isConnected && isSupabaseAvailable) {
        syncData();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [netInfo.isConnected, isSupabaseAvailable, syncData]);

  const manualSync = useCallback(async () => {
    await syncData();
  }, [syncData]);

  const syncContextValue = {
    isSyncing,
    lastSyncTime,
    syncError,
    isOnline: netInfo.isConnected,
    isSupabaseAvailable,
    manualSync,
  };

  return (
    <SyncContext.Provider value={syncContextValue}>
      {children}
    </SyncContext.Provider>
  );
}
