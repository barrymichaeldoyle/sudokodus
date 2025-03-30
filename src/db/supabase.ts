import { observable } from '@legendapp/state';
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage';
import {
  configureSyncedSupabase,
  syncedSupabase,
} from '@legendapp/state/sync-plugins/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { config } from '../config';
import { Database } from './database.types';

type GameState =
  Database['public']['Tables']['game_states']['Row'];

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
  // Figure this out with legend state later
  // {
  //   auth: {
  //     storage: AsyncStorage,
  //     autoRefreshToken: true,
  //     persistSession: true,
  //     detectSessionInUrl: false,
  //   },
  //   db: { schema: 'public' },
  //   global: {
  //     headers: { 'x-application-name': 'sudokodus' },
  //   },
  // }
);

export function generateId() {
  return Crypto.randomUUID();
}

configureSyncedSupabase({
  generateId,
  persist: {
    persist: {
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
  },
  changesSince: 'last-sync',
  fieldCreatedAt: 'created_at',
  fieldUpdatedAt: 'updated_at',
  // Optionally enable soft deletes
  fieldDeleted: 'deleted',
});

// Sync daily challenges
const dailyChallenges$ = observable(
  syncedSupabase({
    supabase,
    collection: 'daily_challenges',
    actions: ['read'],
    persist: {
      name: 'daily_challenges',
      retrySync: true,
    },
    retry: { infinite: true },
  })
);

// Sync a subset of puzzles for random selection
const puzzles$ = observable(
  syncedSupabase({
    supabase,
    collection: 'puzzles',
    actions: ['read'],
    persist: {
      name: 'puzzles',
      retrySync: true,
    },
    retry: { infinite: true },
  })
);

// Sync user's game states
export const gameStates$ = observable(
  syncedSupabase({
    supabase,
    collection: 'game_states',
    actions: ['read', 'create', 'update', 'delete'],
    persist: { name: 'game_states', retrySync: true },
    realtime: true,
    retry: { infinite: true },
  })
) as unknown as {
  assign: (value: GameState) => void;
  set: (value: Record<string, GameState>) => void;
  get: () => Record<string, GameState>;
};

// get() activates and starts syncing
export const dailyChallenges = dailyChallenges$.get();
// Initialize puzzles as an empty object first
export const puzzles: Record<
  string,
  Database['public']['Tables']['puzzles']['Row']
> = {};
// Then try to get the initial value
try {
  const initialPuzzles = puzzles$.get();
  Object.assign(puzzles, initialPuzzles);
  console.log('Initial puzzles loaded successfully');
} catch (error) {
  console.error('Error loading initial puzzles:', error);
  // Keep the empty object as fallback
}
export const gameStates = gameStates$.get();

console.log('Initial values loaded');
