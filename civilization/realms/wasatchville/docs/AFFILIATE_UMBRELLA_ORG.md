# Affiliate Umbrella – Cross-Programme Org

**Realm:** WasatchVille  
**Last Updated:** 2025-02-01  
**Purpose:** Tie together all affiliate programmes (Amazon, Awin, TikTok) under one umbrella: enrollment, tax/compliance, retention, and which sector has full org (staff, procedures, KPIs). **Awin is the template**; Amazon and TikTok use shared compliance and retention but don’t have full sector org unless we add it.

---

## 1. Programmes under the umbrella

| Programme | Enrollment | Full sector org? | Primary docs |
|-----------|------------|------------------|--------------|
| **Amazon Associates** | ✅ Enrolled | No (docs only) | [AMAZON_ASSOCIATES.md](AMAZON_ASSOCIATES.md), [AMAZON_N8N_FEBRUARY_PLAN.md](AMAZON_N8N_FEBRUARY_PLAN.md) |
| **Awin (Booking.com, Viator, etc.)** | ✅ Enrolled | **Yes** – Director of Awin Monetization (A011), staff, policies, procedures, KPIs, cadence, escalation | [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md), [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md), [AWIN_STRATEGY.md](AWIN_STRATEGY.md) |
| **TikTok (affiliate / Shop / Creator)** | ✅ Enrolled | No (docs only) | [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md), [SLCTRIPS_TIKTOK_ANALYSIS.md](SLCTRIPS_TIKTOK_ANALYSIS.md) |

**Template for full sector org:** Awin. If we add a “Director of Amazon Monetization” or “TikTok Monetization” later, replicate: sector doc, sector org (staff, policies, procedures, KPIs, cadence, escalation, onboarding, report destination, conflict resolution), strategy/audit doc, and AGENT_ROSTER entry.

---

## 2. Shared across all programmes

| Item | Where it lives |
|------|-----------------|
| **Enrollment status** | [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) – do not suggest signup. |
| **Tax / 1099** | [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md). |
| **Programme compliance (disclosure, TOS, FTC)** | [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md). |
| **Records retention** | [ORD-0002 Record Retention & Archives](../../../city-hall/ordinances/ORD-0002-record-retention-and-archives.md); per-sector docs (e.g. AWIN_SECTOR_ORG section 7). |
| **city_metrics attribution** | [INTEGRATION_LOG.md](INTEGRATION_LOG.md) – per-building keys (e.g. `slctrips_amazon_revenue`, `slctrips_affiliate_revenue`). |

---

## 3. Who owns what (umbrella view)

| Role | Amazon | Awin | TikTok |
|------|--------|------|--------|
| **Sector lead (agent)** | None | A011 Director of Awin Monetization | None |
| **Browser / audits** | Ad hoc (Chrome extension can run wiring check) | Director (Chrome extension) – monthly cadence per AWIN_SECTOR_ORG | Ad hoc |
| **Code / config** | Cursor – `affiliates.ts`, product JSONs, n8n | Cursor – `affiliates.ts`, n8n | Cursor – app/social config |
| **Strategy / programmes** | AMAZON_ASSOCIATES, AMAZON_N8N_FEBRUARY_PLAN | AWIN_STRATEGY, AWIN_MONETIZATION_SECTOR | MEDIA_AND_ADVERTISING_SECTOR, SLCTRIPS_TIKTOK_ANALYSIS |

---

## 4. Adding a new programme

1. Add to [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) once enrolled.
2. Add tax/compliance row and checklist in [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md).
3. Add city_metrics key(s) in [INTEGRATION_LOG.md](INTEGRATION_LOG.md) if revenue is tracked.
4. If giving it **full sector org** (like Awin): create sector doc, sector org doc (copy structure from AWIN_SECTOR_ORG), strategy/audit doc, and add agent to AGENT_ROSTER.

---

## References

| Doc | Purpose |
|-----|--------|
| [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) | Enrolled programmes; no signup prompts. |
| [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md) | Tax/1099, programme compliance, FTC. |
| [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) | Template for full sector org (staff, policies, KPIs, cadence, escalation, onboarding, reports, conflict, retention). |
| [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | city_metrics, n8n, affiliate expansion. |
| [AGENT_ROSTER.md](AGENT_ROSTER.md) | A011 Director of Awin Monetization; add more agents if we add sector leads for Amazon/TikTok. |

---

## Changelog

| Date | Change |
|------|--------|
| 2025-02-01 | Created: umbrella for Amazon, Awin, TikTok; shared tax/compliance/retention; who owns what; how to add new programme; Awin as template for full sector org. |
