-- Great Basin National Park — destination row for Valentine's TripKit (TikTok Top 5).
--
-- Before running: Verify table name (e.g. public.destinations) and column list. If your schema
-- has different or extra NOT NULL columns, adapt this INSERT (e.g. copy one existing destination
-- row from Supabase Table Editor and replace values with the research data below).
--
-- After running: SELECT id FROM destinations WHERE slug = 'great-basin-national-park';

INSERT INTO public.destinations (
  id,
  name,
  slug,
  place_id,
  latitude,
  longitude,
  county,
  region,
  state_code,
  category,
  subcategory,
  status,
  description,
  data_quality_score,
  featured,
  trending,
  created_at,
  updated_at,
  updated_with_recommendations
) VALUES (
  gen_random_uuid(),
  'Great Basin National Park',
  'great-basin-national-park',
  'ChIJGreatBasinNP_NV',  -- Replace with real Google Place ID if required; some schemas allow placeholders
  39.0062,
  -114.2166,
  'White Pine',
  'Eastern Nevada',
  'NV',
  'National Park',
  'National Park',
  'active',
  'Ancient bristlecone pines, Lehman Caves, and one of the darkest skies in the continental U.S. Certified Dark Sky Park—solitude for two. Best season: late spring through fall (May–Oct). Cave tours year-round.',
  75,
  false,
  false,
  now(),
  now(),
  now()
)
-- ON CONFLICT (slug) DO NOTHING;  -- Uncomment only if your table has UNIQUE(slug)

-- Optional: add drive_minutes / distance_miles if they live in the base table (4 hrs = 240 min, 234 mi from SLC):
-- UPDATE public.destinations SET drive_minutes = 240, distance_miles = 234 WHERE slug = 'great-basin-national-park';
