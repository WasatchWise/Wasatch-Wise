-- ============================================================================
-- DATABASE UNIFICATION & CLEANUP SCRIPT (V2)
-- ============================================================================
-- This script unifies all product access into 'customer_product_access'
-- and removes the legacy 'user_tripkit_access' table.
--
-- INCLUDES FIX FOR: deep_dive_stories dependency
--
-- RUN THIS IN THE SUPABASE SQL EDITOR
-- ============================================================================
-- 1. Ensure customer_product_access exists with correct schema
CREATE TABLE IF NOT EXISTS customer_product_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'tripkit',
    -- 'tripkit', 'staykit', 'welcome-wagon'
    access_type TEXT NOT NULL DEFAULT 'purchased',
    -- 'purchased', 'redeemed', 'complimentary'
    -- Transaction details
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    amount_paid INTEGER,
    -- in cents
    currency TEXT DEFAULT 'usd',
    -- Timestamps
    access_granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate access
    UNIQUE(user_id, product_id, product_type)
);
-- 2. Migrate data from legacy user_tripkit_access (if it exists)
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM information_schema.tables
    WHERE table_name = 'user_tripkit_access'
) THEN
INSERT INTO customer_product_access (
        user_id,
        product_id,
        product_type,
        access_type,
        access_granted_at,
        stripe_payment_intent_id
    )
SELECT user_id,
    tripkit_id,
    'tripkit',
    access_type,
    access_granted_at,
    stripe_payment_intent_id
FROM user_tripkit_access ON CONFLICT (user_id, product_id, product_type) DO NOTHING;
RAISE NOTICE 'Migrated data from user_tripkit_access';
END IF;
END $$;
-- 3. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cpa_user ON customer_product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_cpa_product ON customer_product_access(product_id);
CREATE INDEX IF NOT EXISTS idx_cpa_type ON customer_product_access(product_type);
-- 4. Enable RLS
ALTER TABLE customer_product_access ENABLE ROW LEVEL SECURITY;
-- 5. Create/Update Policies
DROP POLICY IF EXISTS "Users can see their own access" ON customer_product_access;
CREATE POLICY "Users can see their own access" ON customer_product_access FOR
SELECT USING (auth.uid()::text = user_id::text);
-- 6. Fix Dependent Policies (deep_dive_stories)
-- The table 'deep_dive_stories' has a policy that references 'user_tripkit_access'.
-- We need to update it to reference 'customer_product_access' instead.
DO $$ BEGIN -- Only attempt if deep_dive_stories table exists
IF EXISTS (
    SELECT
    FROM information_schema.tables
    WHERE table_name = 'deep_dive_stories'
) THEN -- Drop the old policy
DROP POLICY IF EXISTS "Users can view owned tripkit stories" ON deep_dive_stories;
-- Create the new policy
-- Note: deep_dive_stories.tripkit_id is a CODE (e.g. 'TK-001'), so we resolve to UUID
CREATE POLICY "Users can view owned tripkit stories" ON deep_dive_stories FOR
SELECT USING (
        tripkit_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM customer_product_access cpa
            WHERE cpa.user_id = auth.uid()
                AND cpa.product_type = 'tripkit'
                AND cpa.product_id = (
                    SELECT id
                    FROM tripkits
                    WHERE code = deep_dive_stories.tripkit_id
                )
        )
    );
RAISE NOTICE 'Updated policy on deep_dive_stories';
END IF;
END $$;
-- 7. Drop legacy table
DROP TABLE IF EXISTS user_tripkit_access;
-- 8. Verification
SELECT product_type,
    COUNT(*) as count
FROM customer_product_access
GROUP BY product_type;