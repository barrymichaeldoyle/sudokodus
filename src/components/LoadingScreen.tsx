import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
}
