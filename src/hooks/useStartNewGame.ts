import { useActionSheet } from '@expo/react-native-action-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { router, usePathname } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  getUnusedPuzzle,
  markPuzzleAsUsed,
  saveLocalGameState,
} from '../db/sqlite';
import { Difficulty } from '../db/types';
import { generateId } from '../db/utils/generateId';
import { ACTIVE_GAMES_QUERY_KEY } from './useActiveGames';
import { usePuzzleCacheManager } from './usePuzzleCacheManager';

const ACTIVE_GAMES_PATH = '/games';

interface CellState {
  value: number | null;
  isGiven: boolean;
}

interface CurrentState {
  grid: CellState[][];
  selectedCell: { row: number; col: number } | null;
}

interface NotesState {
  cells: Record<string, number[]>; // key is "row,col", value is array of pencil marks
}

interface Move {
  type: 'setValue' | 'setNotes';
  cell: { row: number; col: number };
  value: number | null;
  notes?: number[];
  previousValue?: number | null;
  previousNotes?: number[];
}

interface LocalGameState {
  id: string;
  user_id: string | null;
  puzzle_string: string;
  current_state: CurrentState;
  notes: NotesState | null;
  is_completed: boolean;
  hints_used: number;
  last_hint_at: string | null;
  moves_history: Move[];
  current_move_index: number;
}

export function useStartNewGame(): {
  isLoading: boolean;
  startNewGame: (difficulty: Difficulty) => Promise<void>;
  showGameDifficultyOptions: () => void;
} {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { checkAndReplenishIfNeeded } =
    usePuzzleCacheManager();
  const { showActionSheetWithOptions } = useActionSheet();
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isOnGamesPage = pathname === ACTIVE_GAMES_PATH;

  const startNewGame = useCallback(
    async (difficulty: Difficulty) => {
      setIsLoading(true);
      try {
        const puzzle = await getUnusedPuzzle(
          db,
          difficulty
        );
        if (puzzle) {
          await markPuzzleAsUsed(db, puzzle.puzzle_string);

          // Create initial game state
          const newGameId = generateId();

          // Convert puzzle string to initial grid state
          const initialState: CurrentState = {
            grid: Array(9)
              .fill(null)
              .map((_, row) =>
                Array(9)
                  .fill(null)
                  .map((_, col) => {
                    const value = parseInt(
                      puzzle.puzzle_string[row * 9 + col]
                    );
                    return {
                      value: isNaN(value) ? null : value,
                      isGiven: value > 0,
                    };
                  })
              ),
            selectedCell: null,
          };

          const now = Date.now();
          const newGameState = {
            id: newGameId,
            user_id: null,
            puzzle_string: puzzle.puzzle_string,
            current_state: JSON.stringify(initialState),
            notes: JSON.stringify({ cells: {} }),
            is_completed: false,
            hints_used: 0,
            last_hint_at: null,
            moves_history: JSON.stringify([]),
            current_move_index: -1,
            created_at: now,
            updated_at: now,
          };

          await saveLocalGameState(db, newGameState);

          // Invalidate queries to refresh the games list
          queryClient.invalidateQueries({
            queryKey: [ACTIVE_GAMES_QUERY_KEY],
          });

          router.push({
            pathname: `/game/${newGameId}`,
          });

          return checkAndReplenishIfNeeded(difficulty);
        }

        Alert.alert(
          'No Puzzles Available',
          isOnGamesPage
            ? `No new ${difficulty} puzzles available locally. Try connecting to the internet to download more puzzles.`
            : `No new ${difficulty} puzzles available locally. Try connecting to the internet, or check your active games.`,
          isOnGamesPage
            ? [{ text: 'OK', style: 'cancel' }]
            : [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'View Active Games',
                  onPress: () =>
                    router.push(ACTIVE_GAMES_PATH),
                  style: 'default',
                },
              ]
        );
      } catch (error) {
        console.error('Error starting game:', error);
        Alert.alert(
          'Error',
          'Failed to start a new game. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      db,
      checkAndReplenishIfNeeded,
      isOnGamesPage,
      queryClient,
    ]
  );

  const showGameDifficultyOptions = useCallback(() => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Difficulty',
        message: 'Select your level.',
        userInterfaceStyle: 'light',
      },
      (selectedIndex?: number) => {
        if (
          selectedIndex !== undefined &&
          selectedIndex !== cancelButtonIndex
        ) {
          startNewGame(
            DIFFICULTY_OPTIONS[selectedIndex].difficulty
          );
        }
      }
    );
  }, [showActionSheetWithOptions, startNewGame]);

  return {
    isLoading,
    startNewGame,
    showGameDifficultyOptions,
  };
}

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', difficulty: 'easy' as const },
  { label: 'Medium', difficulty: 'medium' as const },
  { label: 'Hard', difficulty: 'hard' as const },
  {
    label: 'Diabolical',
    difficulty: 'diabolical' as const,
  },
];

const options = [
  ...DIFFICULTY_OPTIONS.map(d => d.label),
  'Cancel',
];
const cancelButtonIndex = options.length - 1;
