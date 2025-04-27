import { useNetInfo } from '@react-native-community/netinfo';
import { useUser } from '@supabase/auth-helpers-react';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useSQLiteContext } from 'expo-sqlite';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '../db/supabase';
import { useIsMounted } from '../hooks/useIsMounted';
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
  const isMounted = useIsMounted();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] =
    useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isSupabaseAvailable, setIsSupabaseAvailable] =
    useState(true);
  const [
    puzzleCountsSufficient,
    setPuzzleCountsSufficient,
  ] = useState(false);
  const lastPuzzleSyncAttempt = useRef<number>(0);
  const PUZZLE_SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown

  const checkSupabaseClient = useCallback(async () => {
    if (!isMounted.current) return false;
    if (!supabase?.from) {
      console.error(
        'Supabase client not properly initialized'
      );
      setIsSupabaseAvailable(false);
      return false;
    }
    return true;
  }, [isMounted]);

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

  const { syncPuzzlesFromSupabase } = usePuzzleSync(
    netInfo,
    setPuzzleCountsSufficient
  );
  const { syncDailyChallengesFromSupabase } =
    useDailyChallengeSync(netInfo);

  const syncData = useCallback(async () => {
    if (
      isSyncing ||
      !netInfo.isConnected ||
      !isSupabaseAvailable ||
      !isMounted.current
    )
      return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      if (!isMounted.current) return;

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      if (!isMounted.current) return;

      const isSupabaseReady = await checkSupabaseClient();
      if (!isSupabaseReady) {
        console.error(
          'Supabase is not available, skipping sync'
        );
        return;
      }

      if (!isMounted.current) return;

      // Only sync puzzles if counts are not sufficient and cooldown has passed
      const now = Date.now();
      if (
        !puzzleCountsSufficient &&
        now - lastPuzzleSyncAttempt.current >
          PUZZLE_SYNC_COOLDOWN
      ) {
        lastPuzzleSyncAttempt.current = now;
        await syncPuzzlesFromSupabase();
      }

      if (!isMounted.current) return;

      // Always sync daily challenges
      await syncDailyChallengesFromSupabase();

      if (!isMounted.current) return;

      // Only sync game states if user is logged in
      if (user) {
        await syncGameStatesToSupabase();
        await syncGameStatesFromSupabase();
      }

      if (!isMounted.current) return;

      const syncTime = new Date();
      setLastSyncTime(syncTime);

      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
        ['last_sync_time', syncTime.toISOString()]
      );
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Sync error:', error);
      setSyncError(
        error instanceof Error
          ? error
          : new Error('Unknown sync error')
      );
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
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
    puzzleCountsSufficient,
    isMounted,
  ]);

  useEffect(() => {
    if (netInfo.isConnected && isSupabaseAvailable) {
      syncData();
    }
  }, [netInfo.isConnected, isSupabaseAvailable, syncData]);

  // Only set up interval for game state sync
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        netInfo.isConnected &&
        isSupabaseAvailable &&
        user
      ) {
        // Only sync game states on interval
        syncGameStatesToSupabase();
        syncGameStatesFromSupabase();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [
    netInfo.isConnected,
    isSupabaseAvailable,
    user,
    syncGameStatesToSupabase,
    syncGameStatesFromSupabase,
  ]);

  const manualSync = useCallback(async () => {
    // Force puzzle sync on manual sync regardless of counts
    setPuzzleCountsSufficient(false);
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
