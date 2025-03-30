import { puzzles } from '../supabase';

/**
 * Checks if any puzzles have been loaded into the local state.
 * @returns {boolean} True if there are puzzles loaded, false otherwise.
 * @example
 * if (hasPuzzlesLoaded()) {
 *   // Puzzles are available for use
 * }
 */
export function hasPuzzlesLoaded(): boolean {
  return Object.keys(puzzles).length > 0;
}
