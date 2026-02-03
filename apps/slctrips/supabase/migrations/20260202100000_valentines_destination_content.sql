-- Valentine's TripKit: push research content INTO the 5 TikTok destinations.
-- Run after the 5 destinations exist (including Great Basin NP). Uses known UUIDs for TikTok 5.
-- ai_summary = "why romantic" + best season; ai_tips = 3 activities + lodging + brunch hook (Dan-style).
-- If your destinations table uses different column names or ai_tips format (e.g. jsonb vs text[]), adapt.

-- 1. Lava Hot Springs (id from verification doc)
UPDATE public.destinations
SET
  ai_summary = 'Mineral-rich, odor-free hot pools and a quirky small-town main street—the perfect spontaneous couples'' soak. Year-round; winter soaks with snow falling are magical. Why we included it: 2 hours flat from SLC, genuinely charming downtown. Want more secluded? See Mystic Hot Springs or Homestead Crater.',
  ai_tips = '["Evening soak in the World Famous Hot Pools (multiple temp levels)","Float the Portneuf River in summer","Explore downtown—antiques, cafes. Lodging: Riverside Inn, Home Hotel, vacation rentals. Brunch → mineral soak → river float → cozy inn"]'::jsonb
WHERE id = 'b7feb27e-4579-4fc2-99bc-1354a4023fec';

-- 2. Bonneville Salt Flats
UPDATE public.destinations
SET
  ai_summary = 'Surreal white expanse, legendary sunset photo ops, and otherworldly emptiness for a contemplative moment. Best season: late summer through fall (July–Oct) when dry. Spring can be flooded—mirror effect is also stunning.',
  ai_tips = '["Sunset photo shoot on the infinite white flats","Wendover for dinner and entertainment","Stargazing on the flats after dark. Lodging: Wendover casinos or SLC day trip. Brunch → white infinity → sunset portraits → casino dinner"]'::jsonb
WHERE id = 'c4379aa0-f903-44ac-9a25-f0e68c5d2258';

-- 3. Mirror Lake Highway
UPDATE public.destinations
SET
  ai_summary = 'High-alpine lakes, fall color, cabin vibes, quiet escape. Scenic drive + alpine lakes. Seasonal—high-elevation; check road status in winter.',
  ai_tips = '["Drive the full Mirror Lake Highway with photo stops","Hike or snowshoe to lakes and viewpoints","Pack a picnic or hit a cabin. Brunch → mountain drive → alpine lakes → stargaze"]'::jsonb
WHERE id = '4779b93b-1e77-4680-940d-0453e2eebc72';

-- 4. Goblin Valley State Park
UPDATE public.destinations
SET
  ai_summary = 'Mars-like landscape of thousands of hoodoos (goblins), certified International Dark Sky Park—surreal photography and night sky magic. Spring and fall ideal; summer hot; winter quiet and accessible.',
  ai_tips = '["Explore the Valley of Goblins at golden hour (endless photo ops)","Telescope night sky program (check ranger schedule)","Little Wild Horse Canyon slot hike nearby. Lodging: yurts in park (book early), camping, motels in Green River. Brunch → Mars on Earth → yurt under the Milky Way"]'::jsonb
WHERE id = 'f9299b7c-7569-4f8b-81d6-4b81b0c0c71f';

-- 5. Great Basin National Park (run after 20260202000000_great_basin_np_destination.sql)
UPDATE public.destinations
SET
  ai_summary = 'Ancient bristlecone pines, Lehman Caves, and one of the darkest skies in the continental U.S.—solitude for two. Certified Dark Sky Park. Best season: late spring–fall (May–Oct). Cave tours year-round; some roads close in winter.',
  ai_tips = '["Lehman Caves tour (formations are jaw-dropping)","Drive to Wheeler Peak + bristlecone pine grove hike","Astronomy program or self-guided stargazing. Lodging: on-site camping, motels/B&Bs in Baker or Ely. Brunch → cave wonder → ancient trees → darkest skies"]'::jsonb
WHERE slug = 'great-basin-national-park';
