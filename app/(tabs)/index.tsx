import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { primary } from '../../src/colors';
import { Button } from '../../src/components/Button';
import { createNewGame } from '../../src/db/actions/createNewGame';
import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function HomeScreen() {
  usePostHogCapture('home_screen_opened');
  const [error, setError] = useState<string | null>(null);

  async function handleStartNewGame() {
    setError(null);

    try {
      const gameState = await createNewGame('easy');
      if (!gameState) {
        throw new Error('Failed to create new game');
      }
      router.push(`/game/${gameState?.puzzle_string}`);
    } catch (error: any) {
      setError(
        `Failed to start new game: ${error?.message || 'Unknown error'}`
      );
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'SudokoduS' }} />
      <View className="flex flex-1 justify-between gap-2 px-4 py-16">
        <View className="flex flex-col items-center justify-center">
          <View className="flex w-2/3 flex-col items-center justify-center gap-4 rounded-3xl bg-[#D9D9D9] py-16">
            <View className="flex flex-col items-center justify-between gap-1 font-medium">
              <Text>Daily Challenges</Text>
              <Text>coming soon!</Text>
            </View>
            <View className="items-center">
              <SymbolView
                name="trophy.fill"
                size={64}
                weight="semibold"
                tintColor={primary[800]}
              />
            </View>
          </View>
        </View>
        <View className="flex flex-col gap-4">
          <Button
            label="Continue Game"
            variant="primary"
            onPress={handleStartNewGame}
          />
          <Button
            label="New Game"
            variant="secondary"
            onPress={handleStartNewGame}
          />
          {error && (
            <Text className="mt-4 text-red-500">
              {error}
            </Text>
          )}
        </View>
      </View>
    </>
  );
}
