import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { BannerAd } from '../../src/components/BannerAd/BannerAd';
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
      <View className="flex h-full flex-1 flex-col items-center justify-between">
        <BannerAd />
        <View className="flex-1">
          <Game />
        </View>
        {/**
         * Height here matches the tab bar height
         * might need a more robust solution for
         * different screen sizes
         **/}
      </View>
    </ScreenContainer>
  );
}
