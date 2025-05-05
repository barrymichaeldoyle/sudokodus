import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { verifyInstallation } from 'nativewind';
import { PostHogProvider } from 'posthog-react-native';

import '../global.css';
import { primary, white } from '../src/colors';
import { SettingsLink } from '../src/components/settings/SettingsLink';
import { config } from '../src/config';
import { DatabaseProvider } from '../src/db/DatabaseProvider';
import { useSetupAdMob } from '../src/hooks/useSetupAdMob/useSetupAdMob';
import { NetworkSyncManager } from '../src/NetworkSyncManager/NetworkSyncManager';
import { createMMKVStorage } from '../src/utils/createMMKVStorage';

const queryClient = new QueryClient();

const POSTHOG_STORAGE_KEY = 'posthog-storage';
const posthogStorage = createMMKVStorage(
  POSTHOG_STORAGE_KEY
);

export default function RootLayout() {
  verifyInstallation();
  useSetupAdMob();

  return (
    <PostHogProvider
      apiKey={config.posthog.key}
      options={{
        host: config.posthog.host,
        customStorage: posthogStorage,
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
                <Stack.Screen
                  name="game/[puzzle_string]"
                  options={{
                    title: 'SUDOKODUS',
                    headerBackTitle: 'Back',
                    headerStyle: {
                      backgroundColor: primary['500'],
                    },
                    headerTintColor: white,
                    headerShadowVisible: false,
                    animation: 'slide_from_bottom',
                    headerRight: SettingsLink,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    title: 'Settings',
                    headerBackTitle: 'Back',
                    headerStyle: {
                      backgroundColor: primary['500'],
                    },
                    headerTintColor: white,
                  }}
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
