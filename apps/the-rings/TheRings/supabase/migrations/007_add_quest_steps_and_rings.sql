-- ==========================================
-- ADD HOMAGO STEPS AND RING ASSOCIATIONS
-- ==========================================
-- Generates 6 steps per quest and assigns ring weights

-- ==========================================
-- QUEST STEPS (6 per quest with HOMAGO phases)
-- ==========================================

DO $$
DECLARE
  quest_rec RECORD;
  pillar_slug TEXT;
  step_titles TEXT[];
BEGIN
  -- Loop through all quests and add steps
  FOR quest_rec IN
    SELECT q.id, q.slug, q.title, p.slug as pillar_slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.quest_steps qs WHERE qs.quest_id = q.id
    )
  LOOP
    -- Generate contextual step titles based on pillar
    CASE quest_rec.pillar_slug
      WHEN 'wellness' THEN
        step_titles := ARRAY[
          'Introduction & Assessment',
          'Foundation Building',
          'Skill Development',
          'Practice & Refinement',
          'Challenge Mode',
          'Mastery Demonstration'
        ];
      WHEN 'technest' THEN
        step_titles := ARRAY[
          'Explore & Discover',
          'Learn the Basics',
          'Build Your First Project',
          'Experiment & Iterate',
          'Advanced Techniques',
          'Final Project Showcase'
        ];
      WHEN 'creative' THEN
        step_titles := ARRAY[
          'Inspiration & Exploration',
          'Tools & Techniques',
          'First Creations',
          'Style Development',
          'Refine Your Craft',
          'Portfolio Piece'
        ];
      WHEN 'civic' THEN
        step_titles := ARRAY[
          'Awareness & Understanding',
          'Research & Investigation',
          'Planning & Preparation',
          'Taking Action',
          'Leadership & Expansion',
          'Impact & Reflection'
        ];
      ELSE
        step_titles := ARRAY[
          'Getting Started',
          'Building Foundations',
          'Hands-On Practice',
          'Skill Building',
          'Advanced Work',
          'Final Achievement'
        ];
    END CASE;

    -- Insert 6 steps with HOMAGO phases
    INSERT INTO public.quest_steps (quest_id, sort_order, title, description_md, homago_phase) VALUES
      (quest_rec.id, 1, step_titles[1], 'Begin your journey - observe, ask questions, and get comfortable with the basics.', 'hanging_out'),
      (quest_rec.id, 2, step_titles[2], 'Start experimenting with foundational concepts and techniques.', 'hanging_out'),
      (quest_rec.id, 3, step_titles[3], 'Apply what you''ve learned through hands-on activities.', 'messing_around'),
      (quest_rec.id, 4, step_titles[4], 'Deepen your skills through practice and experimentation.', 'messing_around'),
      (quest_rec.id, 5, step_titles[5], 'Push yourself with more challenging work and refine your abilities.', 'geeking_out'),
      (quest_rec.id, 6, step_titles[6], 'Complete your final challenge and demonstrate your mastery.', 'geeking_out');

  END LOOP;
END $$;

-- ==========================================
-- RING ASSOCIATIONS
-- ==========================================

DO $$
DECLARE
  quest_rec RECORD;
  self_ring UUID;
  body_ring UUID;
  brain_ring UUID;
  bubble_ring UUID;
  scene_ring UUID;
  neighborhood_ring UUID;
  community_ring UUID;
  world_ring UUID;
  ether_ring UUID;
BEGIN
  -- Get ring IDs
  SELECT id INTO self_ring FROM public.rings WHERE slug = 'self';
  SELECT id INTO body_ring FROM public.rings WHERE slug = 'body';
  SELECT id INTO brain_ring FROM public.rings WHERE slug = 'brain';
  SELECT id INTO bubble_ring FROM public.rings WHERE slug = 'bubble';
  SELECT id INTO scene_ring FROM public.rings WHERE slug = 'scene';
  SELECT id INTO neighborhood_ring FROM public.rings WHERE slug = 'neighborhood';
  SELECT id INTO community_ring FROM public.rings WHERE slug = 'community';
  SELECT id INTO world_ring FROM public.rings WHERE slug = 'world';
  SELECT id INTO ether_ring FROM public.rings WHERE slug = 'ether';

  -- WELLNESS QUESTS - Ring Associations
  FOR quest_rec IN
    SELECT q.id, q.slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE p.slug = 'wellness'
    AND NOT EXISTS (SELECT 1 FROM public.quest_rings qr WHERE qr.quest_id = q.id)
  LOOP
    -- Fitness & Sports - Body primary, Self secondary
    IF quest_rec.slug IN ('jump-rope-master', 'basketball-fundamentals', 'soccer-skills', 'volleyball-basics',
       'tennis-intro', 'swimming-strokes', 'track-and-field', 'weightlifting-101', 'flexibility-flow',
       'calisthenics-journey', 'martial-arts-intro', 'wrestling-basics', 'jiu-jitsu-foundations',
       'kickboxing-combos', 'parkour-basics', 'skateboarding-start', 'bmx-riding', 'rock-climbing-intro',
       'disc-golf', 'archery-basics', 'golf-fundamentals', 'table-tennis', 'badminton-skills',
       'handball-intro', 'lacrosse-basics', 'flag-football', 'ultimate-frisbee', 'softball-skills',
       'hockey-fundamentals', 'cheerleading-basics') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, body_ring, 1.5),
        (quest_rec.id, self_ring, 0.5),
        (quest_rec.id, scene_ring, 0.5);

    -- Mind-Body - Self primary, Body secondary
    ELSIF quest_rec.slug IN ('yoga-foundations', 'meditation-journey', 'tai-chi-basics', 'breathwork-mastery',
       'mindfulness-practice', 'body-scan-relaxation', 'visualization-training', 'stress-management',
       'emotional-regulation', 'gratitude-practice', 'journaling-for-wellness', 'positive-self-talk',
       'growth-mindset', 'resilience-building', 'anxiety-toolkit') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.5),
        (quest_rec.id, body_ring, 0.5),
        (quest_rec.id, brain_ring, 0.5);

    -- Nutrition - Body, Brain, Bubble
    ELSIF quest_rec.slug IN ('healthy-cooking-basics', 'meal-prep-mastery', 'smoothie-science',
       'reading-nutrition-labels', 'sports-nutrition', 'hydration-habits', 'plant-based-cooking',
       'breakfast-champions', 'snack-smart', 'baking-basics', 'food-safety', 'grocery-shopping-smart',
       'international-healthy-cuisine') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, body_ring, 1.0),
        (quest_rec.id, brain_ring, 0.5),
        (quest_rec.id, bubble_ring, 0.5);

    -- Outdoor - Body, World, Neighborhood
    ELSIF quest_rec.slug IN ('hiking-101', 'camping-skills', 'orienteering', 'nature-awareness',
       'bird-watching', 'fishing-basics', 'kayaking-intro', 'mountain-biking', 'trail-running',
       'outdoor-survival', 'stargazing', 'gardening-basics', 'nature-photography', 'geocaching',
       'snowshoeing', 'cross-country-skiing') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, body_ring, 1.0),
        (quest_rec.id, world_ring, 0.5),
        (quest_rec.id, neighborhood_ring, 0.5);

    -- Sleep & Recovery - Self, Body
    ELSIF quest_rec.slug IN ('sleep-hygiene', 'recovery-techniques', 'digital-detox',
       'morning-routine', 'evening-wind-down') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, body_ring, 1.0);

    -- Dance - Body, Self, Scene
    ELSIF quest_rec.slug IN ('hip-hop-dance', 'breakdancing-basics', 'salsa-dancing', 'contemporary-dance',
       'ballet-basics', 'jazz-dance', 'line-dancing', 'swing-dancing', 'zumba-fitness', 'krumping',
       'popping-locking', 'dance-choreography') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, body_ring, 1.0),
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, scene_ring, 0.5);

    -- Health Literacy - Brain, Self, Community
    ELSE
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.0),
        (quest_rec.id, self_ring, 0.5),
        (quest_rec.id, community_ring, 0.5);
    END IF;
  END LOOP;

  -- TECHNEST QUESTS - Ring Associations
  FOR quest_rec IN
    SELECT q.id, q.slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE p.slug = 'technest'
    AND NOT EXISTS (SELECT 1 FROM public.quest_rings qr WHERE qr.quest_id = q.id)
  LOOP
    -- Coding & Programming - Brain primary, Ether secondary
    IF quest_rec.slug IN ('scratch-projects', 'python-basics', 'javascript-fundamentals', 'html-css-intro',
       'web-design-basics', 'app-development', 'game-development-unity', 'minecraft-modding',
       'roblox-development', 'python-games', 'data-science-intro', 'machine-learning-basics',
       'sql-databases', 'api-integration', 'git-version-control', 'command-line-basics',
       'java-programming', 'c-sharp-basics', 'swift-ios-dev', 'kotlin-android', 'react-basics',
       'node-js-backend', 'algorithms-intro', 'competitive-programming') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.5),
        (quest_rec.id, ether_ring, 1.0),
        (quest_rec.id, self_ring, 0.5);

    -- Robotics & Hardware - Brain, Body (hands-on)
    ELSIF quest_rec.slug IN ('arduino-basics', 'raspberry-pi-projects', 'lego-robotics', 'vex-robotics',
       'drone-programming', '3d-printing-basics', 'electronics-fundamentals', 'soldering-skills',
       'iot-projects', 'wearable-tech', 'cnc-basics', 'laser-cutting', 'pcb-design', 'mechanical-design') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.5),
        (quest_rec.id, body_ring, 0.5),
        (quest_rec.id, ether_ring, 0.5);

    -- Gaming & Esports - Ether, Scene, Brain
    ELSIF quest_rec.slug IN ('esports-fundamentals', 'game-strategy', 'team-communication',
       'streaming-basics', 'content-creation-gaming', 'game-review-writing', 'speedrunning',
       'tournament-organization', 'game-design-theory', 'level-design', 'game-testing',
       'fighting-game-fundamentals', 'fps-mechanics', 'moba-mastery', 'battle-royale-tactics',
       'rhythm-game-skills', 'puzzle-game-logic', 'retro-gaming') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, ether_ring, 1.5),
        (quest_rec.id, scene_ring, 0.5),
        (quest_rec.id, brain_ring, 0.5);

    -- Digital Media & Design - Brain, Self, Ether
    ELSIF quest_rec.slug IN ('digital-art-basics', 'photo-editing', 'vector-graphics', 'ui-ux-design',
       'motion-graphics', '3d-modeling', 'character-design', 'pixel-art', 'logo-design',
       'typography', 'color-theory', 'digital-illustration') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.0),
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, ether_ring, 0.5);

    -- Cybersecurity - Brain, Ether, World
    ELSIF quest_rec.slug IN ('cybersecurity-basics', 'ethical-hacking', 'network-fundamentals',
       'linux-basics', 'cloud-computing', 'computer-building', 'troubleshooting',
       'password-security', 'privacy-protection', 'phishing-awareness') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.5),
        (quest_rec.id, ether_ring, 0.5),
        (quest_rec.id, world_ring, 0.5);

    -- AI & Emerging Tech - Brain, Ether, World
    ELSIF quest_rec.slug IN ('ai-tools-intro', 'prompt-engineering', 'ai-art-generation', 'chatbot-building',
       'vr-development', 'ar-basics', 'blockchain-intro', 'neural-networks', 'computer-vision',
       'nlp-basics', 'quantum-computing-intro') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.5),
        (quest_rec.id, ether_ring, 1.0),
        (quest_rec.id, world_ring, 0.5);

    -- Media Production - Ether, Scene, Self
    ELSE
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, ether_ring, 1.0),
        (quest_rec.id, scene_ring, 0.5),
        (quest_rec.id, self_ring, 0.5);
    END IF;
  END LOOP;

  -- CREATIVE QUESTS - Ring Associations
  FOR quest_rec IN
    SELECT q.id, q.slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE p.slug = 'creative'
    AND NOT EXISTS (SELECT 1 FROM public.quest_rings qr WHERE qr.quest_id = q.id)
  LOOP
    -- Visual Arts - Self primary, Brain secondary
    IF quest_rec.slug IN ('drawing-fundamentals', 'portrait-drawing', 'figure-drawing', 'perspective-drawing',
       'charcoal-art', 'ink-illustration', 'watercolor-painting', 'acrylic-painting', 'oil-painting-basics',
       'abstract-art', 'still-life', 'landscape-painting', 'mixed-media', 'collage-art',
       'printmaking-basics', 'screen-printing', 'comic-art', 'manga-drawing', 'caricature', 'mural-painting') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.5),
        (quest_rec.id, brain_ring, 0.5),
        (quest_rec.id, scene_ring, 0.5);

    -- Sculpture & 3D - Self, Body, Brain
    ELSIF quest_rec.slug IN ('clay-sculpture', 'pottery-wheel', 'wire-sculpture', 'paper-sculpture',
       'origami', 'papier-mache', 'woodworking-basics', 'woodcarving', 'assemblage-art') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, body_ring, 0.5),
        (quest_rec.id, brain_ring, 0.5);

    -- Music - Self, Brain, Scene
    ELSIF quest_rec.slug IN ('guitar-basics', 'ukulele-intro', 'piano-fundamentals', 'drum-basics',
       'bass-guitar', 'violin-intro', 'singing-basics', 'songwriting', 'music-theory', 'beat-making',
       'electronic-music', 'djing-basics', 'music-recording', 'band-formation', 'jazz-improvisation',
       'classical-music-appreciation', 'rap-writing', 'harmonica-basics', 'beatboxing', 'music-mixing') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, brain_ring, 0.5),
        (quest_rec.id, scene_ring, 0.5);

    -- Film & Photography - Self, Ether, Scene
    ELSIF quest_rec.slug IN ('photography-basics', 'portrait-photography', 'street-photography',
       'product-photography', 'film-photography', 'mobile-photography', 'filmmaking-basics',
       'documentary-filmmaking', 'music-video-production', 'screenwriting', 'directing-basics',
       'cinematography', 'stop-motion', 'animation-basics') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, ether_ring, 0.5),
        (quest_rec.id, scene_ring, 0.5);

    -- Writing - Self, Brain, World
    ELSIF quest_rec.slug IN ('creative-writing', 'poetry-writing', 'short-story', 'novel-writing',
       'playwriting', 'journalism', 'blogging', 'memoir-writing', 'comedy-writing', 'spoken-word',
       'zine-making') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.5),
        (quest_rec.id, brain_ring, 0.5),
        (quest_rec.id, world_ring, 0.5);

    -- Theater - Self, Scene, Body
    ELSIF quest_rec.slug IN ('acting-basics', 'improvisation', 'monologue-prep', 'scene-study',
       'musical-theater', 'stage-combat', 'puppetry', 'clowning', 'stage-makeup', 'costume-design',
       'set-design', 'lighting-design', 'sound-design', 'stage-management', 'voice-acting', 'stand-up-comedy') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, scene_ring, 1.0),
        (quest_rec.id, body_ring, 0.5);

    -- Crafts & Fashion - Self, Body, Bubble
    ELSE
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, body_ring, 0.5),
        (quest_rec.id, bubble_ring, 0.5);
    END IF;
  END LOOP;

  -- CIVIC QUESTS - Ring Associations
  FOR quest_rec IN
    SELECT q.id, q.slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE p.slug = 'civic'
    AND NOT EXISTS (SELECT 1 FROM public.quest_rings qr WHERE qr.quest_id = q.id)
  LOOP
    -- Leadership - Self, Scene, Community
    IF quest_rec.slug IN ('youth-leadership', 'public-speaking', 'team-leadership', 'project-management',
       'event-planning', 'meeting-facilitation', 'conflict-resolution', 'peer-mentoring',
       'coaching-basics', 'networking-skills', 'decision-making', 'ethical-leadership', 'servant-leadership') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, scene_ring, 0.5),
        (quest_rec.id, community_ring, 1.0);

    -- Civic Engagement - Community, Neighborhood, World
    ELSIF quest_rec.slug IN ('local-government', 'civic-processes', 'community-organizing', 'advocacy-skills',
       'petition-campaigns', 'youth-council', 'city-council-engagement', 'voter-registration',
       'political-awareness', 'campaign-volunteering', 'mock-trial', 'debate-club', 'model-un') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, community_ring, 1.5),
        (quest_rec.id, neighborhood_ring, 0.5),
        (quest_rec.id, world_ring, 0.5);

    -- Community Service - Community, Neighborhood, Self
    ELSIF quest_rec.slug IN ('food-bank-service', 'homeless-outreach', 'animal-shelter-volunteer',
       'hospital-volunteer', 'senior-center-service', 'tutoring-program', 'library-volunteer',
       'park-cleanup', 'trail-maintenance', 'community-garden', 'habitat-building', 'disaster-relief',
       'blood-drive-support', 'clothing-drive', 'toy-drive', 'meals-on-wheels', 'hospice-support',
       'refugee-support') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, community_ring, 1.5),
        (quest_rec.id, neighborhood_ring, 0.5),
        (quest_rec.id, self_ring, 0.5);

    -- Environmental - World, Neighborhood, Community
    ELSIF quest_rec.slug IN ('environmental-awareness', 'recycling-program', 'composting', 'tree-planting',
       'water-conservation', 'energy-audit', 'climate-action', 'wildlife-conservation', 'beach-cleanup',
       'sustainable-living', 'native-plants', 'pollinator-gardens', 'environmental-education',
       'upcycling', 'zero-waste') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, world_ring, 1.5),
        (quest_rec.id, neighborhood_ring, 0.5),
        (quest_rec.id, community_ring, 0.5);

    -- Social Justice - World, Community, Self
    ELSIF quest_rec.slug IN ('social-justice-intro', 'anti-racism', 'lgbtq-allyship', 'disability-advocacy',
       'gender-equality', 'immigration-awareness', 'poverty-awareness', 'food-justice', 'housing-justice',
       'criminal-justice-reform', 'human-rights', 'mental-health-advocacy') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, world_ring, 1.0),
        (quest_rec.id, community_ring, 1.0),
        (quest_rec.id, self_ring, 0.5);

    -- Entrepreneurship - Brain, Self, Community
    ELSIF quest_rec.slug IN ('entrepreneurship-basics', 'business-plan', 'social-enterprise', 'fundraising',
       'grant-writing', 'nonprofit-basics', 'financial-literacy', 'budgeting-basics', 'investing-intro',
       'marketing-basics') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, brain_ring, 1.0),
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, community_ring, 0.5);

    -- Communication - Self, Scene, World
    ELSIF quest_rec.slug IN ('effective-communication', 'active-listening', 'persuasion-skills',
       'storytelling-for-change', 'media-literacy', 'digital-citizenship', 'interview-skills',
       'resume-building', 'email-etiquette', 'presentation-skills') THEN
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, self_ring, 1.0),
        (quest_rec.id, scene_ring, 0.5),
        (quest_rec.id, world_ring, 0.5);

    -- Global Awareness - World, Brain, Community
    ELSE
      INSERT INTO public.quest_rings (quest_id, ring_id, weight) VALUES
        (quest_rec.id, world_ring, 1.5),
        (quest_rec.id, brain_ring, 0.5),
        (quest_rec.id, community_ring, 0.5);
    END IF;
  END LOOP;

END $$;

-- ==========================================
-- ADD QUEST VERSIONS WITH HOMAGO CONFIG
-- ==========================================

DO $$
DECLARE
  quest_rec RECORD;
  pillar_slug TEXT;
  homago_config JSONB;
BEGIN
  FOR quest_rec IN
    SELECT q.id, q.slug, q.title, p.slug as pillar_slug
    FROM public.quests q
    JOIN public.pillars p ON q.pillar_id = p.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.quest_versions qv WHERE qv.quest_id = q.id
    )
  LOOP
    -- Generate HOMAGO config based on pillar
    CASE quest_rec.pillar_slug
      WHEN 'wellness' THEN
        homago_config := jsonb_build_object(
          'hanging_out', jsonb_build_object(
            'hook_type', 'demo',
            'prompt', 'Watch and observe - what catches your attention?'
          ),
          'messing_around', jsonb_build_object(
            'activities', ARRAY['Practice drills', 'Partner work', 'Free exploration']
          ),
          'geeking_out', jsonb_build_object(
            'boss_challenge', 'Demonstrate your mastery in the final challenge'
          )
        );
      WHEN 'technest' THEN
        homago_config := jsonb_build_object(
          'hanging_out', jsonb_build_object(
            'hook_type', 'demo',
            'prompt', 'See what''s possible - watch a live demonstration'
          ),
          'messing_around', jsonb_build_object(
            'activities', ARRAY['Guided tutorials', 'Small projects', 'Experimentation']
          ),
          'geeking_out', jsonb_build_object(
            'boss_challenge', 'Build and present your final project'
          )
        );
      WHEN 'creative' THEN
        homago_config := jsonb_build_object(
          'hanging_out', jsonb_build_object(
            'hook_type', 'gallery',
            'prompt', 'Explore examples and find inspiration'
          ),
          'messing_around', jsonb_build_object(
            'activities', ARRAY['Technique practice', 'Style exploration', 'Sketching and drafting']
          ),
          'geeking_out', jsonb_build_object(
            'boss_challenge', 'Create a portfolio-worthy piece'
          )
        );
      WHEN 'civic' THEN
        homago_config := jsonb_build_object(
          'hanging_out', jsonb_build_object(
            'hook_type', 'discussion',
            'prompt', 'What matters to you? What would you change?'
          ),
          'messing_around', jsonb_build_object(
            'activities', ARRAY['Research', 'Planning', 'Small actions']
          ),
          'geeking_out', jsonb_build_object(
            'boss_challenge', 'Lead a project and document your impact'
          )
        );
      ELSE
        homago_config := '{}'::jsonb;
    END CASE;

    INSERT INTO public.quest_versions (quest_id, version_number, homago_config, is_current)
    VALUES (quest_rec.id, 1, homago_config, true);

  END LOOP;
END $$;
