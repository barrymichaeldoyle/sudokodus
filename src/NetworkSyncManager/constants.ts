/**
 * The interval at which the network sync manager will check for updates.
 * This is primarily used to sync game states.
 * Puzzles and daily challenges are synced only when the MIN_PUZZLE_COUNT
 * is not met and if there are less than DAYS_TO_CHECK_FOR_DAILY_CHALLENGES ahead.
 */
export const SYNC_INTERVAL = 60 * 1000; // 1 minute
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 5_000; // 5 seconds
/**
 * The minimum number of puzzles that should be in the local database for each difficulty.
 * If the local count is below this threshold, the app will attempt to sync more puzzles from the server.
 */
export const MIN_PUZZLE_COUNT = 100;
/**
 * The number of puzzles to sync from the server at a time.
 */
export const PUZZLE_BATCH_SIZE = 500;
/**
 * The cooldown period for puzzle sync.
 * This is to prevent the app from syncing puzzles too frequently.
 */
export const PUZZLE_SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes
/**
 * The number of days to check for daily challenges.
 */
export const DAYS_TO_CHECK_FOR_DAILY_CHALLENGES = 30;
/**
 * The number of daily challenges to sync from the server at a time.
 */
export const DAILY_CHALLENGES_BATCH_SIZE = 60;
