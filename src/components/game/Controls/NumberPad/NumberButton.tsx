import { useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUpdateCell } from '../../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../../store';

interface NumberButtonProps {
  number: number;
}

export function NumberButton({
  number,
}: NumberButtonProps) {
  const [size, setSize] = useState(24);
  const { data: gameState } = useCurrentGameStateQuery();
  const { selectedCell, isNotesMode } = useGameStore();
  const updateCell = useUpdateCell();

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setSize(size * 0.4);
  }

  function handlePress() {
    if (!selectedCell || !gameState?.puzzle_string) {
      return;
    }

    updateCell.mutate({
      puzzleString: gameState.puzzle_string,
      row: selectedCell.row,
      col: selectedCell.col,
      value: number,
      isNotesMode,
    });
  }

  return (
    <View className="flex-1 p-1">
      <TouchableOpacity
        disabled={!selectedCell}
        onPress={handlePress}
        onLayout={handleLayout}
        className="aspect-square items-center justify-center rounded-full border-2 border-primary-500 bg-white active:bg-primary-100"
      >
        <Text
          className="font-bold text-primary-500"
          style={{ fontSize: size }}
        >
          {number}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
