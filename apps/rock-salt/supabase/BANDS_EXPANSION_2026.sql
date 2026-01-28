-- Salt Lake City Band Database Expansion & Cleanup (1998-2026)
-- Unified Robust Migration
-- 1. Deduplicate Genres
WITH ranked_genres AS (
    SELECT id,
        name,
        ROW_NUMBER() OVER (
            PARTITION BY lower(btrim(name))
            ORDER BY id
        ) AS rn
    FROM public.genres
)
DELETE FROM public.genres g USING ranked_genres r
WHERE g.id = r.id
    AND r.rn > 1;
-- 2. Deduplicate Bands (by slug and name-normalized)
WITH ranked_bands AS (
    SELECT id,
        slug,
        ROW_NUMBER() OVER (
            PARTITION BY CASE
                WHEN lower(name) LIKE '%i dont know how but they found me%' THEN 'idkhow'
                WHEN lower(name) LIKE '%i don''t know how but they found me%' THEN 'idkhow'
                WHEN lower(name) LIKE '%idk how%' THEN 'idkhow'
                WHEN lower(name) = 'idkhow' THEN 'idkhow'
                ELSE lower(btrim(regexp_replace(name, '^The\s+', '', 'i')))
            END
            ORDER BY id
        ) AS rn
    FROM public.bands
)
DELETE FROM public.bands b USING ranked_bands r
WHERE b.id = r.id
    AND r.rn > 1;
-- 3. Ensure Unique Constraints
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'genres_name_key'
) THEN
ALTER TABLE public.genres
ADD CONSTRAINT genres_name_key UNIQUE (name);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bands_slug_key'
) THEN
ALTER TABLE public.bands
ADD CONSTRAINT bands_slug_key UNIQUE (slug);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'musicians_slug_key'
) THEN
ALTER TABLE public.musicians
ADD CONSTRAINT musicians_slug_key UNIQUE (slug);
END IF;
END $$;
-- 4. Unified Data Insert (Bands, Genres, Links)
-- We use a single block to ensure variables are in scope and non-null
DO $$
DECLARE -- Eras & Lore-rich UUIDs
    the_used_id uuid := gen_random_uuid();
whisperhawk_id uuid := gen_random_uuid();
the_brobecks_id uuid := gen_random_uuid();
idkhow_id uuid := gen_random_uuid();
choir_boy_id uuid := gen_random_uuid();
ritt_momney_id uuid := gen_random_uuid();
subrosa_id uuid := gen_random_uuid();
chelsea_grin_id uuid := gen_random_uuid();
the_red_bennies_id uuid := gen_random_uuid();
form_of_rocket_id uuid := gen_random_uuid();
little_moon_id uuid := gen_random_uuid();
krooked_kings_id uuid := gen_random_uuid();
sunsleeper_id uuid := gen_random_uuid();
meg_and_dia_id uuid := gen_random_uuid();
plastic_cherries_id uuid := gen_random_uuid();
daytime_lover_id uuid := gen_random_uuid();
pixie_party_grass_id uuid := gen_random_uuid();
the_madeline_id uuid := gen_random_uuid();
-- Genre Refs
rock_id uuid;
alt_id uuid;
indie_pop_id uuid;
indie_rock_id uuid;
punk_id uuid;
metal_id uuid;
post_hc_id uuid;
deathcore_id uuid;
emo_id uuid;
doom_id uuid;
synth_id uuid;
folk_id uuid;
BEGIN -- 4a. Ins/Get Genres
INSERT INTO public.genres (name)
VALUES ('Post-Hardcore'),
    ('Deathcore'),
    ('Emo'),
    ('Doom Metal'),
    ('Synthpop'),
    ('Shoegaze'),
    ('Jazz Pop') ON CONFLICT (name) DO NOTHING;
SELECT id INTO rock_id
FROM public.genres
WHERE name = 'Rock'
LIMIT 1;
SELECT id INTO alt_id
FROM public.genres
WHERE name = 'Alternative'
LIMIT 1;
SELECT id INTO indie_pop_id
FROM public.genres
WHERE name = 'Indie Pop'
LIMIT 1;
SELECT id INTO indie_rock_id
FROM public.genres
WHERE name = 'Indie Rock'
LIMIT 1;
SELECT id INTO punk_id
FROM public.genres
WHERE name = 'Punk'
LIMIT 1;
SELECT id INTO metal_id
FROM public.genres
WHERE name = 'Metal'
LIMIT 1;
SELECT id INTO post_hc_id
FROM public.genres
WHERE name = 'Post-Hardcore'
LIMIT 1;
SELECT id INTO deathcore_id
FROM public.genres
WHERE name = 'Deathcore'
LIMIT 1;
SELECT id INTO emo_id
FROM public.genres
WHERE name = 'Emo'
LIMIT 1;
SELECT id INTO doom_id
FROM public.genres
WHERE name = 'Doom Metal'
LIMIT 1;
SELECT id INTO synth_id
FROM public.genres
WHERE name = 'Synthpop'
LIMIT 1;
SELECT id INTO folk_id
FROM public.genres
WHERE name = 'Folk'
LIMIT 1;
-- 4b. Insert Bands
INSERT INTO public.bands (
        id,
        name,
        slug,
        origin_city,
        state,
        formed_year,
        status,
        featured,
        tier,
        description,
        history
    )
VALUES (
        whisperhawk_id,
        'Whisperhawk',
        'whisperhawk',
        'Salt Lake City',
        'UT',
        2017,
        'active',
        true,
        'headliner',
        'High-desert Indie Rock project of Michael Gross, blending melodic sensibilities with Shoshone heritage.',
        'Starting in 2017 after Michael Gross''s tenure with The Brobecks, Whisperhawk has become a staple of the SLC scene, featuring deeply personal and culturally resonant songwriting.'
    ),
    (
        the_used_id,
        'The Used',
        'the-used',
        'Orem',
        'UT',
        2001,
        'active',
        true,
        'platinum',
        'Pioneers of the early 2000s post-hardcore and emo movement.',
        'Formed in Orem, The Used exploded onto the international stage with their self-titled 2002 debut, defining a generation of emo and post-hardcore music.'
    ),
    (
        the_brobecks_id,
        'The Brobecks',
        'the-brobecks',
        'Salt Lake City',
        'UT',
        2002,
        'active',
        true,
        'national_act',
        'Influential indie pop band that launched the careers of Dallon Weekes and Michael Gross.',
        'A cornerstone of the early 2000s SLC indie scene, The Brobecks transitioned through many lineups before evolving into projects like IDKHOW and Whisperhawk. Reunited in 2024.'
    ),
    (
        idkhow_id,
        'I DONT KNOW HOW BUT THEY FOUND ME',
        'idkhow',
        'Salt Lake City',
        'UT',
        2016,
        'active',
        true,
        'platinum',
        'Post-modern indie pop/synthpop project of Dallon Weekes.',
        'Emerging from the legacy of The Brobecks, IDKHOW gained global fame with a retro-futuristic sound and conceptual storytelling.'
    ),
    (
        choir_boy_id,
        'Choir Boy',
        'choir-boy',
        'Salt Lake City',
        'UT',
        2016,
        'active',
        true,
        'national_act',
        'Dreamy synthpop featuring the ethereal baritone of Adam Klopp.',
        'Signed to Dais Records, Choir Boy has brought SLC synthpop to an international audience with their nostalgic yet fresh sound.'
    ),
    (
        ritt_momney_id,
        'Ritt Momney',
        'ritt-momney',
        'Salt Lake City',
        'UT',
        2017,
        'active',
        true,
        'national_act',
        'Indie pop project of Jack Rutter, known for the viral hit "Put Your Records On."',
        'Rising from the SLC garage scene, Ritt Momney achieved massive Billboard success before continuing as a sophisticated indie-pop outfit.'
    ),
    (
        subrosa_id,
        'SubRosa',
        'subrosa',
        'Salt Lake City',
        'UT',
        2005,
        'dissolved',
        true,
        'hof',
        'Experimental doom metal featuring haunting violins and heavy sludge.',
        'SubRosa was internationally acclaimed for their unique take on doom metal, blending chamber music elements with crushing weight.'
    ),
    (
        chelsea_grin_id,
        'Chelsea Grin',
        'chelsea-grin',
        'Salt Lake City',
        'UT',
        2007,
        'active',
        true,
        'national_act',
        'Leading force in the deathcore genre.',
        'Named after the gruesome execution method, Chelsea Grin pioneered the SLC metal scene and became a worldwide name in extreme music.'
    ),
    (
        the_red_bennies_id,
        'The Red Bennies',
        'the-red-bennies',
        'Salt Lake City',
        'UT',
        1994,
        'active',
        true,
        'hof',
        'Legendary experimental punk and performance art collective.',
        'Led by Elliott Harmon, The Red Bennies are the spiritual core of SLC''s underground weirdness, performing since the mid-90s.'
    ),
    (
        form_of_rocket_id,
        'Form of Rocket',
        'form-of-rocket',
        'Salt Lake City',
        'UT',
        2000,
        'dissolved',
        true,
        'hof',
        'High-intensity math-rock and post-hardcore.',
        'Form of Rocket was synonymous with the chaotic energy of early 2000s SLC shows, known for their complex rhythms and explosive performances.'
    ),
    (
        little_moon_id,
        'Little Moon',
        'little-moon',
        'Salt Lake City',
        'UT',
        2019,
        'active',
        true,
        'national_act',
        'Folk-rock project and winner of the 2023 NPR Tiny Desk Contest.',
        'Emma Hardyman''s Little Moon brought national eyes back to SLC after winning out of over 6,000 entries with the song "Madelyn."'
    ),
    (
        meg_and_dia_id,
        'Meg & Dia',
        'meg-and-dia',
        'Draper',
        'UT',
        2004,
        'active',
        true,
        'national_act',
        'Indie rock duo of sisters Meg and Dia Frampton.',
        'Draper-born sisters became emo-era icons with their literature-inspired songwriting and appearance on the Warped Tour.'
    ),
    (
        krooked_kings_id,
        'Krooked Kings',
        'krooked-kings',
        'Salt Lake City',
        'UT',
        2019,
        'active',
        true,
        'headliner',
        'Beach-inspired indie rock from the mountains.',
        'Starting as college friends in SLC, Krooked Kings have rapidly grown a massive following for their sun-drenched, melancholic indie rock.'
    ),
    (
        plastic_cherries_id,
        'Plastic Cherries',
        'plastic-cherries',
        'Salt Lake City',
        'UT',
        2021,
        'active',
        true,
        'headliner',
        'Glam rock and power pop duo with a vintage flair.',
        'One of the most visually and sonically distinct bands in modern SLC, Plastic Cherries have gained national attention for their theatrical performances.'
    ),
    (
        daytime_lover_id,
        'Daytime Lover',
        'daytime-lover',
        'Salt Lake City',
        'UT',
        2020,
        'active',
        false,
        'garage',
        'Indie groove and alternative rock.',
        'A breakout act from the local scene known for their infectious rhythms and soulful vocals.'
    ),
    (
        pixie_party_grass_id,
        'Pixie and the Party Grass Boys',
        'pixie-and-the-party-grass-boys',
        'Salt Lake City',
        'UT',
        2015,
        'active',
        true,
        'headliner',
        'High-energy "party grass" (bluegrass/pop/funk fusion).',
        'Consisting of ski bums and classically trained musicians, they are the undisputed kings of the local festival and party scene.'
    ),
    (
        sunsleeper_id,
        'Sunsleeper',
        'sunsleeper',
        'Salt Lake City',
        'UT',
        2016,
        'active',
        true,
        'headliner',
        'Emo-tinged indie rock with massive hooks.',
        'Signed to Rude Records, Sunsleeper has toured nationally, bringing a polished yet raw SLC sound to the emo/indie world.'
    ),
    (
        the_madeline_id,
        'The Madeline',
        'the-madeline',
        'Salt Lake City',
        'UT',
        2024,
        'active',
        false,
        'garage',
        'Emerging act in the 2026 SLC scene.',
        'Participated in the legendary 2026 Urban Lounge Battle of the Bands.'
    ) ON CONFLICT (slug) DO
UPDATE
SET description = EXCLUDED.description,
    history = EXCLUDED.history,
    featured = EXCLUDED.featured,
    tier = EXCLUDED.tier;
-- Refresh IDs from DB to handle case where they already existed with different IDs
SELECT id INTO whisperhawk_id
FROM public.bands
WHERE slug = 'whisperhawk';
SELECT id INTO the_used_id
FROM public.bands
WHERE slug = 'the-used';
SELECT id INTO the_brobecks_id
FROM public.bands
WHERE slug = 'the-brobecks';
SELECT id INTO idkhow_id
FROM public.bands
WHERE slug = 'idkhow';
SELECT id INTO choir_boy_id
FROM public.bands
WHERE slug = 'choir-boy';
SELECT id INTO ritt_momney_id
FROM public.bands
WHERE slug = 'ritt-momney';
SELECT id INTO subrosa_id
FROM public.bands
WHERE slug = 'subrosa';
SELECT id INTO chelsea_grin_id
FROM public.bands
WHERE slug = 'chelsea-grin';
SELECT id INTO the_red_bennies_id
FROM public.bands
WHERE slug = 'the-red-bennies';
SELECT id INTO form_of_rocket_id
FROM public.bands
WHERE slug = 'form-of-rocket';
SELECT id INTO little_moon_id
FROM public.bands
WHERE slug = 'little-moon';
SELECT id INTO meg_and_dia_id
FROM public.bands
WHERE slug = 'meg-and-dia';
SELECT id INTO krooked_kings_id
FROM public.bands
WHERE slug = 'krooked-kings';
SELECT id INTO plastic_cherries_id
FROM public.bands
WHERE slug = 'plastic-cherries';
SELECT id INTO daytime_lover_id
FROM public.bands
WHERE slug = 'daytime-lover';
SELECT id INTO pixie_party_grass_id
FROM public.bands
WHERE slug = 'pixie-and-the-party-grass-boys';
SELECT id INTO sunsleeper_id
FROM public.bands
WHERE slug = 'sunsleeper';
SELECT id INTO the_madeline_id
FROM public.bands
WHERE slug = 'the-madeline';
-- 4c. Insert Band Genres
INSERT INTO public.band_genres (band_id, genre_id)
VALUES (whisperhawk_id, indie_rock_id),
    (whisperhawk_id, alt_id),
    (the_used_id, post_hc_id),
    (the_used_id, emo_id),
    (the_brobecks_id, indie_pop_id),
    (the_brobecks_id, rock_id),
    (idkhow_id, indie_pop_id),
    (idkhow_id, synth_id),
    (choir_boy_id, synth_id),
    (choir_boy_id, indie_pop_id),
    (ritt_momney_id, indie_pop_id),
    (subrosa_id, doom_id),
    (subrosa_id, metal_id),
    (chelsea_grin_id, deathcore_id),
    (chelsea_grin_id, metal_id),
    (the_red_bennies_id, punk_id),
    (the_red_bennies_id, alt_id),
    (form_of_rocket_id, post_hc_id),
    (form_of_rocket_id, indie_rock_id),
    (little_moon_id, folk_id),
    (little_moon_id, indie_rock_id),
    (meg_and_dia_id, indie_rock_id),
    (meg_and_dia_id, emo_id),
    (krooked_kings_id, indie_rock_id),
    (plastic_cherries_id, rock_id),
    (plastic_cherries_id, indie_pop_id),
    (daytime_lover_id, rock_id),
    (daytime_lover_id, alt_id),
    (pixie_party_grass_id, folk_id),
    (pixie_party_grass_id, indie_pop_id),
    (sunsleeper_id, emo_id),
    (sunsleeper_id, indie_rock_id),
    (the_madeline_id, indie_rock_id) ON CONFLICT DO NOTHING;
-- 4d. Insert Band Links
INSERT INTO public.band_links (band_id, label, url)
VALUES (
        whisperhawk_id,
        'Spotify',
        'https://open.spotify.com/artist/23oK02a8s4oA55rYh4c9R4'
    ),
    (
        the_used_id,
        'Spotify',
        'https://open.spotify.com/artist/0Of70jOXmSbaR96iUqkomZ'
    ),
    (
        the_brobecks_id,
        'Spotify',
        'https://open.spotify.com/artist/1G2it0v0N51Q6C0MvX3mN6'
    ),
    (
        idkhow_id,
        'Spotify',
        'https://open.spotify.com/artist/0qUFIxWzKOfRskPNyE3PtZ'
    ),
    (
        choir_boy_id,
        'Spotify',
        'https://open.spotify.com/artist/0y1SjIuQyCjL5J5b7B576N'
    ),
    (
        ritt_momney_id,
        'Spotify',
        'https://open.spotify.com/artist/7eHKiEPT4qFJKIKEAUi1TD'
    ),
    (
        subrosa_id,
        'Spotify',
        'https://open.spotify.com/artist/5CajK0n7q3p2c3L6m3S5mG'
    ),
    (
        chelsea_grin_id,
        'Spotify',
        'https://open.spotify.com/artist/3TV9mP9A0L4iA7CskT0Gv7'
    ),
    (
        the_red_bennies_id,
        'Spotify',
        'https://open.spotify.com/artist/09D1y257850P2c525xZgP7'
    ),
    (
        form_of_rocket_id,
        'Spotify',
        'https://open.spotify.com/artist/7nAm74cpgxqRwr1dbOWnTd'
    ),
    (
        little_moon_id,
        'Spotify',
        'https://open.spotify.com/artist/6vCjY9w7iXlJ5x7G0p4C5a'
    ),
    (
        meg_and_dia_id,
        'Spotify',
        'https://open.spotify.com/artist/2v5509r5d54q2mX8S8q9O4'
    ),
    (
        krooked_kings_id,
        'Spotify',
        'https://open.spotify.com/artist/39uD0uI7tVp2Y9O0J8T5pM'
    ),
    (
        plastic_cherries_id,
        'Spotify',
        'https://open.spotify.com/artist/4X9H3lXkI1Gq7N2v5N8FjM'
    ) ON CONFLICT DO NOTHING;
END $$;