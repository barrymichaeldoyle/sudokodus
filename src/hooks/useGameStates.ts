import {
  useMutation,
  useQuery,
  useQueryClient,
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

export function getActiveGamesQueryKey(userId?: string) {
  return ['activeGames', userId];
}
export function getCompletedGamesQueryKey(userId?: string) {
  return ['completedGames', userId];
}
export function getGameStateQueryKey(id: string | null) {
  return ['gameState', id];
}

export interface GameStateWithDifficulty
  extends LocalGameState {
  difficulty: DifficultyLevel;
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
}) {
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
) {
  const db = useSQLiteContext();
  const { query, params } = getGamesQuery({
    isCompleted: false,
    userId,
    limit,
  });

  return useQuery({
    queryKey: getActiveGamesQueryKey(userId),
    queryFn: () =>
      db.getAllAsync<GameStateWithDifficulty>(
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
) {
  const db = useSQLiteContext();
  const { query, params } = getGamesQuery({
    isCompleted: true,
    userId,
    limit,
  });

  return useQuery({
    queryKey: getCompletedGamesQueryKey(userId),
    queryFn: () =>
      db.getAllAsync<GameStateWithDifficulty>(
        query,
        params
      ),
  });
}

/**
 * Fetches a specific game state from the local database
 * @param id - The ID of the game state to fetch
 * @returns The react-query object for fetching the game state
 */
export function useGameState(id: string | null) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: getGameStateQueryKey(id),
    queryFn: () =>
      db.getFirstAsync<LocalGameState>(
        `SELECT * FROM game_states WHERE id = ?`,
        [id]
      ),
    enabled: !!id,
  });
}

/**
 * Creates a new game state
 * @returns The react-query object for creating a new game state
 */
export function useCreateGame() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      puzzleString,
      userId,
    }: {
      puzzleString: string;
      userId?: string;
    }) => {
      const initialState = [];
      for (let i = 0; i < 81; i++) {
        const value =
          puzzleString[i] === '.'
            ? null
            : parseInt(puzzleString[i]);
        initialState.push({
          value,
          isGiven: value !== null,
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
export function useSaveGameState() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameState: LocalGameState) =>
      saveGameState(db, gameState),
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
) {
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
