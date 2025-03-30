import { dailyChallenges } from '../supabase';
import { DailyChallenge } from '../types';

/**
 * Retrieves all daily challenges for a specific date.
 * @param {string} date - The date in ISO format (YYYY-MM-DD).
 * @returns {DailyChallenge[]} An array of daily challenges for the specified date.
 * @example
 * const challenges = getChallengesForDate('2024-03-30');
 * // Returns: [{ date: '2024-03-30', difficulty: 'easy', puzzle_string: '...' }, ...]
 */
export function getChallengesForDate(
  date: string
): DailyChallenge[] {
  return Object.values(dailyChallenges).filter(
    challenge => challenge.date === date
  );
}
