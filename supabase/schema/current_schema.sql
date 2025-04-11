-- EXTENSIONS --
-- File: extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- TYPES --
-- File: difficulty_level.sql
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'diabolical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- TABLES --
-- File: 1_puzzles.sql
CREATE TABLE IF NOT EXISTS public.puzzles (
  puzzle_string CHAR(81) PRIMARY KEY,
  rating REAL NOT NULL,
  difficulty difficulty_level NOT NULL,
  is_symmetric BOOLEAN DEFAULT false,
  clue_count INTEGER NOT NULL,
  source TEXT DEFAULT 'sudokodus',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON public.puzzles(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzles_clue_count ON public.puzzles(clue_count);

-- File: 2_daily_challenges.sql
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  difficulty difficulty_level NOT NULL,  -- Using the enum type here instead of TEXT
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  -- Ensure only one puzzle per difficulty per day
  UNIQUE(date, difficulty)
);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(date);

-- File: 3_game_states.sql
CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Removed REFERENCES constraint to allow anonymous users
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  current_state JSONB NOT NULL,
  notes JSONB,
  is_completed BOOLEAN DEFAULT false,
  hints_used INTEGER DEFAULT 0,
  moves_history JSONB[], -- Array of moves for undo functionality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- This will set the `created_at` column on create and `updated_at` column on every update
CREATE OR REPLACE FUNCTION handle_times()
    RETURNS trigger AS
    $$
    BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at := now();
        NEW.updated_at := now();
    ELSEIF (TG_OP = 'UPDATE') THEN
        NEW.created_at = OLD.created_at;
        NEW.updated_at := now();
    END IF;
    RETURN NEW;
    END;
    $$ language plpgsql;

CREATE TRIGGER handle_times
    BEFORE INSERT OR UPDATE ON public.game_states
    FOR EACH ROW
EXECUTE PROCEDURE handle_times();


-- FUNCTIONS --
-- File: cleanup_functions.sql
-- Function to clean up old anonymous game states
CREATE OR REPLACE FUNCTION cleanup_anonymous_game_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete completed games older than 90 days
  DELETE FROM public.game_states
  WHERE user_id NOT IN (SELECT id FROM auth.users)
    AND is_completed = true
    AND updated_at < NOW() - INTERVAL '90 days';

  -- Delete abandoned games older than 30 days
  DELETE FROM public.game_states
  WHERE user_id NOT IN (SELECT id FROM auth.users)
    AND is_completed = false
    AND updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to run the cleanup daily
SELECT cron.schedule(
  'cleanup-anonymous-games',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT cleanup_anonymous_game_states();
  $$
); 


-- POLICIES --
-- File: daily_challenges_policies.sql
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to daily challenges"
  ON public.daily_challenges
  FOR SELECT
  USING (true);

-- File: game_state_policies.sql
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to own game states"
  ON public.game_states
  FOR ALL
  USING (user_id IS NOT NULL);

-- File: puzzle_policies.sql
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" 
  ON public.puzzles
  FOR SELECT 
  USING (true);

