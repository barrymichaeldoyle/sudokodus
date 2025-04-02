import {
  diabolicalPuzzles$,
  easyPuzzles$,
  hardPuzzles$,
  mediumPuzzles$,
} from '../supabase';
import { Difficulty } from '../types';

/**
 * Gets a random puzzle of the specified difficulty that is not a daily challenge
 * Works offline by using synced Legend State observables
 * @param difficulty The difficulty level of the puzzle to get
 * @returns A random puzzle that is not a daily challenge
 */
export function getRandomPuzzle(difficulty: Difficulty) {
  // Get the appropriate observable based on difficulty
  const puzzles$ = {
    easy: easyPuzzles$,
    medium: mediumPuzzles$,
    hard: hardPuzzles$,
    diabolical: diabolicalPuzzles$,
  }[difficulty];

  // Get all puzzles from the observable
  const puzzles = puzzles$.get();
  const puzzleArray = Object.values(puzzles);

  if (puzzleArray.length === 0) {
    throw new Error(
      `No puzzles available for difficulty: ${difficulty}`
    );
  }

  // Get a random puzzle
  const randomIndex = Math.floor(
    Math.random() * puzzleArray.length
  );
  return puzzleArray[randomIndex];
}
