# WasatchVille: RTS City & Media Distribution Network

**Realm:** WasatchVille  
**Purpose:** SimCity/RTS framing — buildings, sectors, city_metrics, agents — and multi-platform media strategy.  
**Last Updated:** 2025-01-31

---

## What WasatchVille Actually Is

WasatchVille is a **real-time strategy city**: 11 buildings (businesses), each with metrics, agents, and visual states. The dashboard is the **control panel** — gauges, sector health, agent briefings — not a simulation. Real revenue, real traffic, real data.

| Layer | What It Is |
|-------|------------|
| **Buildings** | B001–B011 = ventures (Capitol, Amusement Park, Concert Hall, etc.) |
| **Sectors** | Media & Advertising connects B002, B003, B004…; Finance connects B001, B007; etc. |
| **Agents** | Park Director, Concert Manager, Mayor… brief you from **city_metrics** |
| **Infrastructure** | n8n workflows, Stripe, affiliates, shared libs (e.g. affiliate config) |
| **Dashboard** | Gauges (green/yellow/red) from city_metrics; RTS UI (SimCity-style) |

**Why the “paralysis” makes sense:** If B002’s revenue pipe is broken, the Amusement Park shows red, Park Director reports failure, and sector metrics are wrong. You can’t reload a save — TikTok followers click once. So validating **every metric pipeline before flipping the switch** is not fear; it’s being a good city planner.

---

## Building-Level Health Check (SimCity Style)

In SimCity terms: **Power** = hosting/availability, **Water** = data flowing to city_metrics, **Revenue** = money pipe, **Traffic** = incoming attention (views, users).

### B002 Amusement Park (SLC Trips)

| Utility | Status |
|---------|--------|
| Power | ⚡ CONNECTED (hosting, domain) |
| Water | 💧 CONNECTED (data pipeline ready) |
| Revenue | 💰 **DISCONNECTED** (Stripe → buy button not wired) |
| Traffic | 🚗 INCOMING (TikTok 23K views/week, +226%) |

**Status:** 🟡 UNDER CONSTRUCTION  

**Blocking:** `slctrips_stripe_revenue` = $0, `slctrips_tripkit_sales` = 0 (demo mode).  
**Ready:** `slctrips_tiktok_views` (pipeline planned), `slctrips_affiliate_revenue` (8 merchants; Amazon attribution fix needed).

### B003 Concert Hall (Rock Salt)

| Utility | Status |
|---------|--------|
| Power | ⚡ CONNECTED |
| Water | 💧 CONNECTED |
| Revenue | 💰 N/A (community platform, free) |
| Traffic | 🎵 READY (476 bands, stream live) |

**Status:** 🟢 OPERATIONAL (needs seeding)  

**Ready:** Band submissions, stream, search. **Needs:** `rocksalt_bookings_completed` > 0 (cold start; seed board).

### Sector: Media & Advertising

| Connection | Status |
|------------|--------|
| TikTok → B002 | ⚠️ READY (views growing); revenue **blocked** by payment |
| TikTok → B003 | 🟢 READY (can promote now) |
| Affiliates → City | 🟡 PARTIAL (8 merchants; Amazon attribution broken) |
| Partnerships → Revenue | ⚠️ BLOCKED (can’t track conversions if payment fails) |

---

## City Metrics Dashboard (Current State)

| Metric | Value | Note |
|--------|--------|------|
| slctrips_tiktok_views | 📈 23K (7d), +226% | Pipeline planned |
| slctrips_stripe_revenue | 💔 $0 | **CRITICAL** — wire Stripe |
| slctrips_tripkit_sales | 💔 0 | Demo mode live |
| slctrips_affiliate_revenue | 🟡 Unknown | Amazon sub-ID fix |
| rocksalt_band_count | ✅ 476 | |
| rocksalt_bookings_completed | 🟡 0 | Needs seeding |

---

## SimCity Answer: Don’t Wait for Perfect Infrastructure

- **Zone incrementally** — Validate one pipeline (TikTok → B002 → Stripe), then add more.
- **Fix bottlenecks first** — Revenue disconnected → fix power (Stripe) before building more roads.
- **Watch the gauges** — Demand, budget, happiness = city_metrics; trust the data once pipes are wired.
- **Accept partial completion** — Unconnected roads are fine if traffic doesn’t need them yet.

---

## Phased Launch (RTS Order)

| Phase | Priority | Task | Validation |
|-------|----------|------|------------|
| **1** | 🔴 CRITICAL | Fix B002 Stripe (wire buy button) | slctrips_stripe_revenue > 0 on test purchase |
| **2** | 🟢 READY | Seed B003 (10 open venue slots) | rocksalt_bookings_completed > 0 |
| **3** | ⚠️ BLOCKED BY 1 | Launch TikTok launcher for B002 | slctrips_tiktok_views → slctrips_tripkit_sales > 0 |

Until Phase 1 is true, B002 stays 🟡; don’t promote TripKits to 5.5K followers.

---

## WasatchVille Media Distribution Network

```
┌─────────────────────────────────────────────────────┐
│  CONTENT LAYER                                       │
│  TikTok, Instagram, Facebook, YouTube               │
│  Platform-specific content per building             │
└─────────────────────────────────────────────────────┘
           ↓ (Traffic & Awareness)
┌─────────────────────────────────────────────────────┐
│  PROPERTY LAYER (11 Buildings)                      │
│  B002 SLC Trips, B003 Rock Salt, B004 Academy…      │
└─────────────────────────────────────────────────────┘
           ↓ (Conversions & Actions)
┌─────────────────────────────────────────────────────┐
│  REVENUE LAYER                                       │
│  Stripe, Affiliates, Partnerships, Ad revenue        │
└─────────────────────────────────────────────────────┘
           ↓ (Data)
┌─────────────────────────────────────────────────────┐
│  METRICS & INTELLIGENCE (WasatchVille)              │
│  city_metrics, n8n, Agent roster, RTS Dashboard    │
└─────────────────────────────────────────────────────┘
```

---

## Multi-Platform: Incremental Build (Not All at Once)

Don’t launch TikTok + Instagram + Facebook + YouTube across 11 buildings at once. Validate **one platform → one building** first.

| Phase | Platform | Building | Goal |
|-------|----------|----------|------|
| **1** | TikTok | B002 (SLC Trips) | Prove TikTok → SLC Trips → Stripe → city_metrics |
| **2** | TikTok | B003 (Rock Salt) | Same platform, different building; prove pattern scales |
| **3** | TikTok + Instagram | B002 | Multi-channel attribution (slctrips_instagram_*, UTM) |
| **4** | TikTok, IG, YouTube, FB | B002, B003, B004 | Shared social infra, sector expansion |

**Platform priority (current assets):**

- **High:** TikTok → B002 (5.5K followers, viral content); TikTok → B003 (music native).
- **Medium:** Instagram → B002 (repurpose TikTok); YouTube → B002 (long-form guides).
- **Low:** Facebook → B002; Instagram/YouTube → B003 (after validation).

---

## What Each Platform Needs (Brief)

| Platform | Best for | B002 (SLC Trips) | B003 (Rock Salt) |
|----------|----------|-------------------|-------------------|
| **TikTok** | Short-form discovery, viral, location | Hidden gems, quick tips, Utah hooks | Band clips, show clips, music discovery |
| **Instagram** | Community, visual, local | Destination photos, Reels, trip inspiration | Band promos, venue shots, events |
| **YouTube** | Long-form, SEO, ad revenue | Trip guides, deep dives, vlogs | Full sets, band features, interviews |
| **Facebook** | Local community, events, older demos | Utah travel groups, event promo | Music scene groups, show announcements |

---

## Integration Pattern (Per Platform)

1. **Content layer** — e.g. `social_posts` (building_id, platform, post_url, published_at, metrics_snapshot, campaign_tags).
2. **Metrics sync** — n8n workflow per platform: fetch API → update social_posts → calculate views/engagement → write city_metrics (e.g. slctrips_tiktok_views).
3. **Attribution** — UTM on links (`utm_source=tiktok`, `utm_campaign=slctrips-hiddencanyons`); Stripe metadata on purchase (referral_source, campaign, building_id); city_metrics increment by source when possible.

---

## Actual Next Move (Not “Build Everything”)

| Step | When | Action |
|------|------|--------|
| **1** | Weekend | Fix B002 Stripe in **existing** codebase; test $9.99 purchase; no DEMO-TK-* |
| **2** | Monday | Validate metric: slctrips_stripe_revenue (or tripkit_sales) appears in city_metrics or dashboard (even if hardcoded at first) |
| **3** | Tuesday | 10-person beta: one TikTok “First 10 to buy get 50% off + help me test” |
| **4** | Rest of month | With working pipeline: migrate to mono-repo, add platforms, build RTS UI with real data |

**Don’t:** Perfect mono-repo and all platforms before any revenue.  
**Do:** Prove one pipe (TikTok → B002 → Stripe → city_metrics), then scale the pattern.

---

## Mono-Repo Question (Where You Are)

**Repo check (B002 SLC Trips):** Stripe integration **code exists** in `apps/slctrips/`: TripKitPurchaseButton → `/api/stripe/create-checkout`, webhook → purchases + tripkit_access_codes + customer_product_access, view page gated by customer_product_access. So you are **not** in (C) “code not written.”

- **A)** Fully set up, all 11 businesses migrated, only metrics need wiring → Next move: verify Stripe env in production and run 11-step test flow.
- **B)** Partially set up, some buildings migrated (SLC Trips is in mono-repo) → Next move: verify B002 env and flow (create-checkout, webhook, view gating); fix any env or gating bug.
- **C)** Designed on paper, not built — **does not apply** to B002; code is in `apps/slctrips`.

If the audit saw “instant access,” possible causes: (1) Auditor clicked a **free** TripKit’s “Start Exploring Now” (no payment). (2) **Env** — STRIPE_SECRET_KEY or webhook secret missing so checkout fails. (3) **View gating** — TripKit marked freemium/price 0 in DB. See [SLCTRIPS_PRE_LAUNCH_CHECKLIST.md](SLCTRIPS_PRE_LAUNCH_CHECKLIST.md) § B002 Stripe: Code Audit.

---

## Related Docs

- [BUILDING_REGISTRY.md](BUILDING_REGISTRY.md) — Building data sources, metric keys  
- [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) — Sector view, TikTok launcher, affiliates  
- [SYSTEMS_AUDIT_SUMMARY.md](SYSTEMS_AUDIT_SUMMARY.md) — SLC Trips + Rock Salt audit, next 3 moves  
- [SLCTRIPS_PRE_LAUNCH_CHECKLIST.md](SLCTRIPS_PRE_LAUNCH_CHECKLIST.md) — B002 payment blocker, post-fix test flow  
- [ROCK_SALT_SYSTEMS_AUDIT.md](ROCK_SALT_SYSTEMS_AUDIT.md) — B003 ready to ship, seed strategy  
- [INTEGRATION_LOG.md](INTEGRATION_LOG.md) — n8n, city_metrics, affiliate expansion  
