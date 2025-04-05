import { Text, View } from 'react-native';

import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function MeScreen() {
  usePostHogCapture('me_screen_opened');

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Me Screen</Text>
    </View>
  );
}
