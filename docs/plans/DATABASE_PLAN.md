# Database Analysis & Build Plan

## Current Situation

### Database Connection Issue
- **MCP Tool Connected To:** `mkepcjzqnbowrgbvjfem.supabase.co` (travel platform - 55 tables)
- **Your Actual Project:** `hwxpcekddtfubmnkwutl.supabase.co` (from .env.local)
- **Issue:** MCP tool is configured to different project than your codebase

### What Your Codebase Expects

From `lib/supabase/schema.sql`, your code expects:
- ✅ `email_captures` - Lead capture (exists but different structure)
- ❌ `clients` - Client/lead management
- ❌ `projects` - Project tracking
- ❌ `cognitive_audits` - Audit results
- ❌ `quiz_results` - Quiz submissions
- ❌ `ai_content_log` - AI usage tracking
- ❌ `heygen_videos` - Video generation logs
- ❌ `blog_posts` - Content management
- ❌ `case_studies` - Marketing content
- ❌ `tiktok_content` - Social media tracking

### What Actually Exists (from MCP tool - wrong project)
- Travel platform tables (tripkits, destinations, etc.)
- `email_captures` with different structure:
  - Has: `email`, `source`, `visitor_type`, `preferences`, `subscribed`
  - Missing: `name`, `organization`, `role`, `lead_magnet`, `converted_to_client`

---

## Action Plan

### Step 1: Verify Actual Database
**You need to:**
1. Go to Supabase Dashboard: https://hwxpcekddtfubmnkwutl.supabase.co
2. Check SQL Editor → List all tables
3. Confirm which tables actually exist

**OR** I can try to connect directly using your credentials (if MCP can be reconfigured)

### Step 2: Apply WasatchWise Base Schema
Once we confirm the actual database state, apply:
- `lib/supabase/schema.sql` - Base WasatchWise tables
- This creates: clients, projects, cognitive_audits, quiz_results, etc.

### Step 3: Apply DAROS Schema
Then apply:
- `lib/supabase/daros-schema.sql` - Consultation platform tables
- This creates: districts, artifacts, controls, stakeholder_matrix, etc.

### Step 4: Migrate/Adapt Existing Data
- If `email_captures` exists with different structure:
  - Option A: Migrate data to new structure
  - Option B: Adapt code to work with existing structure
  - Option C: Create new table, migrate later

---

## Recommended Approach

### Option 1: Clean Slate (Recommended)
If this is a fresh start:
1. Apply base schema (`lib/supabase/schema.sql`)
2. Apply DAROS schema (`lib/supabase/daros-schema.sql`)
3. Start fresh with proper structure

### Option 2: Migrate Existing
If you have important data:
1. Export existing `email_captures` data
2. Apply new schema
3. Migrate data to new structure
4. Update code to use new structure

### Option 3: Hybrid
1. Keep existing `email_captures` as-is
2. Create new `leads` or `contacts` table for WasatchWise
3. Build DAROS on top
4. Migrate gradually

---

## Next Steps

1. **You verify:** Check Supabase dashboard for actual tables
2. **I apply schemas:** Once confirmed, I'll create migration
3. **We test:** Verify all tables created correctly
4. **We build:** Continue with DAROS implementation

---

## Questions to Answer

1. Does your actual database (`hwxpcekddtfubmnkwutl`) have any WasatchWise tables?
2. Do you have important data in `email_captures` that needs preserving?
3. Is this a fresh start or migration?
4. Should DAROS be in same database or separate project?

---

**Status:** Waiting for database verification  
**Blocked By:** MCP tool connection mismatch  
**Action Needed:** Verify actual database state in Supabase dashboard
