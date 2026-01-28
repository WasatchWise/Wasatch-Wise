-- ============================================================================
-- Geographic Restrictions
-- 1. Only users in the United States
-- 2. Exclude users within 6-hour driving radius of Salt Lake City International Airport
-- ============================================================================

-- Salt Lake City International Airport coordinates
-- Latitude: 40.7899° N, Longitude: 111.9791° W
-- Approximately 420 miles at 70 mph average highway speed

-- Create function to calculate driving distance (approximate)
-- Using Haversine formula for great-circle distance, then applying road distance factor
CREATE OR REPLACE FUNCTION calculate_driving_distance_miles(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius_miles DECIMAL := 3959.0; -- Earth radius in miles
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
    straight_line_miles DECIMAL;
    road_distance_factor DECIMAL := 1.3; -- Average factor for road distance vs. straight line
BEGIN
    -- Convert to radians
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    -- Haversine formula
    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    -- Straight-line distance
    straight_line_miles := earth_radius_miles * c;
    
    -- Apply road distance factor (roads aren't straight)
    RETURN straight_line_miles * road_distance_factor;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop old version if it exists (without is_home_location parameter)
DROP FUNCTION IF EXISTS is_location_allowed(TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS is_location_allowed(TEXT);

-- Function to check if user HOME location is allowed
-- Note: This checks permanent/home location, NOT current/temporary location
-- Travelers visiting the SLC area can still use DAiTE if their home is outside the radius
CREATE OR REPLACE FUNCTION is_location_allowed(
    user_country TEXT,
    user_lat DECIMAL DEFAULT NULL,
    user_lon DECIMAL DEFAULT NULL,
    is_home_location BOOLEAN DEFAULT TRUE -- TRUE = home/permanent, FALSE = current/temporary
) RETURNS BOOLEAN AS $$
DECLARE
    slc_lat DECIMAL := 40.7899;
    slc_lon DECIMAL := -111.9791;
    driving_distance_miles DECIMAL;
    six_hours_miles DECIMAL := 420; -- 6 hours at 70 mph average
BEGIN
    -- Check 1: Must be United States
    IF user_country IS NULL OR UPPER(TRIM(user_country)) NOT IN ('US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA') THEN
        RETURN FALSE;
    END IF;
    
    -- Check 2: Only validate HOME location, not temporary/travel locations
    -- If this is a temporary location (is_home_location = FALSE), skip distance check
    IF NOT is_home_location THEN
        RETURN TRUE; -- Allow if it's a temporary/travel location
    END IF;
    
    -- Check 3: If HOME coordinates provided, check distance from SLC
    IF user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
        driving_distance_miles := calculate_driving_distance_miles(
            slc_lat, slc_lon,
            user_lat, user_lon
        );
        
        -- Exclude if HOME is within 6-hour driving radius (420 miles)
        IF driving_distance_miles <= six_hours_miles THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint/trigger to user_profiles table
-- First, add a computed column or trigger to enforce geographic restrictions

-- Add location_type column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'location_type'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN location_type TEXT DEFAULT 'home' 
        CHECK (location_type IN ('home', 'current', 'temporary'));
        
        COMMENT ON COLUMN public.user_profiles.location_type IS 'Type of location: home (permanent residence), current (where user currently is), temporary (traveling)';
    END IF;
END $$;

-- Create trigger function to validate location on insert/update
CREATE OR REPLACE FUNCTION validate_user_location()
RETURNS TRIGGER AS $$
DECLARE
    location_allowed BOOLEAN;
    is_home_loc BOOLEAN;
BEGIN
    -- Determine if this is a home location (default to TRUE for backward compatibility)
    is_home_loc := COALESCE(NEW.location_type, 'home') = 'home';
    
    -- Check if location is allowed (only validates home locations strictly)
    location_allowed := is_location_allowed(
        NEW.location_country,
        CASE WHEN NEW.location_coordinates IS NOT NULL 
             THEN (NEW.location_coordinates::POINT)[0] -- latitude (Y)
             ELSE NULL 
        END,
        CASE WHEN NEW.location_coordinates IS NOT NULL 
             THEN (NEW.location_coordinates::POINT)[1] -- longitude (X)
             ELSE NULL 
        END,
        is_home_loc
    );
    
    IF NOT location_allowed THEN
        IF NOT is_home_loc THEN
            RAISE EXCEPTION 'Geographic restriction: Current location cannot be set for non-US countries.';
        ELSE
            RAISE EXCEPTION 'Geographic restriction: Home location must be in the United States and outside a 6-hour driving radius of Salt Lake City International Airport. Travelers visiting the area can use DAiTE if their home address is outside the restricted zone.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_profiles
DROP TRIGGER IF EXISTS check_geographic_restrictions ON public.user_profiles;
CREATE TRIGGER check_geographic_restrictions
    BEFORE INSERT OR UPDATE OF location_country, location_coordinates, location_type
    ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_location();

-- Drop old version if it exists (without is_home_location parameter)
DROP FUNCTION IF EXISTS can_user_register(TEXT, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS can_user_register(TEXT);

-- Also check on users table if country is stored there
-- Add helper function for checking during registration
-- Note: This checks HOME location - travelers can use DAiTE if their home is outside SLC radius
CREATE OR REPLACE FUNCTION can_user_register(
    country TEXT,
    lat DECIMAL DEFAULT NULL,
    lon DECIMAL DEFAULT NULL,
    is_home_location BOOLEAN DEFAULT TRUE
) RETURNS JSONB AS $$
DECLARE
    is_allowed BOOLEAN;
    error_message TEXT;
    distance_miles DECIMAL;
BEGIN
    is_allowed := is_location_allowed(country, lat, lon, is_home_location);
    
    IF NOT is_allowed THEN
        -- Determine specific reason
        IF country IS NULL OR UPPER(TRIM(country)) NOT IN ('US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA') THEN
            error_message := 'DAiTE is currently only available to users in the United States.';
        ELSIF is_home_location AND lat IS NOT NULL AND lon IS NOT NULL THEN
            distance_miles := calculate_driving_distance_miles(40.7899, -111.9791, lat, lon);
            error_message := format(
                'DAiTE is not available for users whose HOME location is within a 6-hour driving radius of Salt Lake City. Your home location is approximately %.1f miles from Salt Lake City International Airport. Note: Travelers visiting the area can use DAiTE if their home address is outside the restricted zone.',
                distance_miles
            );
        ELSE
            error_message := 'DAiTE is currently only available to users in the United States, excluding the Salt Lake City area.';
        END IF;
        
        RETURN jsonb_build_object(
            'allowed', false,
            'error', error_message,
            'country_check', country IS NOT NULL AND UPPER(TRIM(country)) IN ('US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'),
            'distance_check', lat IS NULL OR lon IS NULL OR NOT is_home_location OR calculate_driving_distance_miles(40.7899, -111.9791, lat, lon) > 420
        );
    END IF;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'message', CASE 
            WHEN NOT is_home_location THEN 'Travel location detected. DAiTE is available for travelers if your home address is outside the restricted zone.'
            ELSE 'Location validated.'
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Add geographic restriction metadata table for tracking
CREATE TABLE IF NOT EXISTS public.geographic_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Location data
    country TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    city TEXT,
    state TEXT,
    location_type TEXT DEFAULT 'home' CHECK (location_type IN ('home', 'current', 'temporary')),
    
    -- Restriction check
    restriction_status TEXT NOT NULL CHECK (restriction_status IN ('allowed', 'blocked_country', 'blocked_radius', 'traveler_allowed')),
    distance_from_slc_miles DECIMAL,
    
    -- Metadata
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    checked_by TEXT NOT NULL DEFAULT 'system', -- 'system', 'admin', etc.
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_geo_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geo_user ON public.geographic_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_status ON public.geographic_restrictions(restriction_status);
CREATE INDEX IF NOT EXISTS idx_geo_country ON public.geographic_restrictions(country);

-- Enable RLS
ALTER TABLE public.geographic_restrictions ENABLE ROW LEVEL SECURITY;

-- Only service role can access geographic restriction data
DROP POLICY IF EXISTS "Only service role can access geographic restrictions" ON public.geographic_restrictions;
CREATE POLICY "Only service role can access geographic restrictions"
ON public.geographic_restrictions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON FUNCTION calculate_driving_distance_miles IS 'Calculates approximate driving distance in miles between two coordinates using Haversine formula with road distance factor';
COMMENT ON FUNCTION is_location_allowed IS 'Checks if a user HOME location is allowed: must be in US and outside 6-hour driving radius of Salt Lake City. Travelers (temporary locations) are allowed regardless of current location.';
COMMENT ON FUNCTION can_user_register IS 'Validates if a user can register based on geographic restrictions (checks HOME location, not current/travel location), returns detailed error message';
COMMENT ON COLUMN public.user_profiles.location_type IS 'Type of location: home (permanent residence - validated), current/temporary (where user is now - not restricted)';
COMMENT ON TABLE public.geographic_restrictions IS 'Tracks geographic restriction checks for users - validates HOME location, allows travelers';

