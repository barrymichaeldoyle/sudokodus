import { View } from 'react-native';

import { ActionButtons } from './ActionButtons/ActionButtons';
import { NumberPad } from './NumberPad/NumberPad';

export function Controls() {
  return (
    <View className="flex w-full flex-row items-center justify-around gap-4 px-2">
      <View className="flex-1">
        <ActionButtons />
      </View>
      <View className="relative right-2 flex-1">
        <NumberPad />
      </View>
    </View>
  );
}
