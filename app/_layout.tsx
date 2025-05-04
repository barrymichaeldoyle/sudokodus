import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import 'expo-dev-client';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { verifyInstallation } from 'nativewind';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from 'react';
import mobileAds, {
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

import '../global.css';
import { primary, white } from '../src/colors';
import { config } from '../src/config';
import { DatabaseProvider } from '../src/db/DatabaseProvider';
import { NetworkSyncManager } from '../src/NetworkSyncManager/NetworkSyncManager';
import { createMMKVStorage } from '../src/utils/createMMKVStorage';

const queryClient = new QueryClient();

const POSTHOG_STORAGE_KEY = 'posthog-storage';
const posthogStorage = createMMKVStorage(
  POSTHOG_STORAGE_KEY
);

export default function RootLayout() {
  verifyInstallation();

  useEffect(() => {
    async function initializeServices() {
      const { status } =
        await getTrackingPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        await requestTrackingPermissionsAsync();
      }

      await mobileAds().initialize();
      mobileAds().setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,

        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: true,

        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: true,

        // An array of test device IDs to allow.
        testDeviceIdentifiers: ['EMULATOR'],
      });
    }

    initializeServices();
  }, []);

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
                    headerRight: () => (
                      <Link href="/settings">
                        <SymbolView
                          name="gearshape.fill"
                          size={24}
                          tintColor={white}
                        />
                      </Link>
                    ),
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
