import * as SQLite from 'expo-sqlite';

import { DifficultyLevel } from './types';
import { generateId } from './utils/generateId';

export const SQLITE_DB_NAME = 'sudoku.db';

// --- Type Definitions ---

export type CachedPuzzle = {
  puzzle_string: string;
  rating: number;
  difficulty: DifficultyLevel; // Use imported type
  is_symmetric: boolean;
  clue_count: number;
  source: string;
  fetched_at: number;
  is_used: boolean;
};

export type LocalGameState = {
  id: string; // Local UUID (TEXT in SQLite)
  user_id: string | null; // Store Supabase User ID if logged in, null if anonymous (TEXT)
  puzzle_string: string; // Foreign Key to puzzle_cache
  // JSON string representing the grid state (TEXT):
  // {
  //   grid: { value: number | null, isGiven: boolean }[][]
  //   selectedCell: { row: number, col: number } | null
  // }
  current_state: string;
  // JSON string for notes (TEXT):
  // {
  //   cells: {
  //     "row,col": number[] // e.g. "0,0": [1,2,3] for top-left cell pencil marks
  //   }
  // }
  notes: string | null;
  is_completed: boolean; // Stored as INTEGER 0 or 1
  hints_used: number; // INTEGER
  last_hint_at: number | null; // Timestamp ms (INTEGER), null if no hint used yet
  // JSON string of moves array (TEXT):
  // Array of:
  // {
  //   type: 'setValue' | 'setNotes',
  //   cell: { row: number, col: number },
  //   value: number | null,           // for setValue moves
  //   notes?: number[],               // for setNotes moves
  //   previousValue?: number | null,  // for setValue moves
  //   previousNotes?: number[]        // for setNotes moves
  // }
  moves_history: string | null;
  // Track position in moves_history:
  // -1 means no moves made yet
  // Used for undo/redo:
  // - undo decrements this index
  // - redo increments this index
  // - new move truncates history after this index and appends new move
  current_move_index: number; // INTEGER
  created_at: number; // Timestamp ms (INTEGER)
  updated_at: number; // Timestamp ms (INTEGER)
};

// Combined type for displaying active games list
export type ActiveGameDisplayInfo = {
  game_id: string; // Local game state ID
  puzzle_string: string;
  difficulty: DifficultyLevel;
  hints_used: number;
  updated_at: number; // Timestamp for sorting
  created_at: number;
};

// --- Table Initialization  ---

// Function to initialize just the local_game_states table
export async function initLocalGameStatesTable(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_game_states (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      puzzle_string CHAR(81) NOT NULL,
      current_state TEXT NOT NULL,
      notes TEXT,
      is_completed INTEGER DEFAULT 0, -- Use INTEGER for BOOLEAN
      hints_used INTEGER DEFAULT 0,
      moves_history TEXT,
      current_move_index INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (puzzle_string) REFERENCES puzzle_cache(puzzle_string) ON DELETE CASCADE
    );
  `);
  await db.execAsync(
    `CREATE INDEX IF NOT EXISTS idx_local_game_states_active ON local_game_states(is_completed, updated_at);`
  );
  await db.execAsync(
    `CREATE INDEX IF NOT EXISTS idx_local_game_states_user ON local_game_states(user_id);`
  );
  console.log('Local game states table initialized.');
}

// Main initialization function called by the Provider
export async function initializeDatabaseTables(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    // Use Write-Ahead Logging for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;');

    await db.withTransactionAsync(async () => {
      // 1. Initialize puzzle_cache table (dependency for game_states)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS puzzle_cache (
          puzzle_string CHAR(81) PRIMARY KEY,
          rating REAL NOT NULL,
          difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard', 'diabolical')),
          is_symmetric INTEGER DEFAULT 0, -- Use INTEGER for BOOLEAN
          clue_count INTEGER NOT NULL,
          source TEXT DEFAULT 'sudokodus',
          fetched_at INTEGER NOT NULL,
          is_used INTEGER DEFAULT 0 -- Use INTEGER for BOOLEAN
        );
      `);
      await db.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_puzzle_cache_difficulty_used ON puzzle_cache(difficulty, is_used);`
      );
      console.log('Puzzle cache table initialized.');

      // 2. Initialize local_game_states table
      await initLocalGameStatesTable(db);

      // 3. Initialize any other tables here.. TODO!!!
    });

    console.log(
      'Database tables initialized successfully (async).'
    );
  } catch (error) {
    console.error(
      'Error initializing database tables:',
      error
    );
    throw error; // Re-throw
  }
}

// --- Puzzle Cache Helper Functions ---

export async function addPuzzlesToCache(
  db: SQLite.SQLiteDatabase,
  puzzles: CachedPuzzle[]
): Promise<void> {
  if (puzzles.length === 0) return;
  try {
    // Use prepared statements
    const insertStatement = await db.prepareAsync(`
      INSERT OR IGNORE INTO puzzle_cache
        (puzzle_string, rating, difficulty, is_symmetric, clue_count, source, fetched_at, is_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `);
    // Execute in a transaction
    await db.withTransactionAsync(async () => {
      for (const p of puzzles) {
        await insertStatement.executeAsync(
          p.puzzle_string,
          p.rating,
          p.difficulty,
          p.is_symmetric ? 1 : 0,
          p.clue_count,
          p.source,
          Date.now(), // fetched_at
          p.is_used ? 1 : 0
        );
      }
    });
    console.log(`Added ${puzzles.length} puzzles (async).`);
    // Finalize statement if needed (depends on exact usage, often handled by transaction)
    // await insertStatement.finalizeAsync();
  } catch (error) {
    console.error(
      'Error adding puzzles to cache (async):',
      error
    );
    // await insertStatement?.finalizeAsync(); // Ensure finalization on error
    throw error;
  }
}

export async function countUnusedPuzzles(
  db: SQLite.SQLiteDatabase,
  difficulty: string
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{
      count: number;
    }>(
      'SELECT COUNT(*) as count FROM puzzle_cache WHERE difficulty = ? AND is_used = 0;',
      difficulty
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error(
      'Error counting unused puzzles (async):',
      error
    );
    throw error;
  }
}

export async function getUnusedPuzzle(
  db: SQLite.SQLiteDatabase,
  difficulty: string
): Promise<CachedPuzzle | null> {
  try {
    const row = await db.getFirstAsync<any>( // Use 'any' and map manually
      'SELECT * FROM puzzle_cache WHERE difficulty = ? AND is_used = 0 LIMIT 1;',
      difficulty
    );
    if (!row) return null;
    // Manual mapping needed for boolean values from number (0/1)
    return {
      ...row,
      is_symmetric: !!row.is_symmetric,
      is_used: !!row.is_used,
    } as CachedPuzzle;
  } catch (error) {
    console.error(
      'Error getting unused puzzle (async):',
      error
    );
    throw error;
  }
}

export async function markPuzzleAsUsed(
  db: SQLite.SQLiteDatabase,
  puzzle_string: string
): Promise<void> {
  try {
    await db.runAsync(
      'UPDATE puzzle_cache SET is_used = 1 WHERE puzzle_string = ?;',
      puzzle_string
    );
  } catch (error) {
    console.error(
      'Error marking puzzle as used (async):',
      error
    );
    throw error;
  }
}

export async function getCachedPuzzleStrings(
  db: SQLite.SQLiteDatabase
): Promise<string[]> {
  try {
    const results = await db.getAllAsync<{
      puzzle_string: string;
    }>('SELECT puzzle_string FROM puzzle_cache;');
    return results.map(row => row.puzzle_string);
  } catch (error) {
    console.error(
      'Error getting cached puzzle strings (async):',
      error
    );
    throw error;
  }
}

// --- Local Game State Helper Functions (New) ---

export async function getActiveGamesWithDifficulty(
  db: SQLite.SQLiteDatabase
): Promise<ActiveGameDisplayInfo[]> {
  try {
    const results = await db.getAllAsync<any>(`
      SELECT
        lg.id as game_id,
        lg.puzzle_string,
        lg.updated_at,
        pc.difficulty,
        lg.hints_used,
        lg.created_at
      FROM local_game_states lg
      JOIN puzzle_cache pc ON lg.puzzle_string = pc.puzzle_string
      WHERE lg.is_completed = 0 -- Filter for active games (0 means false)
      ORDER BY lg.updated_at DESC;
    `);
    return results.map(row => ({
      game_id: row.game_id,
      puzzle_string: row.puzzle_string,
      difficulty: row.difficulty as DifficultyLevel,
      hints_used: row.hints_used,
      updated_at: row.updated_at,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching active games:', error);
    throw error;
  }
}

// Creates a new game state or updates an existing one based on ID
export async function saveLocalGameState(
  db: SQLite.SQLiteDatabase,
  gameState: Omit<
    LocalGameState,
    'created_at' | 'updated_at'
  > & { id?: string }
): Promise<string> {
  const now = Date.now();
  const id = gameState.id || generateId();

  const statement = await db.prepareAsync(`
    INSERT INTO local_game_states (
      id, user_id, puzzle_string, current_state, notes, is_completed,
      hints_used, moves_history, current_move_index,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      puzzle_string = excluded.puzzle_string,
      current_state = excluded.current_state,
      notes = excluded.notes,
      is_completed = excluded.is_completed,
      hints_used = excluded.hints_used,
      moves_history = excluded.moves_history,
      current_move_index = excluded.current_move_index,
      updated_at = excluded.updated_at;
  `);

  try {
    await statement.executeAsync(
      id,
      gameState.user_id, // Can be null
      gameState.puzzle_string,
      gameState.current_state, // Should be JSON stringified
      gameState.notes, // Should be JSON stringified or null
      gameState.is_completed ? 1 : 0, // Convert boolean to 0/1
      gameState.hints_used,
      gameState.moves_history, // Should be JSON stringified or null
      gameState.current_move_index,
      now, // created_at (ignored on update due to ON CONFLICT)
      now // updated_at
    );
    console.log(`Saved local game state with ID: ${id}`);
    return id; // Return the ID (useful if it was generated)
  } catch (error) {
    console.error('Error saving local game state:', error);
    throw error;
  } finally {
    await statement.finalizeAsync();
  }
}

// Marks a specific local game as completed
export async function markLocalGameComplete(
  db: SQLite.SQLiteDatabase,
  gameId: string
): Promise<void> {
  try {
    await db.runAsync(
      'UPDATE local_game_states SET is_completed = 1, updated_at = ? WHERE id = ?;',
      Date.now(),
      gameId
    );
    console.log(`Marked local game ${gameId} as complete.`);
  } catch (error) {
    console.error(
      'Error marking local game complete:',
      error
    );
    throw error;
  }
}

// Add function to get a specific game state by ID (needed for resuming a game)
export async function getLocalGameStateById(
  db: SQLite.SQLiteDatabase,
  gameId: string
): Promise<LocalGameState | null> {
  try {
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM local_game_states WHERE id = ?;',
      gameId
    );
    if (!row) {
      return null;
    }
    // Map boolean back
    return {
      ...row,
      is_completed: !!row.is_completed,
    } as LocalGameState;
  } catch (error) {
    console.error(
      `Error getting local game state by ID ${gameId}:`,
      error
    );
    throw error;
  }
}
