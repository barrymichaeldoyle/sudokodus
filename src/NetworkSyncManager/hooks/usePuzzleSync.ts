import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { supabase } from '../../db/supabase';
import {
  MIN_PUZZLE_COUNT,
  PUZZLE_BATCH_SIZE,
} from '../constants';

export function usePuzzleSync(netInfo: any) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const syncPuzzlesFromSupabase = useCallback(async () => {
    if (!netInfo.isConnected) return;

    try {
      const localPuzzleCount = await db.getFirstAsync<{
        count: number;
      }>(`SELECT COUNT(*) as count FROM puzzles`);

      if (
        localPuzzleCount &&
        localPuzzleCount.count >= MIN_PUZZLE_COUNT
      )
        return;

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
  }, [db, netInfo.isConnected, queryClient]);

  return {
    syncPuzzlesFromSupabase,
  };
}
