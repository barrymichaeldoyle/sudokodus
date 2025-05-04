import { View } from 'react-native';

import { DIFFICULTY_LABELS_MAP } from '../../../db/types';
import { useCurrentGameStateQuery } from '../hooks/useCurrentGameStateQuery';
import { DetailItem } from './DetailItem';

export function Details() {
  const { data: gameState } = useCurrentGameStateQuery();
  const { difficulty, rating } = gameState ?? {};

  return (
    <View className="flex w-full flex-row items-center">
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
