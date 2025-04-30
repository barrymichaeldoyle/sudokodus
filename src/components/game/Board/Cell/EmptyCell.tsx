import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useBoardDimensions } from '../useBoardDimensions';

export function EmptyCell() {
  const { cellSize } = useBoardDimensions();

  return (
    <View
      className={twMerge('items-center justify-center')}
      style={{ width: cellSize, height: cellSize }}
    />
  );
}
