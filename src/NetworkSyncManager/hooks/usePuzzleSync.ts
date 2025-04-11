import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { supabase } from '../../db/supabase';
import {
  MIN_PUZZLE_COUNT,
  PUZZLE_BATCH_SIZE,
} from '../constants';

export function usePuzzleSync(
  netInfo: any,
  setPuzzleCountsSufficient: (value: boolean) => void
) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const syncPuzzlesFromSupabase = useCallback(async () => {
    if (!netInfo.isConnected) return;

    try {
      // Check puzzle counts by difficulty
      const difficultyCounts = await db.getAllAsync<{
        difficulty: string;
        count: number;
      }>(`
        SELECT difficulty, COUNT(*) as count 
        FROM puzzles 
        GROUP BY difficulty
      `);

      // Check if we need to sync any difficulty level
      // If difficultyCounts is empty, we definitely need to sync
      const needsSync =
        difficultyCounts.length === 0 ||
        difficultyCounts.some(
          ({ count }) => count < MIN_PUZZLE_COUNT
        );

      if (!needsSync) {
        console.log(
          'Local puzzle counts are sufficient, skipping sync'
        );
        setPuzzleCountsSufficient(true);
        return;
      }

      setPuzzleCountsSufficient(false);

      // Check if remote database is depleted
      const depletedResult = await db.getAllAsync<{
        value: string;
      }>(
        `SELECT value FROM app_settings WHERE key = 'puzzle_database_depleted'`
      );

      if (depletedResult[0]?.value === 'true') {
        console.log(
          'Remote puzzle database is depleted, skipping sync'
        );
        return;
      }

      const { data: remotePuzzles, error } = await supabase
        .from('puzzles')
        .select('*')
        .limit(PUZZLE_BATCH_SIZE);

      if (error) {
        console.error(
          'Error fetching puzzles from Supabase:',
          error
        );
        throw error;
      }

      if (!remotePuzzles || remotePuzzles.length === 0) {
        console.log(
          'No more puzzles available in Supabase database'
        );
        await db.runAsync(
          `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
          ['puzzle_database_depleted', 'true']
        );
        return;
      }

      console.log(
        `Syncing ${remotePuzzles.length} puzzles from Supabase`
      );

      await db.execAsync('BEGIN TRANSACTION');

      try {
        for (const remotePuzzle of remotePuzzles) {
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
              remotePuzzle.source || 'sudokodus',
              remotePuzzle.created_at,
            ]
          );
        }

        await db.execAsync('COMMIT');

        queryClient.invalidateQueries({
          queryKey: ['puzzles'],
        });
      } catch (error) {
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
  }, [
    db,
    netInfo.isConnected,
    queryClient,
    setPuzzleCountsSufficient,
  ]);

  return {
    syncPuzzlesFromSupabase,
  };
}
