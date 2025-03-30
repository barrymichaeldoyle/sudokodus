import { gameStates } from '../supabase';

export function getCompletedGames() {
  return Object.values(gameStates).filter(
    game => game.is_completed === true
  );
}
