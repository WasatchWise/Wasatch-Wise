-- ============================================================================
-- Fix Migration - Manual Insert with Better Error Handling
-- This will show exactly what's wrong and fix it
-- ============================================================================

-- First, let's see what we're working with
DO $$
DECLARE
    old_user_count INTEGER;
    old_agent_count INTEGER;
    new_user_count INTEGER;
    new_agent_count INTEGER;
    user_id_check UUID;
BEGIN
    -- Count old data
    SELECT COUNT(*) INTO old_user_count FROM old_daite_users;
    SELECT COUNT(*) INTO old_agent_count FROM old_cyraino_agents;
    
    -- Count new data
    SELECT COUNT(*) INTO new_user_count FROM public.users;
    SELECT COUNT(*) INTO new_agent_count FROM public.cyraino_agents;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Current Status:';
    RAISE NOTICE '  Old users: %', old_user_count;
    RAISE NOTICE '  New users: %', new_user_count;
    RAISE NOTICE '  Old agents: %', old_agent_count;
    RAISE NOTICE '  New agents: %', new_agent_count;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================================================
-- Try to migrate users with detailed error reporting
-- ============================================================================

DO $$
DECLARE
    user_rec RECORD;
    inserted_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Migrating Users (one by one to catch errors)...';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOR user_rec IN 
        SELECT * FROM old_daite_users
    LOOP
        BEGIN
            -- Check if user exists in auth.users first
            IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_rec.id) THEN
                RAISE NOTICE '⚠️  User % not in auth.users - creating auth user first...', user_rec.id;
                
                -- Try to get email from old data or generate one
                -- Note: We can't create auth.users directly, so we'll need to handle this
                RAISE NOTICE '   User needs to exist in auth.users first';
                RAISE NOTICE '   Skipping user % for now', user_rec.id;
                error_count := error_count + 1;
                CONTINUE;
            END IF;
            
            -- Insert user
            INSERT INTO public.users (id, email, pseudonym, created_at, updated_at, last_active_at)
            VALUES (
                user_rec.id,
                COALESCE(
                    user_rec.email,
                    (SELECT email FROM auth.users WHERE id = user_rec.id),
                    'user_' || substring(user_rec.id::text from 1 for 8) || '@migrated.local'
                ),
                COALESCE(
                    user_rec.pseudonym,
                    user_rec.username,
                    user_rec.display_name,
                    'User_' || substring(user_rec.id::text from 1 for 8)
                ),
                COALESCE(user_rec.created_at, now()),
                COALESCE(user_rec.updated_at, now()),
                COALESCE(user_rec.last_active_at, user_rec.last_seen_at, now())
            )
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                pseudonym = EXCLUDED.pseudonym,
                updated_at = EXCLUDED.updated_at;
            
            inserted_count := inserted_count + 1;
            RAISE NOTICE '✅ Migrated user: %', user_rec.id;
            
        EXCEPTION WHEN others THEN
            error_count := error_count + 1;
            RAISE NOTICE '❌ Error migrating user %: %', user_rec.id, SQLERRM;
            RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Users: % inserted, % errors', inserted_count, error_count;
END $$;

-- ============================================================================
-- Try to migrate agents with detailed error reporting
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    inserted_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Migrating Agents (one by one to catch errors)...';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOR agent_rec IN 
        SELECT * FROM old_cyraino_agents
    LOOP
        BEGIN
            -- Check if user_id exists in new users table
            IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = agent_rec.user_id) THEN
                RAISE NOTICE '⚠️  User % not found in users table - agent needs user first', agent_rec.user_id;
                error_count := error_count + 1;
                CONTINUE;
            END IF;
            
            -- Insert agent
            INSERT INTO public.cyraino_agents (
                id, 
                user_id, 
                name, 
                personality_traits, 
                agent_embedding,
                created_at, 
                updated_at
            )
            VALUES (
                agent_rec.id,
                agent_rec.user_id,
                agent_rec.name,
                jsonb_build_object(
                    'personality_summary', agent_rec.personality_summary,
                    'communication_style', agent_rec.communication_style,
                    'humor', COALESCE((agent_rec.communication_style->>'humor')::numeric, 0.5),
                    'empathy', COALESCE((agent_rec.communication_style->>'empathy')::numeric, 0.8),
                    'directness', COALESCE((agent_rec.communication_style->>'directness')::numeric, 0.6)
                ),
                agent_rec.embedding,
                COALESCE(agent_rec.created_at, now()),
                COALESCE(agent_rec.last_trained, agent_rec.created_at, now())
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                personality_traits = EXCLUDED.personality_traits,
                agent_embedding = EXCLUDED.agent_embedding,
                updated_at = EXCLUDED.updated_at;
            
            inserted_count := inserted_count + 1;
            RAISE NOTICE '✅ Migrated agent: % (%%)', agent_rec.name, agent_rec.id;
            
        EXCEPTION WHEN others THEN
            error_count := error_count + 1;
            RAISE NOTICE '❌ Error migrating agent %: %', agent_rec.id, SQLERRM;
            RAISE NOTICE '   SQLSTATE: %', SQLSTATE;
            RAISE NOTICE '   Agent name: %', agent_rec.name;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Agents: % inserted, % errors', inserted_count, error_count;
END $$;

-- Final summary
SELECT 
    'Final Count' as check_type,
    (SELECT COUNT(*) FROM public.users) as users,
    (SELECT COUNT(*) FROM public.cyraino_agents) as agents;

