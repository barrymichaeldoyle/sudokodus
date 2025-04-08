import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { DifficultyLevel, Puzzle } from '../db/types';

export function getPuzzlesQueryKey(
  difficulty: DifficultyLevel
) {
  return ['puzzles', difficulty];
}
export function getPuzzleQueryKey(
  puzzleString: string | null
) {
  return ['puzzle', puzzleString];
}

/**
 * Fetches puzzles from Supabase and stores them locally
 * @param difficulty - The difficulty level of the puzzles to fetch
 * @returns The react-query object for fetching puzzles
 */
export function usePuzzles(difficulty: DifficultyLevel) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: ['puzzles', difficulty],
    queryFn: async () => {
      const puzzles = await db.getAllAsync<{
        puzzle_string: string;
        rating: number;
        difficulty: DifficultyLevel;
        is_symmetric: number;
        clue_count: number;
        source: string;
        created_at: string;
      }>(
        `SELECT * FROM puzzles WHERE difficulty = ? LIMIT 100`,
        [difficulty]
      );

      return puzzles.map(puzzle => ({
        ...puzzle,
        is_symmetric: puzzle.is_symmetric === 1,
      }));
    },
  });
}

/**
 * Fetches a specific puzzle from the local database
 * @param puzzleString - The string representation of the puzzle to fetch
 * @returns The react-query object for fetching the puzzle
 */
export function usePuzzle(puzzleString: string | null) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: getPuzzleQueryKey(puzzleString),
    queryFn: () =>
      db.getFirstAsync<Puzzle>(
        `SELECT * FROM puzzles WHERE puzzle_string = ?`,
        [puzzleString]
      ),
    enabled: !!puzzleString,
  });
}
