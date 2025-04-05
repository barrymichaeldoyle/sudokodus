ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" 
  ON public.puzzles
  FOR SELECT 
  USING (true);
