DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'diabolical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;