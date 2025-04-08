import { Text, View } from 'react-native';

interface ErrorScreenProps {
  message: string;
}

export function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text className="text-2xl text-red-500">Error</Text>
      <Text className="text-center">{message}</Text>
    </View>
  );
}
