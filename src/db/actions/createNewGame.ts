import {
  diabolicalPuzzles$,
  easyPuzzles$,
  gameStates$,
  generateId,
  hardPuzzles$,
  mediumPuzzles$,
} from '../supabase';
import { Difficulty, GameState } from '../types';
import { getAnonymousUserId } from '../utils/anonymousUserId';

/**
 * Create a new game from a puzzle
 * @param puzzle The puzzle to create a game from
 * @returns The new game state
 */
export async function createNewGame(
  difficulty: Difficulty
): Promise<GameState | null> {
  const puzzle = getRandomPuzzle(difficulty);

  if (!puzzle) {
    return null;
  }

  const anonymousUserId = await getAnonymousUserId();

  const newGameState: GameState = {
    id: generateId(),
    puzzle_string: puzzle.puzzle_string,
    current_state: puzzle.puzzle_string,
    notes: {},
    is_completed: false,
    created_at: new Date().toISOString(),
    current_move_index: 0,
    hints_used: 0,
    moves_count: 0,
    user_id: anonymousUserId,
    moves_history: [],
    time_spent: 0,
    updated_at: new Date().toISOString(),
  };

  gameStates$[newGameState.id].assign(newGameState);

  return newGameState;
}

/**
 * Get a random puzzle by difficulty
 * @param difficulty The puzzle difficulty ('easy', 'medium', 'hard', 'diabolical')
 * @returns A puzzle object or null if none available
 */
function getRandomPuzzle(difficulty: Difficulty) {
  let puzzles;

  switch (difficulty) {
    case 'easy':
      puzzles = Object.values(easyPuzzles$.get());
      break;
    case 'medium':
      puzzles = Object.values(mediumPuzzles$.get());
      break;
    case 'hard':
      puzzles = Object.values(hardPuzzles$.get());
      break;
    case 'diabolical':
      puzzles = Object.values(diabolicalPuzzles$.get());
      break;
    default:
      return null;
  }

  if (puzzles.length === 0) {
    return null;
  }

  // Get a random puzzle
  const randomIndex = Math.floor(
    Math.random() * puzzles.length
  );
  return puzzles[randomIndex];
}
