import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { usePostHogCapture } from '../src/hooks/usePostHogCapture';

export default function NotFoundScreen() {
  usePostHogCapture('not_found_screen_opened');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Oops! Not Found',
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex-1 items-center justify-center">
        <Link href="/" className="text-xl underline">
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
