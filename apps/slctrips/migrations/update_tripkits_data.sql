-- TK-000: UTAH UNLOCKED
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Identify key geographical features of Utah', 'Plan a basic day trip itinerary', 'Recognize historical significance of major landmarks']),
  curriculum_alignment = '{"subject": "Social Studies", "grade_level": "4th Grade", "standard": "Utah History"}'::jsonb,
  estimated_time = '30 minutes',
  difficulty_level = 'Beginner',
  description = '88 adventures. Zero dollars. Your first ''hell yes'' trip leaves in 30 minutes.'
WHERE code = 'TK-000';

-- TK-002: SKI UTAH COMPLETE
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Compare terrain difficulty across resorts', 'Select appropriate gear for conditions', 'Navigate resort maps effectively']),
  estimated_time = 'Full Day',
  difficulty_level = 'Intermediate',
  description = '86 mountains. One guide. Stop wasting powder days on the wrong resort.'
WHERE code = 'TK-002';

-- TK-005: SECRET SPRINGS & SWIMMIN'' HOLES
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Understand geothermal activity safety', 'Practice Leave No Trace principles', 'Assess water safety risks']),
  estimated_time = 'Half Day',
  difficulty_level = 'Variable',
  description = '55 springs they don''t put on Google Maps. Some are 106°. Some are ''holy sht cold.'' All of them are worth the drive.'
WHERE code = 'TK-005';

-- TK-013: UNEXPLAINED UTAH
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Evaluate evidence quality', 'Apply investigative methodology']),
  estimated_time = 'Variable',
  difficulty_level = 'Variable',
  description = '115 places science can''t explain. Yet. Go find out why.'
WHERE code = 'TK-013';

-- TK-014: HAUNTED HIGHWAY
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Analyze folklore and urban legends', 'Understand theatrical staging in attractions']),
  estimated_time = 'Evening',
  difficulty_level = 'Variable',
  description = '94 reasons to leave the lights on. We mapped every scream between Salt Lake and Hell.'
WHERE code = 'TK-014';

-- TK-015: MORBID MISDEEDS
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Analyze primary source documentation', 'Evaluate historical context of crimes', 'Discuss ethical considerations in true crime']),
  estimated_time = 'Variable',
  difficulty_level = 'Advanced',
  description = '157 dark chapters of Western history. Handle with care.'
WHERE code = 'TK-015';

-- TK-024: BREWERY TRAIL
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Distinguish between beer styles', 'Understand the brewing process', 'Practice responsible consumption']),
  estimated_time = 'Evening',
  difficulty_level = 'Adult',
  description = '97 breweries that don''t suck. We drank at all of them. You''re welcome.'
WHERE code = 'TK-024';

-- TK-025: COFFEE CULTURE
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Identify coffee roast profiles', 'Compare brewing methods', 'Evaluate café workspace ergonomics']),
  estimated_time = '1-2 Hours',
  difficulty_level = 'Easy',
  description = '29 cafés that understand coffee isn''t Starbucks. Good WiFi. Better espresso.'
WHERE code = 'TK-025';

-- TK-038: MOVIE MADNESS
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Analyze cinematographic location choices', 'Compare film scenes to real locations']),
  estimated_time = 'Variable',
  difficulty_level = 'Easy',
  description = 'Stand exactly where John Wayne stood. Where Thelma drove off that cliff. Where the T-1000 chased John Connor. 91 spots. Same view. Your turn.'
WHERE code = 'TK-038';

-- TK-045: 250 UNDER $25
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Plan budget-friendly travel', 'Maximize value in trip planning']),
  estimated_time = 'Variable',
  difficulty_level = 'Easy',
  description = '250 adventures. All under $25. Most under $10. Some totally free. Stop making excuses.'
WHERE code = 'TK-045';

-- TK-055: TEE TIME: MOUNTAIN WEST GOLF
UPDATE tripkits
SET
  learning_objectives = to_jsonb(ARRAY['Adjust play for elevation changes', 'Analyze course layout strategies']),
  estimated_time = 'Half Day',
  difficulty_level = 'Intermediate',
  description = '67 courses where your 7-iron plays like a 6. We did the math. You hit the ball.'
WHERE code = 'TK-055';
