# Amazon Affiliate + n8n Automation – February Content Plan

**Purpose:** SLC Trips TikTok content + Amazon product links, n8n workflows, and city_metrics integration.  
**Account:** wasatchwise20-20 | Creators API eligible ✅  
**Product categories:** `infrastructure/n8n/data/amazon/*.json`

---

## Current Status

| Item | Status |
|------|--------|
| Amazon Associates ID | wasatchwise20-20 |
| Creators API eligible | ✅ YES (3 qualifying sales in 180 days + approved) |
| Product category JSONs | ✅ 7 files in `infrastructure/n8n/data/amazon/` |
| n8n workflow: commission → city_metrics | Stub in `workflows/amazon-commission-to-city-metrics.json` |
| Link management | TBD (Linktree, Beacons, or slctrips.com page) |
| Content calendar source | TBD (Airtable, Notion, Google Sheets) |

---

## Product Categories (n8n-ready)

| Category | File | Use case |
|----------|------|----------|
| Utah Winter Road Trip Essentials | `amazon_roadtrip_essentials.json` | Winter road trip videos |
| Hiking & Outdoor Gear | `amazon_hiking_gear.json` | Hiking / trail videos |
| Photography & Content Creation | `amazon_photo_gear.json` | Photo/drone/content videos |
| Camping & Overnight Gear | `amazon_camping_gear.json` | Camping / overnight videos |
| Travel & Organization | `amazon_travel_gear.json` | Travel planning / packing videos |
| Winter Sports & Snow Gear | `amazon_winter_gear.json` | Ski/snow videos |
| Road Trip Entertainment & Comfort | `amazon_roadtrip_comfort.json` | Road trip comfort videos |

Fill **ASIN** via [SiteStripe](https://affiliate-program.amazon.com/help/node/topic/G1XHSNAA28USJF) or [Product Linking Tool](https://affiliate-program.amazon.com/home/tools/search). Link format: `https://www.amazon.com/dp/{asin}?tag=wasatchwise20-20`.

---

## n8n Workflow Specs

### 1. Amazon Product Link Generator

- **Trigger:** Manual or schedule (e.g. every Monday).
- **Steps:** Read content calendar → match video topic to category JSON → lookup ASINs → build affiliate links → save to calendar row / Notion/Airtable.
- **Output:** `amazon_products` (JSON), `bio_link_text`, `estimated_commission`.
- **Status:** Not built; use category JSONs as input when building.

### 2. TikTok Bio Link Page Generator

- **Trigger:** New video published or manual “Generate Bio Link for Today’s Video”.
- **Steps:** Fetch today’s content → get Amazon products for category from JSON → build bio page text (TripKit link + 3–5 product links) → update Linktree/Bio or save to slctrips.com/links/{slug}.
- **Status:** Not built. Depends on link management choice.

### 3. Amazon Commission Tracker → city_metrics

- **Trigger:** Daily 9am (or manual).
- **Steps:** Get earnings (Amazon Associates API or manual export) → map tracking ID to metric_key → call `upsert_revenue_metric` for `slctrips_amazon_revenue` (and other buildings if using building tags) → optional Slack summary.
- **city_metrics:** `slctrips_amazon_revenue`, `slctrips_amazon_clicks` (if you add a gauge), etc. See AMAZON_ASSOCIATES.md.
- **Status:** Stub workflow in repo: manual trigger → HTTP to Supabase RPC `upsert_revenue_metric`. Replace input with Amazon API/scrape when ready.

### 4. Content-to-Products Auto-Matcher (AI)

- **Trigger:** New row in content calendar.
- **Steps:** Send video topic to Claude → match to one of the 7 categories → return top 5 products → generate affiliate links → update calendar row → notify.
- **Status:** Not built. Category list is in `infrastructure/n8n/data/amazon/`.

---

## February Content + Amazon Category Mapping (example)

| Date | Video topic | Category | Est. commission |
|------|-------------|----------|------------------|
| Feb 2 | Mystic Hot Springs | Road Trip Essentials | $15–25 |
| Feb 4 | Bonneville Salt Flats | Photo Gear | $20–40 |
| Feb 7 | How I find hidden spots | Photo / GPS | $10–20 |
| Feb 8 | Valentine’s week itinerary | Travel Organization | $10–20 |
| Feb 10 | 5 things I pack for winter road trips | Winter Road Trip | $25–50 |
| Feb 15 | 3-day national parks trip | Camping Gear | $20–40 |
| Feb 16 | Alta/Snowbird powder day | Winter Sports | $15–30 |
| Feb 24 | I tested 5 budget daypacks | Hiking Gear | $30–60 |

Gear-focused videos drive most Amazon revenue; destination-only videos use 0–2 product links.

---

## Implementation Checklist

- [ ] Fill ASINs in `infrastructure/n8n/data/amazon/*.json` (SiteStripe or Product Linking Tool).
- [ ] Choose link management: Linktree, Beacons, or slctrips.com/links.
- [ ] Choose content calendar source (Airtable, Notion, Google Sheets) for n8n.
- [ ] Import `amazon-commission-to-city-metrics.json` into n8n; add Supabase credentials; test manual run.
- [ ] When Amazon reporting is available: replace manual amount in workflow with API or export.
- [ ] Build Workflow 1 (Link Generator) and/or 4 (AI Matcher) using category JSONs.
- [ ] Build Workflow 2 (Bio Link Page) after link management is decided.
- [ ] Add disclosure on any page with affiliate links: “As an Amazon Associate I earn from qualifying purchases.”

---

## What You Need to Provide (for full automation)

| Item | Purpose |
|------|--------|
| Link management tool | Linktree / Beacons / slctrips.com – for bio link page output. |
| Content calendar (Airtable / Notion / Google Sheets) | n8n reads video list and writes back product links. |
| Amazon Product Advertising API (optional) | Auto product search; otherwise use manual product lists (current JSONs). |
| WasatchVille / Supabase | Already in use; n8n uses same Supabase for `upsert_revenue_metric`. |

---

## Revenue Model (reference)

| Content type | Videos/mo | Avg products | Click rate | Conv. rate | Avg commission | Monthly |
|--------------|-----------|--------------|------------|------------|----------------|---------|
| Destination | 14 | 2–3 | 1% | 5% | $5–10 | $35–70 |
| Gear-focused | 4 | 5 | 3% | 10% | $15–30 | $60–120 |
| List/value | 8 | 1–2 | 0.5% | 5% | $3–8 | $12–32 |

Conservative: ~\$107–222/mo. Optimistic (1 viral): ~\$300–500/mo.

---

## Pro Tips

- **3-product rule:** Max 3 products per video in bio; fewer options convert better.
- **24-hour cookie:** Clicks to Amazon track for 24h; any purchase in that window can attribute.
- **Seasonal:** Winter gear (Feb), hiking (Mar–Apr), camping (May–Jun).
- **Titles:** “What’s in my Utah road trip bag” → “5 things I pack for Utah winter road trips.”

---

## Related

- [AMAZON_ASSOCIATES.md](AMAZON_ASSOCIATES.md) – Account, tags, disclosure, `upsert_revenue_metric`, building IDs.
- [INTEGRATION_LOG.md](INTEGRATION_LOG.md) – n8n status, city_metrics, verification checklist.
- `infrastructure/n8n/data/amazon/README.md` – Product JSON usage.
- `apps/slctrips/src/lib/affiliates.ts` – `getAmazonLink()` in app code.
