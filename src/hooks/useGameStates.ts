import {
  QueryKey,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  SQLiteDatabase,
  useSQLiteContext,
} from 'expo-sqlite';
import {
  DifficultyLevel,
  LocalGameState,
} from '../db/types';
import { generateId } from '../db/utils/generateId';

export function getActiveGamesQueryKey(
  userId?: string
): QueryKey {
  return ['activeGames', userId];
}
export function getCompletedGamesQueryKey(
  userId?: string
): QueryKey {
  return ['completedGames', userId];
}
export function getGameStateQueryKey(
  puzzleString: string
): QueryKey {
  return ['gameState', puzzleString];
}

export interface LocalGameStateWithPuzzle
  extends LocalGameState {
  difficulty: DifficultyLevel;
  rating: number;
}

/**
 * Base query for fetching games with common fields
 */
function getGamesQuery({
  isCompleted,
  userId,
  limit = 100,
}: {
  isCompleted: boolean;
  userId?: string;
  limit?: number;
}): {
  query: string;
  params: (string | number)[];
} {
  const baseQuery = `
    SELECT gs.*, p.difficulty 
    FROM game_states gs
    LEFT JOIN puzzles p ON gs.puzzle_string = p.puzzle_string
    WHERE gs.is_completed = ? 
    ${userId ? 'AND gs.user_id = ?' : ''}
    ORDER BY gs.updated_at DESC LIMIT ?
  `;

  const params = userId
    ? [isCompleted ? 1 : 0, userId, limit]
    : [isCompleted ? 1 : 0, limit];

  return { query: baseQuery, params };
}

/**
 * Fetches active games from the local database
 * @param userId - The user ID to fetch active games for
 * @param limit - The number of active games to fetch (default: 100)
 * @returns The react-query object for fetching active games
 */
export function useActiveGames(
  userId?: string,
  limit = 100
): UseQueryResult<LocalGameStateWithPuzzle[]> {
  const db = useSQLiteContext();
  const { query, params } = getGamesQuery({
    isCompleted: false,
    userId,
    limit,
  });

  return useQuery({
    queryKey: getActiveGamesQueryKey(userId),
    queryFn: () =>
      db.getAllAsync<LocalGameStateWithPuzzle>(
        query,
        params
      ),
  });
}

/**
 * Fetches completed games from the local database
 * @param userId - The user ID to fetch completed games for
 * @param limit - The number of completed games to fetch (default: 100)
 * @returns The react-query object for fetching completed games
 */
export function useCompletedGames(
  userId?: string,
  limit = 100
): UseQueryResult<LocalGameStateWithPuzzle[]> {
  const db = useSQLiteContext();
  const { query, params } = getGamesQuery({
    isCompleted: true,
    userId,
    limit,
  });

  return useQuery({
    queryKey: getCompletedGamesQueryKey(userId),
    queryFn: () =>
      db.getAllAsync<LocalGameStateWithPuzzle>(
        query,
        params
      ),
  });
}

/**
 * Fetches a specific game state from the local database
 * @param puzzleString - The puzzle string to fetch the game state for
 * @returns The react-query object for fetching the game state
 */
export function useGameState(
  puzzleString: string
): UseQueryResult<LocalGameStateWithPuzzle | null> {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: getGameStateQueryKey(puzzleString),
    queryFn: () =>
      db.getFirstAsync<LocalGameStateWithPuzzle>(
        `SELECT gs.*, p.difficulty, p.rating
         FROM game_states gs
         LEFT JOIN puzzles p ON gs.puzzle_string = p.puzzle_string
         WHERE gs.puzzle_string = ?`,
        [puzzleString]
      ),
    enabled: !!puzzleString,
  });
}

/**
 * Creates a new game state
 * @returns The react-query object for creating a new game state
 */
export function useCreateGame(): UseMutationResult<
  LocalGameState,
  Error,
  { difficulty: DifficultyLevel; userId?: string }
> {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ difficulty, userId }) => {
      // Fetch puzzles for the selected difficulty
      const puzzles = await db.getAllAsync<{
        puzzle_string: string;
        rating: number;
        difficulty: DifficultyLevel;
        is_symmetric: number;
        clue_count: number;
        source: string;
        created_at: string;
      }>(
        // TODO: avoid fetching existing active games or completed puzzles or daily challenges
        `SELECT * FROM puzzles WHERE difficulty = ? LIMIT 100`,
        [difficulty]
      );

      if (!puzzles || puzzles.length === 0) {
        throw new Error(
          `No puzzles available for difficulty: ${difficulty}`
        );
      }

      // Select a random puzzle
      const randomPuzzle =
        puzzles[Math.floor(Math.random() * puzzles.length)];
      const puzzleString = randomPuzzle.puzzle_string;

      const initialState = [];
      for (let i = 0; i < 81; i++) {
        const char = puzzleString[i];
        const value = char === '0' ? null : parseInt(char);
        initialState.push({
          value,
          isGiven: char !== '0',
          notes: [],
        });
      }

      const now = new Date().toISOString();

      const gameState: LocalGameState = {
        id: generateId(),
        user_id: userId || null,
        puzzle_string: puzzleString,
        current_state: initialState,
        notes: {},
        is_completed: false,
        hints_used: 0,
        moves_history: [],
        created_at: now,
        updated_at: now,
        last_hint_at: null,
        synced: false,
      };
      await saveGameState(db, gameState);

      return gameState;
    },
    onSuccess: newGame => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: getActiveGamesQueryKey(),
      });
      // Add the new game to the cache
      queryClient.setQueryData(
        getGameStateQueryKey(newGame.id),
        newGame
      );
    },
  });
}

/**
 * Saves a game state
 * @returns The react-query object for saving a game state
 */
export function useSaveGameState(): UseMutationResult<
  void,
  Error,
  LocalGameState
> {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gameState => saveGameState(db, gameState),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: getGameStateQueryKey(variables.id),
      });

      if (variables.is_completed) {
        queryClient.invalidateQueries({
          queryKey: getCompletedGamesQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getActiveGamesQueryKey(),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: getActiveGamesQueryKey(),
        });
      }
    },
  });
}

/**
 * Deletes a game state
 * @returns The react-query object for deleting a game state
 */
export function useDeleteGame() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      db.runAsync(`DELETE FROM game_states WHERE id = ?`, [
        id,
      ]),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: getActiveGamesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getCompletedGamesQueryKey(),
      });
      queryClient.removeQueries({
        queryKey: getGameStateQueryKey(id),
      });
    },
  });
}

async function saveGameState(
  db: SQLiteDatabase,
  gameState: LocalGameState
): Promise<void> {
  await db.runAsync(
    `
      INSERT OR REPLACE INTO game_states (
        id, user_id, puzzle_string, current_state, notes, is_completed,
        hints_used, moves_history, created_at, updated_at, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    [
      gameState.id,
      gameState.user_id,
      gameState.puzzle_string,
      JSON.stringify(gameState.current_state),
      gameState.notes
        ? JSON.stringify(gameState.notes)
        : null,
      gameState.is_completed ? 1 : 0,
      gameState.hints_used,
      JSON.stringify(gameState.moves_history),
      gameState.created_at,
      gameState.updated_at,
      gameState.synced ? 1 : 0,
    ]
  );
}

export function useUpdateCell() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      puzzleString,
      row,
      col,
      value,
      isNotesMode,
    }: {
      puzzleString: string;
      row: number;
      col: number;
      value: number | null;
      isNotesMode: boolean;
    }) => {
      const gameState =
        await db.getFirstAsync<LocalGameState>(
          'SELECT * FROM game_states WHERE puzzle_string = ?',
          [puzzleString]
        );

      if (!gameState) {
        throw new Error('Game state not found');
      }

      const currentState =
        typeof gameState.current_state === 'string'
          ? JSON.parse(gameState.current_state)
          : gameState.current_state;

      const cellIndex = row * 9 + col;
      const cell = currentState[cellIndex];

      // Don't allow updates to given cells (cells that were part of the original puzzle)
      if (cell.isGiven) {
        throw new Error('Cannot update given cells');
      }

      if (isNotesMode) {
        // Toggle the note
        const notes = cell.notes || [];
        const noteIndex = notes.indexOf(value);
        if (noteIndex === -1) {
          notes.push(value);
        } else {
          notes.splice(noteIndex, 1);
        }
        cell.notes = notes;
      } else {
        // Set the value
        cell.value = value;
        // Clear notes when setting a value
        cell.notes = [];
      }

      await db.runAsync(
        'UPDATE game_states SET current_state = ? WHERE puzzle_string = ?',
        [JSON.stringify(currentState), puzzleString]
      );

      return currentState;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getGameStateQueryKey(
          variables.puzzleString
        ),
      });
    },
  });
}
