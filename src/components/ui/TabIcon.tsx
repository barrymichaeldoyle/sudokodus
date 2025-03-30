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
    const name = focused
      ? ios.focusedName || ios.name
      : ios.name;
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color}
      />
    );
  }

  const name = focused
    ? web.name
    : `${web.name}-outline` in Ionicons.glyphMap
      ? (`${web.name}-outline` as keyof typeof Ionicons.glyphMap)
      : web.name;
  return <Ionicons name={name} size={size} color={color} />;
}

interface TabBarIconProps {
  focused: boolean;
  size: number;
  color: string;
}
export function renderTabIcon(
  icons: Omit<TabIconProps, keyof TabBarIconProps>
) {
  return ({ focused, size, color }: TabBarIconProps) => (
    <TabIcon
      focused={focused}
      size={size}
      color={color}
      ios={icons.ios}
      web={icons.web}
    />
  );
}
