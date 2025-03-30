import { puzzles, supabase } from '../supabase';
import { difficulties } from '../types';
import { hasEnoughPuzzlesOfAllDifficulties } from './hasEnoughPuzzlesOfAllDifficulties';

/**
 * Fetches an initial set of puzzles for each difficulty level if not enough are loaded.
 * This ensures that new users have enough puzzles to start playing immediately.
 * @param {number} minCount - The minimum number of puzzles to fetch per difficulty (default: 10).
 * @returns {Promise<void>} A promise that resolves when the initial puzzles are fetched.
 * @throws {Error} If there's an error fetching puzzles from the database.
 * @example
 * await fetchInitialPuzzles(5);
 * // Fetches at least 5 puzzles for each difficulty level if needed
 */
export async function fetchInitialPuzzles(
  minCount: number = 100
): Promise<void> {
  if (hasEnoughPuzzlesOfAllDifficulties(minCount)) {
    return;
  }

  for (const difficulty of difficulties) {
    try {
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('difficulty', difficulty)
        .limit(minCount);

      if (error) {
        console.error(
          `Supabase error details for ${difficulty}:`,
          error
        );
        throw new Error(
          `Error fetching ${difficulty} puzzles: ${error.message}`
        );
      }

      if (!data || data.length === 0) {
        console.warn(
          `No puzzles found for difficulty: ${difficulty}`
        );
        continue;
      }

      data.forEach(puzzle => {
        puzzles[puzzle.puzzle_string] = puzzle;
      });
    } catch (e) {
      console.error(
        `Exception while fetching ${difficulty} puzzles:`,
        e
      );
      throw e;
    }
  }
}
