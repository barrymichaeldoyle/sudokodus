import { Stack, useLocalSearchParams } from 'expo-router';

import { primary, white } from '../../src/colors';
import { Game } from '../../src/components/game/Game';
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
      <Game puzzleString={puzzleString} />
    </>
  );
}
