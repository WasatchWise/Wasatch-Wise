# Valentine's TripKit Build Plan

**Target:** Valentine's / Presidents Day weekend (Feb 14–17, 2026)  
**Purpose:** Timely hook, TikTok validation, real purchase-flow test.  
**Status:** Spec + migration template ready; DB seed and Stripe after you lock the top 5 destinations.

---

## 1. Launch readiness (current)

- **Items 1–4:** Done (guardian images, TripKit sample, destination card 0s, skeleton loading).
- **Items 5–6:** LOW priority, deferrable (FAQ formatting, nav naming).
- **Verdict:** 90/100 GO. Remaining 10 = real usage data, not more pre-launch polish.

**Next 12 days:**

| Priority | Task | Why |
|----------|------|-----|
| 1 | Launch the site | You're ready. Ship it. |
| 2 | Build the Valentine's TripKit | Timely hook, TikTok validation, real purchase test |
| 3 | Monitor real user behavior | What do people click? Where do they drop off? |
| 4 | Items 5–6 if dead time | Or save for post-launch polish sprint |

---

## 2. Valentine's TripKit spec

Use this as the single source of truth for copy, pricing, and URLs.

### 2.1 Identity

| Field | Value |
|-------|--------|
| **Code** | `TK-VAL` (or next free code, e.g. `TK-060`) |
| **Slug** | `valentines-getaways` |
| **Name** | Romantic Road Trips & Valentine's Compendium |
| **Tagline** | Top 20 road trips from SLC + staycation guide + singles guide. Kick-ass compendium—we don't skimp. |
| **Primary theme** | romance, weekend getaway, Presidents' Day, Valentine's, staycation, singles |

### 2.2 Copy (full — use this)

- **Description (card/list):**  
  *"A compendium: Top 20 romantic road trips from SLC (TikTok Top 5 first, then 15 more ranked), plus full staycation guide (Presidents' Day itineraries, Valentine's events, spas, restaurants, hotels) and singles guide (Craft & Crush, Galentine's, speed dating). We go to the nth degree—no skimping."*
- **Value proposition (detail page):**  
  *"One compendium: 20 road-trip destinations with drive times, lodging, brunch hooks; staycation itineraries (ski + spa, Midway winter escape, culture + cuisine); Valentine's events and restaurants in SLC; and singles events so everyone has a move. Kick-ass shit, all in one place."*
- **Meta title:**  
  `Romantic Road Trips & Valentine's Compendium | SLC | SLCTrips`
- **Meta description:**  
  `Top 20 romantic road trips from Salt Lake City + staycation guide + singles guide. Presidents' Day weekend, Valentine's events, Craft & Crush, itineraries. We don't skimp.`

### 2.3 Pricing

| Field | Value |
|-------|--------|
| **Price** | $12.99 (20 road trips + staycation + singles compendium = kick-ass value) |
| **Founder price** | $9.99 for launch week |
| **Stripe** | Create Product + Price in Dashboard (or API); store `stripe_product_id` and `stripe_price_id` on the TripKit row. |

### 2.3b What's actually in the TripKit (features[] — put this in the TripKit row)

Use these as the **features** array so "What's Included" on the detail page reflects the compendium:

- **Top 20 romantic road trips** from SLC (TikTok Top 5 first, then 15 more ranked)—full profiles, drive times, lodging, brunch hooks
- **Staycation compendium** (Resource Center): Presidents' Day weekend itineraries (ski + spa, Midway winter escape, culture + cuisine), Valentine's events, spas, romantic restaurants, staycation hotels
- **Singles compendium** (Resource Center): Craft & Crush, Galentine's, speed dating, mixers, LGBTQ+ events—single on Valentine's? You're covered
- Best season and 3 couples-friendly activities per destination (research in the product)
- Insider angles (Lava Hot Springs debate, Great Basin "interned there" vibe)
- Learning objectives (TK-VAL in tripkit-learning-objectives.ts)—planning, local-knowledge, safety, culture

### 2.3c Resources (staycation + singles compendium)

The TripKit **resources[]** array powers the Resource Center in the viewer. Add three resources so buyers get the full compendium:

1. **staycation-itineraries** — Presidents' Day weekend itineraries (Valentine's Perfect Date, Luxury Splurge, Ski + Spa Weekend, Midway Winter Escape, Culture + Cuisine). Markdown content in `docs/VALENTINES_COMPENDIUM_RESOURCES.md`.
2. **valentines-slc-events** — Valentine's events, couples spas, romantic restaurants, staycation hotels in SLC.
3. **singles-events** — Craft & Crush, The Love Club, Strike Your Match, Thursday™, Valentine's Tantra Speed Date, Sapphic Night Out, LGBTQ+ mixers.

**Category mapping (already in TripKitResourceCenter):** `staycation-itineraries` → Planning, `valentines-slc-events` and `singles-events` → Essentials.

Build the JSON array from the markdown in `VALENTINES_COMPENDIUM_RESOURCES.md` and set `tripkits.resources` (JSONB) on the TripKit row.

### 2.4 Destinations: Top 20 road trips (start here; you've got way more)

**Order:** TikTok Top 5 first (the hook), then the rest of the Top 20 from the research. This TripKit is a **compendium**—start with the Top 20 road trips; you can add more destinations later.

**1–5 (TikTok — verified):** Lava Hot Springs, Bonneville Salt Flats, Mirror Lake Highway, Goblin Valley State Park, Great Basin NP.  
**6–20 (from research — verify slugs in DB, then add to tripkit_destinations):** Park City, Midway/Heber Valley, Zion NP & Springdale, Bryce Canyon NP, Mystic Hot Springs, Antelope Island, Capitol Reef & Torrey, Moab & Arches, Scenic Byway 12 & Boulder, Bear Lake, Lake Tahoe, Telluride, Kanab, Monument Valley, Sedona. (Use your actual destination slugs; look up IDs and add rows 6–20 to the INSERT.)

**Plus (not destinations—they're in the Resource Center):** Staycation itineraries, Valentine's events/spas/restaurants/hotels, singles events. See **§2.3c Resources (staycation + singles)** and `docs/VALENTINES_COMPENDIUM_RESOURCES.md`.

**Engagement (TikTok):** 3,094 likes, 17 comments, **1,508 saves** ← saves = purchase intent. Comments include real engagement and debate about Lava Hot Springs—address in TripKit with insider tips.

**Check that all 5 exist in your DB:** Run `npx tsx scripts/check-valentines-destinations.ts` from `apps/slctrips`. The script reports which exist (id, name, slug) and which are missing; if all exist, it prints ready-to-use IDs for the `tripkit_destinations` INSERT.

**Put the research INTO the product:**  
1. **Destinations:** Run `supabase/migrations/20260202100000_valentines_destination_content.sql` after the TikTok 5 exist. It UPDATEs those 5 with ai_summary and ai_tips. Do the same for 6–20 (by slug) when you add them—full profiles, no skimping.  
2. **Staycation + singles:** Add the **resources[]** array to the TripKit row from `docs/VALENTINES_COMPENDIUM_RESOURCES.md` (staycation itineraries, Valentine's events/spas/restaurants/hotels, singles events). The Resource Center will show them under Essentials and Planning.

**Full research:** `docs/VALENTINES_RESEARCH_2026.md` (Top 20 road trips, profiles), `docs/VALENTINES_COMPENDIUM_RESOURCES.md` (staycation + singles content for resources[]).

### 2.5 How comprehensive vs other TripKits — and value

**Comparison to existing paid TripKits:**

| TripKit | Destinations | Price | Per-destination | What it is |
|---------|--------------|-------|-----------------|------------|
| Coffee Culture | 29 | $9.99 | $0.34 | Themed list (cafés) |
| Secret Springs | 55 | $10.99 | $0.20 | Themed list (hot springs) |
| Ski Utah | 86 | $12.99 | $0.15 | Themed list (resorts) |
| Haunted Highway | 94 | $14.99 | $0.16 | Themed list (haunts) |
| Brewery Trail | 97 | $24.99 | $0.26 | Themed list (breweries) |
| **Romantic Road Trips & Valentine's Compendium** | **20** | **$12.99** | **$0.65** | **Top 20 road trips + staycation + singles; compendium, no skimp** |

**Comprehensiveness:**

- **Destination count:** 20 (Top 20 road trips). **Plus** staycation compendium (resources) and singles compendium (resources)—so the product is a full compendium, not just destinations.
- **Content depth:** Each of the 5 destinations uses whatever content already lives on their destination pages (ai_summary, ai_tips, drive time, etc.). You have **rich research** in `VALENTINES_RESEARCH_2026.md` (why romantic, 3 activities, lodging, brunch hook, insider angles) — use it to beef up those destination pages or TripKit copy over time. We did **not** pre-populate every destination row with that text; we gave you the reference.
- **TripKit-level fields:** Other kits have `learning_objectives`, `estimated_time`, `difficulty_level` (and some have `curriculum_alignment`). Valentine's build doc and migration template **did not** initially spell these out. For **parity** with other TripKits (so the detail page shows "Estimated time" and "Difficulty" and optionally the Instructional Design block), add:
  - **estimated_time:** e.g. `"Weekend"` or `"2–4 days"`.
  - **difficulty_level:** e.g. `"Easy"` (driving + light activity).
  - **learning_objectives:** Either set in DB (if your schema stores them) or add `TK-VAL` to `src/data/tripkit-learning-objectives.ts` with a few romance/planning objectives (e.g. "Plan a romantic weekend route from SLC," "Choose the right spot for your vibe"). Only 6 existing TripKits have entries in that file; others show no objectives block.

**Value vs other TripKits:**

- **Higher per-destination price** ($2/destination vs $0.15–$0.34) is justified by: **curation** (only 5, not 90), **timeliness** (Valentine's / Presidents' Day), and **social proof** (TikTok saves/comments). Frame it as "the list people are saving" and "one weekend, done" — not "more destinations."
- **Risk:** If users compare "5 for $10" to "29 for $10" (Coffee Culture), they may see Valentine's as thin unless the copy stresses **quality and intent** (romantic weekend, validated by engagement, no overwhelm).

**Recommendation:** Add `estimated_time` and `difficulty_level` to the TripKit row, and optionally add `TK-VAL` to `tripkit-learning-objectives.ts`. That makes Valentine's **as comprehensive** as the others in the fields the app actually displays, while keeping the product position clear: short, curated, timely.

---

## 3. Technical build

### 3.1 Stripe (do first)

1. In Stripe Dashboard (or via API): create a **Product**  
   - Name: `Valentine's Getaways`  
   - Description: same as “Description” above (or shortened).
2. Add a **Price** to that product: one-time, USD, amount in cents (e.g. $9.99 → `999`).
3. Copy **Product ID** (`prod_…`) and **Price ID** (`price_…`) for the migration/seed.

### 3.2 Database: TripKit row

Your `tripkits` table has many columns; existing rows define the real schema. Match an existing paid TripKit (e.g. Haunted Highway, Brewery Trail) and re-use the same column set.

**Required / important fields (conceptual):**

- `id` – UUID (generate new, e.g. `gen_random_uuid()` in Postgres).
- `code` – `'TK-VAL'` (or chosen code).
- `name`, `slug`, `tagline`, `description`, `value_proposition`, `meta_title`, `meta_description`.
- `price`, `founder_price`, `regular_price` (in dollars, e.g. `9.99`).
- `stripe_product_id`, `stripe_price_id` – from Stripe step above.
- `status` – `'active'`.
- `destination_count` – `20`.
- `cover_image_url` – URL to a Valentine’s/romantic image (e.g. Park City or red rocks); can be same as an existing destination image or a new asset.
- **Parity with other TripKits (recommended):** `estimated_time` – e.g. `'Weekend'` or `'2–4 days'`; `difficulty_level` – e.g. `'Easy'`. Optionally add `TK-VAL` to `src/data/tripkit-learning-objectives.ts` for the Instructional Design block.
- `collection_type`, `primary_theme`, `tier`, `states_covered`, `keywords`, `target_audience`, `features`, etc. – copy pattern from an existing paid TripKit and adjust for romance/weekend.

**Checklist:**

- [ ] Resolve exact column list from Supabase (e.g. `SELECT * FROM tripkits LIMIT 1`) or from an existing migration.
- [ ] Create Stripe Product + Price and note IDs.
- [ ] Insert one row into `tripkits` with the above (and any NOT NULL defaults your schema has).

### 3.3 Database: Link destinations

- Table: `tripkit_destinations`.
- Columns: `tripkit_id` (UUID of the new TripKit), `destination_id` (UUID from `public_destinations` / `destinations`).
- If you have `display_order`, set it (1–5) so the “first” destination is the one you want as the TripKit detail sample.

**Resolving destination IDs:**

```sql
-- Example: get IDs by slug (table name may be public_destinations or destinations)
SELECT id, name, slug FROM public_destinations
WHERE slug IN ('park-city', 'sundance', 'midway', 'moab', 'zion-national-park');
```

Then insert into `tripkit_destinations`:

```sql
-- After you have tripkit_id and the 5 destination_id UUIDs
INSERT INTO tripkit_destinations (tripkit_id, destination_id, display_order)
VALUES
  ('<tripkit_uuid>', '<dest_1_uuid>', 1),
  ('<tripkit_uuid>', '<dest_2_uuid>', 2),
  ('<tripkit_uuid>', '<dest_3_uuid>', 3),
  ('<tripkit_uuid>', '<dest_4_uuid>', 4),
  ('<tripkit_uuid>', '<dest_5_uuid>', 5);
```

(If `display_order` doesn’t exist, omit it and rely on insert order; the app may order by `destination_id` or a default. Check `tripkits/[slug]/page.tsx` and `view/page.tsx` for how they order destinations.)

---

## 4. Migration template (Supabase)

Use this as a **template**. Replace placeholders and align with your real schema.

```sql
-- Valentine's TripKit: run after creating Stripe product/price and resolving destination UUIDs.
-- 1) Insert TripKit (match your actual tripkits columns; this is a minimal pattern).
INSERT INTO tripkits (
  id,
  code,
  name,
  slug,
  tagline,
  description,
  value_proposition,
  meta_title,
  meta_description,
  price,
  founder_price,
  regular_price,
  stripe_product_id,
  stripe_price_id,
  status,
  destination_count,
  cover_image_url,
  collection_type,
  primary_theme,
  tier,
  states_covered,
  -- add any other NOT NULL or required columns from your schema
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TK-VAL',
  'Romantic Road Trips & Valentine''s Compendium',
  'valentines-getaways',
  'Top 20 road trips from SLC + staycation guide + singles guide. We don''t skimp.',
  'A compendium: Top 20 romantic road trips (TikTok Top 5 first, then 15 more ranked), plus full staycation guide (Presidents'' Day itineraries, Valentine''s events, spas, restaurants, hotels) and singles guide (Craft & Crush, Galentine''s, speed dating). Nth degree.',
  'One compendium: 20 road-trip destinations + staycation itineraries + Valentine''s events + singles events. Kick-ass shit, all in one place.',
  'Romantic Road Trips & Valentine''s Compendium | SLC | SLCTrips',
  'Top 20 romantic road trips from Salt Lake City + staycation guide + singles guide. Presidents'' Day weekend, Valentine''s events, Craft & Crush. We don''t skimp.',
  12.99,
  9.99,
  12.99,
  'prod_XXXXX',   -- from Stripe
  'price_XXXXX',  -- from Stripe
  'active',
  20,
  'https://...',  -- cover image URL
  'curated',      -- or whatever your enum/value is
  'romance',
  'basic',        -- or 'plus' / 'premium'
  ARRAY['UT'],
  now(),
  now()
);

-- 2) Get the new TripKit id (run in same transaction or copy from Supabase after insert)
-- SELECT id FROM tripkits WHERE code = 'TK-VAL';

-- 3) Insert junction rows (replace <tripkit_id> and destination UUIDs from SELECT above)
-- INSERT INTO tripkit_destinations (tripkit_id, destination_id, display_order)
-- VALUES
--   ('<tripkit_id>', '<uuid_1>', 1),
--   ('<tripkit_id>', '<uuid_2>', 2),
--   ...
```

---

## 5. After the TripKit is live

- **TripKits listing:** It will show automatically at `/tripkits` (status `active`).
- **Detail page:** `/tripkits/valentines-getaways` — same layout as other TripKits; “Sample from this TripKit” will use the first linked destination.
- **Checkout:** Existing flow: user signs in → TripKit Purchase → Stripe Checkout; webhook grants access; user sees it in My TripKits.
- **Promo:** Link from TikTok/email:  
  `https://www.slctrips.com/tripkits/valentines-getaways?utm_source=tiktok&utm_medium=social&utm_campaign=slctrips-valentines`

### Post-launch polish (optional)

- **Hero image:** Upload a Valentine/romantic-themed cover image and set `cover_image_url` on the TripKit row (code `TK-VAL`) so the detail page shows a proper hero instead of "No photo".
- **Stripe product:** Create a product in the Stripe dashboard for cleaner reporting; then update the row’s `stripe_product_id` and `stripe_price_id`. Checkout already works with `price_data` from the row, so this is optional.

---

## 6. Quick reference

| What | Where |
|------|--------|
| TripKit list | `src/app/tripkits/page.tsx` |
| TripKit detail | `src/app/tripkits/[slug]/page.tsx` |
| TripKit view (post-purchase) | `src/app/tripkits/[slug]/view/page.tsx` |
| Checkout | `src/app/api/stripe/create-checkout/route.ts` |
| Stripe webhook (grant access) | `src/app/api/webhooks/stripe/route.ts` |
| Launch playbook | `TRIPKIT_LAUNCH_PLAYBOOK.md` |

---

## 7. Status

**Valentine’s TripKit is live.** TripKit row inserted, 20 destinations linked, page at `/tripkits/valentines-getaways`, pricing and Buy flow working. See **Post-launch polish** above for optional hero image and Stripe product.

---

*Last updated: February 2, 2026*
