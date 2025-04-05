import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import {
  ActiveGameDisplayInfo,
  getActiveGamesWithDifficulty,
} from '../db/sqlite';

export const ACTIVE_GAMES_QUERY_KEY = 'activeGames';

export function useActiveGames() {
  const db = useSQLiteContext();

  return useQuery<ActiveGameDisplayInfo[], Error>({
    // Query key identifies this data
    queryKey: [ACTIVE_GAMES_QUERY_KEY],
    // The function to fetch the data
    queryFn: () => getActiveGamesWithDifficulty(db),
    // Only run the query if the database is available
    enabled: !!db,
    // Optional: Configure caching behavior if needed
    // staleTime: 1000 * 60, // Consider data fresh for 1 minute
    // cacheTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
  });
}
