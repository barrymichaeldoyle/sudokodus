import { Difficulty } from '../types';
import { getPuzzlesByDifficulty } from './getPuzzlesByDifficulty';

/**
 * Checks if there are enough puzzles loaded for a specific difficulty level.
 * @param {Difficulty} difficulty - The difficulty level to check.
 * @param {number} minCount - The minimum number of puzzles required (default: 10).
 * @returns {boolean} True if there are enough puzzles loaded, false otherwise.
 * @example
 * if (hasEnoughPuzzlesOfDifficulty('easy', 5)) {
 *   // At least 5 easy puzzles are available
 * }
 */
export function hasEnoughPuzzlesOfDifficulty(
  difficulty: Difficulty,
  minCount: number = 10
): boolean {
  return (
    getPuzzlesByDifficulty(difficulty).length >= minCount
  );
}
