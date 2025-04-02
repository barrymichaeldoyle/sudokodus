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
export const dailyChallenges$ = observable(
  syncedSupabase({
    supabase,
    collection: 'daily_challenges',
    actions: ['read'],
    filter: select => {
      const today = new Date();

      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 7);

      const todayFormatted = today
        .toISOString()
        .split('T')[0];
      const futureDateFormatted = futureDate
        .toISOString()
        .split('T')[0];

      return select
        .gte('date', todayFormatted)
        .lte('date', futureDateFormatted);
    },
    persist: {
      name: 'daily_challenges',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    retry: { infinite: true },
  })
);

export const PUZZLES_PER_DIFFICULTY = 10;

// Observables for random puzzles by difficulty
export const easyPuzzles$ = observable(
  syncedSupabase({
    supabase,
    collection: 'puzzles',
    actions: ['read'],
    filter: select =>
      select
        .eq('difficulty', 'easy')
        .not(
          'puzzle_string',
          'in',
          `(SELECT puzzle_string FROM daily_challenges WHERE difficulty = 'easy')`
        )
        .limit(PUZZLES_PER_DIFFICULTY),
    persist: {
      name: 'easy_puzzles',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    retry: { infinite: true },
  })
);

export const mediumPuzzles$ = observable(
  syncedSupabase({
    supabase,
    collection: 'puzzles',
    actions: ['read'],
    filter: select =>
      select
        .eq('difficulty', 'medium')
        .not(
          'puzzle_string',
          'in',
          `(SELECT puzzle_string FROM daily_challenges WHERE difficulty = 'medium')`
        )
        .limit(PUZZLES_PER_DIFFICULTY),
    persist: {
      name: 'medium_puzzles',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    retry: { infinite: true },
  })
);

export const hardPuzzles$ = observable(
  syncedSupabase({
    supabase,
    collection: 'puzzles',
    actions: ['read'],
    filter: select =>
      select
        .eq('difficulty', 'hard')
        .not(
          'puzzle_string',
          'in',
          `(SELECT puzzle_string FROM daily_challenges WHERE difficulty = 'hard')`
        )
        .limit(PUZZLES_PER_DIFFICULTY),
    persist: {
      name: 'hard_puzzles',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    retry: { infinite: true },
  })
);

export const diabolicalPuzzles$ = observable(
  syncedSupabase({
    supabase,
    collection: 'puzzles',
    actions: ['read'],
    filter: select =>
      select
        .eq('difficulty', 'diabolical')
        .not(
          'puzzle_string',
          'in',
          `(SELECT puzzle_string FROM daily_challenges WHERE difficulty = 'diabolical')`
        )
        .limit(PUZZLES_PER_DIFFICULTY),
    persist: {
      name: 'diabolical_puzzles',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    retry: { infinite: true },
  })
);

export const gameStates$ = observable<
  Record<string, GameState>
>(
  syncedSupabase({
    supabase,
    collection: 'game_states',
    actions: ['read', 'create', 'update', 'delete'],
    persist: {
      name: 'game_states',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    realtime: true,
    retry: { infinite: true },
    syncMode: 'auto',
  })
);

export const activeGameStates$ = observable<
  Record<string, GameState>
>(
  syncedSupabase({
    supabase,
    collection: 'game_states',
    actions: ['read', 'create', 'update', 'delete'],
    filter: select => select.eq('is_completed', false),
    persist: {
      name: 'active_game_states',
      retrySync: true,
      plugin: observablePersistAsyncStorage({
        AsyncStorage,
      }),
    },
    realtime: true,
    retry: { infinite: true },
    syncMode: 'auto',
  })
);
