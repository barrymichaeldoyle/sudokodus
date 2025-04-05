import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from 'react';

import '../global.css';
import { config } from '../src/config';
import { usePostHogCapture } from '../src/hooks/usePostHogCapture';
import { usePuzzleManager } from '../src/hooks/usePuzzleManager';

export default function RootLayout() {
  usePostHogCapture('app_opened');
  const { ensureSufficientPuzzles } = usePuzzleManager();

  useEffect(() => {
    ensureSufficientPuzzles();
  }, []);

  return (
    <PostHogProvider
      apiKey={config.posthog.key}
      options={{
        host: config.posthog.host,
        customStorage: AsyncStorage,
      }}
    >
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </PostHogProvider>
  );
}
