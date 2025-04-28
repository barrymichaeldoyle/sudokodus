import { router } from 'expo-router';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DIFFICULTY_LABELS_MAP } from '../../db/types';
import {
  LocalGameStateWithPuzzle,
  useDeleteGame,
} from '../../hooks/useGameStates';
import { MiniSudokuGrid } from './MiniSudokuGrid';

interface GameItemProps {
  game: LocalGameStateWithPuzzle;
}

export function GameItem({ game }: GameItemProps) {
  const deleteGame = useDeleteGame();

  async function handleDelete() {
    Alert.alert(
      'Delete Game',
      'This game will be removed from your list. You can always start a new one!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGame.mutateAsync(game.id);
            } catch (error) {
              console.error(
                'Failed to delete game:',
                error
              );
            }
          },
        },
      ]
    );
  }

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

        <TouchableOpacity
          className="mr-4 rounded-full p-2 active:bg-gray-100"
          onPress={handleDelete}
        >
          <Text className="text-red-500">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
