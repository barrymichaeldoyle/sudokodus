import { View } from 'react-native';

import { NumberButton } from './NumberButton';

export function NumberPad() {
  return (
    <View className="aspect-square">
      <NumberPadButtonsRow numbers={[1, 2, 3]} />
      <NumberPadButtonsRow numbers={[4, 5, 6]} />
      <NumberPadButtonsRow numbers={[7, 8, 9]} />
    </View>
  );
}

interface NumberPadButtonsRowProps {
  numbers: number[];
}

function NumberPadButtonsRow({
  numbers,
}: NumberPadButtonsRowProps) {
  return (
    <View className="flex-1 flex-row">
      {numbers.map(number => (
        <NumberButton key={number} number={number} />
      ))}
    </View>
  );
}
