import { use$ } from '@legendapp/state/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { gameStates$ } from '../../src/db/supabase';
import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function GameScreen() {
  const { id: puzzleString } = useLocalSearchParams<{
    id: string;
  }>();
  usePostHogCapture('game_opened', {
    puzzle_string: puzzleString,
  });
  const gameState = use$(() => {
    const states = Object.values(gameStates$.get());
    return states.find(
      state => state.puzzle_string === puzzleString
    );
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'SudokoduS',
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex flex-1 items-center justify-center">
        <Text>
          {gameState
            ? `Game ID: ${gameState.puzzle_string} - ${gameState.id}`
            : 'Loading game...'}
        </Text>
      </View>
    </>
  );
}
