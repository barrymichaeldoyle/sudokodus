import { Text, View } from 'react-native';

import { NewGameButton } from '../NewGameButton';

export function ActiveGamesListEmpty() {
  return (
    <View className="flex flex-1 items-center justify-center gap-8">
      <Text className="text-center text-lg text-gray-600">
        No active games. Start a new game to begin playing!
      </Text>
      <NewGameButton />
    </View>
  );
}
