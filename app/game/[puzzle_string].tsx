import { useLocalSearchParams } from 'expo-router';

import { View } from 'react-native';
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
      <View className="flex h-full flex-col items-center justify-around">
        <Game />
        {/**
         * Height here matches the tab bar height
         * might need a more robust solution for
         * different screen sizes
         **/}
        {/* <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        /> */}
        {/* <View className="h-[82px] w-full bg-primary-500" /> */}
      </View>
    </ScreenContainer>
  );
}
