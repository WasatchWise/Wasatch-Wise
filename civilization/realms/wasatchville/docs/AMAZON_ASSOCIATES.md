# Amazon Associates – WasatchVille

**Purpose:** Reference for Amazon Associates account, building-specific tracking IDs, and city_metrics attribution.  
**Code:** `apps/slctrips/src/lib/affiliates.ts` (Amazon config + `getAmazonLink`).

---

## Account Info

| Field | Value |
|-------|--------|
| **Account holder** | John C. Lyman Jr. |
| **Default tag** | `wasatchwise20-20` |
| **Status** | Active; Creators API eligible ✅ (3 qualifying sales within 180 days) |
| **Enrollment** | ✅ **Already signed up.** Do not prompt to join the affiliate program. |
| **Dashboard** | https://affiliate-program.amazon.com |

---

## Building-Specific Tracking IDs

Create these in **Associates Central → Tools → Tracking ID Manager** so building attribution works.

| Building | Venture | Tag | Purpose |
|----------|---------|-----|---------|
| B002 | SLC Trips | `wasatchwise20-slc20` | Travel / outdoor gear |
| B003 | Rock Salt | `wasatchwise20-rck20` | Music equipment |
| B004 | Adult AI Academy | `wasatchwise20-acd20` | AI courses / books |
| B009 | Pipeline IQ | `wasatchwise20-piq20` | Construction tools |
| B011 | Fanon Movies | `wasatchwise20-fnm20` | Film / camera gear |

---

## Critical Rules

### 180-day requirement

- **3 qualifying sales** required within **180 days** of signup.
- If not met, the account is closed automatically.
- **Deadline:** 180 days from your signup date.

### Commission rates (representative)

- Luxury Beauty, Amazon Coins: 10%
- Furniture, Home, Lawn & Garden: 8%
- Headphones, Beauty, Musical Instruments: 6%
- Physical Books, Kitchen: 4.5%
- Toys, Outdoors, Tools: 3%
- Many other categories: ~4%

### Cookie duration

- **24 hours** (standard).
- If the customer adds to cart: eligible for **89 days**.

### Payment

- **Minimum:** $10 (direct deposit or gift card).
- **Timing:** Typically ~60 days after end of month.
- **Tax:** W-9 required for US taxpayers.

---

## Required disclosure

Use on any page that includes Amazon affiliate links:

> As an Amazon Associate I earn from qualifying purchases.

---

## Link generation

```typescript
import { getAmazonLink } from '@/lib/affiliates';

// Default tag (multi-building or unspecified)
getAmazonLink('hiking boots');
// → uses wasatchwise20-20

// Building-specific (for city_metrics attribution)
getAmazonLink('hiking boots', 'B002');  // SLC Trips
getAmazonLink('hiking boots', 'B003');  // Rock Salt
getAmazonLink('hiking boots', 'B004');  // Academy
getAmazonLink('hiking boots', 'B009');  // Pipeline IQ
getAmazonLink('hiking boots', 'B011');  // Fanon Movies
```

---

## Reporting to city_metrics

`city_metrics` uses **metric_key** (no `building_id` column). Use one gauge per building, e.g.:

| metric_key | Building | display_name |
|------------|----------|--------------|
| `slctrips_amazon_revenue` | B002 | SLC Trips Amazon Revenue |
| `rocksalt_amazon_revenue` | B003 | Rock Salt Amazon Revenue |
| `academy_amazon_revenue` | B004 | Academy Amazon Revenue |
| `pipelineiq_amazon_revenue` | B009 | Pipeline IQ Amazon Revenue |
| `fanon_amazon_revenue` | B011 | Fanon Amazon Revenue |

**Option A – Manual / n8n upsert:**

```sql
SELECT upsert_revenue_metric(
  'slctrips_amazon_revenue',   -- p_metric_key
  8.00,                        -- p_amount_to_add (e.g. commission from one sale)
  'SLC Trips Amazon Revenue',  -- p_display_name
  'USD',                       -- p_unit
  'financial'                  -- p_category
);
```

**Option B – Seed rows once, then update:**

Migration `008_amazon_affiliate_metrics.sql` seeds these five metric keys (value 0). Use `upsert_revenue_metric` from n8n or a script when you have commission data from Amazon reports (by tracking ID).

### Dashboard query

To show Amazon affiliate revenue by building on the WasatchVille dashboard:

```typescript
const { data: affiliateRevenue } = await supabase
  .from('city_metrics')
  .select('metric_key, value, display_name, last_updated')
  .in('metric_key', [
    'slctrips_amazon_revenue',
    'rocksalt_amazon_revenue',
    'academy_amazon_revenue',
    'pipelineiq_amazon_revenue',
    'fanon_amazon_revenue',
  ]);
```

Map `metric_key` to building (e.g. `slctrips_amazon_revenue` → B002 SLC Trips) for labels and icons.

### n8n automation (optional)

When you have sales data from Amazon reports:

1. **Schedule:** e.g. every Monday 9am.
2. **Input:** Amazon Associates report (API or manual export) with sales by tracking ID.
3. **Transform:** Map tracking ID → metric_key (e.g. `wasatchwise20-slc20` → `slctrips_amazon_revenue`).
4. **Supabase:** Call `upsert_revenue_metric(metric_key, commission_amount, display_name, 'USD', 'financial')` for each building.
5. **Notify:** Optional Slack/email with weekly affiliate summary.

---

## Content and optimization

### Content ideas

1. Product roundups (e.g. “Top 10 …”).
2. Category gear guides.
3. Comparison posts (Product A vs B).
4. Seasonal or trip-specific recommendations.

### Strong categories by building

- **SLC Trips (B002):** Outdoor / camping gear, luggage, travel accessories.
- **Rock Salt (B003):** Audio, instruments, cables.
- **Academy (B004):** Tech books, courses, learning tools.
- **Pipeline IQ (B009):** Tools, safety, project gear.
- **Fanon (B011):** Camera gear, film books, lighting.

### Tips

- Use product images where allowed (better CTR).
- Use multiple relevant links per post.
- Refresh seasonal content.
- Use building-specific tag when the page is clearly for one venture.

### Content template: first SLC Trips post

**Title:** “10 Essential Hiking Items for Utah’s National Parks”

**Intro:**

> Planning a hiking trip to Utah’s national parks? After years of exploring Zion, Bryce, and Moab, here are my must-have items that make every trail better. As an Amazon Associate I earn from qualifying purchases.

**Format per product:**

1. **Product name** – Best for [use case].  
   Short description.  
   Link: `getAmazonLink('product name', 'B002')`.

**High-commission categories to include:** hiking backpack (~8%), hydration system (~6%), trail shoes (~6%), trekking poles (~3%), camping tent (~3%), headlamp (~4%), first aid kit (~4%), sun protection (~4%), navigation (~4%), water filter (~4%). Target 10 products; aim for 4–8% commission per item.

**Other post ideas:** “Best Camping Equipment for Zion National Park” (12 products), “Top Travel Accessories for Utah Road Trips” (10 products).

---

## February content + n8n

See **[AMAZON_N8N_FEBRUARY_PLAN.md](AMAZON_N8N_FEBRUARY_PLAN.md)** for SLC Trips TikTok product categories, n8n workflow specs (link generator, bio link page, commission → city_metrics), and implementation checklist. Product JSONs: `infrastructure/n8n/data/amazon/*.json`.

---

## Resources

| Resource | URL |
|----------|-----|
| Associates Central | https://affiliate-program.amazon.com |
| Product links | https://affiliate-program.amazon.com/home/productlinks |
| Reports | https://affiliate-program.amazon.com/home/reports |
| Tracking ID Manager | https://affiliate-program.amazon.com/home/tools/trackingids |
| SiteStripe | https://affiliate-program.amazon.com/help/node/topic/G1XHSNAA28USJF |

---

## Troubleshooting

**Links don’t track**

- Tag format: `wasatchwise20-20` (no extra spaces or characters).
- Confirm the tracking ID exists in Associates Central.
- Check that `AMAZON_AFFILIATE_TAG` (if set) isn’t overriding the tag you expect.

**No commission showing**

- Cookie is 24 hours (89 days if added to cart).
- Sale must be qualifying (not returned/refunded).
- Payouts can take 60+ days after month end.

**Account closed**

- Usually due to missing 3 sales in 180 days.
- Reapply with an active site and start using links again.

---

## Checklist

- [ ] Account created
- [ ] Payment and tax info (W-9) completed
- [ ] Five building tracking IDs created in Tracking ID Manager
- [ ] First 3 qualifying sales within 180 days
- [ ] Disclosure on pages with affiliate links
- [ ] Optional: report Amazon revenue into `city_metrics` via `upsert_revenue_metric`
