import { useEffect, useState } from 'react';
import { fetchInitialPuzzles } from '../db/utils/fetchInitialPuzzles';

export function useLoadPuzzles() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPuzzles() {
      try {
        await fetchInitialPuzzles(10); // Fetch at least 10 puzzles per difficulty
      } catch (error) {
        console.error(
          'Failed to load puzzles:',
          JSON.stringify(error)
        );
        setError(
          'Failed to load puzzles. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPuzzles();
  }, []);

  return { isLoading, error };
}
