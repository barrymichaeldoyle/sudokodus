import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LocalGameState } from '../../../db/types';
import { Controls } from './Controls';

// Define the cell type based on how it's used in useCreateGame
interface Cell {
  value: number | null;
  isGiven: boolean;
  notes: number[];
}

interface BoardProps {
  gameState: LocalGameState;
  onCellPress?: (row: number, col: number) => void;
  onNumberInput?: (number: number, isNote: boolean) => void;
}

export function Board({
  gameState,
  onCellPress,
  onNumberInput,
}: BoardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);

  const boardSize = screenWidth - 16;
  const cellSize = boardSize / 9;

  function handleCellPress(row: number, col: number) {
    setSelectedCell({ row, col });
    if (onCellPress) {
      onCellPress(row, col);
    }
  }

  function handleNumberPress(number: number) {
    if (onNumberInput) {
      onNumberInput(number, isNotesMode);
    }
  }

  function handleClearPress() {
    if (onNumberInput) {
      onNumberInput(0, false);
    }
  }

  function handleNotesPress() {
    setIsNotesMode(!isNotesMode);
  }

  function isRelatedCell(row: number, col: number) {
    if (!selectedCell) return false;

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

  function renderCell(row: number, col: number) {
    const cellIndex = row * 9 + col;

    let cell: Cell | undefined;

    try {
      const currentState =
        typeof gameState.current_state === 'string'
          ? JSON.parse(gameState.current_state)
          : gameState.current_state;

      cell = (currentState as unknown as Cell[])[cellIndex];
    } catch (error) {
      console.error('Error parsing game state:', error);
    }

    const borderTopClass =
      row === 0 ? 'border-t-2 border-t-black' : '';
    const borderLeftClass =
      col === 0 ? 'border-l-2 border-l-black' : '';
    const borderRightClass =
      (col + 1) % 3 === 0
        ? 'border-r-2 border-r-black'
        : col === 8
          ? 'border-r-2 border-r-black'
          : 'border-r border-r-gray-300';
    const borderBottomClass =
      (row + 1) % 3 === 0
        ? 'border-b-2 border-b-black'
        : row === 8
          ? 'border-b-2 border-b-black'
          : 'border-b border-b-gray-300';

    if (!cell) {
      return (
        <View
          key={`${row}-${col}`}
          style={{
            width: cellSize,
            height: cellSize,
          }}
          className={`items-center justify-center ${borderTopClass} ${borderLeftClass} ${borderRightClass} ${borderBottomClass}`}
        />
      );
    }

    const value = cell.value;
    const isGiven = cell.isGiven;
    const notes = cell.notes || [];
    const isSelected =
      selectedCell?.row === row &&
      selectedCell?.col === col;
    const isRelated = isRelatedCell(row, col);

    let bgColorClass = 'bg-white';
    if (isSelected) {
      bgColorClass = 'bg-primary-100';
    } else if (isRelated) {
      bgColorClass = 'bg-gray-100';
    }

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={{ width: cellSize, height: cellSize }}
        className={`items-center justify-center ${bgColorClass} ${borderTopClass} ${borderLeftClass} ${borderRightClass} ${borderBottomClass}`}
        onPress={() => handleCellPress(row, col)}
      >
        {value !== null && value !== 0 ? (
          <Text
            className={`text-xl font-bold ${isGiven ? 'text-black' : 'text-blue-600'}`}
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

  return (
    <View className="items-center">
      <View
        style={{ height: boardSize, width: boardSize }}
        className="shadow-custom"
      >
        {Array.from({ length: 9 }, (_, row) => (
          <View key={row} className="flex-row">
            {Array.from({ length: 9 }, (_, col) =>
              renderCell(row, col)
            )}
          </View>
        ))}
      </View>
      <View className="mt-6">
        <Controls
          onNumberPress={handleNumberPress}
          onErasePress={() => {}}
          onUndoPress={() => {}}
          onHintPress={() => {}}
          onNotesPress={handleNotesPress}
          isNotesMode={isNotesMode}
        />
      </View>
    </View>
  );
}
