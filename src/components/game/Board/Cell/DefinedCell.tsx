import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useGameStore } from '../../store';
import { useBoardDimensions } from '../useBoardDimensions';
import { CellData } from './types';

interface DefinedCellProps {
  cell: CellData;
  row: number;
  col: number;
}

export function DefinedCell({
  cell,
  row,
  col,
}: DefinedCellProps) {
  const { value, isGiven, notes } = cell;
  const { cellSize } = useBoardDimensions();
  const selectedCell = useGameStore(
    state => state.selectedCell
  );
  const setSelectedCell = useGameStore(
    state => state.setSelectedCell
  );

  const isRelatedCell = useMemo(() => {
    if (!selectedCell) {
      return false;
    }

    const { row: selectedRow, col: selectedCol } =
      selectedCell;
    if (row === selectedRow) {
      return true;
    }
    if (col === selectedCol) {
      return true;
    }

    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selectedBoxRow = Math.floor(selectedRow / 3);
    const selectedBoxCol = Math.floor(selectedCol / 3);

    return (
      boxRow === selectedBoxRow && boxCol === selectedBoxCol
    );
  }, [selectedCell, row, col]);

  const bgColorClass = useMemo(() => {
    const isSelected =
      selectedCell?.row === row &&
      selectedCell?.col === col;
    if (isSelected) {
      return 'bg-primary-100';
    }
    if (isRelatedCell) {
      return 'bg-gray-100';
    }
    return 'bg-white';
  }, [selectedCell, row, col, isRelatedCell]);

  return (
    <TouchableOpacity
      className={twMerge(
        'items-center justify-center',
        bgColorClass
      )}
      style={{ width: cellSize, height: cellSize }}
      onPress={() => setSelectedCell(row, col)}
    >
      {value !== null && value !== 0 ? (
        <Text
          className={twMerge(
            'font-bold',
            isGiven ? 'text-black' : 'text-primary-500'
          )}
          style={{ fontSize: cellSize * 0.55 }}
        >
          {value}
        </Text>
      ) : (
        <View className="h-full w-full flex-row flex-wrap p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Text
              key={num}
              className={`text-center-vertical h-1/3 w-1/3 text-center text-xs ${
                notes.includes(num)
                  ? 'text-blue-600'
                  : 'text-transparent'
              }`}
            >
              {notes.includes(num) ? num : ''}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}
