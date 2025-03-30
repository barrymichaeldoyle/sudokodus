import { Database } from '../database.types';
import { gameStates$ } from '../supabase';

export function updateGameState(
  gameId: string,
  updates: Partial<
    Database['public']['Tables']['game_states']['Update']
  >
) {
  const current = gameStates$.get();
  return gameStates$.set({
    ...current,
    [gameId]: { ...current[gameId], ...updates },
  });
}
