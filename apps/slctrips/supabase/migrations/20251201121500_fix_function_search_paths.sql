-- Secure functions by setting a fixed search_path
-- This prevents malicious users from hijacking the search path
DO $$
DECLARE func_record RECORD;
func_sig TEXT;
BEGIN FOR func_record IN
SELECT n.nspname,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as args
FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'update_staykit_progress_activity',
        'record_access_code_usage',
        'generate_tripkit_access_code',
        'validate_staykit_access_code',
        'update_educator_submissions_updated_at',
        'update_county_profiles_updated_at',
        'update_staykit_destination_count',
        'redeem_staykit_access_code',
        'update_enhancement_progress',
        'get_recent_captures',
        'calculate_reading_time',
        'flag_library_for_refresh_on_version_change',
        'update_staykit_day_count',
        'get_email_capture_stats',
        'update_purchases_updated_at',
        'grant_week1_staykit_access',
        'grant_staykit_library_access_on_purchase',
        'validate_tripkit_access_code',
        'update_updated_at_column',
        'validate_guardian_canon',
        'record_flash_sale_purchase',
        'update_user_tripkit_access_updated_at',
        'refresh_trip_planner_metrics',
        'record_staykit_access_code_usage',
        'end_flash_sale',
        'guardian_id',
        'get_flash_sale_status',
        'guardian_by_county',
        'sync_location_gps'
    ) LOOP func_sig := format(
        '%I.%I(%s)',
        func_record.nspname,
        func_record.proname,
        func_record.args
    );
RAISE NOTICE 'Securing function: %',
func_sig;
EXECUTE format(
    'ALTER FUNCTION %s SET search_path = public, pg_temp;',
    func_sig
);
END LOOP;
END $$;