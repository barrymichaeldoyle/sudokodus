import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ActiveGamesListEmpty } from '../../src/components/ActiveGamesListEmpty';
import { ActiveGameDisplayInfo } from '../../src/db/sqlite';
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
    <View className="flex flex-1 p-4">
      <FlatList
        data={activeGames}
        keyExtractor={item => item.puzzle_string}
        renderItem={({ item }) => <GameItem game={item} />}
        contentContainerClassName="flex-1 gap-2"
        ListEmptyComponent={ActiveGamesListEmpty}
      />
    </View>
  );
}

function GameItem({
  game,
}: {
  game: ActiveGameDisplayInfo;
}) {
  return (
    <TouchableOpacity
      className="flex flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-lg shadow-black/10"
      onPressOut={() =>
        router.push(`/game/${game.puzzle_string || ''}`)
      }
    >
      <View className="flex flex-col gap-1">
        <Text className="text-lg font-semibold">
          Game {game.puzzle_string}
        </Text>
        <Text className="text-sm text-gray-600">
          Started{' '}
          {game.created_at
            ? new Date(game.created_at).toLocaleDateString()
            : 'Unknown date'}
        </Text>
      </View>
      <View className="flex flex-col items-end gap-1">
        <Text className="text-sm text-gray-600">
          {game.hints_used || 0} hints
        </Text>
      </View>
    </TouchableOpacity>
  );
}
