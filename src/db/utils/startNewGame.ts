import { gameStates$, generateId } from '../supabase';

export function startNewGame(puzzleString: string) {
  const id = generateId();

  // Add keyed by id to the gameStates$ observable to trigger a create in Supabase
  // @ts-ignore
  gameStates$[id].set({
    id,
    puzzle_string: puzzleString,
    current_state: [],
    moves_history: [],
  });

  console.log('SET GAME STATE!', id);

  return id;
}
