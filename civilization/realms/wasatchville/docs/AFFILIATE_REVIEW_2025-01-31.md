# Affiliate Review: WasatchVille Ecosystem

**Reviewed:** 2025-01-31  
**Source:** Claude (affiliate + ecosystem analysis)  
**Structured data:** [AFFILIATE_REVIEW_2025-01-31.json](./AFFILIATE_REVIEW_2025-01-31.json)

---

## Executive Summary

The current WasatchVille affiliate infrastructure has strong foundations but significant untapped potential. **SLC Trips (B002)** is well-equipped with 8+ merchants across travel, gear, and tours, representing the most mature building. However, the other 6 buildings are severely underutilized—most have only Amazon, which lacks proper attribution for city_metrics tracking.

**Critical findings:**

- **Amazon attribution gap** — The single `wasatchwise-20` tag prevents proper revenue attribution to specific buildings. This is a critical infrastructure issue that must be resolved to accurately track affiliate performance in city_metrics. Consider implementing Amazon's sub-ID tracking or separate tags per building.
- **Rock Salt is a goldmine** — Music equipment affiliates (Sweetwater, Plugin Boutique) offer 3–20% commissions with passionate audiences who regularly purchase gear. The `affiliate_clicks` schema exists but isn't connected to merchant networks. Adding Sweetwater via ShareASale and StubHub via CJ should be immediate priorities.
- **High-margin opportunities** — SaaS/subscription products (Canva Pro, Buffer, ExpressVPN, Splice) offer recurring commissions (20–40%) and are perfect fits for Automation Studio, Ask Before You App, and Rock Salt. These should be prioritized over low-margin retailers.

---

## Top 3 Immediate Actions

1. **Fix Amazon attribution** — Implement building-specific tracking (separate tags or sub-IDs) so Amazon clicks properly flow to correct building metrics in city_metrics. This unblocks accurate revenue reporting across all buildings.

2. **Launch Rock Salt affiliates** — Add Sweetwater (ShareASale), StubHub (CJ), and Plugin Boutique (ShareASale) with `rocksalt-*` campaigns. These three cover equipment, tickets, and studio software—the core monetization categories for music content.

3. **Add high-priority merchants** — REI (B002), Coursera (B004), ExpressVPN (B006), Canva (B010), B&H Photo (B011), Home Depot (B009). These 6 merchants fill critical gaps and all have established affiliate programs with reasonable commissions. Together they enable proper monetization for every non-dating building.

---

## Current Merchants (Summary)

| Merchant    | Network | Status              | Primary Building | Recommendation        |
|------------|---------|---------------------|------------------|------------------------|
| Booking.com| AWIN    | active              | B002             | expand to B009         |
| Viator     | direct  | active              | B002             | keep                  |
| Amazon     | direct  | active              | B002 (all)       | expand + fix attribution |
| Sitpack    | AWIN    | configured_missing_env | B002         | keep                  |
| FLEXTAIL   | AWIN    | configured_missing_env | B002         | keep                  |
| VSGO       | AWIN    | configured_missing_env | B002, B011   | expand to B011        |
| GoWithGuide| AWIN    | configured_missing_env | B002         | keep                  |
| GetYourGuide | direct | disabled            | B002             | enable                |
| Yelp       | none    | active (UTM only)   | B002, B003       | deprioritize          |

---

## New Merchant Recommendations (High Priority)

| Merchant    | Building | Network    | Campaign Prefix | Priority |
|------------|----------|------------|-----------------|----------|
| REI Co-op  | B002     | awin       | slctrips        | high     |
| Sweetwater | B003     | shareasale | rocksalt        | high     |
| Coursera   | B004     | direct     | academy         | high     |
| ExpressVPN | B006     | direct     | abya            | high     |
| Canva Pro  | B010     | direct     | automation      | high     |
| B&H Photo  | B011     | direct     | fanon           | high     |
| Home Depot Pro | B009  | awin       | pipelineiq      | high     |
| StubHub    | B003     | cj         | rocksalt        | high     |

---

## Rock Salt: Affiliate Types to Wire

| affiliate_type | affiliate_partner | recommended_network |
|----------------|-------------------|---------------------|
| equipment      | sweetwater        | shareasale          |
| equipment      | reverb            | direct              |
| tickets        | stubhub           | cj                  |
| tickets        | vivid_seats       | cj                  |
| merch          | merchbar          | shareasale          |
| studio         | plugin_boutique   | shareasale          |
| studio         | splice            | direct              |

Streaming (Spotify: no program; Apple Music: Apple Services) — low/optional.

---

## Use of This Review

- **Config:** `affiliate_config_additions` in the JSON can be merged into `apps/slctrips/src/lib/affiliates.ts` (or shared `packages/wasatchwise-affiliates`) once merchant IDs are obtained.
- **city_metrics:** Add gauge keys per building, e.g. `slctrips_affiliate_revenue`, `rocksalt_affiliate_revenue`, and map AWIN/CJ reports by campaign prefix.
- **Rock Salt:** Populate `affiliate_clicks` and link UI to the partners above; use `rock_salt_affiliate_types` for seeding or docs.
