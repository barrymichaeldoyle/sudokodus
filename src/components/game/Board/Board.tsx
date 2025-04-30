import { View } from 'react-native';

import { BoardLines } from './BoardLines';
import { Cell } from './Cell';
import { useBoardDimensions } from './useBoardDimensions';

export function Board() {
  const { boardSize } = useBoardDimensions();

  return (
    <View className="flex flex-col items-center">
      <View
        className="bg-white shadow-custom"
        style={{ height: boardSize, width: boardSize }}
      >
        {Array.from({ length: 9 }, (_, row) => (
          <View key={`row-${row}`} className="flex-row">
            {Array.from({ length: 9 }, (_, col) => (
              <Cell
                key={`cell-${row}-${col}`}
                col={col}
                row={row}
              />
            ))}
          </View>
        ))}

        <BoardLines />
      </View>
    </View>
  );
}
