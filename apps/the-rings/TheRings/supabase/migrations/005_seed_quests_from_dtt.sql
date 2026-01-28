-- ==========================================
-- QUEST SEED DATA FROM DTT CURRICULUM
-- ==========================================
-- Based on Digital Teaching Tools curriculum documents
-- 6-week programs mapped to pillars and rings

DO $$
DECLARE
  site_id_val UUID;
  wellness_pillar_id UUID;
  technest_pillar_id UUID;
  creative_pillar_id UUID;
  civic_pillar_id UUID;
  -- Rings
  self_ring_id UUID;
  body_ring_id UUID;
  brain_ring_id UUID;
  bubble_ring_id UUID;
  scene_ring_id UUID;
  neighborhood_ring_id UUID;
  community_ring_id UUID;
  world_ring_id UUID;
  ether_ring_id UUID;
  -- Quest IDs
  quest_id_val UUID;
BEGIN
  -- Get IDs
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO wellness_pillar_id FROM public.pillars WHERE slug = 'wellness';
  SELECT id INTO technest_pillar_id FROM public.pillars WHERE slug = 'technest';
  SELECT id INTO creative_pillar_id FROM public.pillars WHERE slug = 'creative';
  SELECT id INTO civic_pillar_id FROM public.pillars WHERE slug = 'civic';

  SELECT id INTO self_ring_id FROM public.rings WHERE slug = 'self';
  SELECT id INTO body_ring_id FROM public.rings WHERE slug = 'body';
  SELECT id INTO brain_ring_id FROM public.rings WHERE slug = 'brain';
  SELECT id INTO bubble_ring_id FROM public.rings WHERE slug = 'bubble';
  SELECT id INTO scene_ring_id FROM public.rings WHERE slug = 'scene';
  SELECT id INTO neighborhood_ring_id FROM public.rings WHERE slug = 'neighborhood';
  SELECT id INTO community_ring_id FROM public.rings WHERE slug = 'community';
  SELECT id INTO world_ring_id FROM public.rings WHERE slug = 'world';
  SELECT id INTO ether_ring_id FROM public.rings WHERE slug = 'ether';

  -- ==========================================
  -- TECHNEST QUESTS
  -- ==========================================

  -- Coding Playground
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    technest_pillar_id,
    'coding-playground',
    'Coding Playground',
    'Introduction to coding through block-based programming and interactive challenges',
    E'# Coding Playground\n\nLearn the fundamentals of coding through engaging, hands-on activities. You''ll use platforms like Code.org, Scratch, and Tynker to build games, animations, and solve puzzles.\n\n## What You''ll Learn\n- Block-based programming concepts\n- Logic and problem-solving\n- Game design basics\n- Creative expression through code\n\n## Final Project\nCreate your own interactive game or animation to share with the community.',
    2,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  -- Link to rings
  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, brain_ring_id, 1.5),
    (quest_id_val, ether_ring_id, 1.0),
    (quest_id_val, self_ring_id, 0.5);

  -- Create steps
  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Code Explorer', 'Introduction to coding concepts and platforms like Code.org', 'hanging_out'),
    (quest_id_val, 2, 'Puzzle Master', 'Solve coding puzzles and challenges', 'messing_around'),
    (quest_id_val, 3, 'Scratch Artist', 'Create animations and stories in Scratch', 'messing_around'),
    (quest_id_val, 4, 'Game Designer', 'Design and build your first game', 'messing_around'),
    (quest_id_val, 5, 'Debug Detective', 'Learn to find and fix code problems', 'geeking_out'),
    (quest_id_val, 6, 'Project Showcase', 'Complete and present your final project', 'geeking_out');

  -- Quest version
  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "demo",
        "prompt": "Watch a simple game being made in real-time"
      },
      "messing_around": {
        "activities": ["Code.org puzzles", "Scratch projects", "Tynker challenges"]
      },
      "geeking_out": {
        "boss_challenge": "Create and present an original game or animation"
      }
    }'::jsonb,
    true
  );

  -- ==========================================
  -- Design It! (Engineering)
  -- ==========================================

  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    technest_pillar_id,
    'design-it',
    'Design It!',
    'Engineering challenges and hands-on building experiments',
    E'# Design It!\n\nExplore engineering principles through fun, hands-on challenges. Build structures, test designs, and learn why things work the way they do.\n\n## What You''ll Learn\n- Engineering design process\n- Structural principles\n- Testing and iteration\n- Creative problem-solving\n\n## Featured Challenge\nThe famous Egg Drop - design a container that protects an egg from a high fall!',
    3,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, brain_ring_id, 1.5),
    (quest_id_val, self_ring_id, 0.5),
    (quest_id_val, scene_ring_id, 0.5);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Engineer Intro', 'Learn about the engineering design process', 'hanging_out'),
    (quest_id_val, 2, 'Tower Challenge', 'Build the tallest tower with limited materials', 'messing_around'),
    (quest_id_val, 3, 'Bridge Builder', 'Design a bridge that can hold weight', 'messing_around'),
    (quest_id_val, 4, 'Egg Drop Prep', 'Research and design your egg protection device', 'messing_around'),
    (quest_id_val, 5, 'Test & Iterate', 'Test your design and make improvements', 'geeking_out'),
    (quest_id_val, 6, 'Final Drop', 'The ultimate egg drop challenge', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "object_on_table",
        "prompt": "Broken structures and successful ones - what makes the difference?"
      },
      "messing_around": {
        "activities": ["Paper towers", "Spaghetti bridges", "Cardboard constructions"]
      },
      "geeking_out": {
        "boss_challenge": "Egg survives a 3-story drop"
      }
    }'::jsonb,
    true
  );

  -- ==========================================
  -- WELLNESS QUESTS
  -- ==========================================

  -- Ecstatic Dance
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    wellness_pillar_id,
    'ecstatic-dance',
    'Ecstatic Dance',
    'Movement, expression, and body awareness through free-form dance',
    E'# Ecstatic Dance\n\nDiscover the joy of movement without judgment. This quest explores dance as a form of self-expression, stress relief, and community connection.\n\n## What You''ll Experience\n- Free-form movement\n- Rhythm and body awareness\n- Emotional expression through dance\n- Group dance experiences\n\n## No Experience Needed\nThis isn''t about being a good dancer - it''s about moving your body and having fun!',
    1,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, body_ring_id, 1.5),
    (quest_id_val, self_ring_id, 1.0),
    (quest_id_val, scene_ring_id, 0.5);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'First Moves', 'Introduction to ecstatic dance - just show up and move', 'hanging_out'),
    (quest_id_val, 2, 'Rhythm Exploration', 'Explore different rhythms and how they make you feel', 'messing_around'),
    (quest_id_val, 3, 'Expression Session', 'Use movement to express emotions', 'messing_around'),
    (quest_id_val, 4, 'Partner Flow', 'Connect with others through movement', 'messing_around'),
    (quest_id_val, 5, 'Personal Style', 'Develop your own movement vocabulary', 'geeking_out'),
    (quest_id_val, 6, 'Community Dance', 'Lead or participate in a community dance session', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "music",
        "prompt": "Music playing - just start moving however feels right"
      },
      "messing_around": {
        "activities": ["Solo exploration", "Partner mirroring", "Group waves"]
      },
      "geeking_out": {
        "boss_challenge": "Lead a 10-minute community dance session"
      }
    }'::jsonb,
    true
  );

  -- 3 Minute Warrior (Boxing)
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    wellness_pillar_id,
    '3-minute-warrior',
    '3 Minute Warrior',
    'Build endurance and technique through structured boxing rounds',
    E'# 3 Minute Warrior\n\nInspired by Gene Fullmer''s legacy, this quest builds physical endurance, discipline, and proper boxing technique. Work your way up to completing a full 3-minute round.\n\n## What You''ll Learn\n- Basic boxing stance and footwork\n- Fundamental punches\n- Defense techniques\n- Cardiovascular endurance\n\n## The Challenge\nA boxing round is 3 minutes - can you last the full round with proper form?',
    3,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, body_ring_id, 2.0),
    (quest_id_val, self_ring_id, 1.0);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Meet the Ring', 'Introduction to the gym and boxing basics', 'hanging_out'),
    (quest_id_val, 2, 'Stance & Movement', 'Learn proper boxing stance and footwork', 'messing_around'),
    (quest_id_val, 3, 'Jab & Cross', 'Master the fundamental punches', 'messing_around'),
    (quest_id_val, 4, 'Defense Basics', 'Learn to slip, block, and move', 'messing_around'),
    (quest_id_val, 5, 'Bag Work', 'Put it all together on the heavy bag', 'geeking_out'),
    (quest_id_val, 6, 'The 3 Minute Round', 'Complete a full round with proper form', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "object_on_table",
        "prompt": "Gene Fullmer poster: What can YOUR body do?"
      },
      "messing_around": {
        "activities": ["Shadow boxing", "Bag work", "Partner drills", "Jump rope"]
      },
      "geeking_out": {
        "boss_challenge": "Complete a 3-minute round maintaining proper form throughout"
      }
    }'::jsonb,
    true
  );

  -- ==========================================
  -- CREATIVE QUESTS
  -- ==========================================

  -- Beats Lab
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    creative_pillar_id,
    'beats-lab',
    'Beats Lab',
    'Create original music using digital audio workstations',
    E'# Beats Lab\n\nExplore music production and create your own beats. Learn to use digital tools to make music that expresses who you are.\n\n## What You''ll Learn\n- Basic music theory\n- Digital audio workstation basics\n- Beat making and sampling\n- Mixing fundamentals\n\n## Final Project\nProduce an original track to add to your portfolio.',
    2,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, brain_ring_id, 1.0),
    (quest_id_val, self_ring_id, 1.0),
    (quest_id_val, ether_ring_id, 1.0);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Sound Explorer', 'Listen to different genres and identify elements', 'hanging_out'),
    (quest_id_val, 2, 'DAW Basics', 'Learn the digital audio workstation interface', 'messing_around'),
    (quest_id_val, 3, 'Beat Builder', 'Create your first drum patterns', 'messing_around'),
    (quest_id_val, 4, 'Melody Maker', 'Add melodies and harmonies to your beats', 'messing_around'),
    (quest_id_val, 5, 'Mix Master', 'Learn to mix and balance your tracks', 'geeking_out'),
    (quest_id_val, 6, 'Release Day', 'Finish and share your original track', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "demo",
        "prompt": "Hear a beat being built from scratch"
      },
      "messing_around": {
        "activities": ["Loop exploration", "Beat making", "Sampling", "Layering"]
      },
      "geeking_out": {
        "boss_challenge": "Produce and export a complete original track"
      }
    }'::jsonb,
    true
  );

  -- Street Art Studio
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    creative_pillar_id,
    'street-art-studio',
    'Street Art Studio',
    'Learn street art techniques and create a community mural',
    E'# Street Art Studio\n\nExplore the world of street art and graffiti as legitimate art forms. Learn techniques and work toward creating art that beautifies our community.\n\n## What You''ll Learn\n- Street art history and culture\n- Spray paint techniques\n- Stencil creation\n- Large-scale design\n\n## Community Project\nContribute to a mural that will be displayed in the center.',
    3,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, self_ring_id, 1.0),
    (quest_id_val, neighborhood_ring_id, 1.0),
    (quest_id_val, community_ring_id, 0.5);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Art History', 'Learn about street art movements and artists', 'hanging_out'),
    (quest_id_val, 2, 'Sketch Practice', 'Develop your design skills on paper', 'messing_around'),
    (quest_id_val, 3, 'Stencil Craft', 'Create your own stencils', 'messing_around'),
    (quest_id_val, 4, 'Spray Technique', 'Learn spray paint control and techniques', 'messing_around'),
    (quest_id_val, 5, 'Design Planning', 'Plan your contribution to the mural', 'geeking_out'),
    (quest_id_val, 6, 'Mural Day', 'Paint your section of the community mural', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "gallery",
        "prompt": "Street art examples from around the world"
      },
      "messing_around": {
        "activities": ["Sketching", "Stencil cutting", "Practice walls"]
      },
      "geeking_out": {
        "boss_challenge": "Complete your section of the community mural"
      }
    }'::jsonb,
    true
  );

  -- ==========================================
  -- CIVIC QUESTS
  -- ==========================================

  -- Community Voice
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    civic_pillar_id,
    'community-voice',
    'Community Voice',
    'Learn to advocate for change through civic engagement',
    E'# Community Voice\n\nDiscover how to make your voice heard in your community. Learn about civic processes and how young people can create real change.\n\n## What You''ll Learn\n- How local government works\n- Effective communication strategies\n- Community organizing basics\n- Public speaking skills\n\n## Take Action\nIdentify an issue you care about and take concrete steps toward change.',
    2,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, community_ring_id, 1.5),
    (quest_id_val, neighborhood_ring_id, 1.0),
    (quest_id_val, self_ring_id, 0.5);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Civic Explorer', 'Learn how local government and community organizations work', 'hanging_out'),
    (quest_id_val, 2, 'Issue Identifier', 'Research issues that matter to you', 'messing_around'),
    (quest_id_val, 3, 'Story Builder', 'Craft your message and personal story', 'messing_around'),
    (quest_id_val, 4, 'Ally Finder', 'Connect with others who share your concerns', 'messing_around'),
    (quest_id_val, 5, 'Action Planner', 'Develop a concrete action plan', 'geeking_out'),
    (quest_id_val, 6, 'Voice Day', 'Present your issue to community leaders or at a public meeting', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "discussion",
        "prompt": "What would you change about your neighborhood?"
      },
      "messing_around": {
        "activities": ["Research", "Interviews", "Writing", "Presentation practice"]
      },
      "geeking_out": {
        "boss_challenge": "Present your issue to a decision-maker or public forum"
      }
    }'::jsonb,
    true
  );

  -- Service Squad
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, description_md, difficulty, estimated_weeks, is_active)
  VALUES (
    site_id_val,
    civic_pillar_id,
    'service-squad',
    'Service Squad',
    'Complete meaningful service hours while building leadership skills',
    E'# Service Squad\n\nGive back to your community while developing valuable skills. This quest connects you with local organizations where you can make a real difference.\n\n## What You''ll Do\n- Partner with local nonprofits\n- Complete service projects\n- Reflect on your impact\n- Build leadership skills\n\n## Service Hours\nComplete service hours that count toward school requirements or scholarships.',
    2,
    6,
    true
  )
  RETURNING id INTO quest_id_val;

  INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
    (quest_id_val, community_ring_id, 1.5),
    (quest_id_val, self_ring_id, 1.0),
    (quest_id_val, world_ring_id, 0.5);

  INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
    (quest_id_val, 1, 'Service Intro', 'Learn about service opportunities and organizations', 'hanging_out'),
    (quest_id_val, 2, 'Partner Match', 'Find a service partner that fits your interests', 'messing_around'),
    (quest_id_val, 3, 'First Shift', 'Complete your first service session', 'messing_around'),
    (quest_id_val, 4, 'Deep Dive', 'Take on more responsibility at your service site', 'messing_around'),
    (quest_id_val, 5, 'Lead a Project', 'Plan and lead a small service project', 'geeking_out'),
    (quest_id_val, 6, 'Impact Reflection', 'Document and share your service impact', 'geeking_out');

  INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
  VALUES (
    quest_id_val,
    1,
    '{
      "hanging_out": {
        "hook_type": "guest_speaker",
        "prompt": "Hear from nonprofit partners about their work"
      },
      "messing_around": {
        "activities": ["Site visits", "Volunteer shifts", "Team projects"]
      },
      "geeking_out": {
        "boss_challenge": "Lead a service project and document your impact"
      }
    }'::jsonb,
    true
  );

END $$;
