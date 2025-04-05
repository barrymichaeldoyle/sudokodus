CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Removed REFERENCES constraint to allow anonymous users
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