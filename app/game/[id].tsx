import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { primary, white } from '../../src/colors';
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
          headerStyle: { backgroundColor: primary['500'] },
          headerTintColor: white,
        }}
      />
      <View className="flex flex-1 items-center justify-center">
        <Text>Puzzle String: {puzzleString}</Text>
      </View>
    </>
  );
}
