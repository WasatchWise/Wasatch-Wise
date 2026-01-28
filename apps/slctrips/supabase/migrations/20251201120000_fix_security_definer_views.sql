-- Fix security definer views by changing them to security invoker
-- This ensures they respect RLS policies of the querying user
ALTER VIEW public.tk000_destinations
SET (security_invoker = true);
ALTER VIEW public.public_destinations
SET (security_invoker = true);
-- NOTE: spatial_ref_sys is a PostGIS system table and cannot be modified.
-- The "rls_disabled_in_public" warning for it can be safely ignored or suppressed in Supabase dashboard.