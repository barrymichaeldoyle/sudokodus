import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { Observable } from '@legendapp/state';
import {
  dailyChallenges$,
  diabolicalPuzzles$,
  easyPuzzles$,
  hardPuzzles$,
  mediumPuzzles$,
  PUZZLES_PER_DIFFICULTY,
} from '../db/supabase';

// Function to safely attempt sync on an observable
async function attemptSync(observable: Observable) {
  // Option 1: Try refresh() if it exists
  if (typeof observable.refresh === 'function') {
    await observable.refresh();
    return;
  }

  // Option 2: Try reload() if it exists
  if (typeof observable.reload === 'function') {
    await observable.reload();
    return;
  }

  // Option 3: Try refetch() if it exists
  if (typeof observable.refetch === 'function') {
    await observable.refetch();
    return;
  }

  // Option 4: If the observable has a sync config property, try to access it
  if (
    observable.config &&
    typeof observable.config.syncNow === 'function'
  ) {
    await observable.config.syncNow();
    return;
  }

  // If we get here, log a warning
  console.warn('No sync method found for observable');
}

export function usePuzzleManager() {
  useEffect(() => {
    // Initial sync on component mount
    const initialSync = async () => {
      const isConnected =
        await Network.getNetworkStateAsync();
      if (isConnected.isConnected) {
        await Promise.all([
          attemptSync(easyPuzzles$),
          attemptSync(mediumPuzzles$),
          attemptSync(hardPuzzles$),
          attemptSync(diabolicalPuzzles$),
          attemptSync(dailyChallenges$),
        ]);
      }
    };

    initialSync();

    // Sync when app returns to foreground
    const subscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          Network.getNetworkStateAsync().then(state => {
            if (state.isConnected) {
              attemptSync(easyPuzzles$);
              attemptSync(mediumPuzzles$);
              attemptSync(hardPuzzles$);
              attemptSync(diabolicalPuzzles$);
              attemptSync(dailyChallenges$);
            }
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Function to check and refill puzzles if running low
  async function ensureSufficientPuzzles() {
    const isConnected =
      await Network.getNetworkStateAsync();
    if (!isConnected.isConnected) return;

    const puzzleCounts = {
      easy: Object.keys(easyPuzzles$.get()).length,
      medium: Object.keys(mediumPuzzles$.get()).length,
      hard: Object.keys(hardPuzzles$.get()).length,
      diabolical: Object.keys(diabolicalPuzzles$.get())
        .length,
    };

    // If any difficulty has fewer than half the target, sync that collection
    if (puzzleCounts.easy < PUZZLES_PER_DIFFICULTY / 2) {
      attemptSync(easyPuzzles$);
    }
    if (puzzleCounts.medium < PUZZLES_PER_DIFFICULTY / 2) {
      attemptSync(mediumPuzzles$);
    }
    if (puzzleCounts.hard < PUZZLES_PER_DIFFICULTY / 2) {
      attemptSync(hardPuzzles$);
    }
    if (
      puzzleCounts.diabolical <
      PUZZLES_PER_DIFFICULTY / 2
    ) {
      attemptSync(diabolicalPuzzles$);
    }
  }

  return {
    ensureSufficientPuzzles,
  };
}
