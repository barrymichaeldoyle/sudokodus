import {
  SQLiteDatabase,
  SQLiteProvider,
} from 'expo-sqlite';
import { PropsWithChildren, useRef, useState } from 'react';
import { ErrorScreen } from '../components/ErrorScreen';
import { LoadingScreen } from '../components/LoadingScreen';

const SQLITE_DB_NAME = ':memory:';

export function DatabaseProvider({
  children,
}: PropsWithChildren) {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] =
    useState(true);
  const hasInitialized = useRef(false);

  async function onInit(db: SQLiteDatabase) {
    if (hasInitialized.current) {
      console.log('Database already initialized, skipping');
      setIsInitializing(false);
      return;
    }

    try {
      console.log('Starting database initialization...');

      // // Disable WAL mode
      /**
       * Leaving this commented out because it's not needed.
       * But we might need it later, preferably not though.
       */
      // await db.execAsync(`PRAGMA journal_mode = DELETE;`);
      // console.log('Disabled WAL mode');

      // Create tables and indexes
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS puzzles (
        puzzle_string TEXT PRIMARY KEY,
        rating REAL NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard', 'diabolical')),
        is_symmetric INTEGER DEFAULT 0,
        clue_count INTEGER NOT NULL,
        source TEXT DEFAULT 'sudokudus',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles(difficulty);
      CREATE INDEX IF NOT EXISTS idx_puzzles_clue_count ON puzzles(clue_count);

      CREATE TABLE IF NOT EXISTS daily_challenges (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard', 'diabolical')),
        puzzle_string TEXT NOT NULL,
        FOREIGN KEY (puzzle_string) REFERENCES puzzles(puzzle_string),
        UNIQUE(date, difficulty)
      );

      CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);

      CREATE TABLE IF NOT EXISTS game_states (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        puzzle_string TEXT NOT NULL,
        current_state TEXT NOT NULL,
        notes TEXT,
        is_completed INTEGER DEFAULT 0,
        moves_count INTEGER DEFAULT 0,
        hints_used INTEGER DEFAULT 0,
        moves_history TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (puzzle_string) REFERENCES puzzles(puzzle_string)
      );

      CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_states_completed ON game_states(is_completed);
      CREATE INDEX IF NOT EXISTS idx_game_states_synced ON game_states(synced);

      CREATE TABLE IF NOT EXISTS db_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL
      );

      INSERT OR IGNORE INTO db_version (id, version) VALUES (1, 1);
    `);

      console.log('Tables created successfully');

      // Run migrations if needed
      const result = await db.getAllAsync<{
        version: number;
      }>(`SELECT version FROM db_version WHERE id = 1`);
      const currentVersion = result[0]?.version || 0;
      const targetVersion = 1; // Increment this when adding new migrations

      if (currentVersion < targetVersion) {
        console.log(
          `Migrating database from version ${currentVersion} to ${targetVersion}`
        );

        // Run migrations sequentially
        for (
          let v = currentVersion + 1;
          v <= targetVersion;
          v++
        ) {
          // Add migration logic here
          // Example: await db.execAsync(`ALTER TABLE game_states ADD COLUMN some_new_field TEXT`);

          // Update version
          await db.runAsync(
            `UPDATE db_version SET version = ? WHERE id = 1`,
            [v]
          );
        }

        hasInitialized.current = true;
      }
    } catch (error) {
      console.error(
        'Database initialization failed:',
        error
      );
      setError(error as string);
    } finally {
      setIsInitializing(false);
    }
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <SQLiteProvider
      databaseName={SQLITE_DB_NAME}
      onInit={onInit}
      useSuspense={false}
    >
      {isInitializing ? <LoadingScreen /> : children}
    </SQLiteProvider>
  );
}
