import { useLocalSearchParams } from 'expo-router';

import { useGameState } from '../../../hooks/useGameStates';
import { GameScreenParams } from '../../../types';

export function useCurrentGameStateQuery() {
  const { puzzle_string } =
    useLocalSearchParams<GameScreenParams>();

  const gameStateQuery = useGameState(puzzle_string);

  // Loading state toggle for testing purposes
  // const [isLoading, setLoading] = useState(false);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setLoading(prev => !prev);
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, []);
  // return { ...gameStateQuery, isLoading };

  return gameStateQuery;
}
