-- Puzzles table --
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
