# Claude Chrome Extension Prompt: In-Depth Affiliate & Ecosystem Review

**Purpose:** Prompt for Claude Chrome Extension to review WasatchVille affiliates and recommend products that fit each building in our ecosystem.

**How to use:** Copy from "## Your Task" to the end of this file, then paste into Claude Chrome Extension's chat. The output will be structured JSON that maps to our Supabase `city_metrics`, `affiliates.ts` config, and Rock Salt `affiliate_clicks` schema.

**File location:** `civilization/realms/wasatchville/docs/AFFILIATE_REVIEW_PROMPT.md`

---

## Your Task

Perform an in-depth review of the WasatchVille affiliate program and ecosystem. Analyze every affiliate merchant and product below, map each to the appropriate building(s), assess fit quality, identify gaps, and recommend new merchants that would strengthen each building's affiliate revenue.

## Context: WasatchVille Ecosystem

WasatchVille is a "city" metaphor for a multi-venture business (Wasatch Wise LLC). Each **building** is a distinct venture with its own audience, content, and revenue streams. Affiliates are being expanded from SLC Trips–only to **city-wide shared infrastructure**: any building can use affiliate links with its own campaign prefix for attribution.

### Buildings (Ventures) & Affiliate Use Cases

| Building ID | Venture | Audience | Affiliate Use Case | Campaign Prefix |
|-------------|---------|----------|--------------------|-----------------|
| B002 | SLC Trips | Utah travelers, trip planners | Hotels, gear, tours, activities | `slctrips-*` |
| B003 | Rock Salt | SLC music community, artists, fans | Concert tickets, merch, equipment, streaming | `rocksalt-*` |
| B004 | Adult AI Academy | Businesses learning AI | Course tools, books, software | `academy-*` |
| B005 | DAiTE | Dating app users | Dating-related products (low priority) | `daite-*` |
| B006 | Ask Before You App | Schools, districts, privacy officers | EdTech, compliance tools | `abya-*` |
| B009 | Pipeline IQ | Construction firms, project managers | Construction tools, software, equipment | `pipelineiq-*` |
| B010 | Automation Studio | SMBs needing social/content | Marketing tools, scheduling | `automation-*` |
| B011 | Fanon Movies | Film fans, cinephiles | Streaming, DVDs, merch, film gear | `fanon-*` |

### Current Affiliate Inventory (from `affiliates.ts`)

**Platforms / Merchants:**

1. **AWIN** (publisher ID: 2060961)
   - Booking.com (merchant 6776) – hotels, flights, car rentals
   - Sitpack (camping/outdoor seating) – env: AWIN_SITPACK_MERCHANT_ID
   - FLEXTAIL (outdoor gear) – env: AWIN_FLEXTAIL_MERCHANT_ID
   - VSGO (photography/camera gear) – env: AWIN_VSGO_MERCHANT_ID
   - GoWithGuide US (private tours) – env: AWIN_GOWITHGUIDE_MERCHANT_ID

2. **Viator** – tours and activities (partnerId via VIATOR_API_KEY)

3. **Amazon** – general products (tag: wasatchwise-20)

4. **GetYourGuide** – tours (disabled, no partner ID)

5. **Yelp** – no affiliate program, UTM tracking only

**Campaigns in use (all SLC Trips–scoped):**
- `slctrips-accommodations`, `slctrips-flights`, `slctrips-cars`
- `slctrips-parkcity`, `slctrips-zion`, `slctrips-moab`, etc. (destination-specific)
- `slctrips-sitpack`, `slctrips-flextail`, `slctrips-vsgo`, `slctrips-gowithguide`
- Viator: utm_source=slctrips
- Amazon: tag wasatchwise-20 (no campaign distinction)

**Note:** Sitpack, FLEXTAIL, VSGO, GoWithGuide have `merchantId` from env; if env vars are missing, links return null.

### Rock Salt Affiliate Infrastructure (Separate App)

Rock Salt has an `affiliate_clicks` table with:
- `affiliate_type`: equipment | streaming | tickets | merch | studio
- `affiliate_partner`: e.g. sweetwater, spotify (text)
- `affiliate_url`, `referral_code`, `converted`, `conversion_value_cents`, `commission_cents`

Rock Salt has the schema but may not yet have live affiliate links wired to the same networks.

### Supabase / city_metrics Schema

- **city_metrics** (KPI store): `metric_key` (PK), `value`, `unit`, `category`, `display_name`
- Affiliate revenue metrics: `slctrips_affiliate_revenue`, `rocksalt_affiliate_revenue`, `fanon_affiliate_revenue`, `academy_affiliate_revenue`, `pipelineiq_affiliate_revenue`
- Attribution: AWIN reports by campaign; we map campaigns to buildings via prefix

---

## What We Need From You

### 1. Current Merchant Assessment

For each merchant/platform in our current inventory, provide:

- **Building(s)** it fits (primary + secondary if applicable)
- **Fit score** (1–10): How naturally does this merchant fit the building's audience and content?
- **Status**: `active` (live + env set) | `configured_missing_env` (code exists, env var needed) | `disabled`
- **Recommendation**: `keep` | `expand_to_buildings` (list which) | `deprioritize` | `remove`
- **Notes**: One paragraph on fit, gaps, or optimization

### 2. Gap Analysis by Building

For each building (B002, B003, B004, B006, B009, B010, B011), identify:

- **What we have** that fits
- **What we're missing** (merchant categories, product types)
- **Top 3–5 recommended merchants/networks** to add (with rationale)

### 3. New Merchant Recommendations

Research and recommend 10–15 **new** affiliate merchants or networks that would strengthen the ecosystem. For each:

- Merchant name and network (AWIN, ShareASale, CJ, Viator, direct, etc.)
- Product category
- Best-fit building(s) and campaign prefix
- Why it fits (audience overlap, content adjacency)
- Approximate commission or typical structure if known
- Priority: `high` | `medium` | `low`

### 4. Output Format (Critical)

Return your analysis as **valid JSON** matching this schema so we can import it into our codebase:

```json
{
  "review_metadata": {
    "reviewed_at": "ISO8601 date",
    "context_version": "WasatchVille 2025-01-31"
  },
  "current_merchants": [
    {
      "merchant_key": "booking",
      "merchant_name": "Booking.com",
      "network": "awin",
      "merchant_id": "6776",
      "status": "active",
      "primary_building_id": "B002",
      "secondary_building_ids": [],
      "campaign_prefix": "slctrips",
      "fit_score": 10,
      "recommendation": "keep",
      "notes": "Core travel merchant; perfect for SLC Trips."
    }
  ],
  "gaps_by_building": {
    "B002": {
      "has": ["booking", "viator", "amazon", "sitpack", "flextail", "vsgo", "gowithguide"],
      "missing": ["REI/Backcountry via AWIN", "rental cars direct"],
      "top_recommendations": ["..."]
    }
  },
  "new_merchant_recommendations": [
    {
      "merchant_name": "Example Merchant",
      "network": "awin",
      "product_category": "outdoor_gear",
      "primary_building_id": "B002",
      "campaign_prefix": "slctrips",
      "rationale": "...",
      "commission_notes": "4-8% typical",
      "priority": "high"
    }
  ],
  "affiliate_config_additions": [
    {
      "key": "rei",
      "config_snippet": {
        "rei": { "enabled": true, "merchantId": "FROM_AWIN", "network": "awin" }
      },
      "building_id": "B002",
      "campaign_prefix": "slctrips"
    }
  ],
  "rock_salt_affiliate_types": [
    {
      "affiliate_type": "equipment",
      "affiliate_partner": "sweetwater",
      "recommended_network": "shareasale",
      "notes": "Music gear for artists"
    }
  ]
}
```

**Schema notes:**
- `merchant_key`: lowercase, no spaces (matches our config keys: booking, viator, amazon, sitpack, flextail, vsgo, gowithguide, yelp, getyourguide)
- `campaign_prefix`: building shorthand (slctrips, rocksalt, academy, abya, pipelineiq, fanon, automation, daite)
- `affiliate_config_additions`: TypeScript-style config we can merge into `AffiliateConfig`

---

## Instructions

1. Use the current inventory and building list above as your source of truth.
2. Research each merchant's actual product offerings and typical commission structures where possible.
3. For new recommendations, focus on merchants that are likely on AWIN, ShareASale, CJ, or Viator—networks we can plug into with minimal new infrastructure.
4. Ensure all JSON is valid and parseable (no trailing commas, escaped quotes).
5. After the JSON block, add a 2–3 paragraph executive summary of your findings and top 3 actions we should take.
