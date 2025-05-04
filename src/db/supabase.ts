import { createClient } from '@supabase/supabase-js';

import { config } from '../config';
import { createMMKVStorage } from '../utils/createMMKVStorage';
import { Database } from './database.types';

const STORAGE_KEY = 'supabase-storage';
const storage = createMMKVStorage(STORAGE_KEY);

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: { schema: 'public' },
    global: {
      headers: { 'x-application-name': 'sudokodus' },
    },
  }
);
