-- ==========================================
-- THE RING AT FULLMER LEGACY CENTER
-- Seed Data
-- ==========================================
-- Initial data for rings, pillars, and example site

-- ==========================================
-- 1. SITES
-- ==========================================

INSERT INTO public.sites (slug, name, city, state, country, timezone) VALUES
  ('south-jordan-flc', 'The Ring at Fullmer Legacy Center', 'South Jordan', 'Utah', 'USA', 'America/Denver')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 2. RINGS (The Nine Domains)
-- ==========================================

INSERT INTO public.rings (slug, name, description, sort_order) VALUES
  ('self', 'Self', 'Personal identity, values, and self-awareness', 1),
  ('body', 'Body', 'Physical health, fitness, and body awareness', 2),
  ('brain', 'Brain', 'Cognitive development, learning, and mental skills', 3),
  ('bubble', 'Bubble', 'Immediate family and close relationships', 4),
  ('scene', 'Scene', 'Peer groups, friends, and social circles', 5),
  ('neighborhood', 'Neighborhood', 'Local community and immediate surroundings', 6),
  ('community', 'Community', 'Broader community engagement and civic participation', 7),
  ('world', 'World', 'Global awareness and understanding', 8),
  ('ether', 'Ether', 'Digital spaces, online communities, and virtual worlds', 9)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 3. PILLARS (The Four Program Pillars)
-- ==========================================

INSERT INTO public.pillars (slug, name, description, color_hex) VALUES
  ('wellness', 'Wellness', 'Physical and mental health, fitness, mindfulness', '#4CAF50'),
  ('technest', 'TechNest', 'Technology, coding, digital skills, esports', '#2196F3'),
  ('creative', 'Creative Studio', 'Arts, music, design, creative expression', '#9C27B0'),
  ('civic', 'Civic Lab', 'Community service, civic engagement, leadership', '#FF9800')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 4. EXAMPLE BADGES
-- ==========================================

-- Insert badges using subqueries to get current IDs
INSERT INTO public.badges (site_id, slug, name, description, ring_id, pillar_id) VALUES
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    '3-minute-warrior', '3 Minute Warrior', 'Complete a 3-minute boxing round',
    (SELECT id FROM public.rings WHERE slug = 'body'),
    (SELECT id FROM public.pillars WHERE slug = 'wellness')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'varsity-ready', 'Varsity Ready', 'Demonstrate varsity-level skills in chosen sport',
    (SELECT id FROM public.rings WHERE slug = 'body'),
    (SELECT id FROM public.pillars WHERE slug = 'wellness')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'cyborg-builder', 'Cyborg Builder', 'Build and program a functional robot',
    (SELECT id FROM public.rings WHERE slug = 'brain'),
    (SELECT id FROM public.pillars WHERE slug = 'technest')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'peace-builder', 'Peace Builder', 'Lead conflict resolution or peace-building initiative',
    (SELECT id FROM public.rings WHERE slug = 'self'),
    (SELECT id FROM public.pillars WHERE slug = 'civic')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'first-responder', 'First Responder', 'Complete Disaster Response Crew training',
    (SELECT id FROM public.rings WHERE slug = 'community'),
    (SELECT id FROM public.pillars WHERE slug = 'civic')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'wisdom-keeper', 'Wisdom Keeper', 'Complete Wisdom Bridge program with seniors',
    (SELECT id FROM public.rings WHERE slug = 'self'),
    (SELECT id FROM public.pillars WHERE slug = 'civic')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'shelter-squad', 'Shelter Squad', 'Complete service hours at animal shelter',
    (SELECT id FROM public.rings WHERE slug = 'community'),
    (SELECT id FROM public.pillars WHERE slug = 'civic')
  )
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 5. ZONES (Physical Campus)
-- ==========================================

INSERT INTO public.zones (site_id, slug, name, description, pillar_id, primary_ring_id) VALUES
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'podium-rings', 'The Podium Rings', 'Sacred boxing rings - earned, not casual',
    (SELECT id FROM public.pillars WHERE slug = 'wellness'),
    (SELECT id FROM public.rings WHERE slug = 'body')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'kinetic-lab', 'Kinetic Lab', 'Open fitness area - experiment freely',
    (SELECT id FROM public.pillars WHERE slug = 'wellness'),
    (SELECT id FROM public.rings WHERE slug = 'body')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'technest', 'The TechNest', 'Esports arena and coding lab',
    (SELECT id FROM public.pillars WHERE slug = 'technest'),
    (SELECT id FROM public.rings WHERE slug = 'brain')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'broadcast-booth', 'Broadcast Booth', 'Podcasting and streaming studio',
    (SELECT id FROM public.pillars WHERE slug = 'technest'),
    (SELECT id FROM public.rings WHERE slug = 'world')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'creators-lounge', 'Creator''s Lounge', 'Co-working and maker space',
    (SELECT id FROM public.pillars WHERE slug = 'creative'),
    (SELECT id FROM public.rings WHERE slug = 'brain')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'the-perch', 'The Perch', 'Mezzanine hangout zone',
    NULL,
    (SELECT id FROM public.rings WHERE slug = 'scene')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'zen-den', 'Zen Den', 'Regulation and mindfulness space',
    (SELECT id FROM public.pillars WHERE slug = 'wellness'),
    (SELECT id FROM public.rings WHERE slug = 'self')
  ),
  (
    (SELECT id FROM public.sites WHERE slug = 'south-jordan-flc'),
    'civic-lab', 'Civic Lab', 'Youth council and community projects',
    (SELECT id FROM public.pillars WHERE slug = 'civic'),
    (SELECT id FROM public.rings WHERE slug = 'community')
  )
ON CONFLICT (site_id, slug) DO NOTHING;

-- ==========================================
-- 6. EXAMPLE QUESTS (Placeholder structure)
-- ==========================================
-- Note: Actual quests will be created from curriculum PDFs
-- This shows the structure for future quest creation

-- Example quest structure (commented out - will be populated from curriculum):
/*
DO $$
DECLARE
  site_id_val UUID;
  wellness_pillar_id UUID;
  body_ring_id UUID;
  quest_id_val UUID;
BEGIN
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO wellness_pillar_id FROM public.pillars WHERE slug = 'wellness';
  SELECT id INTO body_ring_id FROM public.rings WHERE slug = 'body';

  -- Example: 3 Minute Round Quest
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks)
  VALUES (
    site_id_val,
    wellness_pillar_id,
    '3-minute-round',
    '3 Minute Round',
    'Build endurance and technique through structured boxing rounds',
    'This quest focuses on building physical endurance and boxing technique...',
    2,
    4
  )
  RETURNING id INTO quest_id_val;

  -- Link to body ring
  INSERT INTO public.quest_rings (quest_id, ring_id, weight)
  VALUES (quest_id_val, body_ring_id, 1.0);

  -- Create quest version with HOMAGO config
  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "object_on_table",
        "prompt": "Poster of Gene Fullmer with ''Do you know what your body can do?''"
      },
      "messing_around": {
        "activities": ["Shadow boxing", "Bag work", "Partner drills"]
      },
      "geeking_out": {
        "boss_challenge": "Complete a full 3-minute round with proper form"
      }
    }'::jsonb,
    true
  );
END $$;
*/

