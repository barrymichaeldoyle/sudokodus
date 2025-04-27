import { type SFSymbol, SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from 'react-native';
import { primary } from '../../../../colors';

interface ActionButtonProps {
  icon: SFSymbol;
  onPress: () => void;
}

export function ActionButton({
  icon,
  onPress,
}: ActionButtonProps) {
  const [iconSize, setIconSize] = useState(24);

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setIconSize(size * 0.5);
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 p-2"
    >
      <View
        onLayout={handleLayout}
        className="aspect-square items-center justify-center rounded-md bg-white active:bg-primary-100"
      >
        <SymbolView
          name={icon}
          size={iconSize}
          tintColor={primary[500]}
        />
      </View>
    </TouchableOpacity>
  );
}
