// Example in a component where user selects difficulty
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert } from 'react-native';
import {
  getUnusedPuzzle,
  markPuzzleAsUsed,
} from '../db/sqlite';
import { Difficulty } from '../db/types';
import { usePuzzleCacheManager } from '../hooks/usePuzzleCacheManager';
import { Button } from './ui/Button';

interface StartGameButtonProps {
  difficulty: Difficulty;
}

export function StartGameButton({
  difficulty,
}: StartGameButtonProps) {
  const db = useSQLiteContext();
  const { checkAndReplenishIfNeeded } =
    usePuzzleCacheManager();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      const puzzle = await getUnusedPuzzle(db, difficulty);
      if (puzzle) {
        await markPuzzleAsUsed(db, puzzle.puzzle_string);
        router.push({
          pathname: `/game/${puzzle.puzzle_string}`,
        });

        // Trigger a cache check for this difficulty in the background
        checkAndReplenishIfNeeded(difficulty);
      } else {
        // Handle case where no puzzles are available locally
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
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      label={`Start ${
        {
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard',
          diabolical: 'Diabolical',
        }[difficulty]
      } Game`}
      onPress={handleStartGame}
      disabled={isLoading}
    />
  );
}
