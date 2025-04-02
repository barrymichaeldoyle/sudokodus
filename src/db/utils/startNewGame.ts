import { gameStates$, generateId } from '../supabase';
import { getAnonymousUserId } from './anonymousUserId';

export async function startNewGame(puzzleString: string) {
  const id = generateId();
  const anonymousUserId = await getAnonymousUserId();

  gameStates$[id].assign({
    id,
    user_id: anonymousUserId,
    puzzle_string: puzzleString,
    current_state: [],
    moves_history: [],
  });

  return id;
}
