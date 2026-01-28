-- Salt Lake City Scene Connections (Member & Performance Web)
-- Robust Version with Fallback Checks
-- 0. Ensure Unique Constraints & Columns Exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'musicians_slug_key'
) THEN BEGIN
ALTER TABLE public.musicians
ADD CONSTRAINT musicians_slug_key UNIQUE (slug);
EXCEPTION
WHEN duplicate_object THEN NULL;
END;
END IF;
-- Ensure events table columns exist (handling schema drift)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_time timestamptz;
END $$;
DO $$
DECLARE -- Musicians
    michael_gross_id uuid := gen_random_uuid();
dallon_weekes_id uuid := gen_random_uuid();
tyler_glenn_id uuid := gen_random_uuid();
dan_reynolds_id uuid := gen_random_uuid();
meg_frampton_id uuid := gen_random_uuid();
dia_frampton_id uuid := gen_random_uuid();
bert_mccracken_id uuid := gen_random_uuid();
adam_klopp_id uuid := gen_random_uuid();
-- Band IDs
whisperhawk_id uuid;
the_brobecks_id uuid;
idkhow_id uuid;
the_used_id uuid;
neon_trees_id uuid;
imagine_dragons_id uuid;
meg_and_dia_id uuid;
choir_boy_id uuid;
the_red_bennies_id uuid;
form_of_rocket_id uuid;
-- Event IDs
legendary_kilby_show_id uuid := gen_random_uuid();
urban_lounge_mini_fest_id uuid := gen_random_uuid();
BEGIN -- 2. Fetch/Validate Band IDs (Fail-safe check)
SELECT id INTO whisperhawk_id
FROM public.bands
WHERE slug = 'whisperhawk'
LIMIT 1;
SELECT id INTO the_brobecks_id
FROM public.bands
WHERE slug IN ('the-brobecks', 'brobecks')
LIMIT 1;
SELECT id INTO idkhow_id
FROM public.bands
WHERE slug IN (
        'idkhow',
        'i-dont-know-how-but-they-found-me',
        'idk-how'
    )
    OR lower(name) LIKE '%idk%how%'
LIMIT 1;
SELECT id INTO the_used_id
FROM public.bands
WHERE slug IN ('the-used', 'used')
LIMIT 1;
SELECT id INTO neon_trees_id
FROM public.bands
WHERE slug = 'neon-trees'
LIMIT 1;
SELECT id INTO imagine_dragons_id
FROM public.bands
WHERE slug = 'imagine-dragons'
LIMIT 1;
SELECT id INTO meg_and_dia_id
FROM public.bands
WHERE slug IN ('meg-and-dia', 'meg-dia')
LIMIT 1;
SELECT id INTO choir_boy_id
FROM public.bands
WHERE slug = 'choir-boy'
LIMIT 1;
SELECT id INTO the_red_bennies_id
FROM public.bands
WHERE slug IN ('the-red-bennies', 'red-bennies')
LIMIT 1;
SELECT id INTO form_of_rocket_id
FROM public.bands
WHERE slug IN ('form-of-rocket', 'form-rocket')
LIMIT 1;
-- 3. Insert Musicians
INSERT INTO public.musicians (id, name, slug, role)
VALUES (
        michael_gross_id,
        'Michael Gross',
        'michael-gross',
        'Vocals, Guitar'
    ),
    (
        dallon_weekes_id,
        'Dallon Weekes',
        'dallon-weekes',
        'Vocals, Bass'
    ),
    (
        tyler_glenn_id,
        'Tyler Glenn',
        'tyler-glenn',
        'Vocals'
    ),
    (
        dan_reynolds_id,
        'Dan Reynolds',
        'dan-reynolds',
        'Vocals'
    ),
    (
        meg_frampton_id,
        'Meg Frampton',
        'meg-frampton',
        'Guitar, Vocals'
    ),
    (
        dia_frampton_id,
        'Dia Frampton',
        'dia-frampton',
        'Vocals'
    ),
    (
        bert_mccracken_id,
        'Bert McCracken',
        'bert-mccracken',
        'Vocals'
    ),
    (
        adam_klopp_id,
        'Adam Klopp',
        'adam-klopp',
        'Vocals'
    ) ON CONFLICT (slug) DO
UPDATE
SET name = EXCLUDED.name;
-- 4. Re-fetch IDs (All IDs are now guaranteed in DB)
SELECT id INTO michael_gross_id
FROM public.musicians
WHERE slug = 'michael-gross'
LIMIT 1;
SELECT id INTO dallon_weekes_id
FROM public.musicians
WHERE slug = 'dallon-weekes'
LIMIT 1;
SELECT id INTO tyler_glenn_id
FROM public.musicians
WHERE slug = 'tyler-glenn'
LIMIT 1;
SELECT id INTO dan_reynolds_id
FROM public.musicians
WHERE slug = 'dan-reynolds'
LIMIT 1;
SELECT id INTO meg_frampton_id
FROM public.musicians
WHERE slug = 'meg-frampton'
LIMIT 1;
SELECT id INTO dia_frampton_id
FROM public.musicians
WHERE slug = 'dia-frampton'
LIMIT 1;
SELECT id INTO bert_mccracken_id
FROM public.musicians
WHERE slug = 'bert-mccracken'
LIMIT 1;
SELECT id INTO adam_klopp_id
FROM public.musicians
WHERE slug = 'adam-klopp'
LIMIT 1;
-- 4. Robust Connection Inserts (Skip if Band ID is NULL)
IF whisperhawk_id IS NOT NULL
AND michael_gross_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        whisperhawk_id,
        michael_gross_id,
        'Founder, Vocals',
        2017
    ) ON CONFLICT DO NOTHING;
END IF;
IF the_brobecks_id IS NOT NULL THEN IF michael_gross_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        the_brobecks_id,
        michael_gross_id,
        'Guitar, Vocals',
        2002
    ) ON CONFLICT DO NOTHING;
END IF;
IF dallon_weekes_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        the_brobecks_id,
        dallon_weekes_id,
        'Bass, Vocals',
        2003
    ) ON CONFLICT DO NOTHING;
END IF;
END IF;
IF idkhow_id IS NOT NULL
AND dallon_weekes_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        idkhow_id,
        dallon_weekes_id,
        'Founder, Vocals',
        2016
    ) ON CONFLICT DO NOTHING;
END IF;
IF imagine_dragons_id IS NOT NULL
AND dan_reynolds_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        imagine_dragons_id,
        dan_reynolds_id,
        'Lead Vocals',
        2008
    ) ON CONFLICT DO NOTHING;
END IF;
IF neon_trees_id IS NOT NULL
AND tyler_glenn_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        neon_trees_id,
        tyler_glenn_id,
        'Lead Vocals',
        2005
    ) ON CONFLICT DO NOTHING;
END IF;
IF the_used_id IS NOT NULL
AND bert_mccracken_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        the_used_id,
        bert_mccracken_id,
        'Lead Vocals',
        2001
    ) ON CONFLICT DO NOTHING;
END IF;
IF meg_and_dia_id IS NOT NULL THEN IF meg_frampton_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (meg_and_dia_id, meg_frampton_id, 'Guitar', 2004) ON CONFLICT DO NOTHING;
END IF;
IF dia_frampton_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (
        meg_and_dia_id,
        dia_frampton_id,
        'Lead Vocals',
        2004
    ) ON CONFLICT DO NOTHING;
END IF;
END IF;
IF choir_boy_id IS NOT NULL
AND adam_klopp_id IS NOT NULL THEN
INSERT INTO public.band_members (band_id, musician_id, role, tenure_start)
VALUES (choir_boy_id, adam_klopp_id, 'Lead Vocals', 2016) ON CONFLICT DO NOTHING;
END IF;
-- 5. Performance Connections
INSERT INTO public.events (id, name, city, state, start_time, description)
VALUES (
        legendary_kilby_show_id,
        'SLC Legends: The Red Bennies + Form of Rocket',
        'Salt Lake City',
        'UT',
        '2004-06-15 20:00:00+00',
        'A foundational performance that defined the 2004 SLC indie scene.'
    ),
    (
        urban_lounge_mini_fest_id,
        'Spider Network Showcase: Choir Boy + Ritt Momney',
        'Salt Lake City',
        'UT',
        '2023-09-20 19:00:00+00',
        'A modern showcase of the Salt Lake synth and indie pop trajectory.'
    ) ON CONFLICT (id) DO NOTHING;
-- Performance links with NULL checks
IF the_red_bennies_id IS NOT NULL THEN
INSERT INTO public.event_bands (event_id, band_id, slot_order, is_headliner)
VALUES (
        legendary_kilby_show_id,
        the_red_bennies_id,
        2,
        true
    ) ON CONFLICT DO NOTHING;
END IF;
IF form_of_rocket_id IS NOT NULL THEN
INSERT INTO public.event_bands (event_id, band_id, slot_order, is_headliner)
VALUES (
        legendary_kilby_show_id,
        form_of_rocket_id,
        1,
        false
    ) ON CONFLICT DO NOTHING;
END IF;
IF choir_boy_id IS NOT NULL THEN
INSERT INTO public.event_bands (event_id, band_id, slot_order, is_headliner)
VALUES (urban_lounge_mini_fest_id, choir_boy_id, 2, true) ON CONFLICT DO NOTHING;
END IF;
IF whisperhawk_id IS NOT NULL THEN
INSERT INTO public.event_bands (event_id, band_id, slot_order, is_headliner)
VALUES (
        urban_lounge_mini_fest_id,
        whisperhawk_id,
        1,
        false
    ) ON CONFLICT DO NOTHING;
END IF;
END $$;