# Awin Monetization Sector – Organization, Policies & Procedures

**Realm:** WasatchVille  
**Sector:** Awin / Booking.com & Strategic Partnerships (Director of Awin Monetization)  
**Last Updated:** 2025-02-01  
**Purpose:** Org structure, staff, policies, procedures, access controls, expectations, and records retention for the Awin monetization sector. **This is not n8n** – n8n is workflow automation; org, policies, and retention live in civilization docs and city-hall ordinances.

---

## 1. Org chart positioning

| Property | Value |
|----------|--------|
| **Role** | Director of Awin Monetization & Strategic Partnerships |
| **Agent ID** | A011 (see [AGENT_ROSTER.md](AGENT_ROSTER.md)) |
| **Building (primary)** | Amusement Park (SLC Trips) |
| **Scope** | Expands to all buildings (Rock Salt, Adult AI Academy, Pipeline IQ, etc.) as affiliate infrastructure scales |
| **Reports to** | Mayor (A001) for cross-venture strategy and prioritization |
| **Collaborates with** | Park Director (A003) for slctrips content and placement; CFO (A002) for revenue attribution and city_metrics |
| **Peer roles** | Other building leads and sector directors (e.g. Park Director, Concert Manager) |

Director is a **sector lead** for affiliate monetization (Awin/Booking.com), not a direct report of Park Director. Director and Park Director coordinate on slctrips placement and content.

---

## 2. Staff / sector team

“Staff” here means roles that carry out the sector’s work. There are no human employees; the sector runs on **Director (Chrome extension) + Cursor (codebase) + optional automation (n8n)**.

| Role | Who/what | Responsibility |
|------|----------|----------------|
| **Director of Awin Monetization** | Chrome extension (in browser) | Explore Awin platform, document programmes and opportunities, verify links and dashboards, report in RESULT / FINDINGS / BUGS / NEEDS CURSOR format. |
| **Code & config** | Cursor (in repo) | Implement and maintain `affiliates.ts`, city_metrics, n8n workflows, shared packages; fix issues listed in NEEDS CURSOR. |
| **Automation (optional)** | n8n | Run scheduled or event-driven workflows (e.g. Awin report → city_metrics); does **not** define org, policies, or retention. |

Future “staff” could include: dedicated Awin Ops role (human or agent) for n8n Awin workflows, or a Content Ops role for link placement. Document any new role here and in AGENT_ROSTER if it becomes an agent.

---

## 3. Policies (sector-specific)

These apply to Awin monetization; city-hall ordinances apply to all realms.

| Policy | Requirement |
|--------|-------------|
| **Link attribution** | All Booking.com (and Awin merchant) links on WasatchWise properties SHALL use Awin tracking (`awin1.com/cread.php` or equivalent) with correct publisher ID and merchant ID. No direct Booking.com links without Awin wrapper. |
| **Disclosure** | Any page with affiliate links SHALL include appropriate disclosure (e.g. affiliate disclosure in footer; see slctrips Footer and AMAZON_ASSOCIATES). |
| **Attribution to city_metrics** | Revenue from Awin programmes SHALL be attributed to the correct building (e.g. `slctrips_affiliate_revenue`) via n8n, manual reconciliation, or dashboard, per INTEGRATION_LOG. |
| **Credentials** | Awin publisher ID and merchant IDs SHALL NOT be committed in plain text in repo where avoidable; use env vars (e.g. `NEXT_PUBLIC_AWIN_AFFILIATE_ID`) and keep secrets in `.env` (gitignored). |
| **Records** | Sector records (audits, reports, exports) SHALL follow [ORD-0002 Record Retention & Archives](../../../city-hall/ordinances/ORD-0002-record-retention-and-archives.md) – see section 7 below. |

Policies that span all realms (e.g. privacy, record retention) are in [city-hall ordinances](../../../city-hall/ordinances/).

---

## 4. Procedures

| Procedure | Owner | Steps |
|-----------|--------|------|
| **Add new Awin merchant** | Director (discover) + Cursor (implement) | 1) Director finds programme in Awin dashboard and documents commission/terms. 2) Add merchant to `AFFILIATE_CONFIG` in `affiliates.ts` with merchant ID from Awin. 3) Use env for merchant ID if sensitive. 4) Add link builder or campaign in code; document in AWIN_STRATEGY or INTEGRATION_LOG. |
| **Report findings from Awin platform** | Director (Chrome extension) | 1) Use standard report format: RESULT, FINDINGS, BUGS, NEEDS CURSOR. 2) Paste or save report in chat or in a doc (e.g. session summary, or civilization/archives if retained). 3) Cursor addresses NEEDS CURSOR items; user addresses BUGS (e.g. Awin dashboard actions). |
| **Request code/config change** | Director or user | 1) Add item under NEEDS CURSOR in report with enough detail (URL, expected vs actual). 2) Cursor implements in repo. 3) Director or user verifies in browser after deploy. |
| **Awin revenue → city_metrics** | Cursor / n8n / user | 1) Use n8n workflow (when built) to map Awin report or export to `slctrips_affiliate_revenue` (or other building metric). 2) Or manually update via Supabase/dashboard using `upsert_revenue_metric`. 3) Document in INTEGRATION_LOG. |

---

## 5. Access controls

| Asset | Who has access | Notes |
|-------|----------------|-------|
| **Awin dashboard** | User (John Lyman) | Login at Awin; Director (extension) can view when user has session open. No shared service account documented. |
| **n8n** | User (local Docker or deployed) | Env vars for Supabase; Awin API credentials only if n8n workflows use Awin API (future). |
| **Supabase (city_metrics)** | Apps + n8n (service role in env) | RLS and service role per project; n8n uses same Supabase project as dashboard for city_metrics. |
| **Repo (affiliates.ts, sector docs)** | Cursor + user | Code and docs in git; secrets in env only. |
| **Vercel / slctrips deploy** | User (Vercel dashboard) | Deploys from repo; env vars set in Vercel. |

Access to Awin, n8n, and production envs is **user-only** unless a future role (e.g. Awin Ops) is granted. No automated “staff” accounts for Awin dashboard; Director operates in the user’s browser session.

---

## 6. Expectations

| Role | Expectation |
|------|-------------|
| **Director (Chrome extension)** | Explore Awin in browser; document programmes, commission, and opportunities; verify live link placement and tracking; report in standard format; do not suggest signing up (already enrolled). |
| **Cursor** | Implement and maintain affiliate code and config; fix NEEDS CURSOR items from Director reports; keep sector docs (AWIN_STRATEGY, AWIN_MONETIZATION_SECTOR, this doc) updated when structure or process changes. |
| **User** | Submit payment info and complete Awin dashboard actions (e.g. accept/decline invitations); deploy and verify after Cursor changes; decide prioritization (e.g. Booking.com first, then other merchants). |

---

## 6a. Success metrics / KPIs

How we know the sector is working. Review in line with [review cadence](#6b-review-cadence).

| Metric | Source | Target (slctrips, initial) | Notes |
|--------|--------|---------------------------|--------|
| **Awin clicks (Booking.com)** | Awin dashboard or GA | Trend up MoM | Clicks from slctrips homepage + destination accommodations. |
| **Awin conversions** | Awin dashboard | > 0; trend up as traffic grows | Bookings attributed to publisher 2060961. |
| **slctrips_affiliate_revenue** | city_metrics | > 0; updated at least monthly | From n8n or manual reconciliation; per INTEGRATION_LOG. |
| **Link coverage** | Director audit | 100% of Booking.com links use Awin wrapper | No direct Booking.com links; all via `awin1.com/cread.php`. |
| **Director audit RESULT** | Director report | Pass or Partial (no unresolved Fail) | Per wiring/audit run. |

Targets for other buildings (Rock Salt, etc.) when they join affiliate expansion: define per building in INTEGRATION_LOG or AWIN_STRATEGY.

---

## 6b. Review cadence

| Activity | Cadence | Owner |
|----------|---------|--------|
| **Director platform audit** (Awin programmes, commission, link check on slctrips) | Monthly, or after major slctrips deploy | Director (Chrome extension) |
| **Link verification** (homepage + 3 destination pages + TripKit viewer) | Per deploy or weekly during active link changes | Director or user |
| **Awin revenue → city_metrics** | Monthly or when Awin report available | User / n8n (when workflow exists) |
| **Sector doc review** (this doc, AWIN_STRATEGY) | Quarterly or when process changes | Cursor / user |

Ad hoc: run Director audit anytime after big content or affiliate changes.

---

## 6c. Escalation path

| Severity | Trigger | Who decides priority | Action |
|----------|---------|----------------------|--------|
| **Critical** | All Booking.com links broken; Awin account at risk; disclosure missing site-wide | User | User prioritizes; Cursor fixes NEEDS CURSOR; user fixes BUGS (e.g. Awin dashboard). Mayor can be consulted for cross-venture impact. |
| **High** | Major link section missing Awin (e.g. TripKit viewer); revenue leak | User | Add to backlog; Cursor implements; Director verifies. |
| **Normal** | NEEDS CURSOR items (single link, copy, config) | Cursor | Cursor fixes in repo; user deploys; Director or user verifies. |
| **Low** | BUGS (Awin dashboard only); optimization ideas | User | User handles when convenient. |

**Tie-breaker:** User has final say. Mayor (A001) advises on cross-venture priority if asked.

---

## 6d. Conflict resolution

If **Director of Awin Monetization** and **Park Director** (or another building lead) disagree on placement, copy, or priority:

1. **Default:** User decides. User can side with Director (monetization) or Park Director (content/UX).
2. **Optional:** Escalate to Mayor (A001) for a “city-wide” recommendation (e.g. “monetization vs. experience” tradeoff).
3. **Document:** One-line outcome in chat or in a retained summary (e.g. `civilization/archives/public/awin-audits/`) so we don’t repeat the same debate.

No automated override; user and Mayor are the only tie-breakers.

---

## 6e. Onboarding / handoff (Start here for Awin sector)

If someone new (human or agent) joins the Awin monetization sector, read in this order:

| Order | Doc | Purpose |
|-------|-----|--------|
| 1 | [AFFILIATE_ENROLLMENT_STATUS.md](AFFILIATE_ENROLLMENT_STATUS.md) | Confirm Awin (and Amazon, TikTok) already enrolled; no signup prompts. |
| 2 | This doc (AWIN_SECTOR_ORG.md) | Org, staff, policies, procedures, access, expectations, KPIs, cadence, escalation, conflict, retention. |
| 3 | [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md) | Mission, phases, Director/Cursor split. |
| 4 | [AWIN_STRATEGY.md](AWIN_STRATEGY.md) | Programmes, commission, current implementation, action plan, revenue projections. |
| 5 | [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | city_metrics keys, n8n, affiliate expansion. |
| 6 | [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md) | Tax/1099, programme compliance checklists. |
| 7 | `apps/slctrips/src/lib/affiliates.ts` | Code: Awin config, link builders. |

Then run one Director audit (Chrome extension + wiring prompt) to see current state.

---

## 6f. Report destination

Where Director reports are retained so they’re not chat-only.

| Report type | Where to retain | Retention |
|-------------|-----------------|-----------|
| **Redacted audit summary** (RESULT, FINDINGS, BUGS, NEEDS CURSOR; no PII) | `civilization/archives/public/awin-audits/` (e.g. `YYYY-MM-DD-awin-audit-summary.md`) | R2 Governance per ORD-0002 |
| **Full report with screenshots** (if needed for dispute or audit) | `civilization/archives/private/` (gitignored) or secure store; do not commit raw PII | R1 Operational; delete when no longer needed |
| **Chat-only** | No retention beyond session unless user copies into a doc or archive | Ephemeral |

Create `civilization/archives/public/awin-audits/` when first retained summary is written; add a one-line README there pointing to ORD-0002 and this section.

---

## 7. Records retention

Sector records (Director audits, Awin reports, link audits, strategy docs) follow [ORD-0002 Record Retention & Archives](../../../city-hall/ordinances/ORD-0002-record-retention-and-archives.md).

| Record type | Retention class | Location / handling |
|-------------|-----------------|---------------------|
| Director audit reports (summaries in docs) | R2 Governance (3–7 years) | `civilization/realms/wasatchville/docs/` (e.g. AWIN_STRATEGY.md). Redacted summaries only; no raw PII or full Awin exports in git. |
| Awin programme list, commission structure | R2 Governance | AWIN_STRATEGY.md, AWIN_SECTOR_ORG.md. |
| Raw Awin exports / screenshots with PII | R0 Ephemeral or R1 Operational | Do not commit to git. Store in `civilization/archives/private/` (gitignored) or approved secure store if needed; delete when no longer needed. |
| Sector org, policies, procedures | R3 Permanent | This doc and city-hall ordinances. |

n8n **workflow definitions** (JSON in repo) are versioned code; retention follows repo policy. n8n **execution logs** (e.g. Awin sync runs) are operational data; retain per ORD-0002 R1 unless a stricter rule applies.

---

## 8. Where “org, policies, procedures” live (not n8n)

| Need | Where it lives |
|------|-----------------|
| Org chart, staff, expectations | This doc; [AGENT_ROSTER.md](AGENT_ROSTER.md) |
| Sector policies & procedures | This doc; [city-hall ordinances](../../../city-hall/ordinances/) for cross-realm |
| Access controls | This doc (section 5); Supabase RLS, Vercel, Awin dashboard (user-managed) |
| Records retention | [ORD-0002](../../../city-hall/ordinances/ORD-0002-record-retention-and-archives.md); this doc (section 7) |
| **n8n** | **Workflow automation only** – runs tasks (e.g. “Awin report → city_metrics”). It does not store org charts, policies, or retention rules; those stay in civilization docs and city-hall. |

---

## 9. Gaps / possible omissions (addressed)

Previously missing; now addressed as follows:

| Gap | Status | Where it lives |
|-----|--------|----------------|
| **Success metrics / KPIs** | Addressed | This doc, section 6a. |
| **Review cadence** | Addressed | This doc, section 6b. |
| **Escalation path** | Addressed | This doc, section 6c. |
| **Tax / 1099** | Addressed | [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md). |
| **Programme-specific compliance** | Addressed | [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md). |
| **Onboarding / handoff** | Addressed | This doc, section 6e. |
| **Report destination** | Addressed | This doc, section 6f; ORD-0002. |
| **Conflict resolution** | Addressed | This doc, section 6d. |
| **TripKit viewer verification** | Backlog | [AWIN_STRATEGY.md](AWIN_STRATEGY.md) – Gaps / backlog; NEEDS CURSOR when verified. |
| **Other affiliate sectors** | Addressed | [AFFILIATE_UMBRELLA_ORG.md](AFFILIATE_UMBRELLA_ORG.md) – umbrella; Awin is template. |

---

## References

| Doc | Purpose |
|-----|--------|
| [AGENT_ROSTER.md](AGENT_ROSTER.md) | A011 Director definition, peer roles. |
| [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md) | Mission, phases, Director/Cursor split. |
| [AWIN_STRATEGY.md](AWIN_STRATEGY.md) | Programmes, commission, implementation, action plan. |
| [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | Awin/Viator, city_metrics, n8n. |
| [AFFILIATE_TAX_AND_COMPLIANCE.md](AFFILIATE_TAX_AND_COMPLIANCE.md) | Tax/1099, programme compliance checklists (Amazon, Awin, TikTok, FTC). |
| [AFFILIATE_UMBRELLA_ORG.md](AFFILIATE_UMBRELLA_ORG.md) | Affiliate umbrella; Awin sector as template for Amazon/TikTok. |
| [city-hall ordinances](../../../city-hall/ordinances/) | ORD-0002 retention, ORD-0001 privacy, etc. |

---

## Changelog

| Date | Change |
|------|--------|
| 2025-02-01 | Built out to nth degree: 6a KPIs, 6b review cadence, 6c escalation, 6d conflict resolution, 6e onboarding, 6f report destination; AFFILIATE_TAX_AND_COMPLIANCE, AFFILIATE_UMBRELLA_ORG; TripKit verification backlog in AWIN_STRATEGY; section 9 updated to "addressed". |
| 2025-02-01 | Added section 9 (Gaps / possible omissions): KPIs, review cadence, escalation, tax/1099, programme compliance, onboarding, report destination, conflict resolution, TripKit verification, other sectors. |
| 2025-02-01 | Created: org chart, staff, policies, procedures, access, expectations, records retention. Clarified n8n is automation only; org/policies/retention live in civilization and city-hall. |
