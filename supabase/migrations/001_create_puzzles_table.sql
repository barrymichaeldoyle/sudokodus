-- Create enum type for difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'diabolical');

-- migrations/001_create_puzzles_table.sql
CREATE TABLE IF NOT EXISTS public.puzzles (
  puzzle_string CHAR(81) PRIMARY KEY,
  rating REAL NOT NULL,
  difficulty difficulty_level NOT NULL,
  is_symmetric BOOLEAN DEFAULT false,
  clue_count INTEGER NOT NULL,
  source TEXT DEFAULT 'sudokodus',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON public.puzzles(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzles_clue_count ON public.puzzles(clue_count);

-- Add RLS policies
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" 
  ON public.puzzles
  FOR SELECT 
  USING (true);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON public.puzzles(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzles_clue_count ON public.puzzles(clue_count);