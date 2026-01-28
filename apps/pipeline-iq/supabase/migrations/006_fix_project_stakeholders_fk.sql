-- Migration: Fix project_stakeholders foreign key to reference 'projects' table
-- The original FK referenced 'high_priority_projects' (test data)
-- But the scraper saves to 'projects' table (production data)

-- Drop the existing foreign key constraint
ALTER TABLE project_stakeholders
DROP CONSTRAINT IF EXISTS project_stakeholders_project_id_fkey;

-- Add new foreign key constraint referencing the correct table
ALTER TABLE project_stakeholders
ADD CONSTRAINT project_stakeholders_project_id_fkey
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Verify the fix
COMMENT ON TABLE project_stakeholders IS 'Links contacts and companies to projects - FK updated to reference projects table';
