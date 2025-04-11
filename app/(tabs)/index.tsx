import { Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { primary } from '../../src/colors';
import { NewGameButton } from '../../src/components/NewGameButton';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'SudokoduS' }} />
      <View className="flex flex-1 justify-between gap-2 px-4 py-16">
        <View className="flex flex-col items-center justify-center">
          <View className="flex w-2/3 flex-col items-center justify-center gap-4 rounded-3xl bg-white py-16 shadow-custom">
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
          <NewGameButton />
        </View>
      </View>
    </>
  );
}
