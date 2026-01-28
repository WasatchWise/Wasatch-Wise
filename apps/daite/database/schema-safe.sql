-- ============================================================================
-- SAFE Schema Creation - Handles Existing Tables
-- This version drops existing tables first (USE WITH CAUTION!)
-- ============================================================================
-- ⚠️  WARNING: This will DELETE existing tables!
-- Only use if you've backed up your data first!
-- ============================================================================

-- Enable extensions (safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Drop conflicting tables IF THEY EXIST
-- ============================================================================

DO $$
DECLARE
    tables_to_drop TEXT[] := ARRAY[
        'cyraino_agents',
        'users',
        'daite_users',
        'vibe_checks'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_drop
    LOOP
        -- Only drop if it exists AND is not already renamed (old_*)
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'old_' || table_name
        ) THEN
            -- Table exists but wasn't renamed - we should rename, not drop
            RAISE NOTICE '⚠️  Table % exists but not renamed. Please run fix-and-continue.sql first!', table_name;
            RAISE EXCEPTION 'Please rename existing tables first using fix-and-continue.sql';
        END IF;
    END LOOP;
END $$;

-- If we get here, it's safe to continue with schema creation
-- (The rest of schema.sql would go here, but we'll use the original instead)

