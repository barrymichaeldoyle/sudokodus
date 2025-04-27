import { useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NumberButtonProps {
  number: number;
}

export function NumberButton({
  number,
}: NumberButtonProps) {
  const [size, setSize] = useState(24);

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setSize(size * 0.4);
  }

  return (
    <View className="flex-1 p-1">
      <TouchableOpacity
        onPress={() => console.log(number, 'pressed')}
        onLayout={handleLayout}
        className="aspect-square items-center justify-center rounded-full bg-white active:bg-primary-100"
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
