import { Text, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useCurrentGameStateQuery } from '../hooks/useCurrentGameStateQuery';

interface CellData {
  value: number | null;
  isGiven: boolean;
  notes: number[];
}

interface CellProps {
  size: number;
  row: number;
  col: number;
  isSelected: boolean;
  isRelated: boolean;
  onPress: (row: number, col: number) => void;
}

export function Cell({
  size,
  row,
  col,
  isSelected,
  isRelated,
  onPress,
}: CellProps) {
  const { data: gameState } = useCurrentGameStateQuery();
  const cellIndex = row * 9 + col;

  let cell: CellData | undefined;
  try {
    if (!gameState?.current_state) {
      return (
        <View
          style={{
            width: size,
            height: size,
          }}
          className={twMerge('items-center justify-center')} // Removed border classes
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
    console.error('Error parsing game state:', error);
  }

  if (!cell) {
    return (
      <View
        style={{
          width: size,
          height: size,
        }}
        className={twMerge('items-center justify-center')} // Removed border classes
      />
    );
  }

  const { value, isGiven, notes } = cell;

  let bgColorClass = 'bg-white';
  if (isSelected) {
    bgColorClass = 'bg-primary-100';
  } else if (isRelated) {
    bgColorClass = 'bg-gray-100';
  }

  return (
    <TouchableOpacity
      style={{ width: size, height: size }}
      className={twMerge(
        'items-center justify-center',
        bgColorClass
        // Removed border classes
      )}
      onPress={() => onPress(row, col)}
    >
      {value !== null && value !== 0 ? (
        <Text
          className={`text-xl font-bold ${
            isGiven ? 'text-black' : 'text-blue-600'
          }`}
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
