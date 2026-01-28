-- ============================================================================
-- EXPAND CONNECTION TYPES
-- ============================================================================
-- Update the looking_for field to support all DAiTE connection types

-- First, update the constraint to include all connection types
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_looking_for_check;

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_looking_for_check 
CHECK (looking_for <@ ARRAY[
  'dating',           -- Romantic connections
  'friends',          -- Platonic friendships
  'community',        -- Community building
  'playdates',         -- Parent playdates
  'music_collaboration', -- Music partners/jam sessions
  'fitness_partners',   -- Workout buddies
  'hiking_partners',    -- Outdoor adventure partners
  'foodies',           -- Culinary explorers
  'gaming',            -- Gaming buddies
  'book_clubs',        -- Literary connections
  'support_groups',    -- Support and understanding
  'networking',        -- Professional networking
  'creative_collaboration' -- Creative projects
]::TEXT[]);

-- Update default to be empty array (users should explicitly choose)
ALTER TABLE public.user_profiles
ALTER COLUMN looking_for SET DEFAULT ARRAY[]::TEXT[];

-- Add comment explaining the field
COMMENT ON COLUMN public.user_profiles.looking_for IS 
'Array of connection types user is seeking. Can include multiple: dating, friends, playdates, music_collaboration, etc.';

