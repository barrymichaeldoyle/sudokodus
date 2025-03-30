import { difficulties } from '../types';
import { hasEnoughPuzzlesOfDifficulty } from './hasEnoughPuzzlesOfDifficulty';

/**
 * Checks if there are enough puzzles loaded for all difficulty levels.
 * @param {number} minCount - The minimum number of puzzles required per difficulty (default: 10).
 * @returns {boolean} True if there are enough puzzles loaded for all difficulties, false otherwise.
 * @example
 * if (hasEnoughPuzzlesOfAllDifficulties(5)) {
 *   // At least 5 puzzles are available for each difficulty level
 * }
 */
export function hasEnoughPuzzlesOfAllDifficulties(
  minCount: number = 10
): boolean {
  return difficulties.every(difficulty =>
    hasEnoughPuzzlesOfDifficulty(difficulty, minCount)
  );
}
