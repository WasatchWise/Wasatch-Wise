-- ============================================================
-- GUARDIANS MIGRATION - Apply this in Supabase SQL Editor
-- Run this entire file at once
-- ============================================================

-- Step 1: Add missing columns (ignore errors if they already exist)
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS animal_type TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS abilities TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS personality TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS backstory TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS motto TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS element TEXT;
ALTER TABLE guardians ADD COLUMN IF NOT EXISTS colorway TEXT;

-- Step 2: Add unique constraint (will show error if already exists, ignore it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'guardians_county_key'
    ) THEN
        ALTER TABLE guardians ADD CONSTRAINT guardians_county_key UNIQUE (county);
    END IF;
END $$;

-- Step 3: Delete any existing data to start fresh
DELETE FROM guardians;

-- Step 4: Insert all 29 Mt. Olympians
INSERT INTO guardians (county, codename, display_name, animal_type, archetype, element, bio, abilities) VALUES
('Beaver', 'Ember', 'Ember the Eternal Flame', 'Phoenix', 'Renewal Guardian', 'Fire', 'Ember the Eternal Flame is a fiery phoenix whose wings scatter sparks across the high plateaus of Beaver County. This guardian embodies cycles of destruction and rebirth, rising anew from the ashes of transformation.', 'Fire manipulation, regeneration, renewal energy'),
('Box Elder', 'Talon', 'Talon the Sky Sentinel', 'Golden Eagle', 'Sky Watcher', 'Air', 'Talon the Sky Sentinel is a majestic golden eagle whose keen eyes survey the northern reaches of Utah. This guardian watches over the Bear River Migratory Bird Refuge and the ancient shores of the Great Salt Lake.', 'Enhanced vision, aerial reconnaissance, storm calling'),
('Cache', 'Bristle', 'Bristle the Mountain Sage', 'Porcupine', 'Wisdom Keeper', 'Earth', 'Bristle the Mountain Sage is a wise porcupine guardian of Cache Valley, keeper of agricultural knowledge and defender of the fertile lands. Known for measured responses and protective instincts when provoked.', 'Agricultural wisdom, defensive barriers, patience teaching'),
('Carbon', 'Coal', 'Coal the Deep Warden', 'Black Bear', 'Subterranean Guardian', 'Earth', 'Coal the Deep Warden is a powerful black bear who guards the coal seams and deep canyons of Carbon County. This guardian knows the secrets buried in the ancient rock layers and fossil beds.', 'Underground navigation, fossil reading, strength'),
('Daggett', 'Torrent', 'Torrent the River Spirit', 'River Otter', 'Flow Master', 'Water', 'Torrent the River Spirit is a playful yet powerful river otter who commands the waters of the Green River through Flaming Gorge. This guardian embodies the joy of movement and the power of flowing water.', 'Water manipulation, rapid movement, playfulness as strategy'),
('Davis', 'Surge', 'Surge the Urban Tide', 'Peregrine Falcon', 'Speed Demon', 'Air', 'Surge the Urban Tide is the fastest of all guardians, a peregrine falcon who navigates between mountain and metropolis. This guardian represents adaptation and thriving in rapidly changing environments.', 'Supersonic speed, urban navigation, rapid adaptation'),
('Duchesne', 'Tavaputs', 'Tavaputs the Twin-Tongued', 'Geological Prophet', 'Time-Seer', 'Earth', 'Tavaputs the Twin-Tongued is a geological prophet and time-seer who reads the ancient stories written in the stone layers of Duchesne County. This enigmatic guardian speaks in dual voices - one of the deep past, one of the future yet to come.', 'Geological prophecy, time-seeing, reading stone records'),
('Emery', 'Raptor', 'Raptor the Ancient Hunter', 'Utahraptor', 'Prehistoric Protector', 'Earth', 'Raptor the Ancient Hunter is a spectral Utahraptor whose fossils lie deep in the rocks of Emery County. This guardian bridges deep time, connecting the ancient past with the present moment.', 'Paleontological knowledge, pack tactics, time bridge'),
('Garfield', 'Crimson', 'Crimson the Painted Sentinel', 'Red Fox', 'Color Keeper', 'Fire', 'Crimson the Painted Sentinel is a brilliant red fox who embodies the spectacular colors of Bryce Canyon and the grand staircase. This guardian knows that sometimes the most powerful defense is breathtaking beauty.', 'Color manipulation, camouflage, aesthetic warfare'),
('Grand', 'Sandstone', 'Sandstone the Desert Sage', 'Bighorn Sheep', 'Endurance Master', 'Earth', 'Sandstone the Desert Sage is a resilient bighorn sheep who navigates the impossible cliffs and arches of Grand County. This guardian teaches endurance, patience, and finding paths where none seem to exist.', 'Impossible navigation, endurance, cliff mastery'),
('Iron', 'Forge', 'Forge the Iron Sentinel', 'Badger', 'Tenacious Defender', 'Earth', 'Forge the Iron Sentinel is a determined badger whose tenacity matches the iron deposits deep in the southern Utah earth. This guardian never gives up and always digs deeper when obstacles appear.', 'Tunneling, tenacity, never-give-up spirit'),
('Juab', 'Mirage', 'Mirage the Desert Phantom', 'Jackrabbit', 'Illusion Weaver', 'Air', 'Mirage the Desert Phantom is an elusive jackrabbit who dances across the west desert, creating illusions in the heat waves. This guardian teaches that reality is sometimes more flexible than it appears.', 'Speed, illusion creation, desert survival'),
('Kane', 'Echo', 'Echo the Canyon Voice', 'Canyon Wren', 'Sound Weaver', 'Air', 'Echo the Canyon Voice is a small but powerful canyon wren whose songs reverberate through the slot canyons and amphitheaters of Kane County. This guardian speaks the language of stone and wind.', 'Sound manipulation, echo location, sonic shields'),
('Millard', 'Dust', 'Dust the Alkali Drifter', 'Pronghorn Antelope', 'Speed Mystic', 'Earth', 'Dust the Alkali Drifter is the second-fastest land guardian, a pronghorn who races across the open spaces of Millard County. This guardian knows every hidden spring and teaches survival in harsh landscapes.', 'Extreme speed, endurance, hidden water finding'),
('Morgan', 'Willow', 'Willow the Valley Keeper', 'Beaver', 'Builder Guardian', 'Water', 'Willow the Valley Keeper is an industrious beaver who shapes the waterways and wetlands of Morgan Valley. This guardian understands that sometimes the best protection is creating proper habitat.', 'Ecosystem engineering, dam building, patience'),
('Piute', 'Summit', 'Summit the High Watcher', 'Mountain Goat', 'Peak Guardian', 'Earth', 'Summit the High Watcher is a sure-footed mountain goat who inhabits the highest peaks of the Tushar Mountains. This guardian sees far and understands that perspective changes everything.', 'Mountain climbing, far-seeing, perspective shifting'),
('Rich', 'Frost', 'Frost the Winter Warden', 'Moose', 'Cold Commander', 'Water', 'Frost the Winter Warden is a massive moose who rules the cold forests and valleys of Rich County. This guardian embodies patient power and the deep quiet of winter wilderness.', 'Cold resistance, size intimidation, quiet power'),
('Salt Lake', 'Quake', 'Quake the Fault Line', 'Grizzly Bear (ancient)', 'Urban Protector', 'Earth', 'Quake the Fault Line is an ancient spectral grizzly who remembers when Salt Lake Valley was wild. This guardian walks the streets at night, watching over the urban wilderness and keeping the earth stable.', 'Seismic sense, urban guardianship, ancient memory'),
('San Juan', 'Petroglyph', 'Petroglyph the Story Keeper', 'Desert Tortoise', 'Ancient Historian', 'Earth', 'Petroglyph the Story Keeper is an ancient desert tortoise who carries the petroglyphs and stories of thousands of years on their shell. This guardian moves slowly but remembers everything.', 'Story keeping, ancient knowledge, patience incarnate'),
('Sanpete', 'Harvest', 'Harvest the Grain Guardian', 'Barn Owl', 'Agricultural Protector', 'Air', 'Harvest the Grain Guardian is a wise barn owl who watches over the fertile valleys and grain fields of Sanpete County. This guardian balances abundance with protection, ensuring prosperity without waste.', 'Pest control, night vision, abundance blessing'),
('Sevier', 'Quartz', 'Quartz the Crystal Sage', 'Lynx', 'Hidden Seer', 'Earth', 'Quartz the Crystal Sage is an elusive lynx whose eyes reflect light like the quartz crystals hidden in Sevier County canyons. This guardian sees what others miss and finds treasure in unexpected places.', 'Crystal finding, hidden sight, stealth'),
('Summit', 'Alpine', 'Alpine the Peak Dancer', 'Mountain Lion', 'Elite Hunter', 'Air', 'Alpine the Peak Dancer is a graceful mountain lion who moves through the high country of Summit County like water flowing downhill. This guardian represents refined skill and effortless mastery.', 'Silent movement, tracking mastery, athletic grace'),
('Tooele', 'Alkali', 'Alkali the Salt Phantom', 'Coyote', 'Trickster Guardian', 'Earth', 'Alkali the Salt Phantom is a clever coyote who thrives in the harsh salt flats and deserts of Tooele County. This guardian teaches adaptability, cleverness, and finding humor in adversity.', 'Adaptation, trickery, survival humor'),
('Uintah', 'Dreamwalker', 'Dreamwalker the Basin Mystic', 'Elk', 'Vision Seeker', 'Water', 'Dreamwalker the Basin Mystic is a majestic elk whose antlers seem to pierce the veil between worlds. This guardian of the Uintah Basin walks between reality and vision, teaching that both are equally real.', 'Dream navigation, vision questing, realm walking'),
('Utah', 'Thunder', 'Thunder the Valley Storm', 'Bison (ancient)', 'Thunder Bringer', 'Air', 'Thunder the Valley Storm is a spectral bison whose hoofbeats echo like thunder through Utah Valley. This guardian remembers the ancient herds and brings the power of storm and movement.', 'Thunder generation, herd summoning, charging power'),
('Wasatch', 'Dan', 'The Wasatch Sasquatch', 'Sasquatch', 'Trail Master', 'Earth', 'The Wasatch Sasquatch (better known as Dan) is the legendary trail master and chief guardian of the Wasatch Front. Part myth, part mountain man, Dan knows every trail, every hidden hot spring, and every secret viewpoint in these mountains.', 'Trail finding, mountain wisdom, legendary status'),
('Washington', 'Zion', 'Zion the Red Rock Guardian', 'Desert Bighorn Ram', 'Sanctuary Keeper', 'Fire', 'Zion the Red Rock Guardian is a powerful desert bighorn ram whose horns curve like the great arches of the red rock country. This guardian protects the sacred spaces and ensures respect for the land.', 'Sacred space protection, stone manipulation, respect enforcement'),
('Wayne', 'Labyrinth', 'Labyrinth the Maze Walker', 'Raven', 'Mystery Guardian', 'Air', 'Labyrinth the Maze Walker is an enigmatic raven who navigates the impossible canyons and reefs of Wayne County. This guardian knows that getting lost is sometimes the only way to truly find yourself.', 'Maze navigation, mystery teaching, purposeful misdirection'),
('Weber', 'Rapids', 'Rapids the River Warrior', 'Osprey', 'Water Hunter', 'Water', 'Rapids the River Warrior is a fierce osprey who commands the rushing waters of the Weber River. This guardian represents focused power and the ability to strike with precision from above.', 'Precision hunting, water diving, focused strikes');

-- Step 5: Enable RLS if not already enabled
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Step 6: Create public read policy
DROP POLICY IF EXISTS "Allow public read access to guardians" ON guardians;
CREATE POLICY "Allow public read access to guardians" ON guardians FOR SELECT USING (true);

-- Verify the results
SELECT COUNT(*) as total_guardians FROM guardians;
SELECT county, display_name, animal_type FROM guardians ORDER BY county;
