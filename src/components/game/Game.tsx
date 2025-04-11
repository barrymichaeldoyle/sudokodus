import { Text, View } from 'react-native';
import { usePuzzle } from '../../hooks/usePuzzles';
import { PageQueryLoader } from '../PageQueryLoader/PageQueryLoader';

interface GameProps {
  puzzleString: string;
}

export function Game({ puzzleString }: GameProps) {
  const puzzleQuery = usePuzzle(puzzleString);

  return (
    <PageQueryLoader query={puzzleQuery}>
      {puzzle => (
        <View className="flex flex-1 items-center justify-center">
          <Text>Difficulty: {puzzle.difficulty}</Text>
          <Text>{puzzleString}</Text>
        </View>
      )}
    </PageQueryLoader>
  );
}
