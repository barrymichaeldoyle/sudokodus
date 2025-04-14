import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';

import '../global.css';
import { config } from '../src/config';
import { DatabaseProvider } from '../src/db/DatabaseProvider';
import { NetworkSyncManager } from '../src/NetworkSyncManager/NetworkSyncManager';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={config.posthog.key}
      options={{
        host: config.posthog.host,
        customStorage: AsyncStorage,
      }}
    >
      <DatabaseProvider>
        <QueryClientProvider client={queryClient}>
          <ActionSheetProvider>
            <NetworkSyncManager>
              <Stack>
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NetworkSyncManager>
          </ActionSheetProvider>
        </QueryClientProvider>
      </DatabaseProvider>
      <StatusBar style="light" />
    </PostHogProvider>
  );
}
