-- Extend Salt Rocks System to Venues and Fans
-- Created: 2026-01-02

-- =====================================================
-- PART 1: Add balance to venues
-- =====================================================
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS salt_rocks_balance integer DEFAULT 0;

-- =====================================================
-- PART 2: Create fan wallets table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fan_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  salt_rocks_balance integer DEFAULT 0,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS fan_wallets_updated_at ON public.fan_wallets;
CREATE TRIGGER fan_wallets_updated_at
  BEFORE UPDATE ON public.fan_wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS fan_wallets_user_id_idx ON public.fan_wallets(user_id);
CREATE INDEX IF NOT EXISTS fan_wallets_balance_idx ON public.fan_wallets(salt_rocks_balance DESC);

-- =====================================================
-- PART 3: Extend transactions for all entity types
-- =====================================================
ALTER TABLE public.salt_rocks_transactions
ADD COLUMN IF NOT EXISTS entity_type text DEFAULT 'band' CHECK (entity_type IN ('band', 'venue', 'fan'));

ALTER TABLE public.salt_rocks_transactions
ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE;

ALTER TABLE public.salt_rocks_transactions
ADD COLUMN IF NOT EXISTS fan_wallet_id uuid REFERENCES public.fan_wallets(id) ON DELETE CASCADE;

-- Update transaction type constraint to include new types
ALTER TABLE public.salt_rocks_transactions
DROP CONSTRAINT IF EXISTS salt_rocks_transactions_transaction_type_check;

ALTER TABLE public.salt_rocks_transactions
ADD CONSTRAINT salt_rocks_transactions_transaction_type_check CHECK (transaction_type IN (
  -- Existing types
  'purchase',
  'refund',
  'spend_bio_upgrade',
  'spend_song_slot',
  'spend_photo_slot',
  'spend_featured_listing',
  'spend_event_promotion',
  'spend_tier_upgrade',
  'earn_referral',
  'earn_engagement',
  'admin_adjustment',
  -- New types for extended economy
  'spend_boost_band',           -- Fan boosts a band
  'spend_venue_promotion',      -- Venue promotes their listings
  'spend_priority_booking',     -- Venue gets priority in booking requests
  'receive_boost',              -- Band receives boost tokens (tracking)
  'boost_decay',                -- Boost expires (for audit trail)
  'spend_contract_generation'   -- Pay to generate formal contract PDF
));

-- New indexes for extended transactions
CREATE INDEX IF NOT EXISTS salt_rocks_transactions_entity_type_idx
  ON public.salt_rocks_transactions(entity_type);
CREATE INDEX IF NOT EXISTS salt_rocks_transactions_venue_id_idx
  ON public.salt_rocks_transactions(venue_id);
CREATE INDEX IF NOT EXISTS salt_rocks_transactions_fan_wallet_id_idx
  ON public.salt_rocks_transactions(fan_wallet_id);

-- =====================================================
-- PART 4: Band boost tracking with decay
-- =====================================================
CREATE TABLE IF NOT EXISTS public.band_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id uuid REFERENCES public.bands(id) ON DELETE CASCADE NOT NULL,
  boosted_by_fan_id uuid REFERENCES public.fan_wallets(id) ON DELETE SET NULL,
  boosted_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- Note: Daily rate limiting is enforced in application code (/api/leaderboard/boost)
-- We use a regular index for lookups instead of a unique constraint on date expression

-- Indexes for boost queries
CREATE INDEX IF NOT EXISTS band_boosts_band_id_idx ON public.band_boosts(band_id);
CREATE INDEX IF NOT EXISTS band_boosts_expires_at_idx ON public.band_boosts(expires_at);
CREATE INDEX IF NOT EXISTS band_boosts_active_idx ON public.band_boosts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS band_boosts_user_idx ON public.band_boosts(boosted_by_user_id);

-- Add boost_score to bands
ALTER TABLE public.bands
ADD COLUMN IF NOT EXISTS boost_score integer DEFAULT 0;

-- Index for leaderboard sorting
CREATE INDEX IF NOT EXISTS bands_boost_score_idx ON public.bands(boost_score DESC);

-- =====================================================
-- PART 5: RLS Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.fan_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.band_boosts ENABLE ROW LEVEL SECURITY;

-- Fan Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.fan_wallets;
CREATE POLICY "Users can view their own wallet"
  ON public.fan_wallets FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own wallet" ON public.fan_wallets;
CREATE POLICY "Users can create their own wallet"
  ON public.fan_wallets FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own wallet" ON public.fan_wallets;
CREATE POLICY "Users can update their own wallet"
  ON public.fan_wallets FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all wallets" ON public.fan_wallets;
CREATE POLICY "Admins can manage all wallets"
  ON public.fan_wallets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Band Boosts Policies
DROP POLICY IF EXISTS "Anyone can view active boosts" ON public.band_boosts;
CREATE POLICY "Anyone can view active boosts"
  ON public.band_boosts FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create boosts" ON public.band_boosts;
CREATE POLICY "Authenticated users can create boosts"
  ON public.band_boosts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND boosted_by_user_id = auth.uid()
    -- Prevent self-boosting (can't boost your own band)
    AND NOT EXISTS (
      SELECT 1 FROM public.bands
      WHERE id = band_id AND claimed_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all boosts" ON public.band_boosts;
CREATE POLICY "Admins can manage all boosts"
  ON public.band_boosts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    )
  );

-- Extend transactions policies for venue owners
DROP POLICY IF EXISTS "Venue owners can view their venue's transactions" ON public.salt_rocks_transactions;
CREATE POLICY "Venue owners can view their venue's transactions"
  ON public.salt_rocks_transactions FOR SELECT
  USING (
    venue_id IN (
      SELECT id FROM public.venues WHERE claimed_by = auth.uid()
    )
  );

-- Fan can view their own transactions
DROP POLICY IF EXISTS "Fans can view their wallet transactions" ON public.salt_rocks_transactions;
CREATE POLICY "Fans can view their wallet transactions"
  ON public.salt_rocks_transactions FOR SELECT
  USING (
    fan_wallet_id IN (
      SELECT id FROM public.fan_wallets WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- PART 6: Updated transaction function for all entity types
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_salt_rocks_transaction_v2(
  p_entity_type text,
  p_entity_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text DEFAULT NULL,
  p_stripe_payment_intent_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Validate entity type
  IF p_entity_type NOT IN ('band', 'venue', 'fan') THEN
    RAISE EXCEPTION 'Invalid entity type: %', p_entity_type;
  END IF;

  -- Get current balance based on entity type
  IF p_entity_type = 'band' THEN
    SELECT salt_rocks_balance INTO v_current_balance
    FROM public.bands WHERE id = p_entity_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Band not found: %', p_entity_id;
    END IF;

  ELSIF p_entity_type = 'venue' THEN
    SELECT salt_rocks_balance INTO v_current_balance
    FROM public.venues WHERE id = p_entity_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Venue not found: %', p_entity_id;
    END IF;

  ELSIF p_entity_type = 'fan' THEN
    SELECT salt_rocks_balance INTO v_current_balance
    FROM public.fan_wallets WHERE id = p_entity_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Fan wallet not found: %', p_entity_id;
    END IF;
  END IF;

  -- Calculate new balance
  v_new_balance := COALESCE(v_current_balance, 0) + p_amount;

  -- Prevent negative balances (except admin adjustments)
  IF v_new_balance < 0 AND p_transaction_type != 'admin_adjustment' THEN
    RAISE EXCEPTION 'Insufficient Salt Rocks balance. Current: %, Requested: %',
      COALESCE(v_current_balance, 0), ABS(p_amount);
  END IF;

  -- Insert transaction record
  INSERT INTO public.salt_rocks_transactions (
    band_id,
    venue_id,
    fan_wallet_id,
    entity_type,
    amount,
    balance_after,
    transaction_type,
    description,
    stripe_payment_intent_id,
    metadata
  )
  VALUES (
    CASE WHEN p_entity_type = 'band' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'venue' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'fan' THEN p_entity_id ELSE NULL END,
    p_entity_type,
    p_amount,
    v_new_balance,
    p_transaction_type,
    p_description,
    p_stripe_payment_intent_id,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;

  -- Update balance on the appropriate table
  IF p_entity_type = 'band' THEN
    UPDATE public.bands
    SET salt_rocks_balance = v_new_balance
    WHERE id = p_entity_id;

  ELSIF p_entity_type = 'venue' THEN
    UPDATE public.venues
    SET salt_rocks_balance = v_new_balance
    WHERE id = p_entity_id;

  ELSIF p_entity_type = 'fan' THEN
    UPDATE public.fan_wallets
    SET salt_rocks_balance = v_new_balance,
        updated_at = now()
    WHERE id = p_entity_id;
  END IF;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_salt_rocks_transaction_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_salt_rocks_transaction_v2 TO service_role;

-- =====================================================
-- PART 7: Boost a band function (with rate limiting)
-- =====================================================
CREATE OR REPLACE FUNCTION public.boost_band(
  p_band_id uuid,
  p_fan_wallet_id uuid,
  p_amount integer,
  p_days_valid integer DEFAULT 7
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_boost_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Get user_id from fan wallet
  SELECT user_id INTO v_user_id
  FROM public.fan_wallets
  WHERE id = p_fan_wallet_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Fan wallet not found';
  END IF;

  -- Check if user already boosted this band today
  IF EXISTS (
    SELECT 1 FROM public.band_boosts
    WHERE band_id = p_band_id
      AND boosted_by_user_id = v_user_id
      AND created_at::date = CURRENT_DATE
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'You can only boost each band once per day';
  END IF;

  -- Check if trying to boost own band
  IF EXISTS (
    SELECT 1 FROM public.bands
    WHERE id = p_band_id AND claimed_by = v_user_id
  ) THEN
    RAISE EXCEPTION 'You cannot boost your own band';
  END IF;

  -- Deduct tokens from fan wallet
  PERFORM public.add_salt_rocks_transaction_v2(
    'fan',
    p_fan_wallet_id,
    -p_amount,
    'spend_boost_band',
    'Boost for band',
    NULL,
    jsonb_build_object('band_id', p_band_id)
  );

  -- Calculate expiration
  v_expires_at := now() + (p_days_valid || ' days')::interval;

  -- Create boost record
  INSERT INTO public.band_boosts (
    band_id,
    boosted_by_fan_id,
    boosted_by_user_id,
    amount,
    expires_at
  )
  VALUES (
    p_band_id,
    p_fan_wallet_id,
    v_user_id,
    p_amount,
    v_expires_at
  )
  RETURNING id INTO v_boost_id;

  -- Update band's boost score
  UPDATE public.bands
  SET boost_score = boost_score + p_amount
  WHERE id = p_band_id;

  RETURN v_boost_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.boost_band TO authenticated;

-- =====================================================
-- PART 8: Function to decay expired boosts (call via cron)
-- =====================================================
CREATE OR REPLACE FUNCTION public.decay_expired_boosts()
RETURNS integer AS $$
DECLARE
  v_expired_count integer;
BEGIN
  -- Deactivate expired boosts and subtract from band scores
  WITH expired AS (
    UPDATE public.band_boosts
    SET is_active = false
    WHERE is_active = true
      AND expires_at <= now()
    RETURNING band_id, amount
  )
  UPDATE public.bands b
  SET boost_score = GREATEST(0, boost_score - expired_sum.total)
  FROM (
    SELECT band_id, SUM(amount) as total
    FROM expired
    GROUP BY band_id
  ) expired_sum
  WHERE b.id = expired_sum.band_id;

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.decay_expired_boosts TO service_role;

-- =====================================================
-- PART 9: Helper function to get or create fan wallet
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_or_create_fan_wallet(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  -- Try to get existing wallet
  SELECT id INTO v_wallet_id
  FROM public.fan_wallets
  WHERE user_id = p_user_id;

  -- Create if not exists
  IF NOT FOUND THEN
    INSERT INTO public.fan_wallets (user_id)
    VALUES (p_user_id)
    RETURNING id INTO v_wallet_id;
  END IF;

  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_or_create_fan_wallet TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE public.fan_wallets IS 'Salt Rocks wallets for fans (users who are not band/venue owners)';
COMMENT ON TABLE public.band_boosts IS 'Tracks fan boosts to bands with 7-day decay';
COMMENT ON FUNCTION public.add_salt_rocks_transaction_v2 IS 'Create a Salt Rocks transaction for any entity type (band, venue, fan)';
COMMENT ON FUNCTION public.boost_band IS 'Fan boosts a band - deducts tokens and adds to band boost score';
COMMENT ON FUNCTION public.decay_expired_boosts IS 'Deactivate expired boosts and update band scores - call via cron';
COMMENT ON FUNCTION public.get_or_create_fan_wallet IS 'Get existing fan wallet or create new one for user';
