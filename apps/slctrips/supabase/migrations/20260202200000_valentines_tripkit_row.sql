-- Valentine's TripKit row: Romantic Road Trips & Valentine's Compendium (TK-VAL).
-- Run this in Supabase SQL Editor. Stripe IDs are NULL so checkout uses price_data from this row.
-- After running: SELECT id FROM tripkits WHERE code = 'TK-VAL'; then run the 20-destination INSERT
--   (see VALENTINES_TRIPKIT_DB_VERIFICATION.md) with that UUID.
--
-- If you get NOT NULL violation: your table may require keywords, features, target_audience,
-- is_in_flash_sale, founder_sold, featured, download_count, view_count, or published_at.
-- Add those to the column list and VALUES (e.g. ARRAY[]::text[], false, 0, 0, null, now()).

INSERT INTO public.tripkits (
  id,
  code,
  name,
  slug,
  tagline,
  description,
  value_proposition,
  meta_title,
  meta_description,
  price,
  founder_price,
  regular_price,
  stripe_product_id,
  stripe_price_id,
  status,
  destination_count,
  cover_image_url,
  collection_type,
  primary_theme,
  tier,
  states_covered,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TK-VAL',
  'Romantic Road Trips & Valentine''s Compendium',
  'valentines-getaways',
  'Top 20 road trips from SLC + staycation guide + singles guide. Kick-ass compendium—we don''t skimp.',
  'A compendium: Top 20 romantic road trips from SLC (TikTok Top 5 first, then 15 more ranked), plus full staycation guide (Presidents'' Day itineraries, Valentine''s events, spas, restaurants, hotels) and singles guide (Craft & Crush, Galentine''s, speed dating). We go to the nth degree—no skimping.',
  'One compendium: 20 road-trip destinations with drive times, lodging, brunch hooks; staycation itineraries (ski + spa, Midway winter escape, culture + cuisine); Valentine''s events and restaurants in SLC; and singles events so everyone has a move. Kick-ass shit, all in one place.',
  'Romantic Road Trips & Valentine''s Compendium | SLC | SLCTrips',
  'Top 20 romantic road trips from Salt Lake City + staycation guide + singles guide. Presidents'' Day weekend, Valentine''s events, Craft & Crush, itineraries. We don''t skimp.',
  12.99,
  9.99,
  12.99,
  NULL,   -- add Stripe product/price later if desired; checkout works without these
  NULL,
  'active',
  20,
  'https://www.slctrips.com/images/og-tripkits.png',  -- replace with Valentine-specific image URL if you have one
  'curated',
  'romance',
  'basic',
  ARRAY['UT'],
  now(),
  now()
);
