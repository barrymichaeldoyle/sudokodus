import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface DetailItemProps {
  label: string;
  value: string | number | ReactNode;
}

export function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <View className="flex flex-1 flex-row justify-center gap-1">
      <Text className="font-bold">{label}:</Text>
      <Text>{value}</Text>
    </View>
  );
}
