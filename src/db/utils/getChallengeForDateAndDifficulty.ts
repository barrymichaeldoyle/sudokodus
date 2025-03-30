import { dailyChallenges } from '../supabase';
import { DailyChallenge, Difficulty } from '../types';

/**
 * Retrieves a specific daily challenge for a given date and difficulty level.
 * @param {string} date - The date in ISO format (YYYY-MM-DD).
 * @param {Difficulty} difficulty - The difficulty level of the challenge.
 * @returns {DailyChallenge | undefined} The matching daily challenge, or undefined if not found.
 * @example
 * const challenge = getChallengeForDateAndDifficulty('2024-03-30', 'easy');
 * // Returns: { date: '2024-03-30', difficulty: 'easy', puzzle_string: '...' }
 */
export function getChallengeForDateAndDifficulty(
  date: string,
  difficulty: Difficulty
): DailyChallenge | undefined {
  return Object.values(dailyChallenges).find(
    challenge =>
      challenge.date === date &&
      challenge.difficulty === difficulty
  );
}
