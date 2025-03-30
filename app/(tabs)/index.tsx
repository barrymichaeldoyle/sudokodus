import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Difficulty } from '../../src/db/types';
import { getRandomPuzzle } from '../../src/db/utils/getRandomPuzzle';
import { startNewGame } from '../../src/db/utils/startNewGame';
import { useLoadPuzzles } from '../../src/hooks/useLoadPuzzles';

export default function HomeScreen() {
  const { isLoading, error: errorLoadingPuzzles } =
    useLoadPuzzles();

  const [error, setError] = useState<string | null>(null);

  async function handleStartNewGame() {
    setError(null);

    try {
      // Start with an easy puzzle for now
      const puzzle = getRandomPuzzle('easy' as Difficulty);
      console.log('Got random puzzle:', puzzle);
      startNewGame(puzzle.puzzle_string);
      router.push(`/game/${puzzle.puzzle_string}`);
    } catch (error: any) {
      setError(
        `Failed to start new game: ${error?.message || 'Unknown error'}`
      );
    }
  }

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text className="mb-8 text-2xl">SudokuduS</Text>
      <Pressable
        onPress={handleStartNewGame}
        disabled={isLoading}
        className={`rounded-lg px-6 py-3 ${
          isLoading ? 'bg-blue-300' : 'bg-blue-500'
        }`}
      >
        <Text className="text-lg font-semibold text-white">
          {isLoading ? 'Loading...' : 'Start New Game'}
        </Text>
      </Pressable>
      {error && (
        <Text className="mt-4 text-red-500">{error}</Text>
      )}
      {errorLoadingPuzzles && (
        <Text className="mt-4 text-red-500">
          {errorLoadingPuzzles}
        </Text>
      )}
    </View>
  );
}
