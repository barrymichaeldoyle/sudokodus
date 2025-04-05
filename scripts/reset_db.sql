-- Drop all tables, types, and functions in the public schema
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Disable all triggers
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    END LOOP;

    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;

    -- Drop all functions
    FOR r IN (SELECT proname, oid FROM pg_proc WHERE pronamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || 
                pg_get_function_identity_arguments(r.oid) || ') CASCADE;';
    END LOOP;

    -- Drop all types including enums
    FOR r IN (
        SELECT typname FROM pg_type t 
        JOIN pg_namespace n ON t.typnamespace = n.oid 
        WHERE n.nspname = 'public' AND 
        (t.typtype = 'e' OR t.typtype = 'c')
    ) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE;';
    END LOOP;

    -- Recreate public schema
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;

    -- Set default privileges
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO service_role;
END $$;
