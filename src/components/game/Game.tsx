import { Text, View } from 'react-native';

import { DIFFICULTY_LABELS_MAP } from '../../db/types';
import { useGameState } from '../../hooks/useGameStates';
import { PageQueryLoader } from '../PageQueryLoader/PageQueryLoader';
import { Board } from './Board';

interface GameProps {
  puzzleString: string;
}

export function Game({ puzzleString }: GameProps) {
  const gameStateQuery = useGameState(puzzleString);

  return (
    <PageQueryLoader query={gameStateQuery}>
      {gameState => (
        <View className="flex flex-1 flex-col items-center justify-start">
          <View className="flex w-full flex-row justify-around p-4">
            <View className="flex flex-row items-center gap-1">
              <Text className="font-bold">Difficulty:</Text>
              <Text>
                {
                  DIFFICULTY_LABELS_MAP[
                    gameState.difficulty
                  ]
                }
              </Text>
            </View>
            <View className="flex flex-row items-center gap-1">
              <Text className="font-bold">Rating:</Text>
              <Text>{gameState.rating}</Text>
            </View>
          </View>
          <View className="flex flex-1 justify-start">
            <Board gameState={gameState} />
          </View>
        </View>
      )}
    </PageQueryLoader>
  );
}
