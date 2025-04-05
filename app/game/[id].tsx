import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function GameScreen() {
  const { id: puzzleString } = useLocalSearchParams<{
    id: string;
  }>();
  usePostHogCapture('game_opened', {
    puzzle_string: puzzleString,
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
        <Text>Puzzle String: {puzzleString}</Text>
      </View>
    </>
  );
}
