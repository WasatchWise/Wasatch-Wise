# Awin Monetization Sector – Director Role & Mission

**Realm:** WasatchVille  
**Sector:** Affiliate monetization (Awin / Booking.com & strategic partnerships)  
**Last Updated:** 2025-02-01

---

## Director of Awin Monetization & Strategic Partnerships

**Role (codified):** Director of Awin Monetization & Strategic Partnerships.  
**Mission:** Master Awin, maximize Booking.com (and Awin network) revenue across 10+ WasatchWise platforms, starting with slctrips.com. Build the monetization infrastructure that scales to the entire portfolio.

**Operational split:**
- **Chrome extension (in browser):** Acts as Director in the browser – explores Awin platform, documents opportunities, verifies links and dashboards, reports findings. Focus: Awin UI, merchant programs, reporting, optimization.
- **Cursor (in repo):** Supports with code, config, and data – `apps/slctrips/src/lib/affiliates.ts`, city_metrics, n8n workflows, shared affiliate packages. Focus: link builders, env, attribution, automation.

---

## Current State (WasatchVille)

| Item | Value |
|------|--------|
| **Awin Publisher ID** | `2060961` (env: `NEXT_PUBLIC_AWIN_AFFILIATE_ID`) |
| **Booking.com (Awin)** | Merchant ID `6776` – configured in `affiliates.ts` |
| **Code** | `apps/slctrips/src/lib/affiliates.ts` – Awin config, `buildBookingAffiliateUrl`, `buildViatorAffiliateUrl` |
| **Campaign prefix** | `slctrips-*` (SLC Trips); goal: `rocksalt-*`, `academy-*`, etc. per building |
| **city_metrics** | Per-building keys: `slctrips_affiliate_revenue`, `rocksalt_affiliate_revenue`, etc. (see INTEGRATION_LOG) |

**Enrollment:** Awin account is active. Do not suggest signing up. Focus on optimization, merchant expansion, and scaling. See [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md).

**Director's first audit (2026-02-01):** 17 active Awin programmes documented; Booking.com commission structure (4% hotels, $2 flights, 3.8–6% cars); revenue projections and action plan. See [AWIN_STRATEGY.md](AWIN_STRATEGY.md).

**Sector organization (staff, policies, procedures, access, expectations, records retention):** See [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md). n8n is workflow automation only; org, policies, and retention live in civilization docs and city-hall ordinances.

---

## Strategic Priority

**Primary opportunity:** Passive income across 10+ platforms via Awin (Booking.com, Viator, and other merchants). slctrips.com is the first platform; replicate patterns to Rock Salt, Adult AI Academy, Pipeline IQ, and others.

**Phase 1 – Become Awin expert (Director in browser):**
1. Explore Awin platform end-to-end – programs, reporting, tools.
2. Document every opportunity (merchants, commission structures, link types).
3. Identify gaps vs. current implementation in `affiliates.ts` and INTEGRATION_LOG.
4. Report findings in standard format (RESULT / FINDINGS / BUGS / NEEDS CURSOR) so Cursor can implement code/config.

**Phase 2 – Maximize slctrips.com:**
1. Ensure all high-value Awin merchants (Booking.com, Viator, etc.) are linked and tracked.
2. Attribution to city_metrics (`slctrips_affiliate_revenue`) via n8n or manual reconciliation.
3. Disclosure and compliance on slctrips.com.

**Phase 3 – Scale to 10+ platforms:**
1. Extract shared affiliate lib (e.g. `packages/wasatchwise-affiliates`) with configurable `campaignPrefix` / `building_id`.
2. Per-building Awin campaigns and city_metrics keys.
3. n8n workflows for Awin reporting → city_metrics where applicable.

---

## References

| Doc | Purpose |
|-----|--------|
| [AWIN_STRATEGY.md](AWIN_STRATEGY.md) | Director's first audit: 17 programmes, Booking.com commission, implementation summary, action plan, revenue projections. |
| [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) | Sector org: staff, policies, procedures, access controls, expectations, org chart, records retention. (Not n8n.) |
| [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) | Amazon, TikTok, Awin – enrolled; no signup prompts. |
| [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | Affiliate expansion, AWIN/Viator, city_metrics, n8n. |
| [AFFILIATE_REVIEW_2025-01-31.md](AFFILIATE_REVIEW_2025-01-31.md) | Merchant assessment, gaps, Rock Salt affiliates. |
| `apps/slctrips/src/lib/affiliates.ts` | Awin config, Booking.com, Viator, link builders. |
| [CURSOR_CHROME_AGENT_COORDINATION.md](../../../../docs/plans/CURSOR_CHROME_AGENT_COORDINATION.md) | How Director (extension) and Cursor report and hand off. |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-01 | Linked AWIN_STRATEGY.md (Director's first audit: 17 programmes, Booking.com commission, implementation, action plan). |
| 2025-02-01 | Sector created; Director of Awin Monetization role codified. Chrome extension = Director in browser; Cursor = code/config support. Phase 1–3 outlined. |
