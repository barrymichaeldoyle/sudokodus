import { View } from 'react-native';

import { NumberButton } from './NumberButton';

export function NumberPad() {
  return (
    <View className="aspect-square">
      <NumberPadButtonsRow nums={[1, 2, 3]} />
      <NumberPadButtonsRow nums={[4, 5, 6]} />
      <NumberPadButtonsRow nums={[7, 8, 9]} />
    </View>
  );
}

interface NumberPadButtonsRowProps {
  nums: number[];
}

function NumberPadButtonsRow({
  nums,
}: NumberPadButtonsRowProps) {
  return (
    <View className="flex-1 flex-row">
      {nums.map(num => (
        <NumberButton key={num} num={num} />
      ))}
    </View>
  );
}
