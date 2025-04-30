import { Text, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useCurrentGameStateQuery } from '../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../store';
import { useBoardDimensions } from './useBoardDimensions';

interface CellData {
  value: number | null;
  isGiven: boolean;
  notes: number[];
}

interface CellProps {
  row: number;
  col: number;
}

export function Cell({ row, col }: CellProps) {
  const { data: gameState } = useCurrentGameStateQuery();
  const cellIndex = row * 9 + col;
  const { selectedCell, setSelectedCell } = useGameStore();
  const { cellSize } = useBoardDimensions();

  function isRelatedCell() {
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
  }

  let cell: CellData | undefined;
  try {
    if (!gameState?.current_state) {
      return (
        <View
          className={twMerge('items-center justify-center')}
          style={{ width: cellSize, height: cellSize }}
        />
      );
    }

    const currentState =
      typeof gameState.current_state === 'string'
        ? JSON.parse(gameState.current_state)
        : gameState.current_state;

    cell = (currentState as unknown as CellData[])[
      cellIndex
    ];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing game state:', error);
  }

  if (!cell) {
    return (
      <View
        className={twMerge('items-center justify-center')}
        style={{ width: cellSize, height: cellSize }}
      />
    );
  }

  const { value, isGiven, notes } = cell;

  let bgColorClass = 'bg-white';
  const isSelected =
    selectedCell?.row === row && selectedCell?.col === col;
  if (isSelected) {
    bgColorClass = 'bg-primary-100';
  } else if (isRelatedCell()) {
    bgColorClass = 'bg-gray-100';
  }

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
