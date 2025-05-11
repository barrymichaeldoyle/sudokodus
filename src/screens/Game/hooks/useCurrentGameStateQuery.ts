import { useLocalSearchParams } from 'expo-router';

import { useGameState } from '../../../hooks/useGameStates';
import { GameScreenParams } from '../../../types';

export function useCurrentGameStateQuery() {
  const { puzzle_string } =
    useLocalSearchParams<GameScreenParams>();

  const gameStateQuery = useGameState(puzzle_string);

  return gameStateQuery;
}
