-- Migration 016: Add next_contact_date to projects
-- Enables "Snooze" / "Bump" functionality
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS next_contact_date TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_projects_next_contact ON projects(next_contact_date);
COMMENT ON COLUMN projects.next_contact_date IS 'Date when the project should reappear in the Focus Feed';