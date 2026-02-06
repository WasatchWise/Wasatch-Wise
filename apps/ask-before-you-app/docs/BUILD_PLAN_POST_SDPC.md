# Ask Before You App — Build Plan (Post–SDPC)

**Context:** SDPC loved the demo. This plan closes gaps and builds out the rest of the product.

**Sources:** GAPS_OMISSIONS_USE_CASES.md, NTH_DEGREE_AUDIT.md, SDPC_MVP_RUNBOOK_FEB_4.md

---

## Phase 1 — Quick wins (request form + webhook emails)

| Item | Status | Notes |
|------|--------|------|
| **Request form persistence** | Done | `app_requests` table (migration `010_app_requests.sql`); server action `submitAppRequest`; admin + confirmation email; optional lead router webhook. |
| **Stripe webhook emails** | Done | On `checkout.session.completed` (app review): admin notification + customer confirmation via Resend. |

**To enable request form in production:** Run migration `lib/supabase/migrations/010_app_requests.sql` on your ABYA Supabase project. Ensure `RESEND_API_KEY` is set for emails.

---

## Phase 2 — Certification completion

| Item | Status | Notes |
|------|--------|------|
| **Quiz per module** | Not started | `/certification/quiz/[moduleId]` — 3–5 questions per module; store result in localStorage or DB. |
| **Certificate page** | Not started | `/certification/certificate` after all modules complete; optional PDF download. |
| **Progress in DB** (optional) | Not started | `certification_progress` table for resume across devices and completion reporting. |
| **Module lock/unlock** (optional) | Not started | Complete module N before N+1. |

---

## Phase 3 — Content and audience

| Item | Status | Notes |
|------|--------|------|
| **Student “rights”** | Not started | Short section or page: “What students can ask / your rights” + FERPA/state link. |
| **More state ecosystems** | Not started | Add 1–2 states (e.g. CA, TX) or “Federal + how to find your state” for non-Utah. |
| **Board / Consultant in Who modal** (optional) | Not started | Add personas and one line of copy each. |

---

## Phase 4 — Integrations and scale

| Item | Status | Notes |
|------|--------|------|
| **SDPC Registry in-app** | Not started | Embed or iframe search, or API if available. |
| **Completion reporting** | Not started | Webhook/API to report certification completion to SDPC/alliance. |
| **Data-driven states** | Not started | States/counts from CMS or DB for non-dev updates. |
| **DAROS vendors import UI** | Not started | Full import flow in dashboard using `import-uspa` API. |

---

## Done / no longer needed

- **Nav:** ABYA-only; Services/Brands/Pricing removed (no 404s).
- **Branding:** Ask Before You App consistent; Utah contact (John Lyman) removed.

---

**Next:** Execute Phase 1, then prioritize Phase 2 vs 3 based on feedback.
