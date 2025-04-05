ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to own game states"
  ON public.game_states
  FOR ALL
  USING (user_id IS NOT NULL);
