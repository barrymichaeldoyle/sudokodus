import { dailyChallenges } from '../supabase';

/**
 * Retrieves all unique dates that have daily challenges available.
 * @returns {string[]} An array of dates in ISO format (YYYY-MM-DD) that have challenges.
 * @example
 * const dates = getAvailableDates();
 * // Returns: ['2024-03-30', '2024-03-31', ...]
 */
export function getAvailableDates(): string[] {
  return [
    ...new Set(
      Object.values(dailyChallenges).map(
        challenge => challenge.date
      )
    ),
  ].sort();
}
