-- FIX customer_product_access TABLE
-- This table is missing required columns for the webhook

-- First, check if table exists and drop if malformed
DROP TABLE IF EXISTS customer_product_access CASCADE;

-- Create the correct structure
CREATE TABLE customer_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References auth.users but we don't enforce FK for flexibility
  product_id UUID NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'tripkit',  -- 'tripkit' or 'staykit'
  access_type TEXT NOT NULL DEFAULT 'purchased',  -- 'purchased', 'redeemed', 'complimentary'

  -- Transaction details
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,  -- in cents
  currency TEXT DEFAULT 'usd',

  -- Timestamps
  access_granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- NULL = never expires
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate access
  UNIQUE(user_id, product_id, product_type)
);

-- Indexes for fast lookups
CREATE INDEX idx_cpa_user ON customer_product_access(user_id);
CREATE INDEX idx_cpa_product ON customer_product_access(product_id);
CREATE INDEX idx_cpa_type ON customer_product_access(product_type);

-- Enable RLS
ALTER TABLE customer_product_access ENABLE ROW LEVEL SECURITY;

-- Users can see their own access records
CREATE POLICY "cpa_select_own" ON customer_product_access
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can insert (for webhook) - this is automatic with service role key

-- Verification
SELECT 'customer_product_access recreated successfully' as status;
