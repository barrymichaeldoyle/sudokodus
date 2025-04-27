import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { DIFFICULTY_LABELS_MAP } from '../../db/types';
import { LocalGameStateWithPuzzle } from '../../hooks/useGameStates';
import { MiniSudokuGrid } from './MiniSudokuGrid';

interface GameItemProps {
  game: LocalGameStateWithPuzzle;
}

const DIFFICULTY_COLORS = {
  easy: 'text-green-600',
  medium: 'text-blue-600',
  hard: 'text-orange-600',
  diabolical: 'text-red-600',
} as const;

export function GameItem({ game }: GameItemProps) {
  return (
    <TouchableOpacity
      className="group flex flex-row items-center justify-between overflow-hidden rounded-l-md rounded-r-2xl bg-white shadow-lg shadow-black/5 active:bg-gray-50"
      onPress={() =>
        router.push(`/game/${game.puzzle_string || ''}`)
      }
    >
      <View className="flex flex-1 flex-row items-center gap-4">
        <MiniSudokuGrid puzzleString={game.puzzle_string} />

        <View className="flex flex-1 flex-col pr-4">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-lg font-medium text-gray-900">
              {DIFFICULTY_LABELS_MAP[game.difficulty]}
            </Text>
            <Text className="text-sm text-gray-500">
              Game
            </Text>
          </View>

          <View className="flex flex-row items-center gap-2">
            <Text className="text-sm text-gray-600">
              Started{' '}
              {game.created_at
                ? new Date(
                    game.created_at
                  ).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown date'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
