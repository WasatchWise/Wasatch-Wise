# Valentine's & Presidents' Day Compendium — TripKit Resources

**Purpose:** The TripKit is a **compendium**: Top 20 romantic road trips (destinations) **plus** staycation guide **plus** singles guide. This doc defines the **resources[]** array for the TripKit row so the Resource Center shows staycation + singles content.

**Key dates 2026:** Valentine's Day = Saturday Feb 14; Presidents' Day weekend = Feb 14–16.

---

## Resource objects (for `tripkits.resources` JSONB)

Each resource has: `id`, `title`, `type`, `icon`, `content` (markdown). Optional: `items` (label/value), `media` (youtube/podcast/carousel).  
**Category mapping (TripKitResourceCenter):** `staycation-itineraries` → Planning, `valentines-slc-events` → Essentials, `singles-events` → Essentials.

---

### 1. Staycation Itineraries (Presidents' Day weekend)

- **id:** `staycation-itineraries`
- **title:** Presidents' Day Weekend Itineraries
- **type:** `guide`
- **icon:** 🗓️
- **content:** (markdown below)

```markdown
## Valentine's Day Perfect Date (Feb 14) — $150–300
- 4:00 PM: Arrive at Anniversary Inn or boutique hotel
- 5:30 PM: Couples massage at Matrix Spa or Basalt Day Spa
- 7:30 PM: Dinner at Takashi (reserve 2+ weeks early)
- 9:30 PM: Cocktails at rooftop bar or live jazz

## Valentine's Luxury Splurge — $500–1,000+
- 1:00 PM: Check into Grand America Hotel
- 2:00 PM: Full couples spa at The Grand Spa (3–4 hours)
- 6:00 PM: Afternoon tea or champagne in the lobby
- 7:30 PM: Prix-fixe Valentine's dinner at hotel or La Caille

## Presidents' Day Ski + Spa Weekend (Feb 14–16) — $600–1,500
- **Saturday (Valentine's):** Drive to Park City or ski resort; afternoon ski; evening Main Street dinner + cocktails (High West, Riverhorse)
- **Sunday:** Full ski day; evening Yurt dining at Solitude or Viking Yurt at Park City
- **Monday:** Morning spa at Stein Eriksen or Montage Deer Valley; leisurely brunch; drive home

## Midway Winter Escape (Feb 14–16) — $400–800
- **Saturday:** Check into Zermatt Resort or Blue Boar Inn; afternoon Homestead Crater swim; evening dinner at Blue Boar Inn
- **Sunday:** Soldier Hollow tubing or snowshoeing; Ice Castles (if operating); fireside evening
- **Monday:** Sleep in, leisurely breakfast; optional Heber Valley Railroad; return home

## Culture + Cuisine Staycation (Feb 14–15) — $300–600
- **Saturday:** Hotel Monaco or Le Méridien; 2 PM Utah Museum of Fine Arts; 5 PM cocktails at White Horse; 7 PM Ballet West or Utah Symphony; late dinner at Copper Onion
- **Sunday:** Brunch at Eggs in the City or Ruth's Diner; 9th & 9th neighborhood; afternoon Natural History Museum
```

---

### 2. Valentine's Events, Spas, Restaurants & Hotels (SLC)

- **id:** `valentines-slc-events`
- **title:** Valentine's in SLC: Events, Spas, Restaurants & Hotels
- **type:** `guide`
- **icon:** 💕
- **content:** (markdown below)

```markdown
## Special Events
- **2026 Valentine's Gala** ("A Night of Love II") — SLCTWKB Events; alcohol-free dinner show & gala
- **Sweetheart's Swing** — Couples-only East Coast Swing dance night
- **Valentine's Dancing Date Night** — DF Dance Studio; Red & Black Latin Ball
- **2026 Valentine Art Market / HeART Market** — Local artisan markets
- **Utah Opera/Symphony, Ballet West** — Check schedule (Abravanel Hall, Capitol Theatre)

## Couples Spa
- **The Grand Spa** (Grand America) — Couples massage, facials, full-day packages
- **Basalt Day Spa** — Couples massage, hot stone, aromatherapy
- **The Spa Lounge** — Couples Spa Package (1hr massage + facial + pedicure for two)
- **Matrix Spa & Massage** — Side-by-side couples rooms
- **Stein Eriksen Lodge** (Park City) — Luxury alpine spa
- **Cliff Spa at Snowbird** — Mountain views

## Romantic Restaurants (reserve early)
- Log Haven (Millcreek Canyon) — Mountain setting, fireplace
- Takashi — Intimate sushi, omakase
- The Copper Onion — Cozy, creative
- Bambara (Hotel Monaco) — Craft cocktails
- Franck's, Valter's Osteria — French/Italian romance
- La Caille — French château estate (special occasions)

## Staycation Hotels
- Grand America Hotel — 5-star, spa, tea service
- Kimpton Hotel Monaco — Boutique, pet-friendly
- Anniversary Inn — Themed fantasy suites
```

---

### 3. Singles Events (Galentine's, Craft & Crush, Speed Dating)

- **id:** `singles-events`
- **title:** Single on Valentine's? SLC Singles & Galentine's Events
- **type:** `guide`
- **icon:** 🎨
- **content:** (markdown below)

```markdown
## Craft & Crush / Craft Club SLC
- **Vibe:** Creativity meets connection. Make something cute, maybe meet someone cuter.
- **Price:** $25–45/event. Events often **SOLD OUT** (Sapphic Singles Night Out, Friending Night, Cookie Decorating, Craft & Cocktails).
- **Hook:** "POV: You're solving the dating crisis one craft and crush at a time."
- **Site:** craftclubslc.com | IG: @craftclubslc, @craftandcrush

## The Love Club
- **Tagline:** "F*ck the dating apps." Curated guest lists, IRL matches.
- **Format:** Application-based entry, singles-only events. IG: @theloveclub.join

## Strike Your Match — Speed Dating
- **Vibe:** Old-school speed dating, new-school vibes. Face-to-face, no profiles.
- **Site:** strikeyourmatch.net

## Thursday™ Dating Events
- **Format:** Singles mixers at bars/lounges; different venues. events.getthursday.com/salt-lake-city

## Valentine's 2026 Singles Events
- **Valentine's Tantra Speed Date** (Feb 14) — Vitalize Community & Healing Arts Studio, Millcreek; 6–9 PM
- **Quiet Conversations** (Feb 14) — Divorcee Cafe (waitlist)
- **Beginner Salsa / Country Swing Valentine's** (Feb 14) — Salsa, Bachata & West Coast Swing SLC
- **Singles Paint Night SLC** (Feb 6) — Pat's BBQ, 155 W Commonwealth Ave

## LGBTQ+ / Sapphic
- **SLC Sapphic Night Out** — Monthly mixer for queer women (FB: @SLCSapphicNightOut)
- **LGBTQ+ Singles Arcade Mixer** @ Quarters Arcade Bar
- **Chaotic Singles Party for Lesbians & Queers** — The Boiler Room
```

---

## How to add to the TripKit row

1. **Build the resources array** (JSON): one object per resource above, with `id`, `title`, `type`, `icon`, `content` (the markdown as a string). Escape quotes in content.
2. **Update the TripKit row** after insert:  
   `UPDATE tripkits SET resources = '[ ... ]'::jsonb WHERE code = 'TK-VAL';`
3. Or include `resources` in the initial TripKit INSERT if your schema has a `resources` column (JSONB).

**Example (minimal):**
```json
[
  { "id": "staycation-itineraries", "title": "Presidents' Day Weekend Itineraries", "type": "guide", "icon": "🗓️", "content": "## Valentine's Day Perfect Date..." },
  { "id": "valentines-slc-events", "title": "Valentine's in SLC: Events, Spas, Restaurants & Hotels", "type": "guide", "icon": "💕", "content": "## Special Events..." },
  { "id": "singles-events", "title": "Single on Valentine's? SLC Singles & Galentine's Events", "type": "guide", "icon": "🎨", "content": "## Craft & Crush..." }
]
```

---

**See also:** `VALENTINES_RESEARCH_2026.md` (Top 20 road trips, profiles), `VALENTINES_TRIPKIT_BUILD.md` (TripKit spec, destinations, Stripe).
