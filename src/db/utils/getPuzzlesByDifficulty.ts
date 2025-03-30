import { puzzles } from '../supabase';
import { Difficulty, Puzzle } from '../types';

/**
 * Retrieves all puzzles of a specific difficulty level.
 * @param {Difficulty} difficulty - The difficulty level to filter puzzles by.
 * @returns {Puzzle[]} An array of puzzles.
 * @example
 * const easyPuzzles = getPuzzlesByDifficulty('easy');
 * // Returns: [{ puzzle_string: '...', rating: 1.2 }, ...]
 */
export function getPuzzlesByDifficulty(
  difficulty: Difficulty
): Puzzle[] {
  return Object.values(puzzles).filter(
    puzzle => puzzle.difficulty === difficulty
  );
}
