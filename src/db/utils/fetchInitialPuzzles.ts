import {
  diabolicalPuzzles$,
  easyPuzzles$,
  hardPuzzles$,
  mediumPuzzles$,
} from '../supabase';
import { Difficulty, Puzzle } from '../types';

const INITIAL_PUZZLES_PER_DIFFICULTY = 10;

/**
 * Fetches initial puzzles for offline support
 * Gets up to 10 puzzles per difficulty level
 */
export async function fetchInitialPuzzles() {
  const difficulties: Difficulty[] = [
    'easy',
    'medium',
    'hard',
    'diabolical',
  ];

  // Get current puzzles to check what we already have
  const currentCounts = {
    easy: (Object.values(easyPuzzles$.get()) as Puzzle[])
      .length,
    medium: (
      Object.values(mediumPuzzles$.get()) as Puzzle[]
    ).length,
    hard: (Object.values(hardPuzzles$.get()) as Puzzle[])
      .length,
    diabolical: (
      Object.values(diabolicalPuzzles$.get()) as Puzzle[]
    ).length,
  };

  // Only fetch if we don't have enough puzzles
  for (const difficulty of difficulties) {
    if (
      currentCounts[difficulty] >=
      INITIAL_PUZZLES_PER_DIFFICULTY
    ) {
      console.log(
        `Already have enough ${difficulty} puzzles (${currentCounts[difficulty]})`
      );
      continue;
    }

    try {
      console.log(
        `Fetching initial ${difficulty} puzzles...`
      );

      // Get the appropriate observable based on difficulty
      const puzzles$ = {
        easy: easyPuzzles$,
        medium: mediumPuzzles$,
        hard: hardPuzzles$,
        diabolical: diabolicalPuzzles$,
      }[difficulty];

      // Get current puzzles and add more if needed
      const puzzles = puzzles$.get();
      const newPuzzles = (
        Object.values(puzzles) as Puzzle[]
      ).slice(
        0,
        INITIAL_PUZZLES_PER_DIFFICULTY -
          currentCounts[difficulty]
      );

      if (newPuzzles.length === 0) {
        console.warn(`No ${difficulty} puzzles available`);
        continue;
      }

      console.log(
        `Successfully fetched ${newPuzzles.length} ${difficulty} puzzles`
      );

      // Add each puzzle to the observable
      newPuzzles.forEach(puzzle => {
        puzzles$[puzzle.puzzle_string].set(puzzle);
      });
    } catch (error) {
      console.error(
        `Error processing ${difficulty} puzzles:`,
        error
      );
    }
  }
}
