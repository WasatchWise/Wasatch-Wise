# Events Calendar: Claude Chrome Extension Prompts

How to use the Claude Chrome extension as a "junior booker" to populate The Rock Salt events calendar with **Rock Salt ethos** shows. The extension works best when you give it: (1) a clear ethos definition, (2) repeatable places to look, and (3) a strict output schema that maps to our site pipeline.

---

## Rock Salt ethos (filter for every run)

Not genre-only—it’s the feel:

- **Original music** (not tribute/wedding/corporate acts)
- **DIY but professional** (scene credibility, real bills)
- **Community energy** (not corporate ballroom)
- **Bands that look like bands** (not wedding bands)
- **Venues that run real bills**

### Ethos score rubric (use in prompts for consistent scoring)

| Score | Meaning |
|-------|--------|
| **5** | Original, scene-defining local/regional bill, strong credibility signals |
| **4** | Original, good bill, fits the Rock Salt lane |
| **3** | Mixed bill, unclear originality, still potentially relevant |
| **2** | Mostly covers/tribute/DJ night or unclear fit |
| **1** | Not a fit |

---

## Where to have Claude look

1. **Venue calendars** (core venues—see list below)
2. **Bandsintown / Songkick** venue pages
3. **Facebook Events** for venues or promoters
4. **Instagram link-in-bio** event lists (Linktree, Beacons, etc.)
5. **Local media calendars** (e.g. City Weekly–style listings)

Best workflow: open a **venue calendar page**, run **Prompt A**; repeat for the next venue. After 8–15 venues, run **Prompt B** on a broad calendar or Bandsintown to catch stragglers.

---

## Output schema (paste into our pipeline)

Our `events` table and scrape pipeline expect data in this shape. Claude should output so you can paste into an intake sheet or CSV, then normalize into the DB.

**Unified output format (one row per show):**

```
date | start_time | venue_name | venue_city | venue_address | headliner | support_acts | genre_tags | primary_link | ticket_link | ethos_score | ethos_note | missing_info
```

- **date**: `YYYY-MM-DD`
- **start_time**: if listed (e.g. `7:00 PM` or `19:00`)
- **venue_name**, **venue_city**, **venue_address**: for display and venue find-or-create
- **headliner**: main act
- **support_acts**: comma-separated openers/support
- **genre_tags**: 3–6 tags (e.g. `indie, rock, local`)
- **primary_link**: best official event page
- **ticket_link**: if different from primary
- **ethos_score**: 1–5
- **ethos_note**: one sentence, grounded in what’s on the page
- **missing_info**: what’s missing (e.g. “start_time”, “ticket_link”)

From this, we map into `events`: `title`/`name`, `start_time`, `venue_id` (find-or-create by venue name), `venue_name`, `city`, `state`, `description` (can include tags/ethos_note), `ticket_url`, `external_url` = primary_link.

---

## Prompt A: Venue-by-venue extraction

Use when you have a **venue calendar page** (or a Bandsintown “venue” page) open.

**Claude Chrome Extension Prompt (copy/paste):**

```
You are helping me populate The Rock Salt website with "Rock Salt ethos" shows in Utah between **February 1, 2026 and March 31, 2026**.

Task:

1. Read this page and extract every live music event that falls within the date range.
2. For each event, open relevant links on the page (event detail pages, ticket links, Facebook event links) when needed to confirm details.
3. Apply a "Rock Salt ethos" filter: original music, local/regional scene energy, DIY-but-pro, credible bills. Avoid tribute-only nights, wedding/corporate events, DJ-only club nights unless they are clearly part of the local original music scene.

Ethos score rubric:
- 5: original, scene-defining local/regional bill, strong credibility signals
- 4: original, good bill, fits the Rock Salt lane
- 3: mixed bill, unclear originality, still potentially relevant
- 2: mostly covers/tribute/DJ night or unclear fit
- 1: not a fit

For each qualifying show, output one line in this exact format (pipe-separated):

date | start_time | venue_name | venue_city | venue_address | headliner | support_acts | genre_tags | primary_link | ticket_link | ethos_score | ethos_note | missing_info

Rules:
- date = YYYY-MM-DD. start_time = as listed or empty. venue_address = if listed.
- genre_tags = 3–6 comma-separated tags.
- Do not invent details. If a show is outside the date range, ignore it. If details are unclear, include only if you can cite a link; otherwise skip.
- Keep output copy-ready (one row per show).
```

---

## Prompt B: Broader discovery

Use on **Google results**, a **media calendar**, or a “Things to do” listing—not on a single venue page.

**Claude Chrome Extension Prompt (copy/paste):**

```
Goal: Find "Rock Salt ethos" live music shows in Utah between **Feb 1, 2026 and Mar 31, 2026** and return a structured list that can be added to The Rock Salt website.

Definition of "Rock Salt ethos": Original music, local/regional scene credibility, DIY-but-professional, rock/alt/punk/indie/heavy/experimental adjacent. Small-to-mid venues, real bills, not corporate/wedding. Avoid tribute-only unless clearly part of the local original music ecosystem.

Ethos score rubric: 5 = scene-defining original bill; 4 = original, fits lane; 3 = mixed/unclear; 2 = mostly covers/tribute/DJ; 1 = not a fit.

Process:
- Scan this page for show listings in the date range.
- Follow and open 5–15 promising links (venue calendars, event pages, ticket pages, Facebook events).
- Extract details for each show and deduplicate.

Output: one line per show, pipe-separated:
date | start_time | venue_name | venue_city | venue_address | headliner | support_acts | genre_tags | primary_link | ticket_link | ethos_score | ethos_note | missing_info

Hard rules: No hallucinations. If date or venue is not verifiable from a link you opened, do not include the show. Deduplicate by date+venue_name+headliner.
```

---

## Prompt C: Venue-cycled (target venues)

Use this when you want to **explicitly cycle through our top target venues**. Replace the venue list with your own 10 (or more); the list below is the current default from our codebase so you can run it immediately.

**Default target venues (from Rock Salt music-filter / scene):**

1. Soundwell  
2. Urban Lounge  
3. Kilby Court  
4. The Commonwealth Room  
5. The State Room  
6. Metro Music Hall / Metropolitan  
7. The Depot  
8. Piper Down  
9. Beer Bar  
10. Tavernacle  

**Claude Chrome Extension Prompt (copy/paste)—venue list version:**

```
You are helping populate The Rock Salt events calendar for Utah. I need "Rock Salt ethos" live music shows between **February 1, 2026 and March 31, 2026**.

Target venues to check (prioritize these; add others if they fit the ethos):
1. Soundwell
2. Urban Lounge
3. Kilby Court
4. The Commonwealth Room
5. The State Room
6. Metro Music Hall / Metropolitan
7. The Depot
8. Piper Down
9. Beer Bar
10. Tavernacle

Rock Salt ethos: Original music, local/regional scene, DIY-but-pro, real bills. No tribute-only, wedding/corporate, or DJ-only unless part of the local original scene. Ethos score: 5 = scene-defining original; 4 = original, fits; 3 = mixed; 2 = mostly covers/DJ; 1 = not a fit.

Task:
- If this page is a calendar or list that includes any of the venues above (or similar Utah music venues), extract every qualifying show in the date range.
- Open event/ticket/Facebook links as needed to confirm details.
- Output one line per show in this exact format (pipe-separated):

date | start_time | venue_name | venue_city | venue_address | headliner | support_acts | genre_tags | primary_link | ticket_link | ethos_score | ethos_note | missing_info

Rules: date = YYYY-MM-DD. No invented details. Deduplicate by date+venue_name+headliner. Only include shows verifiable from a link. Copy-ready output only.
```

**To use your own top 10:** Replace the numbered venue list in the prompt with your venues (one per line). Keep the rest of the prompt the same so output format stays unified.

---

## Workflow summary

1. Open a **core venue calendar** (e.g. Soundwell, Urban Lounge).
2. Run **Prompt A**.
3. Open the next venue calendar; run **Prompt A** again.
4. After 8–15 venues, open a **local calendar or Bandsintown** and run **Prompt B** to catch what you missed.
5. Optionally use **Prompt C** on a page that lists multiple of our target venues to get one combined, venue-prioritized list.
6. Paste all output into an intake sheet (e.g. CSV with the same columns), then normalize into the website: match venues to `venues` (find-or-create), insert into `events` with `title`, `start_time`, `venue_id`, `venue_name`, `city`, `state`, `description`, `ticket_url`, etc.

---

## Automation note

Right now the calendar is filled by:

- **Scrape pipeline** (`POST /api/scrape-events`): SLUG Magazine, City Weekly, Soundwell, Piper Down (disabled). Writes into `events` with find-or-create for venues.
- **Event submission form**: Humans submit via `event_submissions`; after review these can be promoted to `events`.

The Claude Chrome extension is a **manual but repeatable** way to add more sources (any venue or listing you can open in a browser) and to apply the **ethos filter** and **unified schema** before paste. If you want corporate-level automation later, the same output schema above can be used as the contract for an automated scraper or API that writes into the same pipeline.
