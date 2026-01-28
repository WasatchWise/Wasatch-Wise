# Safe Migration Guide for Existing Database

## Current Situation

You have existing tables that conflict with the new schema:
- ✅ `cyraino_agents` - Already exists
- ✅ `vibe_checks` - Already exists  
- ✅ `daite_users` - Exists (schema expects `users`)
- ✅ `user_connections` - Exists (schema expects `matches`)
- ✅ `agent_dialogues` - Exists (schema expects `agent_conversations`)
- ✅ And more...

## Problem

The `schema.sql` file uses `CREATE TABLE` without `IF NOT EXISTS`, so it fails when tables already exist.

## Solution Options

### Option 1: Drop and Recreate (⚠️ Loses Data)

**Only do this if you don't have important data!**

```sql
-- WARNING: This deletes all data!
-- 1. Export any important data first
-- 2. Drop all existing tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 3. Then run the full schema.sql
```

### Option 2: Rename and Migrate (✅ Keeps Data)

**Best if you have data you want to keep**

1. **Rename existing tables** to backup names:
```sql
ALTER TABLE daite_users RENAME TO daite_users_old;
ALTER TABLE user_connections RENAME TO user_connections_old;
ALTER TABLE agent_dialogues RENAME TO agent_dialogues_old;
-- etc.
```

2. **Run the full schema.sql** (tables will be created fresh)

3. **Migrate data** from old tables to new tables:
```sql
-- Example: Migrate users
INSERT INTO users (id, email, pseudonym, created_at)
SELECT id, email, pseudonym, created_at
FROM daite_users_old
ON CONFLICT (id) DO NOTHING;
```

### Option 3: Modify Schema to Use IF NOT EXISTS (✅ Safest)

**Create missing tables only, keep existing ones**

I can generate a modified version of `schema.sql` that:
- Uses `CREATE TABLE IF NOT EXISTS` for all tables
- Adds missing columns to existing tables with `ALTER TABLE`
- Creates indexes only if they don't exist

## Recommended Next Steps

1. **First, check what you have:**
   Run this in Supabase SQL Editor:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Decide on approach:**
   - **No important data?** → Use Option 1 (clean slate)
   - **Have important data?** → Use Option 2 (migrate)
   - **Want safest approach?** → Use Option 3 (incremental)

3. **Let me know which approach you prefer**, and I'll generate the exact SQL commands you need.

## Quick Check: What Data Do You Have?

Run this to see if tables have data:
```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as columns,
    CASE 
        WHEN table_name = 'daite_users' THEN (SELECT COUNT(*) FROM daite_users)
        WHEN table_name = 'cyraino_agents' THEN (SELECT COUNT(*) FROM cyraino_agents)
        WHEN table_name = 'vibe_checks' THEN (SELECT COUNT(*) FROM vibe_checks)
        -- Add more as needed
        ELSE 0
    END as row_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

This will help determine the best migration strategy.

