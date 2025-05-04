import { useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useGameStore } from '../../store';
import { useHandleUpdateCell } from '../hooks/useHandleUpdateCell';

interface NumberButtonProps {
  num: number;
}

export function NumberButton({ num }: NumberButtonProps) {
  const handleUpdate = useHandleUpdateCell();
  const selectedCell = useGameStore(
    state => state.selectedCell
  );

  const [size, setSize] = useState(24);

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setSize(size * 0.4);
  }

  function handlePress() {
    handleUpdate(num);
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
          {num}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
