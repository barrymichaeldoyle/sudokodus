import { FlatList, View } from 'react-native';

import { ActiveGamesListEmpty } from '../../src/components/games/ActiveGamesListEmpty';
import { GameItem } from '../../src/components/games/GameItem';
import { PageQueryLoader } from '../../src/components/PageQueryLoader/PageQueryLoader';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { useActiveGames } from '../../src/hooks/useGameStates';

export default function ActiveGamesScreen() {
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
              contentContainerClassName="gap-2 p-4"
              ListEmptyComponent={ActiveGamesListEmpty}
            />
          </View>
        )}
      </PageQueryLoader>
    </ScreenContainer>
  );
}
