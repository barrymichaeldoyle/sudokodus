import { Text, View } from 'react-native';

import { useGameState } from '../../hooks/useGameStates';
import { PageQueryLoader } from '../PageQueryLoader/PageQueryLoader';
import { Board } from './Board';

interface GameProps {
  puzzleString: string;
}

export function Game({ puzzleString }: GameProps) {
  const gameQuery = useGameState(puzzleString);

  return (
    <PageQueryLoader query={gameQuery}>
      {game => (
        <View className="flex flex-1 items-center justify-center">
          <Text>Difficulty: {game.puzzle_string}</Text>
          <Text>{puzzleString}</Text>
          <Board />
        </View>
      )}
    </PageQueryLoader>
  );
}
