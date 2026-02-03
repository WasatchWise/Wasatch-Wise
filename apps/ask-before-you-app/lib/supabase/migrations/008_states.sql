-- ============================================================================
-- Optional: state metadata for listing and "ecosystem available" flag.
-- Ecosystem content stays in code (lib/ecosystem) unless we add CMS later.
-- Run after 007. See docs/STATE_AND_DISTRICT_DATA_DESIGN.md.
-- ============================================================================

CREATE TABLE IF NOT EXISTS states (
  code text PRIMARY KEY,
  name text NOT NULL,
  sdpc_member boolean NOT NULL DEFAULT false,
  ecosystem_available boolean NOT NULL DEFAULT false,
  last_updated text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE states IS 'State metadata for listing; ecosystem content remains in code unless moved later.';
