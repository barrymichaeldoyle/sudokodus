/**
 * Better DX types based off of the supabase schema.
 */
import { Database } from './database.types';

export type Puzzle =
  Database['public']['Tables']['puzzles']['Row'];
export type DailyChallenge =
  Database['public']['Tables']['daily_challenges']['Row'];
export type Difficulty =
  Database['public']['Enums']['difficulty_level'];
export type GameState =
  Database['public']['Tables']['game_states']['Row'];

export type DifficultyLevel =
  Database['public']['Enums']['difficulty_level'];

/**
 * The list of all difficulty levels.
 * @type {DifficultyLevel[]}
 */
export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'easy',
  'medium',
  'hard',
  'diabolical',
];
