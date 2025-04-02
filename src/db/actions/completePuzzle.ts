import { gameStates$ } from '../supabase';
import { GameState } from '../types';

export async function completePuzzle(gameState: GameState) {
  // Create a completion record
  const completedGameState: GameState = {
    ...gameState,
    is_completed: true,
    updated_at: new Date().toISOString(),
  };

  // Update the game state in the observable
  // This should trigger automatic sync based on your configuration
  gameStates$[completedGameState.id].assign(
    completedGameState
  );

  return completedGameState;
}
