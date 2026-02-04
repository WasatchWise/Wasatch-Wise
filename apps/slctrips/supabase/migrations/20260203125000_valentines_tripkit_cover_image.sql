-- Valentine's TripKit: set cover image to new Dan/romantic landscape art.
UPDATE public.tripkits
SET cover_image_url = 'https://www.slctrips.com/images/TRIPKITS/valentines-getaways.png',
    updated_at = now()
WHERE slug = 'valentines-getaways';
