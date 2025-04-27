import { View } from 'react-native';

import { PageQueryLoader } from '../PageQueryLoader/PageQueryLoader';
import { Board } from './Board/Board';
import { Controls } from './Controls/Controls';
import { Details } from './Details/Details';
import { useCurrentGameStateQuery } from './hooks/useCurrentGameStateQuery';

export function Game() {
  const gameStateQuery = useCurrentGameStateQuery();

  return (
    <View className="flex flex-1 flex-col">
      <PageQueryLoader query={gameStateQuery} ignoreLoading>
        {({ data: gameState }) => (
          <View className="flex flex-1 flex-col items-center justify-around">
            <Details gameState={gameState} />
            <Board gameState={gameState} />
            <Controls />
          </View>
        )}
      </PageQueryLoader>
      <View className="h-24 w-full bg-primary-500" />
    </View>
  );
}
