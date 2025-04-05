import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { PostHogProvider } from 'posthog-react-native';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import '../global.css';
import { config } from '../src/config';
import {
  initializeDatabaseTables,
  SQLITE_DB_NAME,
} from '../src/db/sqlite';
import { usePuzzleCacheManager } from '../src/hooks/usePuzzleCacheManager';
import { useAppStore } from '../src/stores/appStore';

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
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color="#0000ff"
            />
          </View>
        }
      >
        <SQLiteProvider
          databaseName={SQLITE_DB_NAME}
          onInit={initializeDatabaseTables}
          useSuspense
        >
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </SQLiteProvider>
        <StatusBar style="light" />
      </Suspense>
    </PostHogProvider>
  );
}

function AppContent() {
  const subscribeToNetworkChanges = useAppStore(
    state => state.subscribeToNetworkChanges
  );
  const networkStatus = useAppStore(
    state => state.networkStatus
  );
  const { ensureInitialCache } = usePuzzleCacheManager();

  useEffect(() => {
    const unsubscribe = subscribeToNetworkChanges();
    return () => unsubscribe();
  }, [subscribeToNetworkChanges]);

  useEffect(() => {
    if (networkStatus === 'online') {
      ensureInitialCache();
    }
  }, [networkStatus, ensureInitialCache]);

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
