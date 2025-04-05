import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert } from 'react-native';

import {
  getUnusedPuzzle,
  markPuzzleAsUsed,
} from '../db/sqlite';
import { Difficulty } from '../db/types';
import { usePuzzleCacheManager } from './usePuzzleCacheManager';

/**
 * Hook for starting a new game.
 *
 * This will check if there are any unused puzzles for the given difficulty,
 * and if so, it will start the game with the first unused puzzle.
 *
 * If there are no unused puzzles, it will show an alert prompting the user to
 * check their active games or go online to get new puzzles.
 *
 * Sends the user to the game screen with the puzzle string.
 */
export function useStartGame(): {
  isLoading: boolean;
  startGame: (difficulty: Difficulty) => Promise<void>;
} {
  const db = useSQLiteContext();
  const { checkAndReplenishIfNeeded } =
    usePuzzleCacheManager();
  const [isLoading, setIsLoading] = useState(false);

  async function startGame(difficulty: Difficulty) {
    setIsLoading(true);
    try {
      const puzzle = await getUnusedPuzzle(db, difficulty);
      if (puzzle) {
        await markPuzzleAsUsed(db, puzzle.puzzle_string);
        router.push({
          pathname: `/game/${puzzle.puzzle_string}`,
        });

        return checkAndReplenishIfNeeded(difficulty);
      }

      Alert.alert(
        'No Puzzles Available',
        `No new ${difficulty} puzzles available locally. Try connecting to the internet, or check your active games.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'View Active Games',
            onPress: () => router.push('/games'),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    startGame,
  };
}
