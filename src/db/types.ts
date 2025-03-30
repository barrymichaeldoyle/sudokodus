import { Database } from './database.types';

export type Puzzle =
  Database['public']['Tables']['puzzles']['Row'];
export type DailyChallenge =
  Database['public']['Tables']['daily_challenges']['Row'];
export type Difficulty =
  Database['public']['Enums']['difficulty_level'];

/**
 * The list of all difficulty levels.
 * @type {Difficulty[]}
 */
export const difficulties: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'diabolical',
];
