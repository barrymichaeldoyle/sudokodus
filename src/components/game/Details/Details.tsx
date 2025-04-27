import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import { primary } from '../../../colors';
import { DIFFICULTY_LABELS_MAP } from '../../../db/types';
import { LocalGameStateWithPuzzle } from '../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../hooks/useCurrentGameStateQuery';
import { DetailItem } from './DetailItem';

interface DetailsProps {
  gameState: LocalGameStateWithPuzzle | null;
}

export function Details({ gameState }: DetailsProps) {
  const { isLoading } = useCurrentGameStateQuery();
  const { difficulty, rating } = gameState ?? {};

  return (
    <View className="flex w-full flex-row justify-around pt-4">
      {isLoading ? (
        <View className="-mt-1 flex-1 flex-row items-center justify-center gap-2">
          <ActivityIndicator
            size="small"
            color={primary[500]}
          />
          <Text>Loading Puzzle...</Text>
        </View>
      ) : (
        <>
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
        </>
      )}
    </View>
  );
}
