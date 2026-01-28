# Step-by-Step Migration Execution Guide

## ⚠️ Important: Execute These Steps IN ORDER

### Step 1: Check Your Existing Structure (Optional but Recommended)

Run: `check-old-table-structure.sql`

This shows you what columns exist in your current tables. Helps verify the migration will work.

---

### Step 2: Backup & Rename Tables

Run: `migrate-with-data.sql` **BUT STOP AT LINE ~45** (after Step 2, before Step 3 comment)

Or run just Steps 1-2:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Backup data
CREATE TABLE IF NOT EXISTS migration_backup_daite_users AS SELECT * FROM daite_users;
CREATE TABLE IF NOT EXISTS migration_backup_cyraino_agents AS SELECT * FROM cyraino_agents;

-- Rename old tables
ALTER TABLE IF EXISTS public.daite_users RENAME TO old_daite_users;
ALTER TABLE IF EXISTS public.user_connections RENAME TO old_user_connections;
ALTER TABLE IF EXISTS public.agent_dialogues RENAME TO old_agent_dialogues;
ALTER TABLE IF EXISTS public.cyraino_agents RENAME TO old_cyraino_agents;
ALTER TABLE IF EXISTS public.vibe_checks RENAME TO old_vibe_checks;
ALTER TABLE IF EXISTS public.planned_meetups RENAME TO old_planned_meetups;
ALTER TABLE IF EXISTS public.user_traits RENAME TO old_user_traits;
ALTER TABLE IF EXISTS public.token_transactions RENAME TO old_token_transactions;
ALTER TABLE IF EXISTS public.connection_feedback RENAME TO old_connection_feedback;
```

✅ **Verify:** Old tables should now be renamed (check Table Editor in Supabase)

---

### Step 3: Create New Schema ⭐ **CRITICAL STEP**

**Open `database/schema.sql`** and run the ENTIRE file in Supabase SQL Editor.

This creates all 30+ new tables with the correct structure.

✅ **Verify:** Check Table Editor - you should see new tables like `users`, `cyraino_agents`, etc.

---

### Step 4: Migrate Your Data

**NOW** go back to `migrate-with-data.sql` and run **Step 4** (the migration DO blocks).

Or run this directly:

```sql
-- Step 4: Migrate users
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_daite_users') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_daite_users' INTO user_count;
        RAISE NOTICE 'Found % users to migrate', user_count;
        
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
            
            RAISE NOTICE '✅ Migrated users successfully';
        EXCEPTION WHEN others THEN
            RAISE NOTICE '❌ Error: %', SQLERRM;
        END;
    END IF;
END $$;

-- Step 4: Migrate cyraino_agents
DO $$
DECLARE
    agent_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'old_cyraino_agents') THEN
        EXECUTE 'SELECT COUNT(*) FROM old_cyraino_agents' INTO agent_count;
        RAISE NOTICE 'Found % agents to migrate', agent_count;
        
        BEGIN
            INSERT INTO public.cyraino_agents (id, user_id, name, personality_traits, created_at, updated_at)
            SELECT 
                id,
                user_id,
                name,
                jsonb_build_object(
                    'personality_summary', personality_summary,
                    'communication_style', communication_style,
                    'humor', (communication_style->>'humor')::numeric,
                    'empathy', (communication_style->>'empathy')::numeric,
                    'directness', (communication_style->>'directness')::numeric
                ) as personality_traits,
                COALESCE(created_at, now()) as created_at,
                COALESCE(updated_at, last_trained, now()) as updated_at
            FROM old_cyraino_agents
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                personality_traits = EXCLUDED.personality_traits,
                updated_at = EXCLUDED.updated_at;
            
            RAISE NOTICE '✅ Migrated agents successfully';
        EXCEPTION WHEN others THEN
            RAISE NOTICE '❌ Error: %', SQLERRM;
        END;
    END IF;
END $$;
```

✅ **Verify:** Check row counts match:
```sql
SELECT COUNT(*) FROM users; -- Should be 2
SELECT COUNT(*) FROM cyraino_agents; -- Should be 2
```

---

### Step 5: Verify Migration (Now Safe to Run)

Run Step 5 from `migrate-with-data.sql` (I've fixed it to check if tables exist first).

---

## Common Issues & Fixes

### ❌ Error: "relation public.users does not exist"

**Cause:** You tried to run Step 5 before Step 3 (creating schema.sql)

**Fix:** Make sure you ran the full `schema.sql` file first!

### ❌ Error: Column name mismatch during migration

**Cause:** Your old table has different column names than expected

**Fix:** 
1. Run `check-old-table-structure.sql` to see actual columns
2. Adjust the migration queries in Step 4 to match your column names

### ✅ Success Indicators

- Old tables renamed to `old_*`
- New tables created (users, cyraino_agents, etc.)
- Row counts match: 2 users, 2 agents migrated
- No errors in migration queries

---

## Quick Reference

```
1. Backup & Rename  → migrate-with-data.sql (Steps 1-2)
2. Create Schema    → database/schema.sql (FULL FILE)
3. Migrate Data     → migrate-with-data.sql (Step 4)
4. Verify           → migrate-with-data.sql (Step 5)
```

