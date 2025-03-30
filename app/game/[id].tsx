import { use$ } from '@legendapp/state/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { gameStates$ } from '../../src/db/supabase';

export default function GameScreen() {
  const { id: puzzleString } = useLocalSearchParams<{
    id: string;
  }>();
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
          headerBackTitle: '',
        }}
      />
      <View className="flex flex-1 items-center justify-center bg-[#25292e]">
        <Text className="text-white">
          {gameState
            ? `Game ID: ${gameState.puzzle_string} - ${gameState.id}`
            : 'Loading game...'}
        </Text>
      </View>
    </>
  );
}
