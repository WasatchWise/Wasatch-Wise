-- ============================================================
-- RESTORE REAL GUARDIANS - Delete fake data and restore original
-- ============================================================

-- Delete all the fake guardians
DELETE FROM guardians;

-- Insert the REAL guardians
INSERT INTO guardians (county, display_name, animal_type, archetype, bio, abilities, codename) VALUES
  ('Beaver', 'Quincy', 'Beaver', 'Trickster-Artisan', 'Quincy is an alchemist with a knack for transmutation, though his powers have their limits. A clever trickster and skilled artisan, he embodies the creative spirit of Beaver County.', 'Transmutation with limits', 'Quincy'),

  ('Box Elder', 'Cass', 'Kit Fox', 'Maker-Mentor', 'Cass is an inventor extraordinaire, always tinkering with pocket tools and wind-up contraptions. This kit fox mentor guides others with ingenious mechanical solutions.', 'Pocket tools and wind-ups', 'Cass'),

  ('Cache', 'Elsa', 'Honeybee', 'Mother-Nurturer', 'Elsa tends to the orchards with her bloom chorus, nurturing both plants and people. As a mother figure, she represents the agricultural abundance of Cache Valley.', 'Bloom chorus', 'Elsa'),

  ('Carbon', 'Bruno', 'Big-eared Bat', 'Father-Protector', 'Bruno is a miner who uses his echo-lantern to navigate the depths. A protective father figure, he watches over Carbon County''s mining heritage.', 'Echo-lantern navigation', 'Bruno'),

  ('Daggett', 'Ira', 'Osprey', 'Stoic Mentor', 'Ira is an ice sage who wields a frost compass. This stoic mentor embodies the wild, remote nature of Daggett County.', 'Frost compass', 'Ira'),

  ('Davis', 'Maris', 'Peregrine Falcon', 'Strategist', 'Maris is a storm-seer with lightning glance abilities. As a brilliant strategist, she represents the dynamic growth of Davis County.', 'Lightning glance, storm seeing', 'Maris'),

  ('Duchesne', 'Tavaputs', 'Geological Prophet', 'Time-Seer', 'Tavaputs the Twin-Tongued is a geological prophet and time-seer who reads the ancient stories written in the stone layers of Duchesne County. This enigmatic guardian speaks in dual voices - one of the deep past, one of the future yet to come.', 'Geological prophecy, time-seeing, reading stone records', 'Tavaputs'),

  ('Emery', 'Sedge', 'Chuckwalla', 'Pillar', 'Sedge stands as a pillar among the spires, using resonance to stabilize the land. This steadfast guardian embodies Emery County''s geological wonders.', 'Resonance stabilizer', 'Sedge'),

  ('Garfield', 'Raya', 'Canyon Wren', 'Artist-Healer', 'Raya is an echo dancer who transforms sound into light. As an artist-healer, she brings concerts and joy across the state, though her heart belongs to Garfield County''s canyons.', 'Sound to light transformation, echo dancing', 'Raya'),

  ('Grand', 'Koda', 'Pronghorn', 'Scout-Hero', 'Koda is a swift runner whose hooflines glow as he races across the landscape. This heroic scout embodies the adventurous spirit of Grand County.', 'Glowing hooflines, speed', 'Koda'),

  ('Iron', 'Ash', 'Bighorn Sheep', 'Forge-Mentor', 'Ash is a master smith who wields a thunder hammer at his forge. As a mentor, he shapes both metal and minds in Iron County.', 'Thunder hammer, metalworking', 'Ash'),

  ('Juab', 'Faye', 'Trilobite', 'Crone-Sage', 'Faye is an ancient oracle with the age-touch ability. This wise crone holds the deep time knowledge of Juab County''s prehistoric past.', 'Age-touch, oracular vision', 'Faye'),

  ('Kane', 'Zina', 'Ringtail', 'Rogue-Guide', 'Zina is a slot canyon phantom who reads flood omens. This rogue guide knows every secret passage in Kane County''s labyrinthine canyons.', 'Flood omens, phantom form', 'Zina'),

  ('Millard', 'Bram', 'Horned Lizard', 'Guardian-Paladin', 'Bram is a knight clad in basalt armor. As a guardian-paladin, he stands watch over the vast spaces of Millard County.', 'Basalt armor, defensive power', 'Bram'),

  ('Morgan', 'Nellie', 'Horse Spirit', 'Gentle Psychopomp', 'Nellie is a rail-haunt whose lantern sways gently as she guides souls. This gentle psychopomp honors Morgan County''s pioneer railway heritage.', 'Lantern sway, spirit guiding', 'Nellie'),

  ('Piute', 'Loam', 'Cottontail Rabbit', 'Caretaker', 'Loam is a seedkeeper with instant sprout abilities. As a caretaker, they nurture the growth and renewal of Piute County.', 'Instant sprout, seed keeping', 'Loam'),

  ('Rich', 'Rich', 'Lake Serpent', 'Cryptid-Companion', 'Rich is a poet and cryptid whose size-shifting nature will be revealed in time. This enigmatic companion represents the mysteries of Rich County''s Bear Lake.', 'Size shift (final reveal), poetry', 'Rich'),

  ('Salt Lake', 'Jorah', 'Muskrat', 'Mentor', 'Jorah is a current-keeper who maintains the balance between ember and frost. As a mentor, he guides others through the urban wilderness of Salt Lake County.', 'Ember/frost balance, current keeping', 'Jorah'),

  ('San Juan', 'Hob', 'Raven', 'Trickster-Sage', 'Hob is a sound-carver who creates echo glyphs. This trickster-sage holds the ancient wisdom and modern mischief of San Juan County.', 'Echo glyphs, sound carving', 'Hob'),

  ('Sanpete', 'Juniper Jack', 'Coyote', 'Bard-Guide', 'Juniper Jack is a harmonica-playing bard who knows all the songlines. This musical guide celebrates Sanpete County''s folk traditions.', 'Songlines, harmonica magic', 'Juniper Jack'),

  ('Sevier', 'Gilda', 'Pika', 'Challenger', 'Gilda is an alpine athlete with terrain skis. As a challenger, she pushes herself and others to reach new heights in Sevier County.', 'Terrain skis, alpine athleticism', 'Gilda'),

  ('Summit', 'Vex', 'Fox', 'Golden Champion', 'Vex is a vortex-keeper who channels energy through peak rings. This golden champion represents the elite mountain culture of Summit County.', 'Peak rings, vortex keeping', 'Vex'),

  ('Tooele', 'Voss', 'Jackrabbit', 'Ascetic Scout', 'Voss is a desert racer who moves through heat shimmer. This ascetic scout knows every secret of Tooele County''s vast deserts.', 'Heat shimmer, desert racing', 'Voss'),

  ('Uintah', 'Dreamwalker', 'Elk', 'Psychopomp-Sage', 'Dreamwalker is a time-strider who accesses fossil dreams. This psychopomp-sage bridges past and present in the Uintah Basin.', 'Fossil dreams, time striding', 'Dreamwalker'),

  ('Utah', 'Sylvia', 'Owl', 'Mother-Mentor', 'Sylvia is a scholar whose quill reveals truth. As a mother-mentor, she represents the educational and cultural heart of Utah County.', 'Quill truth, scholarly wisdom', 'Sylvia'),

  ('Wasatch', 'Dan', 'Sasquatch', 'Companion-Guide', 'Dan the Wasatch Sasquatch is the beloved ranger and companion guide. His comfort aura makes everyone feel at home in the Wasatch Mountains.', 'Comfort aura, wilderness guiding', 'Dan'),

  ('Wayne', 'Lars', 'Cougar', 'Wise Navigator', 'Lars is a cartographer whose maps glow with living light. This wise navigator knows every path through Wayne County''s rugged wilderness.', 'Glowing paths, cartography', 'Lars'),

  ('Weber', 'Otis', 'Badger', 'Law/Order Mentor', 'Otis is a conductor who carries an eternal lantern. As a law and order mentor, he keeps Weber County running on time and on track.', 'Eternal lantern, time keeping', 'Otis'),

  ('Washington', 'Sera', 'Roadrunner', 'Scout-Spirit', 'Sera is a desert scout whose dune bells ring across the red rock landscape. This scout-spirit embodies the adventurous energy of Washington County.', 'Dune bells, desert scouting', 'Sera');

-- Verify count
SELECT COUNT(*) as total_guardians, 'REAL guardians restored!' as status FROM guardians;
SELECT county, display_name, animal_type FROM guardians ORDER BY county;
