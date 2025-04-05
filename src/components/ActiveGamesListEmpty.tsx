import { Text, View } from 'react-native';

import { useStartNewGame } from '../hooks/useStartNewGame';
import { Button } from './ui/Button';

export function ActiveGamesListEmpty() {
  const { showGameDifficultyOptions, isLoading } =
    useStartNewGame();

  return (
    <View className="flex flex-1 items-center justify-center gap-8">
      <Text className="text-center text-lg text-gray-600">
        No active games. Start a new game to begin playing!
      </Text>
      <Button
        label="Start New Game"
        onPress={showGameDifficultyOptions}
        isLoading={isLoading}
      />
    </View>
  );
}
