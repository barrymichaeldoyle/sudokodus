import { SafeAreaView, View } from 'react-native';

import { BannerAd } from '../../components/BannerAd/BannerAd';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Board } from './Board/Board';
import { Controls } from './Controls/Controls';
import { Details } from './Details/Details';

export default function GameScreen() {
  return (
    <ScreenContainer>
      <View className="flex h-full flex-1 flex-col items-center justify-between">
        <BannerAd />
        <View className="flex-1">
          <SafeAreaView className="flex flex-1 flex-col justify-around">
            <View className="flex flex-col justify-center">
              <Details />
              <Board />
            </View>
            <Controls />
          </SafeAreaView>
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
