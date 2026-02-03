-- Venue Capability Profile: extend venues table with capability fields
-- Created: 2026-02-02
-- Option B: Extend venues (avoids duplicating stage_width_feet, stage_depth_feet, etc.)

-- Financial capabilities (amounts in cents)
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS typical_guarantee_min integer,
ADD COLUMN IF NOT EXISTS typical_guarantee_max integer,
ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS w9_on_file boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_coi_on_file boolean DEFAULT false;

-- Hospitality capabilities
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS green_room_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS green_room_description text,
ADD COLUMN IF NOT EXISTS meal_buyout_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS typical_meal_buyout_amount integer,
ADD COLUMN IF NOT EXISTS drink_tickets_available integer,
ADD COLUMN IF NOT EXISTS guest_list_spots integer,
ADD COLUMN IF NOT EXISTS parking_spaces integer;

-- Venue policies
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS age_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS load_in_notes text,
ADD COLUMN IF NOT EXISTS curfew_time time;

-- Metadata
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS profile_updated_at timestamptz;

-- Comments
COMMENT ON COLUMN public.venues.typical_guarantee_min IS 'Minimum guarantee this venue typically offers (cents)';
COMMENT ON COLUMN public.venues.typical_guarantee_max IS 'Maximum guarantee this venue typically offers (cents)';
COMMENT ON COLUMN public.venues.payment_methods IS 'Array: cash, venmo, zelle, paypal, check, ach';
COMMENT ON COLUMN public.venues.w9_on_file IS 'W-9 on file for payment processing';
COMMENT ON COLUMN public.venues.insurance_coi_on_file IS 'Certificate of Insurance on file';
COMMENT ON COLUMN public.venues.age_restrictions IS 'Array: all_ages, 18+, 21+';
COMMENT ON COLUMN public.venues.curfew_time IS 'Venue curfew time';
COMMENT ON COLUMN public.venues.profile_updated_at IS 'Last venue capability profile update';
