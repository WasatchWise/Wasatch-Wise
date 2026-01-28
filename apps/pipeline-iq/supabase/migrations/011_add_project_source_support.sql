-- Migration 011: Add support for project source field
-- This migration ensures data_source field exists and documents the source mapping
-- Note: The API maps 'source' field to 'data_source' column for backward compatibility

-- Add comment to data_source column for documentation
COMMENT ON COLUMN high_priority_projects.data_source IS 
  'Source of project data: construction_wire, manual_entry, referral, networking, trade_show, linkedin, other. 
   The API accepts both "source" and "data_source" fields and maps them to this column.';

-- Ensure the column exists (it should from migration 002, but this is safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'high_priority_projects' 
    AND column_name = 'data_source'
  ) THEN
    ALTER TABLE high_priority_projects 
    ADD COLUMN data_source TEXT DEFAULT 'construction_wire';
  END IF;
END $$;

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS idx_projects_data_source ON high_priority_projects(data_source);

-- Update existing projects without data_source
UPDATE high_priority_projects 
SET data_source = 'construction_wire' 
WHERE data_source IS NULL;

