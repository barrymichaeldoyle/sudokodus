CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  difficulty difficulty_level NOT NULL,  -- Using the enum type here instead of TEXT
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  -- Ensure only one puzzle per difficulty per day
  UNIQUE(date, difficulty)
);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(date);