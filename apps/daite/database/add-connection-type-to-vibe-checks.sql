-- ============================================================================
-- ADD CONNECTION TYPE TO VIBE CHECKS
-- ============================================================================
-- Allow vibe checks to be filtered by specific connection type

ALTER TABLE public.vibe_checks
ADD COLUMN IF NOT EXISTS connection_type TEXT;

-- Add comment
COMMENT ON COLUMN public.vibe_checks.connection_type IS 
'Optional: Specific connection type being evaluated in this vibe check (e.g., "dating", "friends", "music_collaboration"). NULL means general compatibility check across all connection types.';

