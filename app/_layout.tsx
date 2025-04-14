import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import '../global.css';
import { primary } from '../src/colors';
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
      {/* TODO: linear gradients go here */}
      <LinearGradient
        // Fades from your primary blue to a lighter, softer blue
        colors={[
          primary[300],
          primary[100],
          primary[25],
          primary[100],
          primary[300],
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.8, 0.9, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <DatabaseProvider>
        <QueryClientProvider client={queryClient}>
          <ActionSheetProvider>
            <NetworkSyncManager>
              <Stack
                screenOptions={{
                  contentStyle: {
                    backgroundColor: 'transparent',
                  },
                }}
              >
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
