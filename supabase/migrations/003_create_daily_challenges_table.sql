-- migrations/003_create_daily_challenges_table.sql
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  difficulty difficulty_level NOT NULL,  -- Using the enum type here instead of TEXT
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure only one puzzle per difficulty per day
  UNIQUE(date, difficulty)
);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(date);

-- Allow public read access
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to daily challenges"
  ON public.daily_challenges
  FOR SELECT
  USING (true);
