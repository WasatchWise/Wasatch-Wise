# Row Level Security (RLS) Setup Guide

## Overview

Your database has 28 tables without RLS enabled, which is a security risk. This guide will help you secure them.

## Tables Requiring RLS

### Legacy/Backup Tables (14 tables)
These are migration artifacts that should be archived or dropped:
- `old_*` tables (9 tables)
- `migration_backup_*` tables (5 tables)

### Active Tables (14 tables)
These need RLS policies:

**User Data:**
- `pseudonym_history`
- `assessments`
- `saved_discoveries`
- `message_drafts`
- `friendship_settings`
- `accountability_scores`

**Safety:**
- `safety_flags`
- `date_safety`

**Dating/Events:**
- `venues`
- `events`
- `planned_dates`
- `date_feedback`

**Billing:**
- `token_purchases`
- `premium_subscriptions`

## Setup Steps

### Step 1: Enable RLS and Create Policies

Run: `enable-rls-and-policies.sql`

This will:
- ✅ Enable RLS on all 14 active tables
- ✅ Create policies for user data access
- ✅ Create policies for safety features
- ✅ Create policies for venues/events (public read, system write)
- ✅ Create policies for billing data
- ✅ Verify RLS status

### Step 2: Clean Up Legacy Tables

**Option A: Archive (Recommended)**
Run: `cleanup-legacy-tables.sql` (Option 1)

Moves legacy tables to `archive` schema:
- Keeps data for reference
- Removes from public schema
- No data loss

**Option B: Drop (Permanent)**
Run: `cleanup-legacy-tables.sql` (Option 2 - uncomment)

⚠️ **Warning:** This permanently deletes the tables!

Only do this after:
- ✅ Migration verified successful
- ✅ Data confirmed in new tables
- ✅ Backup exported (optional but recommended)

## Policy Overview

### User Data Policies
- Users can only access their own data
- Users can create/update their own records
- Assessment templates are publicly readable

### Safety Policies
- Safety flags: System/admin only (users cannot access)
- Date safety: Users can see their own date safety data

### Venues/Events Policies
- **Read:** Public (anyone can view venues and events)
- **Write:** System/service role only

### Billing Policies
- Users can only see their own purchases/subscriptions
- Users can create purchases (processed by Stripe webhook)

## Verification

After running the scripts, verify:

```sql
-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

All active tables should show:
- `rls_enabled = true`
- `policy_count > 0`

## Important Notes

### Service Role Access
Some tables (like `safety_flags`, `venues`) have policies that restrict regular users. Your backend code using the `SUPABASE_SERVICE_ROLE_KEY` will bypass RLS and can access/modify these tables.

### Testing
After enabling RLS:
1. Test with authenticated users (should only see their data)
2. Test with unauthenticated users (should be restricted)
3. Test your backend API (using service role key should work)

## Next Steps

1. ✅ Run `enable-rls-and-policies.sql`
2. ✅ Verify policies are created
3. ✅ Test your application
4. ✅ Clean up legacy tables (archive or drop)
5. ✅ Update your application code if needed

## Security Best Practices

- ✅ Always enable RLS on user data tables
- ✅ Use service role key only in secure backend code
- ✅ Never expose service role key to frontend
- ✅ Test policies with different user roles
- ✅ Review policies periodically

