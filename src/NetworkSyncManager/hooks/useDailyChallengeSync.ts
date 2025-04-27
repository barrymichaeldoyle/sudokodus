import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { supabase } from '../../db/supabase';
import { getDailyChallengesQueryKey } from '../../hooks/useDailyChallenges';
import { useIsMounted } from '../../hooks/useIsMounted';

export function useDailyChallengeSync(netInfo: any) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();

  const syncDailyChallengesFromSupabase =
    useCallback(async () => {
      if (!netInfo.isConnected || !isMounted.current) {
        return;
      }

      try {
        const today = new Date()
          .toISOString()
          .split('T')[0];

        const todaysChallenges = await db.getAllAsync<{
          id: string;
        }>(
          `SELECT id FROM daily_challenges WHERE date = ?`,
          [today]
        );

        if (!isMounted.current) return;

        if (todaysChallenges.length >= 4) return;

        const { data: remoteChallenges, error } =
          await supabase
            .from('daily_challenges')
            .select('*')
            .eq('date', today);

        if (!isMounted.current) return;

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

        await db.execAsync('BEGIN TRANSACTION');

        try {
          for (const remoteChallenge of remoteChallenges) {
            if (!isMounted.current) {
              await db.execAsync('ROLLBACK');
              return;
            }

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

            const puzzleExists = await db.getFirstAsync<{
              puzzle_string: string;
            }>(
              `SELECT puzzle_string FROM puzzles WHERE puzzle_string = ?`,
              [remoteChallenge.puzzle_string]
            );

            if (
              !puzzleExists &&
              remoteChallenge.puzzle_string
            ) {
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

          if (!isMounted.current) {
            await db.execAsync('ROLLBACK');
            return;
          }

          await db.execAsync('COMMIT');

          if (isMounted.current) {
            queryClient.invalidateQueries({
              queryKey: getDailyChallengesQueryKey(),
            });
          }
        } catch (error) {
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
    }, [db, netInfo.isConnected, queryClient, isMounted]);

  return {
    syncDailyChallengesFromSupabase,
  };
}
