import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import '../global.css';
import { usePuzzleManager } from '../src/hooks/usePuzzleManager';

export default function RootLayout() {
  const { ensureSufficientPuzzles } = usePuzzleManager();

  useEffect(() => {
    ensureSufficientPuzzles();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
