import { dailyChallenges } from '../supabase';
import { DailyChallenge } from '../types';

/**
 * Retrieves all daily challenges for the current day.
 * @returns {DailyChallenge[]} An array of daily challenges for today.
 * @example
 * const todaysChallenges = getTodaysChallenges();
 * // Returns: [{ date: '2024-03-30', difficulty: 'easy', puzzle_string: '...' }, ...]
 */
export function getTodaysChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().split('T')[0];
  return Object.values(dailyChallenges).filter(
    challenge => challenge.date === today
  );
}
