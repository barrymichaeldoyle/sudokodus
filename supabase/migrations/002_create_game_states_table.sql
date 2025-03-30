-- migrations/002_create_game_states_table.sql
CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  current_state JSONB NOT NULL,
  notes JSONB,
  is_completed BOOLEAN DEFAULT false,
  moves_count INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  moves_history JSONB[], -- Array of moves for undo/redo
  current_move_index INTEGER DEFAULT 0, -- Track position in history
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own game states
CREATE POLICY "Users can read their own game states"
  ON public.game_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own game states
CREATE POLICY "Users can insert their own game states"
  ON public.game_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
-- Allow users to update their own game states
CREATE POLICY "Users can update their own game states"
  ON public.game_states
  FOR UPDATE
  USING (auth.uid() = user_id);