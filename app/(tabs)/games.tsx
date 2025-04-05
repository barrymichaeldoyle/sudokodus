import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ActiveGamesListEmpty } from '../../src/components/games/ActiveGamesListEmpty';
import { GameItem } from '../../src/components/games/GameItem';
import { useActiveGames } from '../../src/hooks/useActiveGames';

export default function ActiveGamesScreen() {
  const {
    data: activeGames,
    isLoading,
    error,
    refetch,
  } = useActiveGames();

  if (isLoading) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Loading active games...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-red-500">
          Error loading games: {error.message}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="rounded-md bg-blue-500 p-2"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <FlatList
        data={activeGames}
        keyExtractor={item => item.puzzle_string}
        renderItem={({ item }) => <GameItem game={item} />}
        contentContainerClassName="flex-1 gap-2 p-4"
        ListEmptyComponent={ActiveGamesListEmpty}
      />
    </View>
  );
}
