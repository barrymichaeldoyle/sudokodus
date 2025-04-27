import { Text, View } from 'react-native';

import { Button } from '../ui/Button';

interface ErrorScreenProps {
  message: string;
  retry?: () => void;
}

export function ErrorScreen({
  message,
  retry,
}: ErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <Text className="text-2xl text-red-500">Error</Text>
      <Text className="text-center">{message}</Text>
      {retry && <Button onPress={retry} label="Retry" />}
    </View>
  );
}
