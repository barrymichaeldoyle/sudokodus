import { router } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Platform } from 'react-native';

import {
  DIFFICULTY_LEVELS,
  DifficultyLevel,
} from '../db/types';
import { useCreateGame } from '../hooks/useGameStates';
import { usePuzzles } from '../hooks/usePuzzles';
import { Button } from './ui/Button';

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  diabolical: 'Diabolical',
} as const;

export function NewGameButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);
  const createGame = useCreateGame();
  const { data: puzzles } = usePuzzles(
    selectedDifficulty || 'easy'
  );

  const handleDifficultySelect = async (
    difficulty: DifficultyLevel
  ) => {
    setSelectedDifficulty(difficulty);
    setIsLoading(true);
    try {
      if (!puzzles || puzzles.length === 0) {
        console.error(
          'No puzzles available for difficulty:',
          difficulty
        );
        return;
      }

      // Select a random puzzle
      const randomPuzzle =
        puzzles[Math.floor(Math.random() * puzzles.length)];

      // Create a new game with the selected puzzle
      const newGame = await createGame.mutateAsync({
        puzzleString: randomPuzzle.puzzle_string,
      });

      // Navigate to the game screen
      router.push(`/game/${newGame.puzzle_string}`);
    } catch (error) {
      console.error('Error creating new game:', error);
    } finally {
      setIsLoading(false);
      setSelectedDifficulty(null);
    }
  };

  const showDifficultyMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            ...DIFFICULTY_LEVELS.map(
              d => DIFFICULTY_LABELS[d]
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
  };

  return (
    <Button
      label="Start New Game"
      onPress={showDifficultyMenu}
      disabled={isLoading}
    />
  );
}
