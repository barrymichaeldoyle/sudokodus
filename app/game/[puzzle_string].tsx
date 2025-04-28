import { Stack, useLocalSearchParams } from 'expo-router';

import { View } from 'react-native';
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
    <>
      <Stack.Screen
        options={{
          title: 'SUDOKODUS',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: primary['500'] },
          headerTintColor: white,
        }}
      />
      <ScreenContainer>
        <View className="flex flex-1 flex-col items-center justify-around">
          <Game />
          <View className="h-24 w-full bg-primary-500" />
        </View>
      </ScreenContainer>
    </>
  );
}
