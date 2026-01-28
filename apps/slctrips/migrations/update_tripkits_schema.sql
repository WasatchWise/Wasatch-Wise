-- Add new columns for instructional design and accessibility
ALTER TABLE tripkits ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];
ALTER TABLE tripkits ADD COLUMN IF NOT EXISTS estimated_time TEXT;
ALTER TABLE tripkits ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE tripkits ADD COLUMN IF NOT EXISTS curriculum_alignment JSONB;
