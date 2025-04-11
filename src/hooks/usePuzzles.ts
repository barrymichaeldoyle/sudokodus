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
