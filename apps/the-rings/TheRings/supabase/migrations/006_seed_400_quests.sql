-- ==========================================
-- 400+ QUEST EXPERIENCES SEED DATA
-- ==========================================
-- 100+ quests per pillar (Wellness, TechNest, Creative, Civic)

-- ==========================================
-- WELLNESS PILLAR (100+ Quests)
-- ==========================================

DO $$
DECLARE
  site_id_val UUID;
  pillar_id_val UUID;
  self_ring UUID;
  body_ring UUID;
  brain_ring UUID;
  bubble_ring UUID;
  scene_ring UUID;
  neighborhood_ring UUID;
  community_ring UUID;
  world_ring UUID;
  ether_ring UUID;
  quest_id_val UUID;
  i INT;
BEGIN
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO pillar_id_val FROM public.pillars WHERE slug = 'wellness';
  SELECT id INTO self_ring FROM public.rings WHERE slug = 'self';
  SELECT id INTO body_ring FROM public.rings WHERE slug = 'body';
  SELECT id INTO brain_ring FROM public.rings WHERE slug = 'brain';
  SELECT id INTO bubble_ring FROM public.rings WHERE slug = 'bubble';
  SELECT id INTO scene_ring FROM public.rings WHERE slug = 'scene';
  SELECT id INTO neighborhood_ring FROM public.rings WHERE slug = 'neighborhood';
  SELECT id INTO community_ring FROM public.rings WHERE slug = 'community';
  SELECT id INTO world_ring FROM public.rings WHERE slug = 'world';
  SELECT id INTO ether_ring FROM public.rings WHERE slug = 'ether';

  -- FITNESS & SPORTS
  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, difficulty, estimated_weeks, is_active) VALUES
    (site_id_val, pillar_id_val, 'jump-rope-master', 'Jump Rope Master', 'Master jump rope techniques from basic to advanced tricks', 2, 4, true),
    (site_id_val, pillar_id_val, 'basketball-fundamentals', 'Basketball Fundamentals', 'Learn dribbling, shooting, and team play basics', 2, 6, true),
    (site_id_val, pillar_id_val, 'soccer-skills', 'Soccer Skills', 'Develop footwork, passing, and game strategy', 2, 6, true),
    (site_id_val, pillar_id_val, 'volleyball-basics', 'Volleyball Basics', 'Serve, set, spike - learn the fundamentals', 2, 4, true),
    (site_id_val, pillar_id_val, 'tennis-intro', 'Tennis Introduction', 'Forehand, backhand, and court strategy', 2, 6, true),
    (site_id_val, pillar_id_val, 'swimming-strokes', 'Swimming Strokes', 'Master freestyle, backstroke, breaststroke, and butterfly', 3, 6, true),
    (site_id_val, pillar_id_val, 'track-and-field', 'Track & Field', 'Running, jumping, and throwing events', 2, 6, true),
    (site_id_val, pillar_id_val, 'weightlifting-101', 'Weightlifting 101', 'Safe and effective strength training basics', 3, 6, true),
    (site_id_val, pillar_id_val, 'flexibility-flow', 'Flexibility Flow', 'Improve range of motion and prevent injury', 1, 4, true),
    (site_id_val, pillar_id_val, 'calisthenics-journey', 'Calisthenics Journey', 'Bodyweight exercises from pushups to muscle-ups', 3, 8, true),
    (site_id_val, pillar_id_val, 'martial-arts-intro', 'Martial Arts Intro', 'Basic stances, strikes, and self-defense', 2, 6, true),
    (site_id_val, pillar_id_val, 'wrestling-basics', 'Wrestling Basics', 'Takedowns, escapes, and mat awareness', 3, 6, true),
    (site_id_val, pillar_id_val, 'jiu-jitsu-foundations', 'Jiu-Jitsu Foundations', 'Ground work and submission basics', 3, 8, true),
    (site_id_val, pillar_id_val, 'kickboxing-combos', 'Kickboxing Combos', 'Punches, kicks, and combinations', 3, 6, true),
    (site_id_val, pillar_id_val, 'parkour-basics', 'Parkour Basics', 'Safe movement through urban environments', 3, 6, true),
    (site_id_val, pillar_id_val, 'skateboarding-start', 'Skateboarding Start', 'Balance, pushing, and basic tricks', 2, 6, true),
    (site_id_val, pillar_id_val, 'bmx-riding', 'BMX Riding', 'Bike control and beginner tricks', 3, 6, true),
    (site_id_val, pillar_id_val, 'rock-climbing-intro', 'Rock Climbing Intro', 'Indoor climbing techniques and safety', 3, 6, true),
    (site_id_val, pillar_id_val, 'disc-golf', 'Disc Golf', 'Throws, course strategy, and etiquette', 1, 4, true),
    (site_id_val, pillar_id_val, 'archery-basics', 'Archery Basics', 'Form, aim, and consistent shooting', 2, 6, true),
    (site_id_val, pillar_id_val, 'golf-fundamentals', 'Golf Fundamentals', 'Grip, stance, and swing basics', 2, 6, true),
    (site_id_val, pillar_id_val, 'table-tennis', 'Table Tennis', 'Spins, serves, and rally strategy', 2, 4, true),
    (site_id_val, pillar_id_val, 'badminton-skills', 'Badminton Skills', 'Clears, drops, and smashes', 2, 4, true),
    (site_id_val, pillar_id_val, 'handball-intro', 'Handball Introduction', 'Fast-paced team sport basics', 2, 4, true),
    (site_id_val, pillar_id_val, 'lacrosse-basics', 'Lacrosse Basics', 'Stick skills and game fundamentals', 2, 6, true),
    (site_id_val, pillar_id_val, 'flag-football', 'Flag Football', 'Routes, throws, and defensive play', 2, 6, true),
    (site_id_val, pillar_id_val, 'ultimate-frisbee', 'Ultimate Frisbee', 'Throws, cuts, and spirit of the game', 2, 4, true),
    (site_id_val, pillar_id_val, 'softball-skills', 'Softball Skills', 'Hitting, fielding, and pitching basics', 2, 6, true),
    (site_id_val, pillar_id_val, 'hockey-fundamentals', 'Hockey Fundamentals', 'Skating, stick handling, and shooting', 3, 6, true),
    (site_id_val, pillar_id_val, 'cheerleading-basics', 'Cheerleading Basics', 'Jumps, cheers, and basic stunts', 2, 6, true),

    -- MIND-BODY
    (site_id_val, pillar_id_val, 'yoga-foundations', 'Yoga Foundations', 'Basic poses, breathing, and mindfulness', 1, 6, true),
    (site_id_val, pillar_id_val, 'meditation-journey', 'Meditation Journey', 'Techniques for focus and calm', 1, 4, true),
    (site_id_val, pillar_id_val, 'tai-chi-basics', 'Tai Chi Basics', 'Slow, flowing movements for balance', 1, 6, true),
    (site_id_val, pillar_id_val, 'breathwork-mastery', 'Breathwork Mastery', 'Breathing techniques for energy and calm', 1, 4, true),
    (site_id_val, pillar_id_val, 'mindfulness-practice', 'Mindfulness Practice', 'Present-moment awareness skills', 1, 4, true),
    (site_id_val, pillar_id_val, 'body-scan-relaxation', 'Body Scan Relaxation', 'Progressive relaxation techniques', 1, 3, true),
    (site_id_val, pillar_id_val, 'visualization-training', 'Visualization Training', 'Mental imagery for performance', 2, 4, true),
    (site_id_val, pillar_id_val, 'stress-management', 'Stress Management', 'Healthy coping strategies', 1, 4, true),
    (site_id_val, pillar_id_val, 'emotional-regulation', 'Emotional Regulation', 'Understanding and managing emotions', 2, 6, true),
    (site_id_val, pillar_id_val, 'gratitude-practice', 'Gratitude Practice', 'Daily gratitude habits', 1, 3, true),
    (site_id_val, pillar_id_val, 'journaling-for-wellness', 'Journaling for Wellness', 'Reflective writing for mental health', 1, 4, true),
    (site_id_val, pillar_id_val, 'positive-self-talk', 'Positive Self-Talk', 'Reframe negative thoughts', 1, 4, true),
    (site_id_val, pillar_id_val, 'growth-mindset', 'Growth Mindset', 'Embrace challenges and learn from failure', 1, 4, true),
    (site_id_val, pillar_id_val, 'resilience-building', 'Resilience Building', 'Bounce back from setbacks', 2, 6, true),
    (site_id_val, pillar_id_val, 'anxiety-toolkit', 'Anxiety Toolkit', 'Strategies for managing worry', 2, 6, true),

    -- NUTRITION & COOKING
    (site_id_val, pillar_id_val, 'healthy-cooking-basics', 'Healthy Cooking Basics', 'Simple nutritious meals', 2, 6, true),
    (site_id_val, pillar_id_val, 'meal-prep-mastery', 'Meal Prep Mastery', 'Plan and prepare weekly meals', 2, 4, true),
    (site_id_val, pillar_id_val, 'smoothie-science', 'Smoothie Science', 'Blend nutrition and taste', 1, 3, true),
    (site_id_val, pillar_id_val, 'reading-nutrition-labels', 'Reading Nutrition Labels', 'Understand what you eat', 1, 2, true),
    (site_id_val, pillar_id_val, 'sports-nutrition', 'Sports Nutrition', 'Fuel for athletic performance', 2, 4, true),
    (site_id_val, pillar_id_val, 'hydration-habits', 'Hydration Habits', 'Importance of water intake', 1, 2, true),
    (site_id_val, pillar_id_val, 'plant-based-cooking', 'Plant-Based Cooking', 'Vegetarian and vegan recipes', 2, 6, true),
    (site_id_val, pillar_id_val, 'breakfast-champions', 'Breakfast of Champions', 'Start your day right', 1, 3, true),
    (site_id_val, pillar_id_val, 'snack-smart', 'Snack Smart', 'Healthy snacking choices', 1, 2, true),
    (site_id_val, pillar_id_val, 'baking-basics', 'Baking Basics', 'Healthy baked goods', 2, 4, true),
    (site_id_val, pillar_id_val, 'food-safety', 'Food Safety', 'Kitchen hygiene and safe handling', 1, 2, true),
    (site_id_val, pillar_id_val, 'grocery-shopping-smart', 'Grocery Shopping Smart', 'Budget-friendly healthy shopping', 1, 3, true),
    (site_id_val, pillar_id_val, 'international-healthy-cuisine', 'International Healthy Cuisine', 'Nutritious dishes from around the world', 2, 6, true),

    -- OUTDOOR & ADVENTURE
    (site_id_val, pillar_id_val, 'hiking-101', 'Hiking 101', 'Trail basics and safety', 2, 4, true),
    (site_id_val, pillar_id_val, 'camping-skills', 'Camping Skills', 'Set up camp and outdoor living', 2, 4, true),
    (site_id_val, pillar_id_val, 'orienteering', 'Orienteering', 'Map and compass navigation', 2, 4, true),
    (site_id_val, pillar_id_val, 'nature-awareness', 'Nature Awareness', 'Connect with the natural world', 1, 4, true),
    (site_id_val, pillar_id_val, 'bird-watching', 'Bird Watching', 'Identify local bird species', 1, 4, true),
    (site_id_val, pillar_id_val, 'fishing-basics', 'Fishing Basics', 'Casting, baiting, and catch-and-release', 2, 4, true),
    (site_id_val, pillar_id_val, 'kayaking-intro', 'Kayaking Introduction', 'Paddle strokes and water safety', 2, 4, true),
    (site_id_val, pillar_id_val, 'mountain-biking', 'Mountain Biking', 'Trail riding techniques', 3, 6, true),
    (site_id_val, pillar_id_val, 'trail-running', 'Trail Running', 'Off-road running skills', 2, 4, true),
    (site_id_val, pillar_id_val, 'outdoor-survival', 'Outdoor Survival', 'Basic wilderness skills', 3, 6, true),
    (site_id_val, pillar_id_val, 'stargazing', 'Stargazing', 'Learn constellations and astronomy basics', 1, 4, true),
    (site_id_val, pillar_id_val, 'gardening-basics', 'Gardening Basics', 'Grow your own food', 2, 8, true),
    (site_id_val, pillar_id_val, 'nature-photography', 'Nature Photography', 'Capture the outdoors', 2, 4, true),
    (site_id_val, pillar_id_val, 'geocaching', 'Geocaching', 'GPS treasure hunting', 1, 4, true),
    (site_id_val, pillar_id_val, 'snowshoeing', 'Snowshoeing', 'Winter hiking basics', 2, 4, true),
    (site_id_val, pillar_id_val, 'cross-country-skiing', 'Cross-Country Skiing', 'Nordic skiing fundamentals', 2, 6, true),

    -- SLEEP & RECOVERY
    (site_id_val, pillar_id_val, 'sleep-hygiene', 'Sleep Hygiene', 'Habits for better sleep', 1, 3, true),
    (site_id_val, pillar_id_val, 'recovery-techniques', 'Recovery Techniques', 'Foam rolling and stretching', 1, 3, true),
    (site_id_val, pillar_id_val, 'digital-detox', 'Digital Detox', 'Healthy screen time habits', 1, 2, true),
    (site_id_val, pillar_id_val, 'morning-routine', 'Morning Routine', 'Start each day strong', 1, 3, true),
    (site_id_val, pillar_id_val, 'evening-wind-down', 'Evening Wind-Down', 'Relaxation before bed', 1, 3, true),

    -- DANCE & MOVEMENT
    (site_id_val, pillar_id_val, 'hip-hop-dance', 'Hip-Hop Dance', 'Basic hip-hop moves and combos', 2, 6, true),
    (site_id_val, pillar_id_val, 'breakdancing-basics', 'Breakdancing Basics', 'Toprock, footwork, and freezes', 3, 8, true),
    (site_id_val, pillar_id_val, 'salsa-dancing', 'Salsa Dancing', 'Basic salsa steps and timing', 2, 6, true),
    (site_id_val, pillar_id_val, 'contemporary-dance', 'Contemporary Dance', 'Expressive modern movement', 2, 6, true),
    (site_id_val, pillar_id_val, 'ballet-basics', 'Ballet Basics', 'Foundational ballet positions and moves', 2, 6, true),
    (site_id_val, pillar_id_val, 'jazz-dance', 'Jazz Dance', 'Energy and style in jazz', 2, 6, true),
    (site_id_val, pillar_id_val, 'line-dancing', 'Line Dancing', 'Country and western steps', 1, 4, true),
    (site_id_val, pillar_id_val, 'swing-dancing', 'Swing Dancing', 'Classic swing moves', 2, 6, true),
    (site_id_val, pillar_id_val, 'zumba-fitness', 'Zumba Fitness', 'Dance workout party', 1, 4, true),
    (site_id_val, pillar_id_val, 'krumping', 'Krumping', 'High-energy street dance', 3, 6, true),
    (site_id_val, pillar_id_val, 'popping-locking', 'Popping & Locking', 'Funk style dance techniques', 3, 6, true),
    (site_id_val, pillar_id_val, 'dance-choreography', 'Dance Choreography', 'Create your own routines', 3, 6, true),

    -- HEALTH LITERACY
    (site_id_val, pillar_id_val, 'first-aid-basics', 'First Aid Basics', 'Emergency response skills', 2, 4, true),
    (site_id_val, pillar_id_val, 'cpr-certification', 'CPR Certification', 'Life-saving techniques', 2, 2, true),
    (site_id_val, pillar_id_val, 'body-systems', 'Body Systems', 'How your body works', 1, 4, true),
    (site_id_val, pillar_id_val, 'injury-prevention', 'Injury Prevention', 'Stay safe during activity', 1, 3, true),
    (site_id_val, pillar_id_val, 'mental-health-awareness', 'Mental Health Awareness', 'Recognize and support mental wellness', 2, 4, true),
    (site_id_val, pillar_id_val, 'substance-awareness', 'Substance Awareness', 'Make informed decisions', 2, 4, true),
    (site_id_val, pillar_id_val, 'healthy-relationships', 'Healthy Relationships', 'Communication and boundaries', 2, 6, true),
    (site_id_val, pillar_id_val, 'peer-support', 'Peer Support', 'Help friends in need', 2, 4, true),
    (site_id_val, pillar_id_val, 'goal-setting-wellness', 'Goal Setting for Wellness', 'SMART fitness goals', 1, 3, true),
    (site_id_val, pillar_id_val, 'fitness-tracking', 'Fitness Tracking', 'Monitor your progress', 1, 3, true);

END $$;

-- ==========================================
-- TECHNEST PILLAR (100+ Quests)
-- ==========================================

DO $$
DECLARE
  site_id_val UUID;
  pillar_id_val UUID;
BEGIN
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO pillar_id_val FROM public.pillars WHERE slug = 'technest';

  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, difficulty, estimated_weeks, is_active) VALUES
    -- CODING & PROGRAMMING
    (site_id_val, pillar_id_val, 'scratch-projects', 'Scratch Projects', 'Visual programming with Scratch', 1, 6, true),
    (site_id_val, pillar_id_val, 'python-basics', 'Python Basics', 'Introduction to Python programming', 2, 8, true),
    (site_id_val, pillar_id_val, 'javascript-fundamentals', 'JavaScript Fundamentals', 'Web programming basics', 2, 8, true),
    (site_id_val, pillar_id_val, 'html-css-intro', 'HTML & CSS Introduction', 'Build your first webpage', 1, 4, true),
    (site_id_val, pillar_id_val, 'web-design-basics', 'Web Design Basics', 'Create beautiful websites', 2, 6, true),
    (site_id_val, pillar_id_val, 'app-development', 'App Development', 'Build mobile apps', 3, 8, true),
    (site_id_val, pillar_id_val, 'game-development-unity', 'Game Dev with Unity', 'Create 2D and 3D games', 3, 8, true),
    (site_id_val, pillar_id_val, 'minecraft-modding', 'Minecraft Modding', 'Create Minecraft mods', 2, 6, true),
    (site_id_val, pillar_id_val, 'roblox-development', 'Roblox Development', 'Build Roblox experiences', 2, 6, true),
    (site_id_val, pillar_id_val, 'python-games', 'Python Games', 'Code games with Python', 2, 6, true),
    (site_id_val, pillar_id_val, 'data-science-intro', 'Data Science Introduction', 'Analyze data with Python', 3, 8, true),
    (site_id_val, pillar_id_val, 'machine-learning-basics', 'Machine Learning Basics', 'Train your first AI model', 3, 8, true),
    (site_id_val, pillar_id_val, 'sql-databases', 'SQL & Databases', 'Work with data storage', 2, 6, true),
    (site_id_val, pillar_id_val, 'api-integration', 'API Integration', 'Connect apps and services', 3, 6, true),
    (site_id_val, pillar_id_val, 'git-version-control', 'Git & Version Control', 'Track code changes', 2, 4, true),
    (site_id_val, pillar_id_val, 'command-line-basics', 'Command Line Basics', 'Terminal navigation', 2, 3, true),
    (site_id_val, pillar_id_val, 'java-programming', 'Java Programming', 'Object-oriented basics', 3, 8, true),
    (site_id_val, pillar_id_val, 'c-sharp-basics', 'C# Basics', 'Programming with C#', 3, 8, true),
    (site_id_val, pillar_id_val, 'swift-ios-dev', 'Swift iOS Development', 'Build iPhone apps', 3, 8, true),
    (site_id_val, pillar_id_val, 'kotlin-android', 'Kotlin for Android', 'Android app development', 3, 8, true),
    (site_id_val, pillar_id_val, 'react-basics', 'React Basics', 'Modern web development', 3, 8, true),
    (site_id_val, pillar_id_val, 'node-js-backend', 'Node.js Backend', 'Server-side JavaScript', 3, 8, true),
    (site_id_val, pillar_id_val, 'algorithms-intro', 'Algorithms Introduction', 'Problem-solving patterns', 3, 6, true),
    (site_id_val, pillar_id_val, 'competitive-programming', 'Competitive Programming', 'Code challenges and contests', 3, 8, true),

    -- ROBOTICS & HARDWARE
    (site_id_val, pillar_id_val, 'arduino-basics', 'Arduino Basics', 'Program microcontrollers', 2, 6, true),
    (site_id_val, pillar_id_val, 'raspberry-pi-projects', 'Raspberry Pi Projects', 'Mini computer experiments', 2, 6, true),
    (site_id_val, pillar_id_val, 'lego-robotics', 'LEGO Robotics', 'Build and program LEGO robots', 2, 6, true),
    (site_id_val, pillar_id_val, 'vex-robotics', 'VEX Robotics', 'Competitive robotics building', 3, 8, true),
    (site_id_val, pillar_id_val, 'drone-programming', 'Drone Programming', 'Code autonomous drones', 3, 6, true),
    (site_id_val, pillar_id_val, '3d-printing-basics', '3D Printing Basics', 'Design and print objects', 2, 6, true),
    (site_id_val, pillar_id_val, 'electronics-fundamentals', 'Electronics Fundamentals', 'Circuits and components', 2, 6, true),
    (site_id_val, pillar_id_val, 'soldering-skills', 'Soldering Skills', 'Build electronic circuits', 2, 4, true),
    (site_id_val, pillar_id_val, 'iot-projects', 'IoT Projects', 'Internet of Things devices', 3, 6, true),
    (site_id_val, pillar_id_val, 'wearable-tech', 'Wearable Technology', 'Build smart wearables', 3, 6, true),
    (site_id_val, pillar_id_val, 'cnc-basics', 'CNC Basics', 'Computer-controlled fabrication', 3, 6, true),
    (site_id_val, pillar_id_val, 'laser-cutting', 'Laser Cutting', 'Precision cutting projects', 2, 4, true),
    (site_id_val, pillar_id_val, 'pcb-design', 'PCB Design', 'Create circuit boards', 3, 6, true),
    (site_id_val, pillar_id_val, 'mechanical-design', 'Mechanical Design', 'CAD and engineering', 3, 8, true),

    -- GAMING & ESPORTS
    (site_id_val, pillar_id_val, 'esports-fundamentals', 'Esports Fundamentals', 'Competitive gaming basics', 2, 6, true),
    (site_id_val, pillar_id_val, 'game-strategy', 'Game Strategy', 'Think like a pro gamer', 2, 4, true),
    (site_id_val, pillar_id_val, 'team-communication', 'Team Communication', 'Coordinate with your squad', 2, 4, true),
    (site_id_val, pillar_id_val, 'streaming-basics', 'Streaming Basics', 'Start your streaming journey', 2, 4, true),
    (site_id_val, pillar_id_val, 'content-creation-gaming', 'Gaming Content Creation', 'YouTube and TikTok for gamers', 2, 6, true),
    (site_id_val, pillar_id_val, 'game-review-writing', 'Game Review Writing', 'Critique games professionally', 2, 4, true),
    (site_id_val, pillar_id_val, 'speedrunning', 'Speedrunning', 'Master games at high speed', 3, 8, true),
    (site_id_val, pillar_id_val, 'tournament-organization', 'Tournament Organization', 'Run gaming events', 2, 6, true),
    (site_id_val, pillar_id_val, 'game-design-theory', 'Game Design Theory', 'What makes games fun', 2, 6, true),
    (site_id_val, pillar_id_val, 'level-design', 'Level Design', 'Create engaging game levels', 3, 6, true),
    (site_id_val, pillar_id_val, 'game-testing', 'Game Testing', 'Find and report bugs', 2, 4, true),
    (site_id_val, pillar_id_val, 'fighting-game-fundamentals', 'Fighting Game Fundamentals', 'Combos and frame data', 3, 6, true),
    (site_id_val, pillar_id_val, 'fps-mechanics', 'FPS Mechanics', 'Aim training and positioning', 2, 6, true),
    (site_id_val, pillar_id_val, 'moba-mastery', 'MOBA Mastery', 'Strategic team gameplay', 3, 8, true),
    (site_id_val, pillar_id_val, 'battle-royale-tactics', 'Battle Royale Tactics', 'Survival and combat strategy', 2, 6, true),
    (site_id_val, pillar_id_val, 'rhythm-game-skills', 'Rhythm Game Skills', 'Timing and coordination', 2, 4, true),
    (site_id_val, pillar_id_val, 'puzzle-game-logic', 'Puzzle Game Logic', 'Problem-solving in games', 2, 4, true),
    (site_id_val, pillar_id_val, 'retro-gaming', 'Retro Gaming', 'Classic games and history', 1, 4, true),

    -- DIGITAL MEDIA & DESIGN
    (site_id_val, pillar_id_val, 'digital-art-basics', 'Digital Art Basics', 'Draw with tablets and software', 2, 6, true),
    (site_id_val, pillar_id_val, 'photo-editing', 'Photo Editing', 'Professional photo manipulation', 2, 6, true),
    (site_id_val, pillar_id_val, 'vector-graphics', 'Vector Graphics', 'Create scalable illustrations', 2, 6, true),
    (site_id_val, pillar_id_val, 'ui-ux-design', 'UI/UX Design', 'Design user interfaces', 3, 8, true),
    (site_id_val, pillar_id_val, 'motion-graphics', 'Motion Graphics', 'Animated visual effects', 3, 8, true),
    (site_id_val, pillar_id_val, '3d-modeling', '3D Modeling', 'Create 3D objects and characters', 3, 8, true),
    (site_id_val, pillar_id_val, 'character-design', 'Character Design', 'Create memorable characters', 2, 6, true),
    (site_id_val, pillar_id_val, 'pixel-art', 'Pixel Art', 'Retro-style digital art', 2, 4, true),
    (site_id_val, pillar_id_val, 'logo-design', 'Logo Design', 'Brand identity basics', 2, 4, true),
    (site_id_val, pillar_id_val, 'typography', 'Typography', 'The art of text design', 2, 4, true),
    (site_id_val, pillar_id_val, 'color-theory', 'Color Theory', 'Use color effectively', 1, 3, true),
    (site_id_val, pillar_id_val, 'digital-illustration', 'Digital Illustration', 'Professional illustration techniques', 3, 8, true),

    -- CYBERSECURITY & IT
    (site_id_val, pillar_id_val, 'cybersecurity-basics', 'Cybersecurity Basics', 'Stay safe online', 2, 4, true),
    (site_id_val, pillar_id_val, 'ethical-hacking', 'Ethical Hacking', 'Learn security through offense', 3, 8, true),
    (site_id_val, pillar_id_val, 'network-fundamentals', 'Network Fundamentals', 'How the internet works', 2, 6, true),
    (site_id_val, pillar_id_val, 'linux-basics', 'Linux Basics', 'Open-source operating system', 2, 6, true),
    (site_id_val, pillar_id_val, 'cloud-computing', 'Cloud Computing', 'AWS, Azure, and GCP basics', 3, 6, true),
    (site_id_val, pillar_id_val, 'computer-building', 'Computer Building', 'Assemble your own PC', 2, 4, true),
    (site_id_val, pillar_id_val, 'troubleshooting', 'Troubleshooting', 'Diagnose tech problems', 2, 4, true),
    (site_id_val, pillar_id_val, 'password-security', 'Password Security', 'Protect your accounts', 1, 2, true),
    (site_id_val, pillar_id_val, 'privacy-protection', 'Privacy Protection', 'Control your digital footprint', 1, 3, true),
    (site_id_val, pillar_id_val, 'phishing-awareness', 'Phishing Awareness', 'Recognize online scams', 1, 2, true),

    -- AI & EMERGING TECH
    (site_id_val, pillar_id_val, 'ai-tools-intro', 'AI Tools Introduction', 'Use AI assistants effectively', 1, 4, true),
    (site_id_val, pillar_id_val, 'prompt-engineering', 'Prompt Engineering', 'Get better AI results', 2, 4, true),
    (site_id_val, pillar_id_val, 'ai-art-generation', 'AI Art Generation', 'Create with AI image tools', 2, 4, true),
    (site_id_val, pillar_id_val, 'chatbot-building', 'Chatbot Building', 'Create conversational AI', 3, 6, true),
    (site_id_val, pillar_id_val, 'vr-development', 'VR Development', 'Build virtual reality experiences', 3, 8, true),
    (site_id_val, pillar_id_val, 'ar-basics', 'AR Basics', 'Augmented reality projects', 3, 6, true),
    (site_id_val, pillar_id_val, 'blockchain-intro', 'Blockchain Introduction', 'Understand decentralized tech', 3, 6, true),
    (site_id_val, pillar_id_val, 'neural-networks', 'Neural Networks', 'Deep learning fundamentals', 3, 8, true),
    (site_id_val, pillar_id_val, 'computer-vision', 'Computer Vision', 'Image recognition projects', 3, 8, true),
    (site_id_val, pillar_id_val, 'nlp-basics', 'NLP Basics', 'Natural language processing', 3, 8, true),
    (site_id_val, pillar_id_val, 'quantum-computing-intro', 'Quantum Computing Introduction', 'Next-gen computing concepts', 3, 6, true),

    -- MEDIA PRODUCTION
    (site_id_val, pillar_id_val, 'video-editing', 'Video Editing', 'Edit professional videos', 2, 6, true),
    (site_id_val, pillar_id_val, 'podcasting', 'Podcasting', 'Start your own podcast', 2, 6, true),
    (site_id_val, pillar_id_val, 'audio-editing', 'Audio Editing', 'Clean and enhance audio', 2, 4, true),
    (site_id_val, pillar_id_val, 'youtube-creation', 'YouTube Creation', 'Build a YouTube channel', 2, 6, true),
    (site_id_val, pillar_id_val, 'tiktok-content', 'TikTok Content', 'Short-form video creation', 1, 4, true),
    (site_id_val, pillar_id_val, 'live-streaming', 'Live Streaming', 'Broadcast in real-time', 2, 4, true),
    (site_id_val, pillar_id_val, 'obs-studio', 'OBS Studio', 'Streaming and recording software', 2, 4, true),
    (site_id_val, pillar_id_val, 'green-screen', 'Green Screen', 'Chroma key techniques', 2, 4, true),
    (site_id_val, pillar_id_val, 'thumbnail-design', 'Thumbnail Design', 'Click-worthy images', 1, 3, true),
    (site_id_val, pillar_id_val, 'social-media-management', 'Social Media Management', 'Build online presence', 2, 6, true);

END $$;

-- ==========================================
-- CREATIVE PILLAR (100+ Quests)
-- ==========================================

DO $$
DECLARE
  site_id_val UUID;
  pillar_id_val UUID;
BEGIN
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO pillar_id_val FROM public.pillars WHERE slug = 'creative';

  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, difficulty, estimated_weeks, is_active) VALUES
    -- VISUAL ARTS
    (site_id_val, pillar_id_val, 'drawing-fundamentals', 'Drawing Fundamentals', 'Pencil techniques and basics', 1, 6, true),
    (site_id_val, pillar_id_val, 'portrait-drawing', 'Portrait Drawing', 'Capture the human face', 3, 8, true),
    (site_id_val, pillar_id_val, 'figure-drawing', 'Figure Drawing', 'Draw the human body', 3, 8, true),
    (site_id_val, pillar_id_val, 'perspective-drawing', 'Perspective Drawing', 'Create depth and space', 2, 6, true),
    (site_id_val, pillar_id_val, 'charcoal-art', 'Charcoal Art', 'Bold, expressive drawings', 2, 4, true),
    (site_id_val, pillar_id_val, 'ink-illustration', 'Ink Illustration', 'Pen and ink techniques', 2, 6, true),
    (site_id_val, pillar_id_val, 'watercolor-painting', 'Watercolor Painting', 'Transparent painting medium', 2, 6, true),
    (site_id_val, pillar_id_val, 'acrylic-painting', 'Acrylic Painting', 'Versatile painting techniques', 2, 6, true),
    (site_id_val, pillar_id_val, 'oil-painting-basics', 'Oil Painting Basics', 'Classic painting medium', 3, 8, true),
    (site_id_val, pillar_id_val, 'abstract-art', 'Abstract Art', 'Express without representation', 2, 4, true),
    (site_id_val, pillar_id_val, 'still-life', 'Still Life', 'Paint objects from life', 2, 6, true),
    (site_id_val, pillar_id_val, 'landscape-painting', 'Landscape Painting', 'Capture nature on canvas', 2, 6, true),
    (site_id_val, pillar_id_val, 'mixed-media', 'Mixed Media', 'Combine multiple materials', 2, 6, true),
    (site_id_val, pillar_id_val, 'collage-art', 'Collage Art', 'Create with found materials', 1, 4, true),
    (site_id_val, pillar_id_val, 'printmaking-basics', 'Printmaking Basics', 'Linocut and monoprints', 2, 6, true),
    (site_id_val, pillar_id_val, 'screen-printing', 'Screen Printing', 'Print on fabric and paper', 2, 6, true),
    (site_id_val, pillar_id_val, 'comic-art', 'Comic Art', 'Sequential art storytelling', 2, 8, true),
    (site_id_val, pillar_id_val, 'manga-drawing', 'Manga Drawing', 'Japanese comic style', 2, 6, true),
    (site_id_val, pillar_id_val, 'caricature', 'Caricature', 'Exaggerated portraits', 2, 4, true),
    (site_id_val, pillar_id_val, 'mural-painting', 'Mural Painting', 'Large-scale wall art', 3, 8, true),

    -- SCULPTURE & 3D
    (site_id_val, pillar_id_val, 'clay-sculpture', 'Clay Sculpture', 'Hand-building with clay', 2, 6, true),
    (site_id_val, pillar_id_val, 'pottery-wheel', 'Pottery Wheel', 'Throw pots on the wheel', 3, 8, true),
    (site_id_val, pillar_id_val, 'wire-sculpture', 'Wire Sculpture', 'Create with wire and metal', 2, 4, true),
    (site_id_val, pillar_id_val, 'paper-sculpture', 'Paper Sculpture', '3D paper art', 2, 4, true),
    (site_id_val, pillar_id_val, 'origami', 'Origami', 'Japanese paper folding', 1, 4, true),
    (site_id_val, pillar_id_val, 'papier-mache', 'Papier-Mâché', 'Sculpt with paper and paste', 1, 4, true),
    (site_id_val, pillar_id_val, 'woodworking-basics', 'Woodworking Basics', 'Basic carpentry skills', 2, 6, true),
    (site_id_val, pillar_id_val, 'woodcarving', 'Woodcarving', 'Carve wood sculptures', 3, 8, true),
    (site_id_val, pillar_id_val, 'assemblage-art', 'Assemblage Art', 'Found object sculpture', 2, 4, true),

    -- MUSIC
    (site_id_val, pillar_id_val, 'guitar-basics', 'Guitar Basics', 'Chords and strumming', 2, 8, true),
    (site_id_val, pillar_id_val, 'ukulele-intro', 'Ukulele Introduction', 'Easy string instrument', 1, 4, true),
    (site_id_val, pillar_id_val, 'piano-fundamentals', 'Piano Fundamentals', 'Keys and music reading', 2, 8, true),
    (site_id_val, pillar_id_val, 'drum-basics', 'Drum Basics', 'Rhythm and coordination', 2, 6, true),
    (site_id_val, pillar_id_val, 'bass-guitar', 'Bass Guitar', 'Hold down the low end', 2, 8, true),
    (site_id_val, pillar_id_val, 'violin-intro', 'Violin Introduction', 'Classical string instrument', 3, 8, true),
    (site_id_val, pillar_id_val, 'singing-basics', 'Singing Basics', 'Voice training fundamentals', 2, 6, true),
    (site_id_val, pillar_id_val, 'songwriting', 'Songwriting', 'Write original songs', 2, 6, true),
    (site_id_val, pillar_id_val, 'music-theory', 'Music Theory', 'Understand how music works', 2, 8, true),
    (site_id_val, pillar_id_val, 'beat-making', 'Beat Making', 'Produce hip-hop beats', 2, 6, true),
    (site_id_val, pillar_id_val, 'electronic-music', 'Electronic Music', 'Synthesizers and production', 3, 8, true),
    (site_id_val, pillar_id_val, 'djing-basics', 'DJing Basics', 'Mix and blend tracks', 2, 6, true),
    (site_id_val, pillar_id_val, 'music-recording', 'Music Recording', 'Home studio basics', 2, 6, true),
    (site_id_val, pillar_id_val, 'band-formation', 'Band Formation', 'Start a band', 2, 6, true),
    (site_id_val, pillar_id_val, 'jazz-improvisation', 'Jazz Improvisation', 'Spontaneous musical creation', 3, 8, true),
    (site_id_val, pillar_id_val, 'classical-music-appreciation', 'Classical Music Appreciation', 'Listen and understand classical', 1, 4, true),
    (site_id_val, pillar_id_val, 'rap-writing', 'Rap Writing', 'Lyrical composition', 2, 6, true),
    (site_id_val, pillar_id_val, 'harmonica-basics', 'Harmonica Basics', 'Pocket-sized instrument', 1, 4, true),
    (site_id_val, pillar_id_val, 'beatboxing', 'Beatboxing', 'Vocal percussion', 2, 6, true),
    (site_id_val, pillar_id_val, 'music-mixing', 'Music Mixing', 'Balance tracks professionally', 3, 8, true),

    -- FILM & PHOTOGRAPHY
    (site_id_val, pillar_id_val, 'photography-basics', 'Photography Basics', 'Camera and composition', 2, 6, true),
    (site_id_val, pillar_id_val, 'portrait-photography', 'Portrait Photography', 'Photograph people', 2, 6, true),
    (site_id_val, pillar_id_val, 'street-photography', 'Street Photography', 'Capture urban life', 2, 6, true),
    (site_id_val, pillar_id_val, 'product-photography', 'Product Photography', 'Commercial photo skills', 2, 6, true),
    (site_id_val, pillar_id_val, 'film-photography', 'Film Photography', 'Shoot on analog film', 2, 6, true),
    (site_id_val, pillar_id_val, 'mobile-photography', 'Mobile Photography', 'Phone camera mastery', 1, 4, true),
    (site_id_val, pillar_id_val, 'filmmaking-basics', 'Filmmaking Basics', 'Create short films', 2, 8, true),
    (site_id_val, pillar_id_val, 'documentary-filmmaking', 'Documentary Filmmaking', 'Tell true stories', 3, 8, true),
    (site_id_val, pillar_id_val, 'music-video-production', 'Music Video Production', 'Visual storytelling for music', 3, 8, true),
    (site_id_val, pillar_id_val, 'screenwriting', 'Screenwriting', 'Write for film and TV', 3, 8, true),
    (site_id_val, pillar_id_val, 'directing-basics', 'Directing Basics', 'Lead a production', 3, 8, true),
    (site_id_val, pillar_id_val, 'cinematography', 'Cinematography', 'Visual language of film', 3, 8, true),
    (site_id_val, pillar_id_val, 'stop-motion', 'Stop Motion Animation', 'Frame-by-frame animation', 2, 6, true),
    (site_id_val, pillar_id_val, 'animation-basics', 'Animation Basics', '2D animation principles', 3, 8, true),

    -- WRITING
    (site_id_val, pillar_id_val, 'creative-writing', 'Creative Writing', 'Fiction and storytelling', 2, 6, true),
    (site_id_val, pillar_id_val, 'poetry-writing', 'Poetry Writing', 'Express through verse', 2, 6, true),
    (site_id_val, pillar_id_val, 'short-story', 'Short Story Writing', 'Craft complete narratives', 2, 6, true),
    (site_id_val, pillar_id_val, 'novel-writing', 'Novel Writing', 'Long-form fiction', 3, 12, true),
    (site_id_val, pillar_id_val, 'playwriting', 'Playwriting', 'Write for the stage', 3, 8, true),
    (site_id_val, pillar_id_val, 'journalism', 'Journalism', 'News and feature writing', 2, 6, true),
    (site_id_val, pillar_id_val, 'blogging', 'Blogging', 'Write for the web', 1, 4, true),
    (site_id_val, pillar_id_val, 'memoir-writing', 'Memoir Writing', 'Personal narrative', 2, 6, true),
    (site_id_val, pillar_id_val, 'comedy-writing', 'Comedy Writing', 'Write humor and jokes', 2, 6, true),
    (site_id_val, pillar_id_val, 'spoken-word', 'Spoken Word', 'Performance poetry', 2, 6, true),
    (site_id_val, pillar_id_val, 'zine-making', 'Zine Making', 'DIY publications', 1, 4, true),

    -- THEATER & PERFORMANCE
    (site_id_val, pillar_id_val, 'acting-basics', 'Acting Basics', 'Theater fundamentals', 2, 6, true),
    (site_id_val, pillar_id_val, 'improvisation', 'Improvisation', 'Think on your feet', 2, 4, true),
    (site_id_val, pillar_id_val, 'monologue-prep', 'Monologue Preparation', 'Solo performance pieces', 2, 4, true),
    (site_id_val, pillar_id_val, 'scene-study', 'Scene Study', 'Work with scene partners', 2, 6, true),
    (site_id_val, pillar_id_val, 'musical-theater', 'Musical Theater', 'Sing, dance, act', 3, 8, true),
    (site_id_val, pillar_id_val, 'stage-combat', 'Stage Combat', 'Theatrical fighting', 3, 6, true),
    (site_id_val, pillar_id_val, 'puppetry', 'Puppetry', 'Puppet creation and performance', 2, 6, true),
    (site_id_val, pillar_id_val, 'clowning', 'Clowning', 'Physical comedy', 2, 4, true),
    (site_id_val, pillar_id_val, 'stage-makeup', 'Stage Makeup', 'Character transformation', 2, 4, true),
    (site_id_val, pillar_id_val, 'costume-design', 'Costume Design', 'Design for performance', 2, 6, true),
    (site_id_val, pillar_id_val, 'set-design', 'Set Design', 'Create stage environments', 3, 6, true),
    (site_id_val, pillar_id_val, 'lighting-design', 'Lighting Design', 'Light the stage', 2, 6, true),
    (site_id_val, pillar_id_val, 'sound-design', 'Sound Design', 'Audio for theater', 2, 6, true),
    (site_id_val, pillar_id_val, 'stage-management', 'Stage Management', 'Run the show', 2, 6, true),
    (site_id_val, pillar_id_val, 'voice-acting', 'Voice Acting', 'Perform with your voice', 2, 6, true),
    (site_id_val, pillar_id_val, 'stand-up-comedy', 'Stand-Up Comedy', 'Write and perform comedy', 2, 6, true),

    -- CRAFTS & FASHION
    (site_id_val, pillar_id_val, 'sewing-basics', 'Sewing Basics', 'Hand and machine sewing', 2, 6, true),
    (site_id_val, pillar_id_val, 'fashion-design', 'Fashion Design', 'Design clothing', 3, 8, true),
    (site_id_val, pillar_id_val, 'knitting', 'Knitting', 'Create with yarn', 2, 6, true),
    (site_id_val, pillar_id_val, 'crochet', 'Crochet', 'Hook and yarn crafts', 2, 6, true),
    (site_id_val, pillar_id_val, 'embroidery', 'Embroidery', 'Decorative stitching', 2, 4, true),
    (site_id_val, pillar_id_val, 'jewelry-making', 'Jewelry Making', 'Create wearable art', 2, 6, true),
    (site_id_val, pillar_id_val, 'leather-crafting', 'Leather Crafting', 'Work with leather', 2, 6, true),
    (site_id_val, pillar_id_val, 'candle-making', 'Candle Making', 'Create decorative candles', 1, 3, true),
    (site_id_val, pillar_id_val, 'soap-making', 'Soap Making', 'Handcrafted soaps', 1, 3, true),
    (site_id_val, pillar_id_val, 'tie-dye', 'Tie-Dye', 'Fabric dyeing techniques', 1, 2, true),
    (site_id_val, pillar_id_val, 'macrame', 'Macramé', 'Knotted textile art', 2, 4, true),
    (site_id_val, pillar_id_val, 'resin-art', 'Resin Art', 'Epoxy creations', 2, 4, true),
    (site_id_val, pillar_id_val, 'calligraphy', 'Calligraphy', 'Beautiful lettering', 2, 6, true),
    (site_id_val, pillar_id_val, 'bookbinding', 'Bookbinding', 'Create handmade books', 2, 4, true);

END $$;

-- ==========================================
-- CIVIC PILLAR (100+ Quests)
-- ==========================================

DO $$
DECLARE
  site_id_val UUID;
  pillar_id_val UUID;
BEGIN
  SELECT id INTO site_id_val FROM public.sites WHERE slug = 'south-jordan-flc';
  SELECT id INTO pillar_id_val FROM public.pillars WHERE slug = 'civic';

  INSERT INTO public.quests (site_id, pillar_id, slug, title, short_summary, difficulty, estimated_weeks, is_active) VALUES
    -- LEADERSHIP
    (site_id_val, pillar_id_val, 'youth-leadership', 'Youth Leadership', 'Develop leadership skills', 2, 6, true),
    (site_id_val, pillar_id_val, 'public-speaking', 'Public Speaking', 'Speak with confidence', 2, 6, true),
    (site_id_val, pillar_id_val, 'team-leadership', 'Team Leadership', 'Lead groups effectively', 2, 6, true),
    (site_id_val, pillar_id_val, 'project-management', 'Project Management', 'Plan and execute projects', 3, 8, true),
    (site_id_val, pillar_id_val, 'event-planning', 'Event Planning', 'Organize community events', 2, 6, true),
    (site_id_val, pillar_id_val, 'meeting-facilitation', 'Meeting Facilitation', 'Run effective meetings', 2, 4, true),
    (site_id_val, pillar_id_val, 'conflict-resolution', 'Conflict Resolution', 'Mediate and resolve disputes', 2, 6, true),
    (site_id_val, pillar_id_val, 'peer-mentoring', 'Peer Mentoring', 'Guide and support peers', 2, 6, true),
    (site_id_val, pillar_id_val, 'coaching-basics', 'Coaching Basics', 'Help others improve', 2, 6, true),
    (site_id_val, pillar_id_val, 'networking-skills', 'Networking Skills', 'Build professional connections', 2, 4, true),
    (site_id_val, pillar_id_val, 'decision-making', 'Decision Making', 'Make better choices', 2, 4, true),
    (site_id_val, pillar_id_val, 'ethical-leadership', 'Ethical Leadership', 'Lead with integrity', 2, 6, true),
    (site_id_val, pillar_id_val, 'servant-leadership', 'Servant Leadership', 'Lead by serving others', 2, 6, true),

    -- CIVIC ENGAGEMENT
    (site_id_val, pillar_id_val, 'local-government', 'Local Government', 'How your city works', 1, 4, true),
    (site_id_val, pillar_id_val, 'civic-processes', 'Civic Processes', 'Voting and participation', 1, 4, true),
    (site_id_val, pillar_id_val, 'community-organizing', 'Community Organizing', 'Mobilize for change', 3, 8, true),
    (site_id_val, pillar_id_val, 'advocacy-skills', 'Advocacy Skills', 'Speak up for causes', 2, 6, true),
    (site_id_val, pillar_id_val, 'petition-campaigns', 'Petition Campaigns', 'Gather support for issues', 2, 4, true),
    (site_id_val, pillar_id_val, 'youth-council', 'Youth Council', 'Participate in youth government', 2, 8, true),
    (site_id_val, pillar_id_val, 'city-council-engagement', 'City Council Engagement', 'Attend and speak at meetings', 2, 6, true),
    (site_id_val, pillar_id_val, 'voter-registration', 'Voter Registration', 'Help others register to vote', 1, 3, true),
    (site_id_val, pillar_id_val, 'political-awareness', 'Political Awareness', 'Understand current issues', 2, 6, true),
    (site_id_val, pillar_id_val, 'campaign-volunteering', 'Campaign Volunteering', 'Support political campaigns', 2, 6, true),
    (site_id_val, pillar_id_val, 'mock-trial', 'Mock Trial', 'Learn the legal system', 3, 8, true),
    (site_id_val, pillar_id_val, 'debate-club', 'Debate Club', 'Argue and defend positions', 2, 6, true),
    (site_id_val, pillar_id_val, 'model-un', 'Model United Nations', 'Simulate international diplomacy', 3, 8, true),

    -- COMMUNITY SERVICE
    (site_id_val, pillar_id_val, 'food-bank-service', 'Food Bank Service', 'Help fight hunger', 1, 4, true),
    (site_id_val, pillar_id_val, 'homeless-outreach', 'Homeless Outreach', 'Support unhoused neighbors', 2, 6, true),
    (site_id_val, pillar_id_val, 'animal-shelter-volunteer', 'Animal Shelter Volunteer', 'Care for shelter animals', 1, 6, true),
    (site_id_val, pillar_id_val, 'hospital-volunteer', 'Hospital Volunteer', 'Support patients and families', 2, 6, true),
    (site_id_val, pillar_id_val, 'senior-center-service', 'Senior Center Service', 'Connect with elders', 1, 6, true),
    (site_id_val, pillar_id_val, 'tutoring-program', 'Tutoring Program', 'Help students learn', 2, 8, true),
    (site_id_val, pillar_id_val, 'library-volunteer', 'Library Volunteer', 'Support library programs', 1, 6, true),
    (site_id_val, pillar_id_val, 'park-cleanup', 'Park Cleanup', 'Beautify public spaces', 1, 3, true),
    (site_id_val, pillar_id_val, 'trail-maintenance', 'Trail Maintenance', 'Keep trails safe and clear', 2, 4, true),
    (site_id_val, pillar_id_val, 'community-garden', 'Community Garden', 'Grow food together', 2, 8, true),
    (site_id_val, pillar_id_val, 'habitat-building', 'Habitat Building', 'Construct homes for families', 3, 6, true),
    (site_id_val, pillar_id_val, 'disaster-relief', 'Disaster Relief', 'Help communities recover', 2, 6, true),
    (site_id_val, pillar_id_val, 'blood-drive-support', 'Blood Drive Support', 'Organize blood donation events', 2, 4, true),
    (site_id_val, pillar_id_val, 'clothing-drive', 'Clothing Drive', 'Collect and distribute clothes', 1, 3, true),
    (site_id_val, pillar_id_val, 'toy-drive', 'Toy Drive', 'Holiday giving for kids', 1, 3, true),
    (site_id_val, pillar_id_val, 'meals-on-wheels', 'Meals on Wheels', 'Deliver food to homebound', 1, 6, true),
    (site_id_val, pillar_id_val, 'hospice-support', 'Hospice Support', 'Comfort for end-of-life care', 2, 6, true),
    (site_id_val, pillar_id_val, 'refugee-support', 'Refugee Support', 'Welcome new neighbors', 2, 6, true),

    -- ENVIRONMENTAL
    (site_id_val, pillar_id_val, 'environmental-awareness', 'Environmental Awareness', 'Understand ecological issues', 1, 4, true),
    (site_id_val, pillar_id_val, 'recycling-program', 'Recycling Program', 'Reduce waste', 1, 4, true),
    (site_id_val, pillar_id_val, 'composting', 'Composting', 'Turn waste into soil', 1, 4, true),
    (site_id_val, pillar_id_val, 'tree-planting', 'Tree Planting', 'Grow urban forests', 2, 4, true),
    (site_id_val, pillar_id_val, 'water-conservation', 'Water Conservation', 'Protect water resources', 1, 4, true),
    (site_id_val, pillar_id_val, 'energy-audit', 'Energy Audit', 'Reduce energy waste', 2, 4, true),
    (site_id_val, pillar_id_val, 'climate-action', 'Climate Action', 'Address climate change', 2, 6, true),
    (site_id_val, pillar_id_val, 'wildlife-conservation', 'Wildlife Conservation', 'Protect local wildlife', 2, 6, true),
    (site_id_val, pillar_id_val, 'beach-cleanup', 'Beach/Waterway Cleanup', 'Clean water environments', 1, 3, true),
    (site_id_val, pillar_id_val, 'sustainable-living', 'Sustainable Living', 'Reduce your footprint', 2, 6, true),
    (site_id_val, pillar_id_val, 'native-plants', 'Native Plants', 'Restore local ecosystems', 2, 6, true),
    (site_id_val, pillar_id_val, 'pollinator-gardens', 'Pollinator Gardens', 'Support bees and butterflies', 2, 4, true),
    (site_id_val, pillar_id_val, 'environmental-education', 'Environmental Education', 'Teach others about nature', 2, 6, true),
    (site_id_val, pillar_id_val, 'upcycling', 'Upcycling', 'Create from waste', 1, 4, true),
    (site_id_val, pillar_id_val, 'zero-waste', 'Zero Waste', 'Eliminate personal waste', 2, 6, true),

    -- SOCIAL JUSTICE
    (site_id_val, pillar_id_val, 'social-justice-intro', 'Social Justice Introduction', 'Understand systemic issues', 2, 6, true),
    (site_id_val, pillar_id_val, 'anti-racism', 'Anti-Racism', 'Combat racial injustice', 2, 6, true),
    (site_id_val, pillar_id_val, 'lgbtq-allyship', 'LGBTQ+ Allyship', 'Support LGBTQ+ community', 2, 4, true),
    (site_id_val, pillar_id_val, 'disability-advocacy', 'Disability Advocacy', 'Support accessibility', 2, 6, true),
    (site_id_val, pillar_id_val, 'gender-equality', 'Gender Equality', 'Promote equal treatment', 2, 6, true),
    (site_id_val, pillar_id_val, 'immigration-awareness', 'Immigration Awareness', 'Understand immigration issues', 2, 6, true),
    (site_id_val, pillar_id_val, 'poverty-awareness', 'Poverty Awareness', 'Understand economic inequality', 2, 6, true),
    (site_id_val, pillar_id_val, 'food-justice', 'Food Justice', 'Access to healthy food', 2, 6, true),
    (site_id_val, pillar_id_val, 'housing-justice', 'Housing Justice', 'Affordable housing advocacy', 2, 6, true),
    (site_id_val, pillar_id_val, 'criminal-justice-reform', 'Criminal Justice Reform', 'Understand the justice system', 3, 8, true),
    (site_id_val, pillar_id_val, 'human-rights', 'Human Rights', 'Global rights awareness', 2, 6, true),
    (site_id_val, pillar_id_val, 'mental-health-advocacy', 'Mental Health Advocacy', 'Reduce stigma', 2, 6, true),

    -- ENTREPRENEURSHIP
    (site_id_val, pillar_id_val, 'entrepreneurship-basics', 'Entrepreneurship Basics', 'Start your own venture', 2, 8, true),
    (site_id_val, pillar_id_val, 'business-plan', 'Business Plan Writing', 'Plan a business', 3, 6, true),
    (site_id_val, pillar_id_val, 'social-enterprise', 'Social Enterprise', 'Business for good', 3, 8, true),
    (site_id_val, pillar_id_val, 'fundraising', 'Fundraising', 'Raise money for causes', 2, 6, true),
    (site_id_val, pillar_id_val, 'grant-writing', 'Grant Writing', 'Apply for funding', 3, 6, true),
    (site_id_val, pillar_id_val, 'nonprofit-basics', 'Nonprofit Basics', 'Start a nonprofit', 3, 8, true),
    (site_id_val, pillar_id_val, 'financial-literacy', 'Financial Literacy', 'Money management', 2, 6, true),
    (site_id_val, pillar_id_val, 'budgeting-basics', 'Budgeting Basics', 'Create and follow budgets', 1, 4, true),
    (site_id_val, pillar_id_val, 'investing-intro', 'Investing Introduction', 'Grow your money', 2, 6, true),
    (site_id_val, pillar_id_val, 'marketing-basics', 'Marketing Basics', 'Promote your ideas', 2, 6, true),

    -- COMMUNICATION
    (site_id_val, pillar_id_val, 'effective-communication', 'Effective Communication', 'Express yourself clearly', 1, 4, true),
    (site_id_val, pillar_id_val, 'active-listening', 'Active Listening', 'Listen to understand', 1, 3, true),
    (site_id_val, pillar_id_val, 'persuasion-skills', 'Persuasion Skills', 'Influence others ethically', 2, 4, true),
    (site_id_val, pillar_id_val, 'storytelling-for-change', 'Storytelling for Change', 'Use stories to inspire', 2, 6, true),
    (site_id_val, pillar_id_val, 'media-literacy', 'Media Literacy', 'Evaluate information sources', 2, 4, true),
    (site_id_val, pillar_id_val, 'digital-citizenship', 'Digital Citizenship', 'Responsible online behavior', 1, 4, true),
    (site_id_val, pillar_id_val, 'interview-skills', 'Interview Skills', 'Present yourself professionally', 2, 4, true),
    (site_id_val, pillar_id_val, 'resume-building', 'Resume Building', 'Create effective resumes', 1, 3, true),
    (site_id_val, pillar_id_val, 'email-etiquette', 'Email Etiquette', 'Professional communication', 1, 2, true),
    (site_id_val, pillar_id_val, 'presentation-skills', 'Presentation Skills', 'Deliver great presentations', 2, 4, true),

    -- GLOBAL AWARENESS
    (site_id_val, pillar_id_val, 'world-cultures', 'World Cultures', 'Learn about global diversity', 1, 6, true),
    (site_id_val, pillar_id_val, 'global-issues', 'Global Issues', 'Understand world challenges', 2, 6, true),
    (site_id_val, pillar_id_val, 'language-learning', 'Language Learning', 'Learn a new language', 2, 8, true),
    (site_id_val, pillar_id_val, 'international-relations', 'International Relations', 'How countries interact', 3, 8, true),
    (site_id_val, pillar_id_val, 'global-health', 'Global Health', 'Health challenges worldwide', 2, 6, true),
    (site_id_val, pillar_id_val, 'fair-trade', 'Fair Trade', 'Ethical consumption', 2, 4, true),
    (site_id_val, pillar_id_val, 'cultural-exchange', 'Cultural Exchange', 'Share and learn cultures', 2, 6, true),
    (site_id_val, pillar_id_val, 'pen-pals-global', 'Global Pen Pals', 'Connect with youth worldwide', 1, 6, true),
    (site_id_val, pillar_id_val, 'international-service', 'International Service', 'Global service projects', 3, 8, true);

END $$;
