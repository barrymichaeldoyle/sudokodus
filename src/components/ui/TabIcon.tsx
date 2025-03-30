import { Ionicons } from '@expo/vector-icons';
import { SFSymbol, SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';

interface TabIconProps {
  focused: boolean;
  size: number;
  color: string;
  ios: { name: SFSymbol; focusedName?: SFSymbol };
  web: { name: keyof typeof Ionicons.glyphMap };
}

function TabIcon({
  focused,
  size,
  color,
  ios,
  web,
}: TabIconProps) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={
          focused ? ios.focusedName || ios.name : ios.name
        }
        size={size}
        tintColor={color}
      />
    );
  }

  return (
    <Ionicons
      name={
        focused
          ? web.name
          : (`${web.name}-outline` as keyof typeof Ionicons.glyphMap)
      }
      size={size}
      color={color}
    />
  );
}

export function renderTabIcon(
  icons: Omit<TabIconProps, 'focused' | 'size' | 'color'>
) {
  return ({
    focused,
    size,
    color,
  }: {
    focused: boolean;
    size: number;
    color: string;
  }) => (
    <TabIcon
      focused={focused}
      size={size}
      color={color}
      ios={icons.ios}
      web={icons.web}
    />
  );
}
