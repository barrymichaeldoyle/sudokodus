import {
  ActionSheetProvider,
  useActionSheet,
} from '@expo/react-native-action-sheet';
import { Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { primary } from '../../src/colors';
import { Button } from '../../src/components/ui/Button';
import { Difficulty } from '../../src/db/types';
import { useStartGame } from '../../src/hooks/useStartGame';

const DIFFICULTY_OPTIONS: {
  label: string;
  difficulty: Difficulty;
}[] = [
  { label: 'Easy', difficulty: 'easy' },
  { label: 'Medium', difficulty: 'medium' },
  { label: 'Hard', difficulty: 'hard' },
  { label: 'Diabolical', difficulty: 'diabolical' },
] as const;

function HomeScreen() {
  const { startGame, isLoading } = useStartGame();
  const { showActionSheetWithOptions } = useActionSheet();

  async function showDifficultyOptions() {
    const options = [
      ...DIFFICULTY_OPTIONS.map(d => d.label),
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Difficulty',
        message: 'Select your level.',
        // TODO: make this based on selected theme in future.
        userInterfaceStyle: 'light',
      },
      selectedIndex => {
        if (
          selectedIndex !== undefined &&
          selectedIndex !== cancelButtonIndex
        ) {
          startGame(
            DIFFICULTY_OPTIONS[selectedIndex].difficulty
          );
        }
      }
    );
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
            label="New Game"
            onPress={showDifficultyOptions}
            isLoading={isLoading}
          />
        </View>
      </View>
    </>
  );
}

export default function HomeScreenWithProvider() {
  return (
    <ActionSheetProvider>
      <HomeScreen />
    </ActionSheetProvider>
  );
}
