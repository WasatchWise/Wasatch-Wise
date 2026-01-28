# Database Schema Documentation

This directory contains the database schema for the Adult AI Academy application.

## Tables

### `production_batches`
Stores production batch data from the multi-agent orchestrator.

**Columns:**
- `id` (TEXT, PRIMARY KEY) - Batch identifier (usually from auditReport.targetId)
- `status` (TEXT) - Batch status: 'pending', 'completed', or 'failed'
- `audit_score` (NUMERIC) - Quality score from the auditor agent (0-1)
- `audit_report` (JSONB) - Full audit report object
- `blackboard` (JSONB) - Context blackboard with inferences, decisions, and agent communications
- `synthesis` (JSONB) - Complete synthesis result from research phase
- `storyboard_results` (JSONB) - Array of scene results with assets
- `heygen_video_id` (TEXT) - Reference to generated HeyGen video
- `created_at` (TIMESTAMPTZ) - Timestamp when batch was created
- `updated_at` (TIMESTAMPTZ) - Timestamp when batch was last updated

**Usage:** Created by `saveProductionBatch()` in `src/lib/supabase/client.ts`

---

### `leads`
CRM integration table for tracking leads and their propensity scores.

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique identifier
- `email` (TEXT, UNIQUE) - Lead email address
- `propensity_score` (INTEGER) - Calculated propensity score (incremented by analytics)
- `created_at` (TIMESTAMPTZ) - When lead was first created
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Usage:** 
- Read/updated by `updateLeadPropensity()` in `src/lib/supabase/client.ts`
- Called from `src/lib/research/learning-lab.ts` when high-intent signals are detected

---

### `produced_assets`
Stores final produced content assets ready for distribution.

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique identifier
- `topic` (TEXT) - Content topic
- `pillar` (TEXT) - Content pillar/cluster (e.g., "AI Anxiety", "Work Automation")
- `social_hook` (TEXT) - Social media hook text
- `nepq_trigger` (TEXT) - NEPQ framework trigger
- `video_script` (TEXT) - Full video script
- `veo_video_url` (TEXT) - URL to generated video (Google Veo)
- `dalle_image_url` (TEXT) - URL to generated image (DALL-E)
- `raw_text` (TEXT) - Original raw input text
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Usage:** Created by `saveAssetToLibrary()` in `src/lib/supabase/client.ts`

## Setup Instructions

1. **Via Supabase Dashboard:**
   - Go to your Supabase project SQL Editor
   - Copy and paste the contents of `schema.sql`
   - Execute the SQL

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Manual Creation:**
   - Use the Supabase Table Editor to create each table
   - Add columns as specified above
   - Add indexes for performance

## Row Level Security (RLS)

The schema includes RLS enablement but example policies are commented out. You'll need to:

1. Set up authentication (Supabase Auth)
2. Create appropriate policies based on your access control requirements
3. Uncomment and customize the example policies in `schema.sql`

## Future Enhancements

Consider adding:
- `users` table for authentication
- `content_campaigns` table for campaign tracking
- `analytics_events` table for detailed event tracking
- Foreign key relationships between tables

