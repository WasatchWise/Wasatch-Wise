# Awin Strategy – Director's First Audit & Implementation

**Realm:** WasatchVille  
**Source:** Director of Awin Monetization (Chrome extension) first platform audit, 2026-02-01  
**Code:** `apps/slctrips/src/lib/affiliates.ts`, `BookYourAdventure.tsx`, `BookingAccommodations.tsx`

---

## Executive Summary

- **Account:** Wasatch Wise LLC, Publisher ID `2060961`, active 8+ years (since 2016).
- **Active programmes:** 17 Awin advertisers (travel, outdoor, car rental).
- **Crown jewel:** Booking.com North America (merchant `6776`) – 4% accommodations, $2 flights, 3.8–6% car rentals.
- **Current implementation:** Homepage and destination accommodations use AWIN tracking (`awin1.com/cread.php`). Revenue opportunity: deepen placement and scale to 10+ platforms.

---

## Booking.com Commission Structure (Awin)

| Product | Commission |
|---------|------------|
| Accommodations | 4% |
| Flights | $2 flat per booking |
| Car rentals (pay locally) | 3.8% |
| Car rentals (pay now) | 6% |

**Performance (from Director audit):** Conversion 2.06%, Approval 71.39%, EPC $0.23, link status green.

---

## All 17 Active Awin Programmes (from Director audit)

**Tier 1 – High-value travel (priority for slctrips.com):**

| Programme | Commission / EPC | Status | Notes |
|-----------|------------------|--------|--------|
| Booking.com North America | 4% hotels, $2 flights, 3.8–6% cars | Green | Integrate into every TripKit |
| Campspot (US) | EPC $0.05, 1.99% conv. | Amber | Utah camping content |
| GoWithGuide US | EPC $2.77, 10.64% conv. | Amber | Tour guides, national parks |
| Como Hotels and Resorts (US) | n/a (luxury) | Amber | High-end Utah resorts |

**Tier 2 – Car rental & transport:** Cerquer (EPC $0.19), eSIMMania.com (EPC $0.05, international SIMs).

**Tier 3 – Outdoor gear:** Flextail (Green), Slipack (EPC $0.68), VSGO (EPC $1.45, camera gear).

*Full list and invitation status (Betckey, Sparkle GmbH, etc.) – see Director’s report in session; accept/decline in Awin dashboard.*

---

## Current Implementation (slctrips.com)

| Location | Component | Awin usage | Campaign |
|----------|-----------|------------|----------|
| Homepage | `BookYourAdventure` | Yes – `awin1.com/cread.php` with `ued=` Booking.com URL | `slctrips-homepage-cars`, `slctrips-homepage-hotels` |
| Homepage | “Rent a Car” / “Find Hotels” | Yes – same AWIN wrapper | As above |
| Destination pages | `BookingAccommodations` | Yes – `buildBookingAffiliateUrl()` wraps each accommodation link | `slctrips-accommodations` |
| Shared | `affiliates.ts` | `getBookingLink`, `getBookingFlightsLink`, `getBookingCarRentalsLink`, `getBookingDeeplink` | Configurable campaign param |

**Config:** Publisher ID `2060961` (env: `NEXT_PUBLIC_AWIN_AFFILIATE_ID`), Booking.com merchant `6776`. See `apps/slctrips/src/lib/affiliates.ts`.

**Gaps to verify (Director/Chrome extension):**

- TripKit viewer pages – do “Where to Stay” / accommodation links use the same Awin wrapper?
- Footer “Find Accommodations” – does it use `getBookingLink` or equivalent?
- Any page that links to Booking.com without going through `buildAwinTrackingLink` / `buildBookingAffiliateUrl` / `getBookingLink` is a revenue leak.

---

## Director’s Action Plan (from first audit)

**Phase 1 – Fix/verify Booking.com integration (48h):**

1. Confirm “Find Hotels” and “Rent a Car” on homepage use Awin (done in code; extension can verify on live site).
2. Confirm every TripKit and destination “Where to Stay” uses Awin (BookingAccommodations does; TripKit viewer to be checked).
3. Add or verify Booking.com in footer (e.g. “Find Accommodations” → `getBookingLink`).

**Phase 2 – Accept strategic invitations (Awin dashboard):**

- Accept Betckey, Sparkle GmbH if relevant; decline Mars by GHC. (Browser task.)

**Phase 3 – Audit link placement (this week):**

- Director checks slctrips.com: view source for `awin1.com/cread.php`, test booking flow, confirm tracking fires.

---

## Revenue Projections (from Director report)

| Scenario | Monthly visitors | Click rate | Convert | Avg commission | Monthly | Annual |
|----------|------------------|------------|---------|----------------|---------|--------|
| Conservative (slctrips) | 3,000 | 5% | 2% | $18 | $54 | $648 |
| Optimistic (optimized) | 10,000 | 10% | 2.5% | $25 | $625 | $7,500 |
| 10+ platforms | — | — | — | — | — | ~$75k potential |

**Comparison:** One Booking.com hotel booking ($450 × 4% = $18) ≈ 8× a typical Amazon gear sale ($50 × 3% ≈ $2.25).

---

## Phase 2 – Awin invitations (Director recommendation)

Recommendation from Director link audit (2026-02-01). Execute in Awin dashboard (browser).

| Invitation | Action | Rationale |
|------------|--------|-----------|
| **Betckey** | **Accept** | 12% commission, outdoor/travel gear; fits Utah outdoor content (camping, hiking, road trips). Higher commission than Amazon on comparable gear. |
| **Sparkle GmbH** | **Accept** | 10% commission, travel products; fits Utah travel essentials. Quality travel gear for authentic recommendations. |
| **Mars by GHC** | **Decline** | Men's wellness; not relevant to Utah travel content. |

**Context:** Booking.com remains primary for accommodations/travel; Betckey/Sparkle add higher-commission options for outdoor gear; Amazon stays for convenience/quick shipping. Example: $100 camping tent → Amazon $4.50 vs Betckey $12.00 commission.

**Phase 2 decision:** **Option A – Executed on 2026-02-01.**

| Result | Detail |
|--------|--------|
| **Betckey** | Accepted. 12% commission, outdoor/travel gear. |
| **Sparkle GmbH** (Hey Happiness) | Accepted. 10% commission, travel/jewelry. Personal outreach from Tamya. |
| **Mars by GHC** | Invitation not found in activity stream (may have expired). No action; not travel-relevant. |

**Status:** Phase 2 complete. Betckey and Sparkle GmbH will appear in "My Programmes" within 24–48 hours. No code change.

---

## Director's 30-day plan and standing orders (2026-02-01)

**30-day execution (Feb 2–29):**

| Week | Focus |
|------|--------|
| **Week 1 (Feb 2–8)** | Confirm Betckey + Sparkle GmbH in "My Programmes"; create 1 test piece featuring Betckey-eligible product; baseline Booking.com metrics. |
| **Week 2 (Feb 9–15)** | Compare Betckey vs Amazon click-through for same product category; add Booking.com to 3 more TripKit pages; test Sparkle GmbH in one travel-essentials piece. |
| **Week 3 (Feb 16–22)** | Analyze which network (Awin vs Amazon) converts better for gear; double down on winning network; if Betckey performs well, replace more Amazon gear links. |
| **Week 4 (Feb 23–29)** | Report actual revenue Awin vs Amazon; decide permanent link strategy from data; plan March content with optimized affiliate mix. |

**Standing orders (Director ongoing):**

- Monitor monthly performance; track which partners drive revenue.
- Identify new Awin opportunities that fit Utah travel.
- Recommend where to add/move affiliate links.
- Report quarterly: performance analysis and strategic recommendations.
- Ensure all partners align with "local-first, benefit the traveler."

**Next check-in:** February 8, 2026 (verify new partners in dashboard).

---

## Backlog (NEEDS CURSOR)

Concrete items to verify or implement; hand to Cursor when ready.

| Item | Description | Verification |
|------|-------------|--------------|
| **TripKit viewer – Where to Stay** | Ensure "Where to Stay" (or any accommodation links) in TripKit viewer pages use Awin wrapper (`getBookingLink` or `buildBookingAffiliateUrl`), not raw Booking.com URLs. | **2026-02-01:** Director audit could not verify (TripKit viewer returned 404 without login/ownership). Verify when logged in or when TripKit is publicly viewable. See civilization/archives/public/awin-audits/2026-02-01-awin-audit-summary.md. |
| **Footer "Find Accommodations"** | If slctrips footer has a "Find Accommodations" or similar link, ensure it uses `getBookingLink` or equivalent. | Director or user: check footer on slctrips.com; if link exists, confirm Awin tracking. |
| **Awin revenue → city_metrics (n8n)** | Optional n8n workflow: Awin report or export → map to `slctrips_affiliate_revenue` (and other building keys when scaled). | Per INTEGRATION_LOG; implement when Awin reporting API or export is available. |

---

## References

| Doc | Purpose |
|-----|--------|
| [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md) | Director role, mission, phases. |
| [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) | Awin enrolled; no signup prompts. |
| [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | AWIN/Viator, city_metrics, per-building revenue. |
| [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) | Sector org: KPIs, cadence, escalation, onboarding, report destination. |
| [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md) | Tax/1099, programme compliance. |
| [AFFILIATE_UMBRELLA_ORG.md](AFFILIATE_UMBRELLA_ORG.md) | Umbrella: Amazon, Awin, TikTok; Awin as template. |
| `apps/slctrips/src/lib/affiliates.ts` | Awin config, `getBookingLink`, `buildAwinTrackingLink`. |
| `apps/slctrips/src/components/BookYourAdventure.tsx` | Homepage cars/hotels Awin links. |
| `apps/slctrips/src/components/BookingAccommodations.tsx` | Destination “Where to Stay” Awin links. |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-01 | Added Director's 30-day plan and standing orders (Week 1–4, next check-in Feb 8). Phase 2 executed (Betckey, Sparkle GmbH accepted). |
| 2025-02-01 | Added Backlog (NEEDS CURSOR): TripKit viewer Where to Stay, footer Find Accommodations, Awin → city_metrics n8n. References to AWIN_SECTOR_ORG, AFFILIATE_TAX_AND_COMPLIANCE, AFFILIATE_UMBRELLA_ORG. |
| 2026-02-01 | Created from Director of Awin Monetization first platform audit. Commission structure, 17 programmes, current implementation summary, action plan, revenue projections. |
