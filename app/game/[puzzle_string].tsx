import { Stack, useLocalSearchParams } from 'expo-router';

import { primary, white } from '../../src/colors';
import { Game } from '../../src/components/game/Game';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';
import { GameScreenParams } from '../../src/types';

export default function GameScreen() {
  const { puzzle_string } =
    useLocalSearchParams<GameScreenParams>();
  usePostHogCapture('game_opened', {
    puzzle_string,
  });

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: 'SudokoduS',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: primary['500'] },
          headerTintColor: white,
        }}
      />
      <Game />
    </ScreenContainer>
  );
}
