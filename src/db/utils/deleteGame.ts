import { gameStates$ } from '../supabase';

export function deleteGame(gameId: string) {
  const current = gameStates$.get();
  const { [gameId]: _, ...rest } = current;
  return gameStates$.set(rest);
}
