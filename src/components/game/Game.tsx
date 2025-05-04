import { SafeAreaView, View } from 'react-native';

import { Board } from './Board/Board';
import { Controls } from './Controls/Controls';
import { Details } from './Details/Details';

export function Game() {
  return (
    <SafeAreaView className="flex flex-1 flex-col justify-around">
      <View className="flex flex-col justify-center">
        <Details />
        <Board />
      </View>
      <Controls />
    </SafeAreaView>
  );
}
