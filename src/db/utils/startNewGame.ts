import { gameStates$, generateId } from '../supabase';
import { getAnonymousUserId } from './anonymousUser';

export async function startNewGame(puzzleString: string) {
  const id = generateId();
  const anonymousUserId = await getAnonymousUserId();

  // Add keyed by id to the gameStates$ observable to trigger a create in Supabase
  // @ts-ignore
  gameStates$[id].set({
    id,
    user_id: anonymousUserId,
    puzzle_string: puzzleString,
    current_state: [],
    moves_history: [],
  });

  console.log('SET GAME STATE!', id);

  return id;
}
