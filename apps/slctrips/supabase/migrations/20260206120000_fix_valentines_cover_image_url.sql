-- Valentine's TripKit: use relative URL so Next.js Image works (same-origin).
-- Absolute https://www.slctrips.com/... is not in next.config.js remotePatterns.
UPDATE public.tripkits
SET cover_image_url = '/images/TRIPKITS/valentines-getaways.png',
    updated_at = now()
WHERE slug = 'valentines-getaways';
