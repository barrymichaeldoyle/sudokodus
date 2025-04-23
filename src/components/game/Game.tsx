import { View } from 'react-native';

import { useGameState } from '../../hooks/useGameStates';
import { PageQueryLoader } from '../PageQueryLoader/PageQueryLoader';
import { Board } from './Board/Board';
import { Details } from './Details/Details';

interface GameProps {
  puzzleString: string;
}

export function Game({ puzzleString }: GameProps) {
  const gameStateQuery = useGameState(puzzleString);

  return (
    <View className="flex flex-1 flex-col">
      <PageQueryLoader query={gameStateQuery} ignoreLoading>
        {({ data: gameState, isLoading }) => (
          <View className="flex flex-1 flex-col items-center justify-start">
            <Details gameState={gameState} />
            <View className="flex flex-1 justify-start">
              <Board gameState={gameState} />
            </View>
          </View>
        )}
      </PageQueryLoader>
      <View className="h-24 w-full bg-primary-500" />
    </View>
  );
}
