import { type SFSymbol, SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { primary } from '../../../../colors';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';

interface ActionButtonProps {
  icon: SFSymbol;
  label: string;
  onPress: () => void;
}

export function ActionButton({
  icon,
  label,
  onPress,
}: ActionButtonProps) {
  const { isLoading } = useCurrentGameStateQuery();
  const [iconSize, setIconSize] = useState(24);

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setIconSize(size * 0.5);
  }

  function handlePress() {
    console.log('pressed');
    onPress();
  }

  return (
    <View className="flex-1 p-2">
      <TouchableOpacity
        disabled={isLoading}
        onPress={handlePress}
        onLayout={handleLayout}
        className="aspect-square items-center justify-center rounded-md border-2 border-primary-500 bg-white active:bg-primary-100"
      >
        <View className="flex flex-col items-center gap-1">
          <SymbolView
            name={icon}
            size={iconSize}
            tintColor={primary[500]}
          />
          <Text className="-mb-2 font-bold text-primary-500">
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
