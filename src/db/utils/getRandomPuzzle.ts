import { dailyChallenges } from '../supabase';
import { Difficulty, Puzzle } from '../types';
import { getPuzzlesByDifficulty } from './getPuzzlesByDifficulty';

/**
 * Retrieves a random puzzle of the specified difficulty level.
 * Does not return daily challenges unless no other puzzles are available.
 * @param {Difficulty} difficulty - The difficulty level of the puzzle to retrieve.
 * @returns {Puzzle} A random puzzle with its string and rating.
 * @throws {Error} If no puzzles are available for the specified difficulty.
 * @example
 * const randomPuzzle = getRandomPuzzle('easy');
 * // Returns: { puzzle_string: '...', rating: 1.2 }
 */
export function getRandomPuzzle(
  difficulty: Difficulty
): Puzzle {
  const puzzles = getPuzzlesByDifficulty(difficulty);

  // Handle case where dailyChallenges is undefined
  const dailyPuzzleStrings = new Set<string>();
  if (dailyChallenges) {
    Object.values(dailyChallenges)
      .filter(
        challenge => challenge.difficulty === difficulty
      )
      .forEach(challenge => {
        if (challenge.puzzle_string) {
          dailyPuzzleStrings.add(challenge.puzzle_string);
        }
      });
  }

  if (puzzles.length === 0) {
    throw new Error(
      `No puzzles available for difficulty: ${difficulty}`
    );
  }

  const puzzlesThatAreNotDailyChallenges = puzzles.filter(
    puzzle => !dailyPuzzleStrings.has(puzzle.puzzle_string)
  );
  if (puzzlesThatAreNotDailyChallenges.length > 0) {
    return puzzlesThatAreNotDailyChallenges[
      Math.floor(
        Math.random() *
          puzzlesThatAreNotDailyChallenges.length
      )
    ];
  }

  return puzzles[
    Math.floor(Math.random() * puzzles.length)
  ];
}
