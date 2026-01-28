# Database Migration Steps

## Current Situation
- ✅ `daite_users`: 2 rows
- ✅ `cyraino_agents`: 2 rows
- ✅ `vibe_checks`: 0 rows

## Migration Plan

### Step 1: Inspect Existing Tables (5 minutes)

Run `check-old-table-structure.sql` in Supabase SQL Editor to see:
- What columns your existing tables have
- How they differ from the new schema
- Sample data structure

This helps us create accurate migration queries.

### Step 2: Backup & Rename (2 minutes)

Run `migrate-with-data.sql` **up to STEP 2** (stops before "STEP 3").

This will:
- ✅ Create backup tables with your data
- ✅ Rename old tables so schema.sql can run

### Step 3: Run New Schema (2 minutes)

Now run the full `schema.sql` file. It should complete without errors because conflicting tables are renamed.

### Step 4: Migrate Data (5 minutes)

Continue with **STEP 4** from `migrate-with-data.sql` to migrate your 2 users and 2 agents to the new structure.

### Step 5: Verify (1 minute)

Check that your data migrated correctly:
```sql
SELECT COUNT(*) FROM users; -- Should show 2
SELECT COUNT(*) FROM cyraino_agents; -- Should show 2
```

### Step 6: Clean Up (optional, later)

Once you're confident everything works, drop the old tables:
```sql
DROP TABLE IF EXISTS old_daite_users;
DROP TABLE IF EXISTS old_cyraino_agents;
-- etc.
```

## Quick Command Sequence

1. **Check structure:**
   ```sql
   -- Run: check-old-table-structure.sql
   ```

2. **Backup & rename:**
   ```sql
   -- Run: migrate-with-data.sql (Steps 1-2 only)
   ```

3. **Create new schema:**
   ```sql
   -- Run: database/schema.sql (full file)
   ```

4. **Migrate data:**
   ```sql
   -- Continue: migrate-with-data.sql (Step 4)
   ```

5. **Verify:**
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM cyraino_agents;
   ```

## Important Notes

- **Backups are created first** - your data is safe
- **Old tables are renamed, not deleted** - can recover if needed
- **Migration is idempotent** - can re-run if there are issues
- **Test with your 2 users first** before adding more data

## If Something Goes Wrong

1. Data is backed up in `migration_backup_*` tables
2. Old tables renamed to `old_*` (not deleted)
3. Can restore by renaming back:
   ```sql
   ALTER TABLE old_daite_users RENAME TO daite_users;
   ```

## Need Help?

If the migration queries fail due to column name differences, share:
1. Output from `check-old-table-structure.sql`
2. Error messages
3. I'll adjust the migration queries for your exact schema

