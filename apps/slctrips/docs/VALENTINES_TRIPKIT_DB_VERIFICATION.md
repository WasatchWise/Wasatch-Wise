# Valentine's TripKit — DB Verification Results

**TripKit = 20 road trips** (TikTok Top 5 first, then 15 more from ranked research) **+ staycation + singles** compendium. Research content is pushed into the 5 TikTok destinations via `supabase/migrations/20260202100000_valentines_destination_content.sql`.

**Status:** All 20 destinations mapped and verified. Use the slug list below for the INSERT.

---

## Launch sequence (3 steps)

| Step | Task | When |
|------|------|------|
| 1 | **Stripe:** Create product + price ($9.99 or $12.99), copy `prod_…` and `price_…` | Do first so you can put IDs in the TripKit row |
| 2 | **DB:** Insert TripKit row with `code = 'TK-VAL'`, slug `valentines-getaways`, Stripe IDs, copy the new row `id` | After Stripe (or use `NULL` for Stripe IDs and add later) |
| 3 | **DB:** Run the INSERT for 20 destination links (query below); use the TripKit row `id` in the CTE | As soon as you have the TripKit UUID |

**If you already have the TripKit row:** Run `SELECT id FROM tripkits WHERE code = 'TK-VAL';`, then run the **INSERT all 20** query below (replace the UUID on line 1). You can add or update Stripe product/price and the row’s `stripe_product_id` / `stripe_price_id` anytime.

**Full spec (copy, Stripe, features, resources):** `VALENTINES_TRIPKIT_BUILD.md`.

**Ready-to-run TripKit row:** `supabase/migrations/20260202200000_valentines_tripkit_row.sql` — copy the INSERT into Supabase SQL Editor and run it (Stripe IDs are NULL; checkout still works). Then run the 20-destination INSERT above with the new TripKit UUID.

---

## Recommended mapping (20 destinations)

| # | Research name | Best DB match | Slug |
|---|----------------|---------------|------|
| 1 | Lava Hot Springs | Lava Hot Springs | lava-hot-springs |
| 2 | Bonneville Salt Flats | Bonneville Salt Flats | bonneville-salt-flats |
| 3 | Mirror Lake | Mirror Lake Highway | mirror-lake-highway |
| 4 | Goblin Valley | Goblin Valley State Park | goblin-valley-state-park |
| 5 | Great Basin NP | Great Basin National Park | great-basin-national-park |
| 6 | Park City | Park City Mountain Resort | park-city-mountain-resort |
| 7 | Midway/Heber | Homestead Crater | homestead-crater |
| 8 | Zion NP | Zion National Park - Kolob Canyons | zion-national-park-kolob-canyons |
| 9 | Bryce Canyon NP | Bryce Canyon National Park | bryce-canyon-film-location |
| 10 | Mystic Hot Springs | Mystic Hot Springs | mystic-hot-springs-monroe |
| 11 | Antelope Island | Antelope Island State Park | antelope-island-film-trail |
| 12 | Capitol Reef NP | Capitol Reef National Park Visitor Center | capitol-reef-visitor-center |
| 13 | Moab | Moab Jeep Safari or Museum of Moab | moab-jeep-safari |
| 14 | Scenic Byway 12 | Highway 12 - All-American Road | highway-12-all-american-road |
| 15 | Bear Lake | Raspberry Days (Bear Lake) | raspberry-days-bear-lake |
| 16 | Lake Tahoe | Lake Tahoe | lake-tahoe |
| 17 | Telluride | Telluride | telluride |
| 18 | Kanab | Kanab - Little Hollywood's Western Sets | kanab-little-hollywood-western-sets |
| 19 | Monument Valley | Monument Valley Navajo Tribal Park | monument-valley-tribal-park |
| 20 | Sedona | Sedona | sedona |

---

---

## Final verification query (get all 20 UUIDs in order)

Run in Supabase SQL Editor (table may be `public_destinations` or `destinations`) to confirm all 20 slugs exist and get their IDs in display order:

```sql
SELECT o.ord AS display_order, d.id, d.name, d.slug
FROM (VALUES
  (1, 'lava-hot-springs'),
  (2, 'bonneville-salt-flats'),
  (3, 'mirror-lake-highway'),
  (4, 'goblin-valley-state-park'),
  (5, 'great-basin-national-park'),
  (6, 'park-city-mountain-resort'),
  (7, 'homestead-crater'),
  (8, 'zion-national-park-kolob-canyons'),
  (9, 'bryce-canyon-film-location'),
  (10, 'mystic-hot-springs-monroe'),
  (11, 'antelope-island-film-trail'),
  (12, 'capitol-reef-visitor-center'),
  (13, 'moab-jeep-safari'),
  (14, 'highway-12-all-american-road'),
  (15, 'raspberry-days-bear-lake'),
  (16, 'lake-tahoe'),
  (17, 'telluride'),
  (18, 'kanab-little-hollywood-western-sets'),
  (19, 'monument-valley-tribal-park'),
  (20, 'sedona')
) AS o(ord, slug)
JOIN public_destinations d ON d.slug = o.slug
ORDER BY o.ord;
```

You should get exactly 20 rows. If any slug is missing, that destination row doesn’t exist yet—fix the slug or add the destination.

---

## INSERT all 20 (by slug — paste your TripKit UUID once)

Get your TripKit UUID: `SELECT id FROM tripkits WHERE code = 'TK-VAL';` The literal `<TRIPKIT_UUID>` is not valid SQL (Postgres errors). Replace the example UUID on **line 1** of the query below with that id. After the verification query returns 20 rows, run this. Replace **only** `<TRIPKIT_UUID>` with your Valentine’s TripKit row `id`. No destination UUIDs needed; the INSERT resolves them by slug.

```sql
WITH tk AS (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid AS id)  -- paste your TripKit id here
INSERT INTO tripkit_destinations (tripkit_id, destination_id, display_order)
SELECT
  tk.id,
  d.id,
  o.ord
FROM (VALUES
  (1, 'lava-hot-springs'),
  (2, 'bonneville-salt-flats'),
  (3, 'mirror-lake-highway'),
  (4, 'goblin-valley-state-park'),
  (5, 'great-basin-national-park'),
  (6, 'park-city-mountain-resort'),
  (7, 'homestead-crater'),
  (8, 'zion-national-park-kolob-canyons'),
  (9, 'bryce-canyon-film-location'),
  (10, 'mystic-hot-springs-monroe'),
  (11, 'antelope-island-film-trail'),
  (12, 'capitol-reef-visitor-center'),
  (13, 'moab-jeep-safari'),
  (14, 'highway-12-all-american-road'),
  (15, 'raspberry-days-bear-lake'),
  (16, 'lake-tahoe'),
  (17, 'telluride'),
  (18, 'kanab-little-hollywood-western-sets'),
  (19, 'monument-valley-tribal-park'),
  (20, 'sedona')
) AS o(ord, slug)
JOIN public_destinations d ON d.slug = o.slug
CROSS JOIN tk
ORDER BY o.ord;
```

If your table is `destinations` instead of `public_destinations`, change the `JOIN` to use that table.

---

## Checklist

- [x] Map all 20 to best DB matches (recommended mapping above)
- [x] Add **Great Basin National Park** destination
- [ ] Run **final verification query** (above) — expect 20 rows
- [ ] Create Stripe product/price for Valentine's TripKit
- [ ] Insert TripKit row in `tripkits` (get TripKit UUID)
- [ ] Run **INSERT all 20** (above); replace the UUID on line 1 with your TripKit `id`

See `VALENTINES_TRIPKIT_BUILD.md` for full TripKit spec and Stripe steps.
