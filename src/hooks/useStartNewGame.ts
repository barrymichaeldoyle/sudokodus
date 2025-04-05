import { useActionSheet } from '@expo/react-native-action-sheet';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  getUnusedPuzzle,
  markPuzzleAsUsed,
} from '../db/sqlite';
import { Difficulty } from '../db/types';
import { usePuzzleCacheManager } from './usePuzzleCacheManager';

export function useStartNewGame(): {
  isLoading: boolean;
  startNewGame: (difficulty: Difficulty) => Promise<void>;
  showGameDifficultyOptions: () => void;
} {
  const db = useSQLiteContext();
  const { checkAndReplenishIfNeeded } =
    usePuzzleCacheManager();
  const { showActionSheetWithOptions } = useActionSheet();
  const [isLoading, setIsLoading] = useState(false);

  const startNewGame = useCallback(
    async (difficulty: Difficulty) => {
      setIsLoading(true);
      try {
        const puzzle = await getUnusedPuzzle(
          db,
          difficulty
        );
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
    },
    [db, checkAndReplenishIfNeeded]
  );

  const showGameDifficultyOptions = useCallback(() => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Difficulty',
        message: 'Select your level.',
        userInterfaceStyle: 'light',
      },
      selectedIndex => {
        if (
          selectedIndex !== undefined &&
          selectedIndex !== cancelButtonIndex
        ) {
          startNewGame(
            DIFFICULTY_OPTIONS[selectedIndex].difficulty
          );
        }
      }
    );
  }, [showActionSheetWithOptions, startNewGame]);

  return {
    isLoading,
    startNewGame,
    showGameDifficultyOptions,
  };
}
const DIFFICULTY_OPTIONS: {
  label: string;
  difficulty: Difficulty;
}[] = [
  { label: 'Easy', difficulty: 'easy' },
  { label: 'Medium', difficulty: 'medium' },
  { label: 'Hard', difficulty: 'hard' },
  { label: 'Diabolical', difficulty: 'diabolical' },
] as const;

const options = [
  ...DIFFICULTY_OPTIONS.map(d => d.label),
  'Cancel',
];
const cancelButtonIndex = options.length - 1;
