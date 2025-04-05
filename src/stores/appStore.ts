// src/stores/appStore.ts
import NetInfo, {
  NetInfoState,
} from '@react-native-community/netinfo';
import { create } from 'zustand';
import { DifficultyLevel } from '../db/types';

type NetworkStatus = 'online' | 'offline' | 'unknown';
type CacheStatus =
  | 'idle'
  | 'checking'
  | 'fetching'
  | 'error'
  | 'fetch_depleted';

interface AppState {
  networkStatus: NetworkStatus;
  puzzleCacheStatus: Record<DifficultyLevel, CacheStatus>; // e.g., { easy: 'idle', medium: 'fetching' }
  setNetworkStatus: (status: NetworkStatus) => void;
  setPuzzleCacheStatus: (
    difficulty: string,
    status: CacheStatus
  ) => void;
  subscribeToNetworkChanges: () => () => void; // Returns unsubscribe function
}

export const useAppStore = create<AppState>()(set => ({
  networkStatus: 'unknown',
  puzzleCacheStatus: {
    easy: 'idle',
    medium: 'idle',
    hard: 'idle',
    diabolical: 'idle',
  },
  setNetworkStatus: status =>
    set({ networkStatus: status }),
  setPuzzleCacheStatus: (difficulty, status) =>
    set(state => ({
      puzzleCacheStatus: {
        ...state.puzzleCacheStatus,
        [difficulty]: status,
      },
    })),
  subscribeToNetworkChanges: () => {
    const unsubscribe = NetInfo.addEventListener(
      (state: NetInfoState) => {
        const newStatus: NetworkStatus =
          (state.isConnected ?? false)
            ? 'online'
            : 'offline';
        const previousStatus =
          useAppStore.getState().networkStatus; // Get previous status

        set(state => {
          // --- Reset 'fetch_depleted' status when coming back online ---
          let newCacheStatus = state.puzzleCacheStatus;
          if (
            newStatus === 'online' &&
            previousStatus !== 'online'
          ) {
            console.log(
              "Network back online, resetting 'fetch_depleted' statuses to 'idle'."
            );
            newCacheStatus = { ...state.puzzleCacheStatus }; // Create a new object
            for (const diff in newCacheStatus) {
              if (
                newCacheStatus[diff as DifficultyLevel] ===
                'fetch_depleted'
              ) {
                newCacheStatus[diff as DifficultyLevel] =
                  'idle';
              }
            }
          }
          // --- End Reset Logic ---
          return {
            networkStatus: newStatus,
            puzzleCacheStatus: newCacheStatus,
          };
        });
      }
    );
    // ... rest of fetch initial state ...
    return unsubscribe;
  },
}));
