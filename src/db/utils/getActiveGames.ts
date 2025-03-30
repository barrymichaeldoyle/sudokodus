import { gameStates } from '../supabase';

export function getActiveGames() {
  return Object.values(gameStates).filter(
    game => game.is_completed === false
  );
}
