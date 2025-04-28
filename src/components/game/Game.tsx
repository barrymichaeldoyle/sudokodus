import { View } from 'react-native';

import { Board } from './Board/Board';
import { Controls } from './Controls/Controls';
import { Details } from './Details/Details';

export function Game() {
  return (
    <View className="flex flex-1 flex-col items-center justify-around">
      <Details />
      <Board />
      <Controls />
    </View>
  );
}
