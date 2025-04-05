import { createClient } from '@supabase/supabase-js';

import { config } from '../config';
import { Database } from './database.types';

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
  // Figure this out later with local-first architecutre
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
