import { View } from 'react-native';

import { ActionButtons } from './ActionButtons/ActionButtons';
import { NumberPad } from './NumberPad/NumberPad';

export function Controls() {
  return (
    <View className="flex w-full flex-row items-center justify-around px-4">
      <ActionButtons />
      <NumberPad />
    </View>
  );
}
