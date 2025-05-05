import { SFSymbol, SymbolView } from 'expo-symbols';
import { Platform, Switch, Text, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { primary } from '../../colors';

interface SettingsItemProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  title: string;
  iosIconName: SFSymbol;
  isLastItem?: boolean;
}

export function SettingsItem({
  value,
  onValueChange,
  title,
  iosIconName,
  isLastItem = false,
}: SettingsItemProps) {
  return (
    <View
      className={twMerge(
        'flex-row items-center justify-between p-3',
        !isLastItem && 'border-b border-gray-300'
      )}
    >
      <View className="flex-1 flex-row items-center gap-2">
        {Platform.OS === 'ios' && (
          <SymbolView
            name={iosIconName}
            size={20}
            tintColor={primary[500]}
          />
        )}
        <Text className="text-base text-black">
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          true: primary[500],
          false: primary[200],
        }}
      />
    </View>
  );
}
