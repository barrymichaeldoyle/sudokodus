import { useNetInfo } from '@react-native-community/netinfo';
import {
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getGameStateQueryKey } from './hooks/useGameStates';

const SYNC_INTERVAL = 60_000; // 1 minute

export function NetworkSyncManager({
  children,
}: PropsWithChildren) {
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const supabase = useSupabaseClient();
  const user = useUser();
  const netInfo = useNetInfo();
  const queryClient = useQueryClient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] =
    useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(
    null
  );

  const syncGameStatesToSupabase = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const unsyncedGameStates = await db.getAllAsync<{
        id: string;
        user_id: string | null;
        puzzle_string: string;
        current_state: string;
        notes: string | null;
        is_completed: number;
        moves_count: number;
        hints_used: number;
        moves_history: string;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT * FROM game_states WHERE synced = 0 AND user_id = ?`,
        [user.id]
      );

      if (unsyncedGameStates.length === 0) {
        return;
      }

      console.log(
        `Syncing ${unsyncedGameStates.length} game states to Supabase`
      );

      // Process each unsynced game state
      for (const gameState of unsyncedGameStates) {
        // Check if the record already exists in Supabase
        const { data: existingData, error: checkError } =
          await supabase
            .from('game_states')
            .select('id')
            .eq('id', gameState.id)
            .maybeSingle();

        if (checkError) {
          console.error(
            'Error checking game state existence:',
            checkError
          );
          continue;
        }

        // Prepare the data for Supabase
        const supabaseGameState = {
          id: gameState.id,
          user_id: user.id,
          puzzle_string: gameState.puzzle_string,
          current_state: JSON.parse(
            gameState.current_state
          ),
          notes: gameState.notes
            ? JSON.parse(gameState.notes)
            : null,
          is_completed: gameState.is_completed === 1,
          moves_count: gameState.moves_count,
          hints_used: gameState.hints_used,
          moves_history: JSON.parse(
            gameState.moves_history
          ),
          created_at: gameState.created_at,
          updated_at: gameState.updated_at,
        };

        // Insert or update the record in Supabase
        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('game_states')
            .update(supabaseGameState)
            .eq('id', gameState.id);

          if (updateError) {
            console.error(
              'Error updating game state:',
              updateError
            );
            continue;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('game_states')
            .insert(supabaseGameState);

          if (insertError) {
            console.error(
              'Error inserting game state:',
              insertError
            );
            continue;
          }
        }

        // Mark the game state as synced in the local database
        await db.runAsync(
          `UPDATE game_states SET synced = 1 WHERE id = ?`,
          [gameState.id]
        );
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: getGameStateQueryKey(user.id),
      });
    } catch (error) {
      console.error(
        'Error syncing game states to Supabase:',
        error
      );
      throw error;
    }
  }, [db, supabase, user, queryClient]);

  // Function to sync game states from Supabase
  const syncGameStatesFromSupabase =
    useCallback(async () => {
      if (!user) {
        return;
      }

      try {
        // Get the latest sync time from local database
        const syncTimeResult = await db.getAllAsync<{
          value: string;
        }>(
          `SELECT value FROM app_settings WHERE key = 'last_supabase_sync'`
        );

        const lastSyncTimeStr = syncTimeResult[0]?.value;
        const lastSyncDate = lastSyncTimeStr
          ? new Date(lastSyncTimeStr)
          : new Date(0);

        // Get game states updated after the last sync
        const { data: remoteGameStates, error } =
          await supabase
            .from('game_states')
            .select('*')
            .eq('user_id', user.id)
            .gt('updated_at', lastSyncDate.toISOString());

        if (error) {
          console.error(
            'Error fetching game states from Supabase:',
            error
          );
          throw error;
        }

        if (
          !remoteGameStates ||
          remoteGameStates.length === 0
        )
          return;

        console.log(
          `Syncing ${remoteGameStates.length} game states from Supabase`
        );

        // Start a transaction
        await db.execAsync('BEGIN TRANSACTION');

        try {
          // Process each remote game state
          for (const remoteGameState of remoteGameStates) {
            // Check if the game state exists locally
            const localGameState = await db.getFirstAsync<{
              updated_at: string;
            }>(
              `SELECT updated_at FROM game_states WHERE id = ?`,
              [remoteGameState.id]
            );

            // If the local game state is newer, skip this update
            if (
              localGameState &&
              new Date(localGameState.updated_at) >=
                new Date(remoteGameState.updated_at)
            ) {
              continue;
            }

            // Insert or update the game state locally
            await db.runAsync(
              `INSERT OR REPLACE INTO game_states (
              id, user_id, puzzle_string, current_state, notes, is_completed,
              moves_count, hints_used, moves_history, created_at, updated_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                remoteGameState.id,
                remoteGameState.user_id,
                remoteGameState.puzzle_string,
                JSON.stringify(
                  remoteGameState.current_state
                ),
                remoteGameState.notes
                  ? JSON.stringify(remoteGameState.notes)
                  : null,
                remoteGameState.is_completed ? 1 : 0,
                remoteGameState.moves_count,
                remoteGameState.hints_used,
                JSON.stringify(
                  remoteGameState.moves_history
                ),
                remoteGameState.created_at,
                remoteGameState.updated_at,
                1, // Mark as synced
              ]
            );

            // Check if the puzzle exists locally
            const puzzleExists = await db.getFirstAsync<{
              puzzle_string: string;
            }>(
              `SELECT puzzle_string FROM puzzles WHERE puzzle_string = ?`,
              [remoteGameState.puzzle_string]
            );

            // If the puzzle doesn't exist locally, fetch it from Supabase
            if (!puzzleExists) {
              const {
                data: puzzleData,
                error: puzzleError,
              } = await supabase
                .from('puzzles')
                .select('*')
                .eq(
                  'puzzle_string',
                  remoteGameState.puzzle_string
                )
                .maybeSingle();

              if (puzzleError) {
                console.error(
                  'Error fetching puzzle from Supabase:',
                  puzzleError
                );
                continue;
              }

              if (puzzleData) {
                // Insert the puzzle locally
                await db.runAsync(
                  `INSERT OR IGNORE INTO puzzles (
                  puzzle_string, rating, difficulty, is_symmetric, clue_count, source, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    puzzleData.puzzle_string,
                    puzzleData.rating,
                    puzzleData.difficulty,
                    puzzleData.is_symmetric ? 1 : 0,
                    puzzleData.clue_count,
                    puzzleData.source || 'sudokudus',
                    puzzleData.created_at,
                  ]
                );
              }
            }
          }

          // Update the last sync time
          const now = new Date().toISOString();
          await db.runAsync(
            `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
            ['last_supabase_sync', now]
          );

          // Commit the transaction
          await db.execAsync('COMMIT');

          // Update the last sync time state
          setLastSyncTime(new Date());

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ['gameStates'],
          });
        } catch (error) {
          // Rollback the transaction on error
          await db.execAsync('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error(
          'Error syncing game states from Supabase:',
          error
        );
        throw error;
      }
    }, [db, supabase, user, queryClient]);

  // Function to sync puzzles from Supabase
  const syncPuzzlesFromSupabase = useCallback(async () => {
    if (!user) return;

    try {
      // Get the count of puzzles in the local database
      const localPuzzleCount = await db.getFirstAsync<{
        count: number;
      }>(`SELECT COUNT(*) as count FROM puzzles`);

      // If we already have a good number of puzzles, skip this sync
      if (localPuzzleCount && localPuzzleCount.count >= 100)
        return;

      // Get puzzles from Supabase
      const { data: remotePuzzles, error } = await supabase
        .from('puzzles')
        .select('*')
        .limit(500); // Fetch a batch of puzzles

      if (error) {
        console.error(
          'Error fetching puzzles from Supabase:',
          error
        );
        throw error;
      }

      if (!remotePuzzles || remotePuzzles.length === 0)
        return;

      console.log(
        `Syncing ${remotePuzzles.length} puzzles from Supabase`
      );

      // Start a transaction
      await db.execAsync('BEGIN TRANSACTION');

      try {
        // Process each remote puzzle
        for (const remotePuzzle of remotePuzzles) {
          // Insert the puzzle locally
          await db.runAsync(
            `INSERT OR IGNORE INTO puzzles (
              puzzle_string, rating, difficulty, is_symmetric, clue_count, source, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              remotePuzzle.puzzle_string,
              remotePuzzle.rating,
              remotePuzzle.difficulty,
              remotePuzzle.is_symmetric ? 1 : 0,
              remotePuzzle.clue_count,
              remotePuzzle.source || 'sudokudus',
              remotePuzzle.created_at,
            ]
          );
        }

        // Commit the transaction
        await db.execAsync('COMMIT');

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['puzzles'],
        });
      } catch (error) {
        // Rollback the transaction on error
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(
        'Error syncing puzzles from Supabase:',
        error
      );
      throw error;
    }
  }, [db, supabase, user, queryClient]);

  // Function to sync daily challenges from Supabase
  const syncDailyChallengesFromSupabase =
    useCallback(async () => {
      if (!user) return;

      try {
        // Get today's date
        const today = new Date()
          .toISOString()
          .split('T')[0];

        // Check if we already have today's challenges
        const todaysChallenges = await db.getAllAsync<{
          id: string;
        }>(
          `SELECT id FROM daily_challenges WHERE date = ?`,
          [today]
        );

        // If we already have today's challenges, skip this sync
        if (todaysChallenges.length >= 4) return;

        // Get daily challenges from Supabase
        const { data: remoteChallenges, error } =
          await supabase
            .from('daily_challenges')
            .select('*')
            .eq('date', today);

        if (error) {
          console.error(
            'Error fetching daily challenges from Supabase:',
            error
          );
          throw error;
        }

        if (
          !remoteChallenges ||
          remoteChallenges.length === 0
        )
          return;

        console.log(
          `Syncing ${remoteChallenges.length} daily challenges from Supabase`
        );

        // Start a transaction
        await db.execAsync('BEGIN TRANSACTION');

        try {
          // Process each remote challenge
          for (const remoteChallenge of remoteChallenges) {
            // Insert the challenge locally
            await db.runAsync(
              `INSERT OR REPLACE INTO daily_challenges (
              id, date, difficulty, puzzle_string
            ) VALUES (?, ?, ?, ?)`,
              [
                remoteChallenge.id,
                remoteChallenge.date,
                remoteChallenge.difficulty,
                remoteChallenge.puzzle_string,
              ]
            );

            // Check if the puzzle exists locally
            const puzzleExists = await db.getFirstAsync<{
              puzzle_string: string;
            }>(
              `SELECT puzzle_string FROM puzzles WHERE puzzle_string = ?`,
              [remoteChallenge.puzzle_string]
            );

            // If the puzzle doesn't exist locally, fetch it from Supabase
            if (!puzzleExists) {
              const {
                data: puzzleData,
                error: puzzleError,
              } = await supabase
                .from('puzzles')
                .select('*')
                .eq(
                  'puzzle_string',
                  remoteChallenge.puzzle_string
                )
                .maybeSingle();

              if (puzzleError) {
                console.error(
                  'Error fetching puzzle from Supabase:',
                  puzzleError
                );
                continue;
              }

              if (puzzleData) {
                // Insert the puzzle locally
                await db.runAsync(
                  `INSERT OR IGNORE INTO puzzles (
                  puzzle_string, rating, difficulty, is_symmetric, clue_count, source, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [
                    puzzleData.puzzle_string,
                    puzzleData.rating,
                    puzzleData.difficulty,
                    puzzleData.is_symmetric ? 1 : 0,
                    puzzleData.clue_count,
                    puzzleData.source || 'sudokudus',
                    puzzleData.created_at,
                  ]
                );
              }
            }
          }

          // Commit the transaction
          await db.execAsync('COMMIT');

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ['dailyChallenges'],
          });
        } catch (error) {
          // Rollback the transaction on error
          await db.execAsync('ROLLBACK');
          throw error;
        }
      } catch (error) {
        console.error(
          'Error syncing daily challenges from Supabase:',
          error
        );
        throw error;
      }
    }, [db, supabase, user, queryClient]);

  // Main sync function
  const syncData = useCallback(async () => {
    // Skip if already syncing, offline, or no user
    if (isSyncing || !netInfo.isConnected || !user) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      // Create app_settings table if it doesn't exist
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Perform sync operations
      await syncGameStatesToSupabase();
      await syncGameStatesFromSupabase();
      await syncPuzzlesFromSupabase();
      await syncDailyChallengesFromSupabase();

      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);

      // Store last sync time in database
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
    syncGameStatesToSupabase,
    syncGameStatesFromSupabase,
    syncPuzzlesFromSupabase,
    syncDailyChallengesFromSupabase,
  ]);

  // Sync on mount and when network status changes
  useEffect(() => {
    if (netInfo.isConnected && user) {
      syncData();
    }
  }, [netInfo.isConnected, user, syncData]);

  // Set up periodic sync
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (netInfo.isConnected && user) {
        syncData();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [netInfo.isConnected, user, syncData]);

  // Manual sync function that can be exposed to components
  const manualSync = useCallback(async () => {
    await syncData();
  }, [syncData]);

  // Create a context value to expose sync state and functions
  const syncContextValue = {
    isSyncing,
    lastSyncTime,
    syncError,
    isOnline: netInfo.isConnected,
    manualSync,
  };

  return (
    <SyncContext.Provider value={syncContextValue}>
      {children}
    </SyncContext.Provider>
  );
}

// Create a context for sync state
interface SyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: Error | null;
  isOnline: boolean | null;
  manualSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType>({
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  isOnline: null,
  manualSync: async () => {},
});

// Hook to use the sync context
export function useSyncContext() {
  return useContext(SyncContext);
}
