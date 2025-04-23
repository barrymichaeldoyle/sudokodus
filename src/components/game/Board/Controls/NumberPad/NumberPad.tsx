import { View } from 'react-native';

import { NumberButton } from './NumberButton';

export function NumberPad() {
  return (
    <View className="aspect-square flex-1">
      <View className="flex-1 flex-row">
        {[1, 2, 3].map(number => (
          <NumberButton key={number} number={number} />
        ))}
      </View>
      <View className="flex-1 flex-row">
        {[4, 5, 6].map(number => (
          <NumberButton key={number} number={number} />
        ))}
      </View>
      <View className="flex-1 flex-row">
        {[7, 8, 9].map(number => (
          <NumberButton key={number} number={number} />
        ))}
      </View>
    </View>
  );
}
