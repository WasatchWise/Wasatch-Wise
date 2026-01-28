-- Migration: Add January 2026 events from deep scan
-- Created: 2026-01-01
DO $$
DECLARE v_kilby_id uuid;
v_urban_id uuid;
v_metro_id uuid;
v_ice_haus_id uuid;
v_soundwell_id uuid;
v_depot_id uuid;
BEGIN -- Get venue IDs
SELECT id INTO v_kilby_id
FROM venues
WHERE slug = 'kilby-court';
SELECT id INTO v_urban_id
FROM venues
WHERE slug = 'urban-lounge';
SELECT id INTO v_metro_id
FROM venues
WHERE slug = 'metro-music-hall';
SELECT id INTO v_ice_haus_id
FROM venues
WHERE slug = 'ice-haus';
SELECT id INTO v_soundwell_id
FROM venues
WHERE slug = 'soundwell';
SELECT id INTO v_depot_id
FROM venues
WHERE slug = 'the-depot';
-- Kilby Court Shows
INSERT INTO events (name, venue_id, start_time, description)
VALUES (
        'CLUB MUNGO Album Release',
        v_kilby_id,
        '2026-01-02 18:00:00-07',
        'w/ Bad Luck Brigade, Roses On The Moon'
    ),
    (
        'Early Bird',
        v_kilby_id,
        '2026-01-03 18:00:00-07',
        'w/ Lemon Bread, Runaway Fighter, Gayt'
    ),
    (
        'Will Sangster & The Fine Chaps',
        v_kilby_id,
        '2026-01-04 18:00:00-07',
        'w/ Raccoon Rodeo'
    ),
    (
        'Stage Fright Album Release',
        v_kilby_id,
        '2026-01-06 18:00:00-07',
        'w/ You Shall Know Our Velocity'
    ),
    (
        'LaLion',
        v_kilby_id,
        '2026-01-07 18:00:00-07',
        'w/ Connor Cristi'
    ),
    (
        'Ferrin',
        v_kilby_id,
        '2026-01-08 18:00:00-07',
        'w/ Attagirl, Wildberry'
    );
-- Urban Lounge Shows
INSERT INTO events (name, venue_id, start_time, description)
VALUES (
        'Eagle Twin',
        v_urban_id,
        '2026-01-02 20:00:00-07',
        'Local legends return'
    ),
    (
        'Let It Happen - Tame Impala Dance Party',
        v_urban_id,
        '2026-01-10 21:00:00-07',
        '21+ Event'
    ),
    (
        'The Toasters',
        v_urban_id,
        '2026-01-21 19:00:00-07',
        'Ska legends'
    ),
    (
        'Battle Of The Bands - FINALE!',
        v_urban_id,
        '2026-01-31 19:00:00-07',
        'The big showdown'
    );
-- Metro Music Hall Shows
INSERT INTO events (name, venue_id, start_time, description)
VALUES (
        'Brenda Famina',
        v_metro_id,
        '2026-01-02 19:00:00-07',
        'Live performance'
    ),
    (
        'The Lunatics Ball',
        v_metro_id,
        '2026-01-03 20:30:00-07',
        'Evening of madness'
    ),
    (
        'Sapphic Playground',
        v_metro_id,
        '2026-01-10 20:00:00-07',
        'Community dance party'
    );
-- Soundwell
INSERT INTO events (name, venue_id, start_time, description)
VALUES (
        'LaRussell Live',
        v_soundwell_id,
        '2026-01-08 19:00:00-07',
        'Hiphop performance'
    ),
    (
        'Slushii',
        v_soundwell_id,
        '2026-01-10 19:00:00-07',
        'EDM tour'
    );
END $$;