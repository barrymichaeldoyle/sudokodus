import { Text, View } from 'react-native';

interface DetailItemProps {
  label: string;
  value: string | number;
}

export function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <View className="flex flex-row items-center gap-1">
      <Text className="font-bold">{label}:</Text>
      <Text>{value}</Text>
    </View>
  );
}
