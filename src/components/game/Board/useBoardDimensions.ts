import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useBoardDimensions(): {
  boardSize: number;
  cellSize: number;
} {
  const { width: screenWidth } = useWindowDimensions();

  return useMemo(() => {
    const boardSize = screenWidth - 16;
    const cellSize = boardSize / 9;

    return { boardSize, cellSize };
  }, [screenWidth]);
}
