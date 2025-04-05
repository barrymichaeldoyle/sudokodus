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
  | 'error';

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
        const status: NetworkStatus = state.isConnected
          ? 'online'
          : 'offline';
        console.log('Network status changed:', status);
        set({ networkStatus: status });
      }
    );
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      const status: NetworkStatus = state.isConnected
        ? 'online'
        : 'offline';
      set({ networkStatus: status });
    });
    return unsubscribe;
  },
}));
