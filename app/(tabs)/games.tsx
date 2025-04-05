import { observer } from '@legendapp/state/react';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { activeGameStates$ as _activeGameStates$ } from '../../src/db/supabase';

import { GameState } from '../../src/db/types';
import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function ActiveGamesScreen() {
  usePostHogCapture('active_games_screen_opened');

  return (
    <ActiveGames $activeGameStates={_activeGameStates$} />
  );
}

const ActiveGames = observer(
  ({
    $activeGameStates,
  }: {
    $activeGameStates: typeof _activeGameStates$;
  }) => {
    const activeGamesMap = $activeGameStates.get();

    if (!activeGamesMap) {
      return null;
    }

    const activeGames = Object.values(activeGamesMap);

    return (
      <View className="flex flex-1">
        <FlatList
          data={activeGames}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <GameItem game={item} />
          )}
          contentContainerClassName="p-4"
          ItemSeparatorComponent={() => (
            <View className="h-4" />
          )}
          ListEmptyComponent={() => (
            <View className="flex flex-1 items-center justify-center p-4">
              <Text className="text-center text-lg text-gray-600">
                No active games. Start a new game from the
                home screen!
              </Text>
            </View>
          )}
        />
      </View>
    );
  }
);

function GameItem({ game }: { game: GameState }) {
  return (
    <View
      className="flex flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-lg shadow-black/10"
      onTouchEnd={() =>
        router.push(`/game/${game.puzzle_string || ''}`)
      }
    >
      <View className="flex flex-col gap-1">
        <Text className="text-lg font-semibold">
          Game {game.id.slice(0, 8)}
        </Text>
        <Text className="text-sm text-gray-600">
          Started{' '}
          {game.created_at
            ? new Date(game.created_at).toLocaleDateString()
            : 'Unknown date'}
        </Text>
      </View>
      <View className="flex flex-col items-end gap-1">
        <Text className="text-sm font-medium text-gray-600">
          {game.moves_count || 0} moves
        </Text>
        <Text className="text-sm text-gray-600">
          {game.hints_used || 0} hints
        </Text>
      </View>
    </View>
  );
}
