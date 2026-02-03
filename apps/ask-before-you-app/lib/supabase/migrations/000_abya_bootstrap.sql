-- ============================================================================
-- ABYA bootstrap: run this first on an empty Supabase project
-- Creates extension + tables that later migrations depend on (districts, email_captures).
-- Then run 001, 002, 003, 004, 005, 006, 007 in order.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Email captures (Who Are You modal signup, newsletter)
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  organization text,
  role text,
  source text NOT NULL,
  lead_magnet text,
  created_at timestamptz DEFAULT now(),
  converted_to_client boolean DEFAULT false
);

-- Districts (required by 001_sdpc_registry and DAROS)
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  size_band text CHECK (size_band IN ('small', 'medium', 'large', 'mega')),
  contacts jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE email_captures IS 'Newsletter and modal signups (ABYA Who Are You, etc.)';
COMMENT ON TABLE districts IS 'K-12 districts / LEAs; required by SDPC registry and DAROS';
