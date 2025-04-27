import { View } from 'react-native';

import { DIFFICULTY_LABELS_MAP } from '../../../db/types';
import { LocalGameStateWithPuzzle } from '../../../hooks/useGameStates';
import { DetailItem } from './DetailItem';

interface DetailsProps {
  gameState: LocalGameStateWithPuzzle | null;
}

export function Details({ gameState }: DetailsProps) {
  const { difficulty, rating } = gameState ?? {};

  return (
    <View className="flex w-full flex-row justify-around pt-4">
      <DetailItem
        label="Difficulty"
        value={
          difficulty
            ? DIFFICULTY_LABELS_MAP[difficulty]
            : '-'
        }
      />
      <DetailItem
        label="Rating"
        value={rating?.toString() ?? '-'}
      />
    </View>
  );
}
