# Media & Advertising Sector: WasatchVille

**Realm:** WasatchVille  
**Sector:** Content distribution, advertising, affiliates, partnerships  
**Last Updated:** 2026-02-01

---

## What This Sector Is

In city terms, the **“media TV station”** is the layer that **broadcasts** to the city: social content (TikTok, etc.), affiliate links, and partnerships. It’s not one building—it’s the **advertising sector** that spans:

- **Distribution:** TikTok, social, SEO → reach and awareness  
- **Monetization:** Affiliates, sponsorships, TripKits, product  
- **Partnerships:** Viator, AWIN, Amazon, direct deals by building  

**Primary launcher:** **TikTok for SLC Trips (B002)** — top-of-funnel that drives traffic to destinations, TripKits, and affiliate revenue. Maximizing TikTok here is the main lever for the Amusement Park.

---

## What We're Really Wanting to Do with SLC Trips

One-place summary: **distribution** (social, SEO, slctrips.com) → **monetization** (affiliates, partnerships, TripKit sales) → **city_metrics** (dashboard + agents). n8n and content both fit into this.

| Question | Answer |
|----------|--------|
| **n8n and burden reduction** | n8n is the **automation backbone**: Stripe → `daily_revenue` + per-building (e.g. `slctrips_revenue`), Amazon → `slctrips_amazon_revenue`, (planned) TikTok → `slctrips_tiktok_views`, Awin → `slctrips_affiliate_revenue`. **Burden reduction** = less manual data entry; pipelines push data into city_metrics so the dashboard and Park Director see live numbers without you copy-pasting. Lock-in complete for Stripe, Test, Amazon; next: TikTok Views Sync, ConvertKit, Awin when API/export exists. |
| **Is this for social media?** | **Yes, in part.** Social (TikTok) is the **launcher** — top-of-funnel. TikTok → profile & link → slctrips.com, TripKits, affiliate links. SLC Trips is **not only** social: it's **TikTok + slctrips.com + destinations + TripKits + affiliates + partnerships**. Social is one pillar; the site, TripKits, and affiliate/partnership revenue are the rest. |
| **In addition to affiliates, partnerships, TripKit sales?** | **Yes.** Full stack: **Distribution:** TikTok, social, SEO, slctrips.com. **Monetization:** Affiliates (Booking.com, Awin, Amazon, Betckey, Sparkle, etc.), partnerships (Viator, tourism, brands), **TripKit sales** (when wired to Stripe with `building_id` B002 → `slctrips_revenue`). All of these should attribute to city_metrics so the Amusement Park shows real revenue and traffic. |
| **Does this take content creation into account?** | **Yes.** Content is explicitly in the strategy: **Content** = destination-first hooks (Hidden Canyon, Moab, etc.), series and trends that fit “Utah travel.” **Content cadence** = Park Director / Content Council align on posting frequency and themes; **data loop** = TikTok views (and eventually other metrics) in city_metrics so you see which content drives views and can double down. Content **creation** (filming, editing, writing) is human-led; n8n and the dashboard **inform** what to create and when (metrics → prioritize). There is no “n8n creates content” workflow; the pipeline is “data in → gauges → better content decisions.” |

**TL;DR:** SLC Trips = distribution (social + site) + monetization (affiliates, partnerships, TripKits). n8n reduces burden by auto-pushing revenue and engagement into city_metrics. Content creation is part of the plan (strategy + cadence + data-informed decisions), not automated by n8n.

---

## Buildings in This Sector

| Building | Role in Media / Advertising |
|----------|------------------------------|
| **B002 Amusement Park (SLC Trips)** | Main “broadcast”: TikTok, slctrips.com, destinations. **Launcher:** TikTok → SLC Trips content → TripKits + affiliate. |
| **B003 Concert Hall (Rock Salt)** | Music content, streaming, concert/ticket affiliates (Sweetwater, StubHub). |
| **B004 Community College (Adult AI Academy)** | Course/content affiliates (Coursera, books, tools). |
| **B009 Telecom Tower (Pipeline IQ)** | B2B; construction/software affiliates. |
| **B010 Automation Studio** | Social/automation clients; Canva, tools. |
| **B011 Cinema (Fanon Movies)** | Streaming, DVD, film gear affiliates. |

SLC Trips (B002) is the most mature: TikTok + 8+ affiliate merchants (travel, gear, tours). Others are expanding via city-wide affiliate config and campaign prefixes.

---

## Affiliates: Current State

- **SLC Trips (B002):** 8+ merchants — Booking.com, Viator, Amazon, Sitpack, FLEXTAIL, VSGO, GoWithGuide, GetYourGuide (see [AFFILIATE_REVIEW_2025-01-31.md](AFFILIATE_REVIEW_2025-01-31.md)). Campaign prefix: `slctrips-*`. **Gap:** Amazon attribution (single tag; need per-building/sub-ID for city_metrics).
- **Rock Salt (B003):** Schema ready (`affiliate_clicks`); merchants not yet wired. **Priority:** Sweetwater (ShareASale), StubHub (CJ), Plugin Boutique.
- **City-wide:** Goal is shared `packages/wasatchwise-affiliates` (or shared `lib/affiliates`) with configurable `campaignPrefix` / `building_id`. Each building gets its own `{building}_affiliate_revenue` in city_metrics.

**Key docs:**  
- [AMAZON_ASSOCIATES.md](AMAZON_ASSOCIATES.md) — Amazon tags, `getAmazonLink`, city_metrics keys  
- [AFFILIATE_REVIEW_2025-01-31.md](AFFILIATE_REVIEW_2025-01-31.md) — merchant list, gaps, top actions, config additions  
- [INTEGRATION_LOG.md](INTEGRATION_LOG.md) — affiliate expansion, n8n, metric keys  

**Top actions (from review):**  
1. Fix Amazon attribution (sub-ID or per-building tags) for city_metrics.  
2. Launch Rock Salt affiliates (Sweetwater, StubHub, Plugin Boutique).  
3. Add high-priority merchants: REI (B002), Coursera (B004), ExpressVPN (B006), Canva (B010), B&H (B011), Home Depot (B009).

---

## Partnerships

| Type | Examples | Buildings |
|------|----------|-----------|
| **Travel / activities** | Viator (direct), Booking.com (AWIN), GetYourGuide | B002 |
| **Gear / retail** | Amazon, REI (AWIN), Sitpack, FLEXTAIL, VSGO (AWIN) | B002, B011 |
| **Music / events** | Sweetwater, StubHub, Plugin Boutique (when live) | B003 |
| **Education / tools** | Coursera, Canva, ExpressVPN (when added) | B004, B006, B010 |

Attribution: campaign prefix per building (`slctrips-*`, `rocksalt-*`, etc.) so AWIN/CJ/direct reports map to `slctrips_affiliate_revenue`, `rocksalt_affiliate_revenue`, etc. in city_metrics.

---

## TikTok as Launcher for SLC Trips (B002)

**Idea:** TikTok is the **top-of-funnel launcher** — short-form Utah/travel content → profile & link → SLC Trips (destinations, TripKits, affiliate links). Maximizing TikTok = maximizing reach and downstream revenue for the Amusement Park.

**Metrics:**

- **city_metrics:** `slctrips_tiktok_views` (and later: engagement, followers, top posts).  
- **Dashboard:** B002 shows TikTok views; Park Director agent uses this in briefings.  
- **n8n:** Workflow `tiktok-views-sync` (planned) — TikTok API → city_metrics on a schedule (e.g. hourly).

**Strategy levers:**

1. **Content:** Destination-first hooks (Hidden Canyon, Moab, etc.); series and trends that fit “Utah travel.”  
2. **CTA:** Link in bio / video to slctrips.com, TripKits, or high-intent affiliate (e.g. Viator for that destination).  
3. **Attribution:** UTM + campaign (`utm_source=slctrips`, `slctrips-parkcity`, etc.) so traffic and conversions tie back to SLC Trips in analytics and city_metrics.  
4. **Data loop:** TikTok views in WasatchVille (gauges + Park Director) so you can prioritize what to double down on.

**Owner:** Park Director (B002); content strategy and social in [AGENT_ROSTER.md](AGENT_ROSTER.md).

**Deep dive:** [SLCTRIPS_TIKTOK_ANALYSIS.md](SLCTRIPS_TIKTOK_ANALYSIS.md) — @slctrips stats, viral hit, content pillars. [SLCTRIPS_PRE_LAUNCH_CHECKLIST.md](SLCTRIPS_PRE_LAUNCH_CHECKLIST.md) — MVP checklist, audit findings (payment blocker), post-fix test flow. [ROCK_SALT_SYSTEMS_AUDIT.md](ROCK_SALT_SYSTEMS_AUDIT.md) — Rock Salt audit (ready to ship). [SYSTEMS_AUDIT_SUMMARY.md](SYSTEMS_AUDIT_SUMMARY.md) — Both properties, next 3 moves. [WASATCHVILLE_RTS_AND_MEDIA.md](WASATCHVILLE_RTS_AND_MEDIA.md) — RTS/SimCity framing, building health check, multi-platform media strategy.

---

## How to Maximize TikTok for SLC Trips (Launcher)

1. **Ship the data pipeline:** Implement n8n `tiktok-views-sync` (TikTok API → `slctrips_tiktok_views` in city_metrics) so the dashboard and agents see live TikTok performance.  
2. **Define “launcher” KPIs:** Views per week, top 5 posts, link clicks (if trackable), TripKit/affiliate conversions from TikTok traffic. Add these as metric_keys when sources are available.  
3. **Content cadence:** Use Park Director / Content Council to align on posting frequency and themes; use city_metrics to see which content drives views and adjust.  
4. **Affiliate in the funnel:** In captions and link-in-bio, favor TripKits and affiliate links (Viator, Booking, gear) with `slctrips-*` so revenue attributes to B002 and shows in `slctrips_affiliate_revenue` / Stripe.  
5. **Partnerships:** Any TikTok-native or travel-partner deals (e.g. tourism boards, brands) run through the same campaign/attribution so they show up in the advertising sector view.

---

## Summary Table

| Area | Status | Next Step |
|------|--------|-----------|
| **TikTok (SLC Trips launcher)** | Planned | n8n `tiktok-views-sync` → `slctrips_tiktok_views`; define launcher KPIs |
| **Affiliates (B002)** | Active, 8+ merchants | Fix Amazon attribution; add REI |
| **Affiliates (B003)** | Schema ready | Launch Sweetwater, StubHub, Plugin Boutique |
| **Affiliates (city-wide)** | SLC Trips only in code | Extract shared affiliate lib; per-building prefixes |
| **Partnerships** | Viator, AWIN, Amazon, direct | Map all to city_metrics by campaign; add high-priority merchants |

---

## Related Docs

- [BUILDING_REGISTRY.md](BUILDING_REGISTRY.md) — B002 data sources, metrics, visual states  
- [AGENT_ROSTER.md](AGENT_ROSTER.md) — Park Director, Content Council  
- [INTEGRATION_LOG.md](INTEGRATION_LOG.md) — n8n, metric keys, affiliate expansion  
- [AFFILIATE_REVIEW_2025-01-31.md](AFFILIATE_REVIEW_2025-01-31.md) — Full affiliate review and config  
- [AMAZON_ASSOCIATES.md](AMAZON_ASSOCIATES.md) — Amazon setup and city_metrics  
