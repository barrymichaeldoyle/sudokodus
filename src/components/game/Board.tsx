import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LocalGameState } from '../../db/types';

// Define the cell type based on how it's used in useCreateGame
interface Cell {
  value: number | null;
  isGiven: boolean;
  notes: number[];
}

interface BoardProps {
  gameState: LocalGameState;
  onCellPress?: (row: number, col: number) => void;
}

export function Board({
  gameState,
  onCellPress,
}: BoardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Calculate board size based on screen width
  // We'll use the screen width minus some padding
  const boardSize = screenWidth - 16; // 8px padding on each side
  const cellSize = boardSize / 9;

  // Handle cell selection
  function handleCellPress(row: number, col: number) {
    setSelectedCell({ row, col });
    if (onCellPress) {
      onCellPress(row, col);
    }
  }

  // Check if a cell is in the same row, column, or box as the selected cell
  function isRelatedCell(row: number, col: number) {
    if (!selectedCell) return false;

    const { row: selectedRow, col: selectedCol } =
      selectedCell;

    // Same row
    if (row === selectedRow) {
      return true;
    }

    // Same column
    if (col === selectedCol) {
      return true;
    }

    // Same 3x3 box
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selectedBoxRow = Math.floor(selectedRow / 3);
    const selectedBoxCol = Math.floor(selectedCol / 3);

    return (
      boxRow === selectedBoxRow && boxCol === selectedBoxCol
    );
  }

  // Render a single cell
  function renderCell(row: number, col: number) {
    const cellIndex = row * 9 + col;

    // Safely access the current_state
    let cell: Cell | undefined;

    try {
      // The current_state is stored as a JSON string in the database
      // We need to parse it if it's a string, or use it directly if it's already an object
      const currentState =
        typeof gameState.current_state === 'string'
          ? JSON.parse(gameState.current_state)
          : gameState.current_state;

      // Now we can safely cast it to our Cell[] type
      cell = (currentState as unknown as Cell[])[cellIndex];
    } catch (error) {
      console.error('Error parsing game state:', error);
    }

    if (!cell) {
      return (
        <View
          key={`${row}-${col}`}
          style={{
            width: cellSize,
            height: cellSize,
          }}
          className={`items-center justify-center ${
            (col + 1) % 3 === 0
              ? 'border-r-2 border-r-gray-400'
              : 'border-r border-r-gray-300'
          } ${
            (row + 1) % 3 === 0
              ? 'border-b-2 border-b-gray-400'
              : 'border-b border-b-gray-300'
          }`}
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

    // Determine cell background color based on selection and related cells
    let bgColorClass = 'bg-white';
    if (isSelected) {
      bgColorClass = 'bg-blue-50'; // Light blue for selected cell
    } else if (isRelated) {
      bgColorClass = 'bg-gray-100'; // Light gray for related cells
    }

    // Add border styling for 3x3 boxes
    const borderRightClass =
      (col + 1) % 3 === 0
        ? 'border-r-2 border-r-gray-400'
        : 'border-r border-r-gray-300';
    const borderBottomClass =
      (row + 1) % 3 === 0
        ? 'border-b-2 border-b-gray-400'
        : 'border-b border-b-gray-300';

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={{
          width: cellSize,
          height: cellSize,
        }}
        className={`items-center justify-center border-gray-300 ${bgColorClass} ${borderRightClass} ${borderBottomClass}`}
        onPress={() => handleCellPress(row, col)}
      >
        {value !== null ? (
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

  // Render the entire board
  return (
    <View
      style={{
        width: boardSize,
        height: boardSize,
      }}
      className="self-center border-2 border-gray-400"
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} className="flex-row">
          {Array.from({ length: 9 }, (_, col) =>
            renderCell(row, col)
          )}
        </View>
      ))}
    </View>
  );
}
