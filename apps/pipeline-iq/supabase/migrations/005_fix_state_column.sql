-- Fix state column in projects table
-- The column is currently varchar(2) but needs to handle full state names
-- Option 1: Alter the column type to TEXT
ALTER TABLE projects
ALTER COLUMN state TYPE TEXT;
-- Done - this will allow any length state value