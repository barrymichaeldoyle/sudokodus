import { useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { black, primary } from '../../../colors';
import { Cell } from './Cell';

interface BoardProps {
  onCellPress?: (row: number, col: number) => void;
}

const thinLineColor = primary[200];
const thickLineColor = black;
const thinLineWidth = StyleSheet.hairlineWidth;
const thickLineWidth = 2;

export function Board({ onCellPress }: BoardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const boardSize = screenWidth - 16;
  const cellSize = boardSize / 9;

  function handleCellPress(row: number, col: number) {
    setSelectedCell({ row, col });
    if (onCellPress) {
      onCellPress(row, col);
    }
  }

  function isRelatedCell(row: number, col: number) {
    if (!selectedCell) return false;
    const { row: selectedRow, col: selectedCol } =
      selectedCell;
    if (row === selectedRow) return true;
    if (col === selectedCol) return true;
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const selectedBoxRow = Math.floor(selectedRow / 3);
    const selectedBoxCol = Math.floor(selectedCol / 3);
    return (
      boxRow === selectedBoxRow && boxCol === selectedBoxCol
    );
  }

  function getLineStyle(
    index: number,
    orientation: 'horizontal' | 'vertical'
  ) {
    const isThick = index % 3 === 0;
    const thickness = isThick
      ? thickLineWidth
      : thinLineWidth;
    const color = isThick ? thickLineColor : thinLineColor;
    const position =
      index * cellSize - (isThick ? thickness / 2 : 0);

    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: color,
    };

    if (orientation === 'horizontal') {
      return {
        ...baseStyle,
        top: position,
        left: -thickLineWidth / 2,
        width: boardSize + thickLineWidth,
        height: thickness,
      };
    }
    return {
      ...baseStyle,
      top: -thickLineWidth / 2,
      left: position,
      width: thickness,
      height: boardSize + thickLineWidth,
    };
  }

  return (
    <View className="flex flex-col items-center">
      <View
        style={{ height: boardSize, width: boardSize }}
        className="bg-white shadow-custom"
      >
        {Array.from({ length: 9 }, (_, row) => (
          <View key={`row-${row}`} className="flex-row">
            {Array.from({ length: 9 }, (_, col) => (
              <Cell
                key={`cell-${row}-${col}`}
                size={cellSize}
                row={row}
                col={col}
                isSelected={
                  selectedCell?.row === row &&
                  selectedCell?.col === col
                }
                isRelated={isRelatedCell(row, col)}
                onPress={handleCellPress}
              />
            ))}
          </View>
        ))}

        {Array.from({ length: 10 }, (_, i) =>
          i % 3 !== 0 ? (
            <View
              key={`h-thin-line-${i}`}
              style={{
                ...getLineStyle(i, 'horizontal'),
                zIndex: 1,
              }}
            />
          ) : null
        )}
        {Array.from({ length: 10 }, (_, i) =>
          i % 3 !== 0 ? (
            <View
              key={`v-thin-line-${i}`}
              style={{
                ...getLineStyle(i, 'vertical'),
                zIndex: 1,
              }}
            />
          ) : null
        )}

        {Array.from({ length: 10 }, (_, i) =>
          i % 3 === 0 ? (
            <View
              key={`h-thick-line-${i}`}
              style={{
                ...getLineStyle(i, 'horizontal'),
                zIndex: 2,
              }}
            />
          ) : null
        )}
        {Array.from({ length: 10 }, (_, i) =>
          i % 3 === 0 ? ( // Only thick lines
            <View
              key={`v-thick-line-${i}`}
              style={{
                ...getLineStyle(i, 'vertical'),
                zIndex: 2,
              }}
            />
          ) : null
        )}
      </View>
    </View>
  );
}
