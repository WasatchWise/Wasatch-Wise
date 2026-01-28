# StayKit Phase 1 Implementation Guide

## Overview

This guide walks you through deploying the StayKit Phase 1 database schema, which adds structured itinerary support alongside the existing TripKit system. StayKits share the same destinations infrastructure but add:

- **Versioned Content**: Track different versions of StayKits for seamless updates
- **Day-by-Day Itineraries**: Structured daily plans with tasks and sections
- **User Progress Tracking**: Monitor which tasks users have completed
- **Community Features**: User-contributed tips and recommendations
- **Unified Product Library**: Single table managing both TripKits and StayKits

## Architecture

### Key Design Decisions

1. **Parallel to TripKits**: StayKits mirror TripKit architecture while adding structured itinerary features
2. **Shared Destinations**: Both products use the existing `destinations` table via junction tables
3. **Product Key System**: Unified identifier format (`staykit:sk-001`, `tripkit:tk-001`) for cross-product features
4. **Version Control**: Built-in versioning allows content updates without breaking user progress
5. **RLS Security**: Row-level security ensures users only access their own data

### Database Schema

**Core Tables:**
- `staykits` - Main product catalog (mirrors `tripkits`)
- `staykit_versions` - Version control for content updates
- `staykit_days` - Daily itinerary structure
- `staykit_sections` - Optional grouping within days (e.g., "Morning", "Afternoon")
- `staykit_tasks` - Individual activities/tasks within a day
- `staykit_destinations` - Junction table linking StayKits to destinations

**User Data Tables:**
- `user_product_library` - Unified library for both TripKits and StayKits
- `staykit_user_progress` - Track completed/skipped tasks per user
- `staykit_notifications` - User notifications for updates, tips, achievements
- `staykit_community_tips` - User-generated tips and recommendations

**System Tables:**
- `staykit_access_codes` - Redeemable access codes (mirrors TripKit codes)
- `staykit_snapshots` - Historical snapshots of versions
- `snapshot_jobs` - Background job queue for generating snapshots

## Prerequisites

Before starting, ensure you have:

1. **Supabase Project**: Active Supabase project with SQL Editor access
2. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Existing Schema**: Current TripKit schema with `destinations` table
4. **Node.js**: v18+ for running test scripts

## Migration Steps

### Step 1: Backup Your Database

**Critical**: Always backup before major schema changes!

```sql
-- In Supabase Dashboard → SQL Editor
-- Run a full backup or use Supabase's built-in backup feature
```

### Step 2: Apply Schema Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `slctrips-v2/migrations/staykit_phase1_schema.sql`
3. Paste into SQL Editor
4. Click **Run** to execute

**Expected Output:**
- 13 new tables created
- Indexes created for performance
- Check constraints applied

**Verification Query:**
```sql
-- Check all StayKit tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'staykit%'
ORDER BY table_name;

-- Expected: 10 tables starting with 'staykit'
```

### Step 3: Apply RLS Policies

1. Copy contents of `slctrips-v2/migrations/staykit_phase1_rls_policies.sql`
2. Paste into SQL Editor
3. Click **Run**

**What This Does:**
- Enables Row Level Security on all StayKit tables
- Creates policies for public read access (active products)
- Creates policies for user-specific data (progress, notifications)
- Restricts modification to service role

**Verification Query:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE 'staykit%' OR tablename = 'user_product_library')
ORDER BY tablename;

-- All should show rowsecurity = true
```

### Step 4: Apply Triggers & Functions

1. Copy contents of `slctrips-v2/migrations/staykit_phase1_triggers.sql`
2. Paste into SQL Editor
3. Click **Run**

**What This Does:**
- Auto-update timestamps on record changes
- Grant library access on Week 1 signups (Welcome Wagon integration)
- Grant library access on Stripe purchases
- Flag library items for refresh when versions change
- Auto-increment destination and day counts
- Create RPC functions for access code validation

**Verification Query:**
```sql
-- Check triggers exist
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid IN (
  SELECT oid FROM pg_class
  WHERE relname LIKE 'staykit%' OR relname = 'user_product_library'
)
ORDER BY tgrelid::regclass::text, tgname;
```

### Step 5: Run Test Script

Run the automated verification script to seed test data and validate the setup:

```bash
cd slctrips-v2
node scripts/seed-staykit-test.mjs
```

**What This Tests:**
- ✅ All tables exist and are accessible
- ✅ Sample StayKit (SK-000) is created
- ✅ Version, days, sections, and tasks are structured correctly
- ✅ RLS policies protect user data
- ✅ Public users can see active products
- ✅ Triggers auto-update counts
- ✅ Access code validation works

**Expected Output:**
```
🏔️  STAYKIT PHASE 1 - SEED & VERIFICATION SCRIPT

============================================================
  STEP 1: Verify Schema
============================================================

✅ Table staykits exists
✅ Table staykit_versions exists
...
✅ All StayKit tables exist!

============================================================
  STEP 2: Seed Sample StayKit
============================================================

✅ Created StayKit: Week 1: Welcome to Utah (SK-000)
...

============================================================
  SUMMARY
============================================================

📊 staykits: 1 records
📊 staykit_versions: 1 records
📊 staykit_days: 1 records
📊 staykit_tasks: 2 records
📊 staykit_access_codes: 1 records

✅ StayKit Phase 1 setup complete!
```

## Welcome Wagon Integration

To integrate StayKit signups into your existing Welcome Wagon flow, update your submission handler:

```typescript
// Example: src/app/api/welcome-wagon/submit/route.ts

import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { email, product_type } = await request.json();

  // Insert submission
  const { data: submission, error } = await supabaseServer
    .from('welcome_wagon_submissions')
    .insert({
      email,
      submission_type: product_type === 'staykit' ? 'week1_staykit' : 'week1_tripkit',
      product_type: product_type, // 'tripkit' or 'staykit'
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Trigger will automatically grant library access!

  return Response.json({ success: true, submission });
}
```

The `grant_week1_staykit_access()` trigger will automatically add SK-000 to the user's `user_product_library` when a Week 1 StayKit signup is detected.

## Testing Your Setup

### Test 1: Manual StayKit Creation

```sql
-- Create a test StayKit
INSERT INTO staykits (
  name, slug, code, product_key, tagline, description,
  value_proposition, meta_title, meta_description,
  collection_type, primary_theme, tier, status,
  cover_image_url, price
) VALUES (
  'Test StayKit',
  'test-staykit',
  'SK-TEST',
  'staykit:sk-test',
  'A test StayKit',
  'This is a test StayKit for validation',
  'Test the system',
  'Test StayKit | SLCTrips',
  'Test description',
  'free',
  'test',
  'free',
  'active',
  'https://example.com/test.jpg',
  0.00
);
```

### Test 2: Access Code Redemption

```sql
-- Validate an access code
SELECT * FROM validate_staykit_access_code('WELCOME2025');

-- Redeem a code (replace with real user_id)
SELECT * FROM redeem_staykit_access_code(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'WELCOME2025'
);
```

### Test 3: User Progress Tracking

```typescript
// In your app, track user progress:
const { data, error } = await supabase
  .from('staykit_user_progress')
  .upsert({
    user_id: user.id,
    staykit_id: staykit.id,
    version_id: version.id,
    completed_task_ids: [...existingTasks, newTaskId],
    last_activity_at: new Date().toISOString()
  });
```

## Rollback Plan

If you encounter issues, rollback by running:

```sql
-- WARNING: This will delete all StayKit data!
-- Backup first if you have production data.

DROP TABLE IF EXISTS staykit_community_tips CASCADE;
DROP TABLE IF EXISTS staykit_notifications CASCADE;
DROP TABLE IF EXISTS staykit_user_progress CASCADE;
DROP TABLE IF EXISTS staykit_tasks CASCADE;
DROP TABLE IF EXISTS staykit_sections CASCADE;
DROP TABLE IF EXISTS staykit_days CASCADE;
DROP TABLE IF EXISTS staykit_destinations CASCADE;
DROP TABLE IF EXISTS staykit_snapshots CASCADE;
DROP TABLE IF EXISTS staykit_versions CASCADE;
DROP TABLE IF EXISTS staykit_access_codes CASCADE;
DROP TABLE IF EXISTS snapshot_jobs CASCADE;
DROP TABLE IF EXISTS user_product_library CASCADE;
DROP TABLE IF EXISTS staykits CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS validate_staykit_access_code(TEXT);
DROP FUNCTION IF EXISTS record_staykit_access_code_usage(TEXT);
DROP FUNCTION IF EXISTS redeem_staykit_access_code(UUID, TEXT);
DROP FUNCTION IF EXISTS grant_week1_staykit_access();
DROP FUNCTION IF EXISTS grant_staykit_library_access_on_purchase();
DROP FUNCTION IF EXISTS flag_library_for_refresh_on_version_change();
DROP FUNCTION IF EXISTS update_staykit_destination_count();
DROP FUNCTION IF EXISTS update_staykit_day_count();
DROP FUNCTION IF EXISTS update_staykit_progress_activity();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Next Steps

After successful deployment:

1. **Create Production StayKits**: Build out SK-001, SK-002, etc. with real content
2. **Frontend Integration**: Update UI to display StayKits alongside TripKits
3. **User Dashboard**: Add progress tracking and library views
4. **Monitoring**: Set up alerts for failed snapshot jobs
5. **Documentation**: Update user-facing docs with StayKit features

## Troubleshooting

### Issue: Tables not created
**Solution**: Check Supabase logs for syntax errors. Ensure you're using PostgreSQL 14+.

### Issue: RLS blocking legitimate queries
**Solution**: Verify you're using the correct client (anon vs service role). Check policy definitions in SQL Editor.

### Issue: Triggers not firing
**Solution**: Run verification queries to ensure triggers exist. Check function definitions for errors.

### Issue: Access codes not validating
**Solution**: Verify `validate_staykit_access_code` function exists and is SECURITY DEFINER.

## Support

For issues with this implementation:
1. Review the migration SQL files for inline comments
2. Check Supabase logs in Dashboard → Logs
3. Run the test script with verbose output
4. Verify your environment variables are correct

## Architecture Decisions Log

**Q: Why separate tables for StayKits instead of a unified products table?**
A: Keeps TripKit functionality isolated during development. Allows for different pricing models and content structures. Easier to maintain and scale independently.

**Q: Why `user_product_library` instead of separate access tables?**
A: Unified library simplifies cross-product features (bundles, recommendations). Single source of truth for "what does this user own?" Makes reporting and analytics easier.

**Q: Why version control for StayKits?**
A: Allows content updates without breaking user progress. Users can finish the version they started, even if a new version is released. Critical for maintaining trust with paying customers.

**Q: Why community tips as separate table instead of JSONB?**
A: Enables moderation, voting, and search. Structured data allows for better UX (filtering, sorting). Easier to implement anti-spam and quality control.

---

**Status**: ✅ Phase 1 Complete
**Date**: November 14, 2025
**Next Phase**: Frontend Integration & User Dashboard
