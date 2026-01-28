-- Migration 014: Align outreach-related foreign keys to `projects`
-- Reason: The application has transitioned to using `projects` as the source-of-truth table,
-- but some outreach tables still reference `high_priority_projects`, causing split-brain joins.

-- IMPORTANT:
-- Existing outreach rows may reference project IDs that exist in `high_priority_projects` but not yet in `projects`.
-- To avoid FK violations, we:
--  1) backfill missing referenced projects into `projects` (preserving IDs),
--  2) NULL out any remaining orphaned `outreach_activities.project_id` values (best-effort),
--  3) then add the FK.

-- NOTE ON UNIQUENESS:
-- `projects.cw_project_id` is UNIQUE. Some `high_priority_projects` rows may have a different `id` but the same
-- `cw_project_id` as an existing `projects` row. In that case, we must NOT insert a duplicate into `projects`.
-- Instead, we remap outreach rows to the existing `projects.id` for that `cw_project_id`.

-- 0) Drop old FK constraints FIRST (so we can safely rewrite project_id values)
DO $$
BEGIN
  ALTER TABLE outreach_activities
    DROP CONSTRAINT IF EXISTS outreach_activities_project_id_fkey;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE outreach_queue
    DROP CONSTRAINT IF EXISTS outreach_queue_project_id_fkey;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE project_snapshots
    DROP CONSTRAINT IF EXISTS project_snapshots_project_id_fkey;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 0a) Remap outreach_activities.project_id from high_priority_projects(id) -> projects(id) via cw_project_id
DO $$
BEGIN
  UPDATE outreach_activities oa
  SET project_id = p.id
  FROM high_priority_projects hp
  JOIN projects p ON p.cw_project_id = hp.cw_project_id
  WHERE oa.project_id IS NOT NULL
    AND oa.project_id = hp.id;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 0a.1) Remap outreach_queue.project_id if it exists
DO $$
BEGIN
  UPDATE outreach_queue oq
  SET project_id = p.id
  FROM high_priority_projects hp
  JOIN projects p ON p.cw_project_id = hp.cw_project_id
  WHERE oq.project_id IS NOT NULL
    AND oq.project_id = hp.id;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 0a.2) Remap project_snapshots.project_id if it exists
DO $$
BEGIN
  UPDATE project_snapshots ps
  SET project_id = p.id
  FROM high_priority_projects hp
  JOIN projects p ON p.cw_project_id = hp.cw_project_id
  WHERE ps.project_id IS NOT NULL
    AND ps.project_id = hp.id;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 0) Backfill referenced projects into `projects` (best-effort, preserves IDs)
DO $$
BEGIN
  INSERT INTO projects (
    id,
    organization_id,
    cw_project_id,
    project_name,
    project_type,
    project_stage,
    project_value,
    units_count,
    project_size_sqft,
    address,
    city,
    state,
    zip,
    groove_fit_score,
    engagement_score,
    timing_score,
    priority_level,
    outreach_status,
    data_source,
    scraped_at,
    raw_data,
    created_at,
    updated_at
  )
  SELECT
    hp.id,
    hp.organization_id,
    hp.cw_project_id,
    hp.project_name,
    hp.project_type,
    COALESCE(hp.project_stage, 'planning'),
    hp.project_value,
    hp.units_count,
    hp.project_size_sqft,
    hp.address,
    hp.city,
    hp.state,
    hp.zip,
    hp.groove_fit_score,
    hp.engagement_score,
    hp.timing_score,
    hp.priority_level,
    hp.outreach_status,
    hp.data_source,
    hp.scraped_at,
    hp.raw_data,
    hp.created_at,
    hp.updated_at
  FROM high_priority_projects hp
  WHERE hp.id IN (
    SELECT DISTINCT oa.project_id
    FROM outreach_activities oa
    WHERE oa.project_id IS NOT NULL
  )
  -- De-dupe by cw_project_id (unique business key on projects)
  AND NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.cw_project_id = hp.cw_project_id
  );
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 0b) Null out any remaining orphaned outreach_activities.project_id references (so FK can be added)
DO $$
BEGIN
  UPDATE outreach_activities oa
  SET project_id = NULL
  WHERE oa.project_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = oa.project_id);
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 1) outreach_activities.project_id -> projects(id)
DO $$
BEGIN
  -- Add FK pointing at projects
  ALTER TABLE outreach_activities
    ADD CONSTRAINT outreach_activities_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_table THEN NULL;
  -- If there are still bad references, leave the FK off rather than failing the whole migration.
  WHEN foreign_key_violation THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) outreach_queue.project_id -> projects(id) (if table exists)
DO $$
BEGIN
  ALTER TABLE outreach_queue
    ADD CONSTRAINT outreach_queue_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN foreign_key_violation THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- 3) project_snapshots.project_id -> projects(id) (if table exists)
DO $$
BEGIN
  ALTER TABLE project_snapshots
    ADD CONSTRAINT project_snapshots_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN foreign_key_violation THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;


