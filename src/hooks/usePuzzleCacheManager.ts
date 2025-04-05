// src/hooks/usePuzzleCacheManager.ts
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useSQLiteContext,
  type SQLiteDatabase,
} from 'expo-sqlite';
import {
  addPuzzlesToCache,
  CachedPuzzle,
  countUnusedPuzzles,
  getCachedPuzzleStrings,
} from '../db/sqlite';
import { supabase } from '../db/supabase';
import {
  DIFFICULTY_LEVELS,
  DifficultyLevel,
} from '../db/types';
import { useAppStore } from '../stores/appStore';

const INITIAL_CACHE_TARGET = 100;
const REPLENISH_THRESHOLD = 50;
const FETCH_BATCH_SIZE = 50; // How many to fetch at once

// --- React Query Mutation to Fetch and Store Puzzles ---
async function fetchAndStorePuzzles(
  db: SQLiteDatabase,
  difficulty: DifficultyLevel,
  count: number
): Promise<number> {
  const setCacheStatus =
    useAppStore.getState().setPuzzleCacheStatus;
  setCacheStatus(difficulty, 'fetching');

  try {
    // 1. Get IDs of puzzles already in cache to avoid fetching them again
    const existingPuzzleStrings =
      await getCachedPuzzleStrings(db);

    // 2. Fetch random puzzles from Supabase, excluding existing ones
    const { data, error } = await supabase
      .from('puzzles')
      .select(
        'puzzle_string, rating, difficulty, is_symmetric, clue_count, source'
      )
      .eq('difficulty', difficulty)
      .not(
        'puzzle_string',
        'in',
        `(${existingPuzzleStrings.join(',')})`
      ) // Exclude existing
      .limit(count); // Fetch the required number

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log(`No new puzzles found for ${difficulty}`);
      setCacheStatus(difficulty, 'idle');
      return 0; // No new puzzles fetched
    }

    // 3. Format for local cache (add fetched_at, is_used)
    const puzzlesToCache: CachedPuzzle[] = data.map(p => ({
      ...p,
      difficulty: p.difficulty,
      is_symmetric: p.is_symmetric ?? false,
      fetched_at: Date.now(),
      is_used: false,
      source: p.source ?? 'sudokodus',
    }));

    // 4. Add to SQLite cache
    await addPuzzlesToCache(db, puzzlesToCache);
    console.log(
      `Added ${puzzlesToCache.length} ${difficulty} puzzles to cache.`
    );
    setCacheStatus(difficulty, 'idle');
    return puzzlesToCache.length; // Return how many were actually added
  } catch (err) {
    console.error(
      `Error fetching/storing ${difficulty} puzzles:`,
      err
    );
    setCacheStatus(difficulty, 'error');
    // Optionally re-throw or handle error state
    throw err; // Re-throw so useMutation knows it failed
  }
}

export function usePuzzleCacheManager() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const cacheStatus = useAppStore(
    state => state.puzzleCacheStatus
  );
  const networkStatus = useAppStore(
    state => state.networkStatus
  );
  const setCacheStatus = useAppStore(
    state => state.setPuzzleCacheStatus
  );

  // Mutation hook for fetching/storing
  const fetchMutation = useMutation({
    mutationFn: ({
      difficulty,
      count,
    }: {
      difficulty: DifficultyLevel;
      count: number;
    }) => fetchAndStorePuzzles(db, difficulty, count),
    onSuccess: (fetchedCount, variables) => {
      // Invalidate the count query for this difficulty to refresh UI if needed
      queryClient.invalidateQueries({
        queryKey: [
          'localPuzzleCount',
          variables.difficulty,
        ],
      });
      console.log(
        `Successfully fetched ${fetchedCount} puzzles for ${variables.difficulty}`
      );
    },
    onError: (error, variables) => {
      console.error(
        `Mutation failed for ${variables.difficulty}:`,
        error
      );
      // Keep status as error
    },
  });

  // --- Core Cache Checking Logic ---
  async function checkAndReplenishCache(
    difficulty: DifficultyLevel,
    targetCount: number,
    fetchSize: number
  ) {
    if (
      networkStatus !== 'online' ||
      fetchMutation.isPending
    ) {
      console.log(
        `Skipping cache check for ${difficulty} (offline, already fetching, or unknown network)`
      );
      return; // Don't fetch if offline or already fetching
    }

    setCacheStatus(difficulty, 'checking');
    try {
      const currentCount = await countUnusedPuzzles(
        db,
        difficulty
      );
      console.log(
        `Local unused ${difficulty} puzzles: ${currentCount}`
      );

      if (currentCount < targetCount) {
        const needed = Math.max(
          fetchSize,
          targetCount - currentCount
        ); // Fetch at least fetchSize
        console.log(
          `Need ${needed} more ${difficulty} puzzles. Triggering fetch.`
        );
        // Use the mutation to fetch and store
        fetchMutation.mutate({ difficulty, count: needed });
        // Status is set to 'fetching' inside the mutation function
      } else {
        console.log(
          `Cache for ${difficulty} is sufficient (${currentCount}/${targetCount}).`
        );
        setCacheStatus(difficulty, 'idle');
      }
    } catch (error) {
      console.error(
        `Error checking cache for ${difficulty}:`,
        error
      );
      setCacheStatus(difficulty, 'error');
    }
  }

  // --- Public Functions ---
  function ensureInitialCache() {
    console.log('Ensuring initial puzzle cache...');
    DIFFICULTY_LEVELS.forEach(diff => {
      checkAndReplenishCache(
        diff,
        INITIAL_CACHE_TARGET,
        FETCH_BATCH_SIZE
      );
    });
  }

  function checkAndReplenishIfNeeded(
    difficulty: DifficultyLevel
  ) {
    console.log(
      `Checking replenishment for ${difficulty}...`
    );
    checkAndReplenishCache(
      difficulty,
      REPLENISH_THRESHOLD,
      FETCH_BATCH_SIZE
    );
  }

  return {
    ensureInitialCache,
    checkAndReplenishIfNeeded,
    isLoading: fetchMutation.isPending, // Expose loading state if needed
    cacheStatus,
  };
}
