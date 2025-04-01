-- Function to clean up old anonymous game states
CREATE OR REPLACE FUNCTION cleanup_anonymous_game_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete completed games older than 30 days
  DELETE FROM public.game_states
  WHERE user_id NOT IN (SELECT id FROM auth.users)
    AND is_completed = true
    AND updated_at < NOW() - INTERVAL '30 days';

  -- Delete abandoned games older than 7 days
  DELETE FROM public.game_states
  WHERE user_id NOT IN (SELECT id FROM auth.users)
    AND is_completed = false
    AND updated_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Create a scheduled job to run the cleanup daily
SELECT cron.schedule(
  'cleanup-anonymous-games',
  '0 0 * * *', -- Run at midnight every day
  $$
  SELECT cleanup_anonymous_game_states();
  $$
); 