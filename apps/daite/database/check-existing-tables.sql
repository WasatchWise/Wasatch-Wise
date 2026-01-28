-- Check what tables currently exist in your database
-- Run this in Supabase SQL Editor to see current state

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

