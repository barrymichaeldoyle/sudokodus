import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('sudoku.db');

export function initPuzzleCacheTable(): void {
  try {
    // Synchronous execution
    db.execSync(`
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
    `);
    console.log('Puzzle cache table initialized (sync).');
  } catch (error) {
    console.error(
      'Error initializing puzzle cache table (sync):',
      error
    );
    throw error; // Re-throw if needed
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

export function addPuzzlesToCacheSync(
  puzzles: CachedPuzzle[]
): void {
  if (puzzles.length === 0) {
    return;
  }

  let insertStatement: SQLite.SQLiteStatement | null = null; // Keep track for finalization

  try {
    // Prepare the statement once outside the loop
    insertStatement = db.prepareSync(
      `INSERT OR IGNORE INTO puzzle_cache
       (puzzle_string, rating, difficulty, is_symmetric, clue_count, source, fetched_at, is_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
    );

    // Manually begin the transaction
    db.execSync('BEGIN TRANSACTION;');

    // Execute the prepared statement for each puzzle
    for (const p of puzzles) {
      insertStatement.executeSync(
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

    // Manually commit the transaction
    db.execSync('COMMIT;');

    console.log(`Added ${puzzles.length} puzzles (sync).`);
  } catch (error) {
    console.error(
      'Error adding puzzles to cache (sync):',
      error
    );
    // If an error occurs, try to roll back
    try {
      db.execSync('ROLLBACK;');
      console.log('Transaction rolled back.');
    } catch (rollbackError) {
      console.error(
        'Error rolling back transaction:',
        rollbackError
      );
    }
    throw error; // Re-throw the original error
  } finally {
    // Always finalize the prepared statement
    insertStatement?.finalizeSync();
  }
}

export async function countUnusedPuzzles(
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

export async function getCachedPuzzleStrings(): Promise<
  string[]
> {
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

export async function markPuzzleAsUsed(
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

export function initializeDatabase() {
  initPuzzleCacheTable();
  // Initialize other tables like game_states etc.
  console.log('Database initialized successfully');
}
