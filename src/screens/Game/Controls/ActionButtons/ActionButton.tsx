import { type SFSymbol, SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { primary } from '../../../../colors';
import { useHapticFeedback } from '../../../../hooks/useHapticFeedback';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';

interface ActionButtonProps {
  badge?: string;
  icon: SFSymbol;
  label: string;
  onPressIn: () => void;
}

export function ActionButton({
  badge,
  icon,
  label,
  onPressIn,
}: ActionButtonProps) {
  const { isLoading } = useCurrentGameStateQuery();
  const [iconSize, setIconSize] = useState(24);
  const { selectionAsync } = useHapticFeedback();

  function handleLayout(e: LayoutChangeEvent) {
    const size = Math.min(
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height
    );
    setIconSize(size * 0.5);
  }

  function handlePress() {
    selectionAsync();
    onPressIn();
  }

  return (
    <View className="flex-1 p-2">
      <TouchableOpacity
        disabled={isLoading}
        onPressIn={handlePress}
        onLayout={handleLayout}
        className="aspect-square items-center justify-center rounded-md border-2 border-primary-500 bg-white active:bg-primary-100"
      >
        <View className="flex flex-col items-center gap-1">
          {badge && (
            <View className="absolute -left-5 -top-4 z-10 rounded-full bg-primary-500 px-2 py-1">
              <Text className="text-xs font-bold text-white">
                {badge}
              </Text>
            </View>
          )}
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
