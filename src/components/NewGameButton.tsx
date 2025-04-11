import { router } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Platform } from 'react-native';

import {
  DIFFICULTY_LABELS_MAP,
  DIFFICULTY_LEVELS,
  DifficultyLevel,
} from '../db/types';
import { useCreateGame } from '../hooks/useGameStates';
import { Button } from './ui/Button';

export function NewGameButton() {
  const [isLoading, setIsLoading] = useState(false);
  const createGame = useCreateGame();

  async function handleDifficultySelect(
    difficulty: DifficultyLevel
  ) {
    console.log('Selected difficulty:', difficulty);
    setIsLoading(true);
    try {
      const newGame = await createGame.mutateAsync({
        difficulty,
      });

      router.push(`/game/${newGame.puzzle_string}`);
    } catch (error) {
      console.error('Error creating new game:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function showDifficultyMenu() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            ...DIFFICULTY_LEVELS.map(
              d => DIFFICULTY_LABELS_MAP[d]
            ),
            'Cancel',
          ],
          cancelButtonIndex: DIFFICULTY_LEVELS.length,
        },
        buttonIndex => {
          if (buttonIndex < DIFFICULTY_LEVELS.length) {
            handleDifficultySelect(
              DIFFICULTY_LEVELS[buttonIndex]
            );
          }
        }
      );
    } else {
      // For Android, we'll use a simple button for now
      // TODO: Implement a proper Android action sheet
      handleDifficultySelect(DIFFICULTY_LEVELS[0]);
    }
  }

  return (
    <Button
      label="Start New Game"
      onPress={showDifficultyMenu}
      disabled={isLoading}
    />
  );
}
