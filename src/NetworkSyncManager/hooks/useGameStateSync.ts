import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { supabase } from '../../db/supabase';
import { LocalGameState } from '../../db/types';
import { getGameStateQueryKey } from '../../hooks/useGameStates';
import { handleRetry } from '../utils';

export function useGameStateSync(
  user: any,
  netInfo: any,
  isSupabaseAvailable: boolean,
  checkSupabaseClient: () => Promise<boolean>
) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const syncGameStatesToSupabase = useCallback(async () => {
    if (
      !netInfo.isConnected ||
      !isSupabaseAvailable ||
      !user
    )
      return;

    await handleRetry(async () => {
      const isSupabaseReady = await checkSupabaseClient();
      if (!isSupabaseReady) return;

      try {
        const unsyncedGameStates =
          await db.getAllAsync<LocalGameState>(
            `SELECT * FROM game_states WHERE synced = 0 AND user_id = ?`,
            [user.id]
          );

        if (unsyncedGameStates.length === 0) return;

        console.log(
          `Syncing ${unsyncedGameStates.length} game states to Supabase`
        );

        for (const gameState of unsyncedGameStates) {
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

          const supabaseGameState = {
            id: gameState.id,
            user_id: user.id,
            puzzle_string: gameState.puzzle_string,
            current_state: gameState.current_state
              ? JSON.parse(
                  gameState.current_state as string
                )
              : null,
            notes: gameState.notes
              ? JSON.parse(gameState.notes as string)
              : null,
            is_completed: gameState.is_completed,
            hints_used: gameState.hints_used,
            moves_history: gameState.moves_history
              ? JSON.parse(
                  JSON.stringify(gameState.moves_history)
                )
              : null,
            created_at: gameState.created_at,
            updated_at: gameState.updated_at,
          };

          if (existingData) {
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

          await db.runAsync(
            `UPDATE game_states SET synced = 1 WHERE id = ?`,
            [gameState.id]
          );
        }

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
    });
  }, [
    db,
    user,
    netInfo.isConnected,
    queryClient,
    isSupabaseAvailable,
    checkSupabaseClient,
  ]);

  const syncGameStatesFromSupabase =
    useCallback(async () => {
      if (!netInfo.isConnected || !user) return;

      try {
        const syncTimeResult = await db.getAllAsync<{
          value: string;
        }>(
          `SELECT value FROM app_settings WHERE key = 'last_supabase_sync'`
        );

        const lastSyncTimeStr = syncTimeResult[0]?.value;
        const lastSyncDate = lastSyncTimeStr
          ? new Date(lastSyncTimeStr)
          : new Date(0);

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

        await db.execAsync('BEGIN TRANSACTION');

        try {
          for (const remoteGameState of remoteGameStates) {
            const localGameState = await db.getFirstAsync<{
              updated_at: string;
            }>(
              `SELECT updated_at FROM game_states WHERE id = ?`,
              [remoteGameState.id]
            );

            if (
              localGameState &&
              remoteGameState.updated_at &&
              new Date(localGameState.updated_at) >=
                new Date(remoteGameState.updated_at)
            ) {
              continue;
            }

            await db.runAsync(
              `INSERT OR REPLACE INTO game_states (
              id, user_id, puzzle_string, current_state, notes, is_completed,
              hints_used, moves_history, created_at, updated_at, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                remoteGameState.hints_used,
                JSON.stringify(
                  remoteGameState.moves_history
                ),
                remoteGameState.created_at,
                remoteGameState.updated_at,
                1,
              ]
            );

            const puzzleExists = await db.getFirstAsync<{
              puzzle_string: string;
            }>(
              `SELECT puzzle_string FROM puzzles WHERE puzzle_string = ?`,
              [remoteGameState.puzzle_string]
            );

            if (
              !puzzleExists &&
              remoteGameState.puzzle_string
            ) {
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
                    puzzleData.source || 'sudokodus',
                    puzzleData.created_at,
                  ]
                );
              }
            }
          }

          const now = new Date().toISOString();
          await db.runAsync(
            `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
            ['last_supabase_sync', now]
          );

          await db.execAsync('COMMIT');

          queryClient.invalidateQueries({
            queryKey: ['gameStates'],
          });
        } catch (error) {
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
    }, [db, user, netInfo.isConnected, queryClient]);

  return {
    syncGameStatesToSupabase,
    syncGameStatesFromSupabase,
  };
}
