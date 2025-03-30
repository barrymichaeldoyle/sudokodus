import { Difficulty, Puzzle } from '../types';
import { getPuzzlesByDifficulty } from './getPuzzlesByDifficulty';

/**
 * Retrieves a random puzzle of the specified difficulty level.
 * @param {Difficulty} difficulty - The difficulty level of the puzzle to retrieve.
 * @returns {Array<{ puzzle_string: string; rating: number }>} A random puzzle with its string and rating.
 * @throws {Error} If no puzzles are available for the specified difficulty.
 * @example
 * const randomPuzzle = getRandomPuzzle('easy');
 * // Returns: [{ puzzle_string: '...', rating: 1.2 }]
 */
export function getRandomPuzzle(
  difficulty: Difficulty
): Puzzle {
  const puzzles = getPuzzlesByDifficulty(difficulty);
  if (puzzles.length === 0) {
    throw new Error(
      `No puzzles available for difficulty: ${difficulty}`
    );
  }
  return puzzles[
    Math.floor(Math.random() * puzzles.length)
  ];
}
