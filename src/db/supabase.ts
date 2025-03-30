import {
  configureSyncedSupabase,
  syncedSupabase,
} from '@legendapp/state/sync-plugins/supabase';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

import { observable } from '@legendapp/state';
import { config } from '../config';
import { Database } from './database.types';

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

configureSyncedSupabase({ generateId: uuidv4 });

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
    changesSince: 'last-sync',
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
    changesSince: 'last-sync',
  })
);

// get() activates and starts syncing
export const dailyChallenges = dailyChallenges$.get();
export const puzzles = puzzles$.get();
