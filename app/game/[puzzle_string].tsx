import { useLocalSearchParams } from 'expo-router';

import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';
import GameScreen from '../../src/screens/Game/Game';
import { GameScreenParams } from '../../src/types';

export default function Game() {
  const { puzzle_string } =
    useLocalSearchParams<GameScreenParams>();
  usePostHogCapture('game_opened', {
    puzzle_string,
  });

  return <GameScreen />;
}
