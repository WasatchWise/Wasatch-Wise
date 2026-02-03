# Database Verification & Migration Guide

## Current Situation

**Your Project:** `hwxpcekddtfubmnkwutl.supabase.co`  
**MCP Tool Issue:** Connected to different project (can't access yours directly)

## What Your Codebase Needs

### WasatchWise Base Tables (Required for existing code)
- `clients` - Used by: cognitive audits, projects
- `projects` - Project tracking
- `cognitive_audits` - Audit results
- `quiz_results` - Used by: `/ai-readiness-quiz` page
- `email_captures` - Used by: quiz, contact form (exists but needs columns)
- `ai_content_log` - Used by: Claude integration
- `heygen_videos` - Used by: HeyGen integration
- `blog_posts` - Content management
- `case_studies` - Marketing
- `tiktok_content` - Social tracking

### DAROS Tables (New consultation platform)
- `districts` - District master data
- `artifacts` - Generated outputs
- `controls` - Privacy checklist (8 default controls)
- `district_controls` - Implementation tracking
- `stakeholder_matrix` - Bob's framework
- `interventions` - Change management
- `vendors` / `district_vendors` - Vendor risk
- `briefing_sessions` - 60-minute sessions
- `adoption_plans` - 30/60/90 plans

---

## Step-by-Step Migration

### Step 1: Verify Current State

**In Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/hwxpcekddtfubmnkwutl
2. Click "SQL Editor"
3. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Share the results** so I know what exists.

### Step 2: Apply Migration

**Option A: Use Complete Migration (Recommended)**
1. Open SQL Editor in Supabase
2. Copy entire contents of: `lib/supabase/complete-migration.sql`
3. Paste and run
4. Verify with query below

**Option B: Apply Incrementally**
1. First: `lib/supabase/schema.sql` (WasatchWise base)
2. Then: `lib/supabase/daros-schema.sql` (DAROS)

### Step 3: Verify Migration

Run this verification query:

```sql
-- Check WasatchWise tables
SELECT 'WasatchWise Tables' as category, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients', 'projects', 'cognitive_audits', 'quiz_results', 
    'email_captures', 'ai_content_log', 'heygen_videos',
    'blog_posts', 'case_studies', 'tiktok_content'
  )
ORDER BY table_name;

-- Check DAROS tables
SELECT 'DAROS Tables' as category, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'districts', 'artifacts', 'controls', 'district_controls',
    'stakeholder_matrix', 'interventions', 'vendors', 'district_vendors',
    'briefing_sessions', 'adoption_plans'
  )
ORDER BY table_name;

-- Check email_captures structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'email_captures'
ORDER BY ordinal_position;

-- Check controls seed data
SELECT COUNT(*) as control_count FROM controls;
-- Should return 8
```

### Step 4: Test Code Connection

After migration, test that your code can connect:

```bash
# Your dev server should be running
# Try accessing:
# - http://localhost:3000/ai-readiness-quiz (uses quiz_results, email_captures)
# - http://localhost:3000/dashboard (uses districts, artifacts)
```

---

## Migration Safety

### Safe Operations
- ✅ All CREATE TABLE use `IF NOT EXISTS`
- ✅ All ALTER TABLE wrapped in conditional blocks
- ✅ All CREATE INDEX use `IF NOT EXISTS`
- ✅ Seed data uses `ON CONFLICT DO NOTHING`

### What Won't Break
- Existing `email_captures` data (columns added, not modified)
- Any existing tables (only creates new ones)
- Existing indexes (only creates new ones)

### What to Watch
- If `email_captures` has data, new columns will be NULL
- RLS policies need to be configured (currently just enabled)
- Foreign key constraints will enforce relationships

---

## Post-Migration Checklist

- [ ] All WasatchWise tables created
- [ ] All DAROS tables created
- [ ] `email_captures` has new columns
- [ ] 8 controls seeded
- [ ] Indexes created
- [ ] RLS enabled
- [ ] Code can connect (test quiz submission)
- [ ] Dashboard loads (test district creation)

---

## If Migration Fails

### Common Issues

1. **"relation already exists"**
   - Some tables already exist
   - Migration uses `IF NOT EXISTS` - should be safe
   - Check which tables exist first

2. **"column already exists"** (email_captures)
   - Migration checks before adding
   - Should be safe
   - Verify with column check query

3. **"permission denied"**
   - Need proper database permissions
   - Run as postgres user or service role

4. **"uuid_generate_v4() does not exist"**
   - Extension not enabled
   - Migration includes: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

---

## Next Steps After Migration

1. **Test Existing Features**
   - Quiz submission (quiz_results, email_captures)
   - Contact form (email_captures)
   - AI integrations (ai_content_log, heygen_videos)

2. **Test DAROS Features**
   - Create district via API
   - Create briefing session
   - Generate artifacts

3. **Configure RLS Policies**
   - Set up access rules
   - Test permissions

4. **Continue Building**
   - UI components
   - PDF generation
   - White-label setup

---

**Ready to migrate?** Run `lib/supabase/complete-migration.sql` in your Supabase SQL Editor!
