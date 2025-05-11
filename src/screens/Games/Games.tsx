import { FlatList, View } from 'react-native';

import { PageQueryLoader } from '../../components/PageQueryLoader/PageQueryLoader';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useActiveGames } from '../../hooks/useGameStates';
import { ActiveGamesListEmpty } from './ActiveGamesListEmpty';
import { GameItem } from './GameItem/GameItem';

export function GamesScreen() {
  const activeGamesQuery = useActiveGames();

  return (
    <ScreenContainer>
      <PageQueryLoader query={activeGamesQuery}>
        {({ data: activeGames }) => (
          <View className="flex-1">
            <FlatList
              data={activeGames}
              keyExtractor={item =>
                item.puzzle_string || ''
              }
              renderItem={({ item }) => (
                <GameItem game={item} />
              )}
              contentContainerClassName="min-h-full gap-2 p-4"
              ListEmptyComponent={ActiveGamesListEmpty}
              className="flex-1"
            />
          </View>
        )}
      </PageQueryLoader>
    </ScreenContainer>
  );
}
