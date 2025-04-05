CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Removed REFERENCES constraint to allow anonymous users
  puzzle_string CHAR(81) REFERENCES public.puzzles(puzzle_string),
  -- current_state JSONB structure:
  -- {
  --   grid: { value: number | null, isGiven: boolean }[][]
  --   selectedCell: { row: number, col: number } | null
  -- }
  current_state JSONB NOT NULL,
  -- notes JSONB structure:
  -- {
  --   cells: {
  --     "row,col": number[] // e.g. "0,0": [1,2,3] for top-left cell pencil marks
  --   }
  -- }
  notes JSONB,
  is_completed BOOLEAN DEFAULT false,
  hints_used INTEGER DEFAULT 0,
  last_hint_at TIMESTAMP WITH TIME ZONE, -- NULL if no hint used yet, used for cooldown
  -- moves_history JSONB[] structure:
  -- Array of move objects, each containing:
  -- {
  --   type: 'setValue' | 'setNotes',
  --   cell: { row: number, col: number },
  --   value: number | null,           -- for setValue moves
  --   notes?: number[],               -- for setNotes moves
  --   previousValue?: number | null,  -- for setValue moves
  --   previousNotes?: number[]        -- for setNotes moves
  -- }
  moves_history JSONB[],
  -- current_move_index tracks the current position in moves_history
  -- -1 means no moves made yet
  -- Used for undo/redo functionality:
  -- - undo decrements this index
  -- - redo increments this index
  -- - new move truncates history after this index and appends new move
  current_move_index INTEGER DEFAULT 0,
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