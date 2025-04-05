ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to daily challenges"
  ON public.daily_challenges
  FOR SELECT
  USING (true);
