-- ============================================================================
-- Step 4: Migrate Data to New Schema
-- Run this AFTER schema.sql has completed successfully
-- 
-- NOTE: Tables were already backed up and renamed in Step 2
-- This script only migrates data from old_* tables to new tables
-- ============================================================================

-- Verify new tables exist first
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'New schema not found! Please run database/schema.sql first.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cyraino_agents') THEN
        RAISE EXCEPTION 'cyraino_agents table not found! Please run database/schema.sql first.';
    END IF;
    
    RAISE NOTICE '✅ New schema tables found - proceeding with migration...';
END $$;

-- ============================================================================
-- Migrate Users from old_daite_users to users
-- ============================================================================

DO $$
DECLARE
    user_count INTEGER;
    col_list TEXT;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_daite_users' INTO user_count;
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE 'Found % users to migrate', user_count;
        
        IF user_count > 0 THEN
            -- Check what columns exist in old table
            SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
            INTO col_list
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'old_daite_users';
            
            RAISE NOTICE 'Columns in old_daite_users: %', col_list;
            
            BEGIN
                INSERT INTO public.users (id, email, pseudonym, created_at, updated_at, last_active_at)
                SELECT 
                    id,
                    COALESCE(
                        email, 
                        (SELECT email FROM auth.users WHERE id = old_daite_users.id),
                        'user_' || substring(id::text from 1 for 8) || '@migrated.local'
                    ) as email,
                    COALESCE(pseudonym, username, display_name, 'User_' || substring(id::text from 1 for 8)) as pseudonym,
                    COALESCE(created_at, now()) as created_at,
                    COALESCE(updated_at, now()) as updated_at,
                    COALESCE(last_active_at, last_seen_at, now()) as last_active_at
                FROM old_daite_users
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    pseudonym = EXCLUDED.pseudonym,
                    updated_at = EXCLUDED.updated_at;
                
                RAISE NOTICE '✅ Successfully migrated % users', user_count;
            EXCEPTION WHEN others THEN
                RAISE NOTICE '❌ Error migrating users: %', SQLERRM;
                RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
                RAISE NOTICE 'Available columns: %', col_list;
            END;
        ELSE
            RAISE NOTICE 'No users to migrate';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  old_daite_users table not found';
    END IF;
END $$;

-- ============================================================================
-- Migrate CYRAiNO Agents from old_cyraino_agents to cyraino_agents
-- ============================================================================

DO $$
DECLARE
    agent_count INTEGER;
    col_list TEXT;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_cyraino_agents' INTO agent_count;
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE 'Found % cyraino_agents to migrate', agent_count;
        
        IF agent_count > 0 THEN
            -- Check columns
            SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
            INTO col_list
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents';
            
            RAISE NOTICE 'Columns in old_cyraino_agents: %', col_list;
            
            BEGIN
                -- Migrate with your actual structure
                -- Your structure: id, user_id, name, personality_summary, communication_style, embedding, last_trained, created_at
                INSERT INTO public.cyraino_agents (
                    id, 
                    user_id, 
                    name, 
                    personality_traits, 
                    agent_embedding,
                    created_at, 
                    updated_at
                )
                SELECT 
                    id,
                    user_id,
                    name,
                    -- Combine personality_summary and communication_style into personality_traits JSONB
                    jsonb_build_object(
                        'personality_summary', personality_summary,
                        'communication_style', communication_style,
                        'humor', COALESCE((communication_style->>'humor')::numeric, 0.5),
                        'empathy', COALESCE((communication_style->>'empathy')::numeric, 0.8),
                        'directness', COALESCE((communication_style->>'directness')::numeric, 0.6)
                    ) as personality_traits,
                    -- Map embedding to agent_embedding (will be null if not set, which is fine)
                    embedding as agent_embedding,
                    COALESCE(created_at, now()) as created_at,
                    COALESCE(last_trained, created_at, now()) as updated_at
                FROM old_cyraino_agents
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    personality_traits = EXCLUDED.personality_traits,
                    agent_embedding = EXCLUDED.agent_embedding,
                    updated_at = EXCLUDED.updated_at;
                
                RAISE NOTICE '✅ Successfully migrated % cyraino_agents', agent_count;
                RAISE NOTICE '   Preserved: personality_summary, communication_style (humor/empathy/directness)';
            EXCEPTION WHEN others THEN
                RAISE NOTICE '❌ Error migrating cyraino_agents: %', SQLERRM;
                RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
                RAISE NOTICE 'Column mapping failed. Existing columns: %', col_list;
                RAISE NOTICE 'Expected columns: id, user_id, name, personality_summary, communication_style, embedding, last_trained, created_at';
            END;
        ELSE
            RAISE NOTICE 'No agents to migrate';
        END IF;
    ELSE
        RAISE NOTICE '⚠️  old_cyraino_agents table not found';
    END IF;
END $$;

-- ============================================================================
-- Migration Summary
-- ============================================================================

DO $$
DECLARE
    new_users INTEGER;
    new_agents INTEGER;
    old_users INTEGER;
    old_agents INTEGER;
BEGIN
    SELECT COUNT(*) INTO new_users FROM public.users;
    SELECT COUNT(*) INTO new_agents FROM public.cyraino_agents;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_daite_users' INTO old_users;
    ELSE
        old_users := 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_cyraino_agents' INTO old_agents;
    ELSE
        old_agents := 0;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 Migration Summary';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Users:   % old → % new', old_users, new_users;
    RAISE NOTICE 'Agents:  % old → % new', old_agents, new_agents;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    IF new_users >= old_users AND new_agents >= old_agents THEN
        RAISE NOTICE '✅ Migration appears successful!';
    ELSE
        RAISE NOTICE '⚠️  Some data may not have migrated - check above for errors';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '➡️  Next: Run verify-migration.sql to check details';
END $$;

