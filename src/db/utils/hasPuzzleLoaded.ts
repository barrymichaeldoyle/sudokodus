import { puzzles } from '../supabase';

/**
 * Checks if a specific puzzle has been loaded into the local state.
 * @param {string} puzzleString - The string representation of the puzzle to check.
 * @returns {boolean} True if the puzzle is loaded, false otherwise.
 * @example
 * if (hasPuzzleLoaded('003020600900305010018090000081000200700602000000000040000000000000000000000000000')) {
 *   // The specific puzzle is available
 * }
 */
export function hasPuzzleLoaded(
  puzzleString: string
): boolean {
  return puzzleString in puzzles;
}
