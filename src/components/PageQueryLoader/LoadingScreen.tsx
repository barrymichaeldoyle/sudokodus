import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import { primary } from '../../colors';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <ActivityIndicator
        size="large"
        color={primary[500]}
      />
      <Text>Loading...</Text>
    </View>
  );
}
