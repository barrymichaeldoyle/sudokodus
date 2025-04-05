import * as SQLite from 'expo-sqlite';

export const SQLITE_DB_NAME = 'sudoku.db';

// --- Table Initialization (runs via Provider onInit) ---
export async function initializeDatabaseTables(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL; -- Enable Write-Ahead Logging for better performance

      CREATE TABLE IF NOT EXISTS puzzle_cache (
        puzzle_string CHAR(81) PRIMARY KEY,
        rating REAL NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard', 'diabolical')),
        is_symmetric BOOLEAN DEFAULT false,
        clue_count INTEGER NOT NULL,
        source TEXT DEFAULT 'sudokodus',
        fetched_at INTEGER NOT NULL,
        is_used BOOLEAN DEFAULT false
      );

      CREATE INDEX IF NOT EXISTS idx_puzzle_cache_difficulty_used ON puzzle_cache(difficulty, is_used);

      -- Initialize other tables here...
      -- CREATE TABLE IF NOT EXISTS game_states (...);
    `);
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

// --- Helper Functions ---

export type CachedPuzzle = {
  puzzle_string: string;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'diabolical';
  is_symmetric: boolean;
  clue_count: number;
  source: string;
  fetched_at: number;
  is_used: boolean;
};

export async function addPuzzlesToCache(
  db: SQLite.SQLiteDatabase,
  puzzles: CachedPuzzle[]
): Promise<void> {
  if (puzzles.length === 0) return;
  try {
    // Use prepared statements
    const insertStatement = await db.prepareAsync(
      `INSERT OR IGNORE INTO puzzle_cache
       (puzzle_string, rating, difficulty, is_symmetric, clue_count, source, fetched_at, is_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    );
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
