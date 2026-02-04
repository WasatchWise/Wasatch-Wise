# Ask Before You App — Nth-Degree Audit

**Purpose:** Compare what was planned (“to the nth degree”) against what’s built, and identify gaps before running HCI on the deployed site.

**Date:** Feb 3, 2026

---

## 1. Sources of “What We Thought We Needed”

| Doc | Scope |
|-----|--------|
| **STATE_AND_DISTRICT_DATA_DESIGN.md** | State & district data: nth-degree vision vs minimized (states in code, Utah full, districts minimal). |
| **NDPA_CERTIFICATION_COURSE_PLAN.md** | NDPA certification: 5 modules, quizzes, badges, certificate, state selection, progress tracking. |
| **lib/daros/README.md** | DAROS: PCE, SOE, TCMP, VDFM; briefing flow; vendors bulk import. |
| **SDPC_MVP_RUNBOOK_FEB_4.md** | SDPC demo: home, learn, certification, ecosystem, registry, request; no 404s on nav. |
| **SHARED_SERVICES.md** (repo root) | ABYA: certification purchases, privacy evaluation, NDPA alignment. |

---

## 2. What’s Built vs What’s Not

### 2.1 State & District Data (STATE_AND_DISTRICT_DATA_DESIGN)

| Planned | Built | Gap? |
|--------|--------|-----|
| 51 state ecosystems (nth degree) | Minimized: Utah full in code; others “Coming Soon” via ALL_STATES | **No** — design chose minimization. |
| State content in code (Utah) | `lib/ecosystem/states/utah.ts` — laws, roles, contacts, resources, workflows, DPA templates | **Done** |
| Optional `states` table | Not implemented | **Optional** — doc says optional for v1. |
| Districts: seed where needed | `districts` table; Utah LEAs seeded; DAROS uses it | **Done** |
| getStateEcosystem(), getAvailableStates() | Yes; ALL_STATES, SDPC_MEMBER_STATES in types | **Done** |

**Verdict:** State/district scope matches the *minimized* design. No required gaps.

---

### 2.2 NDPA Certification (NDPA_CERTIFICATION_COURSE_PLAN)

| Planned | Built | Gap? |
|--------|--------|-----|
| Course landing | `/certification` — 5 modules, value prop, SDPC link | **Done** |
| Module content (0–4) | MODULE_0 through MODULE_4 in `course-content.ts`; full lesson content | **Done** |
| Module/lesson routes | `/certification/module/[moduleId]` — renders lessons, badge celebration | **Done** |
| Quiz routes | `/certification/quiz/[moduleId]` | **Missing** — plan calls for quiz per module. |
| Badge award routes | `/certification/badge/[badgeId]` | **Partial** — badge celebration inline in module page; no dedicated route. |
| Certificate route | `/certification/certificate` | **Missing** — no final certificate page/PDF. |
| User registration + state selection | Not in ABYA | **Deferred** — plan “Next Steps”; MVP is content-only. |
| Progress tracking | localStorage per module in certification module page | **Partial** — no DB, no cross-device. |
| Module lock/unlock | Not enforced (all modules open) | **Deferred** — acceptable for MVP. |
| Rich content / markdown | ReactMarkdown in module page | **Done** |
| Certificate generation (PDF) | Not built | **Missing** |

**Verdict:** For SDPC *content* demo, certification is sufficient: 5 modules, lessons, badges inline. Gaps: **quizzes**, **certificate page/PDF**, **progress in DB** — acceptable to defer for “run HCI on deployed” if demo path doesn’t rely on them.

---

### 2.3 DAROS (lib/daros/README.md)

| Planned | Built | Gap? |
|--------|--------|-----|
| Schema, PCE, SOE, TCMP, VDFM | Schema + engines in code | **Done** |
| Briefing flow, artifacts, district portal | Dashboard app: districts, briefing, artifact download | **Done** |
| Vendors bulk import | Placeholder page; API `import-uspa` exists | **Partial** — not full UI flow. |

**Verdict:** DAROS is in the **dashboard** app; ABYA exposes API routes for Daros (districts, briefing). Vendors bulk import is the only called-out gap; not blocking ABYA standalone demo.

---

### 2.4 SDPC MVP Runbook (Nav & 404s)

| Route | Expected | Built | Gap? |
|-------|----------|--------|-----|
| `/` | Campaign home, SDPC trust, Who modal | Yes | **Done** |
| `/learn` | Knowledge hub, SDPC Registry | Yes | **Done** |
| `/certification` | NDPA training, 5 modules | Yes | **Done** |
| `/ecosystem` | State grid, SDPC count, Utah link | Yes | **Done** |
| `/ecosystem/[stateCode]` | Utah (and future states) | Yes | **Done** |
| `/registry` | Vendor Registry → SDPC Registry | Yes | **Done** |
| `/request` | Request app review | Yes | **Done** |
| **Header: Services** | `/#services` | Home has no `id="services"` in ABYA | **Minor** — scroll does nothing; not 404. |
| **Header: Pricing** | `/pricing` | No `/pricing` in ABYA | **404** — fixed by adding page. |
| **Header: Contact** | `/contact` | No `/contact` in ABYA | **404** — fixed by adding page. |
| **Header: Tools** | Certification, Ecosystem, Quiz, WiseBot, Registry | All exist | **Done** |

**Verdict:** After adding **/contact** and **/pricing**, the runbook’s “no 404s on nav” is satisfied. Optional: add `id="services"` to a section on home or link Services to `/learn`.

---

### 2.5 Supabase & Env

| Item | Status |
|------|--------|
| Migrations 000–009 | Present in `lib/supabase/migrations/` |
| email_captures, districts, RLS, pricing, citations, states, etc. | Schema present; production must have migrations run. |
| Env (lib/env.ts) | Supabase + optional Stripe; getServerEnv() / getClientEnv() | **Done** |

**Verdict:** Backend and env design are in place; deployment checklist is “run migrations + set env in Vercel.”

---

## 3. Summary: Gaps That Matter for “Nth Degree” + HCI on Deployed

### Fixed in this audit

- **/contact** — Added so Header “Contact” does not 404.
- **/pricing** — Added so Header “Pricing” does not 404.

### Deferred / acceptable for current MVP

- **Certification:** Quizzes per module, certificate page/PDF, DB progress, state selection — not required for SDPC content demo.
- **States table** — Optional per design; in-code + ALL_STATES is enough.
- **Daros vendors bulk import** — Dashboard feature; not ABYA nav.
- **/#services** — No `id="services"` on ABYA home; optional to add or point Services to `/learn`.

### Not built (nth-degree wishlist only)

- 50 more state ecosystems (only Utah in code).
- Full certification feature set (registration, quizzes, certificate generation, LTI).

---

## 4. Running HCI on the Deployed Site

### Prerequisites

1. **Deploy** — ABYA built and deployed (e.g. Vercel) with a stable production URL.
2. **No 404s on demo path** — After adding /contact and /pricing, run: `/` → `/learn` → `/certification` → `/ecosystem` → `/ecosystem/ut` → `/registry` → `/request`; click all Header links (Services, Pricing, Tools, Contact). All should resolve.
3. **Env (optional for static demo)** — If tests hit Supabase (e.g. contact form, email capture), set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production.

### How to run HCI against production

Playwright is configured with:

- `baseURL: process.env.BASE_URL || 'http://localhost:3000'`
- `webServer` starts the dev server when tests run (for local).

To run HCI against the **deployed** site:

1. Set **BASE_URL** to your production URL in the same shell where you run Playwright (e.g. `export BASE_URL=https://ask-before-you-app.vercel.app`).
2. Run tests from the ABYA app directory. Tests will navigate to `BASE_URL`; the dev server may still start but is ignored when BASE_URL is set.

Example (from repo root):

```bash
cd apps/ask-before-you-app
BASE_URL=https://YOUR-ABYA-PRODUCTION-URL.vercel.app pnpm exec playwright test --config=tests/hci/playwright.config.ts
```

Or from monorepo root:

```bash
BASE_URL=https://YOUR-ABYA-PRODUCTION-URL.vercel.app pnpm --filter ask-before-you-app exec playwright test --config=tests/hci/playwright.config.ts
```

Verify in the test output or trace that the requested URLs use your production domain, not localhost.

### What HCI covers

- Archetype flows (teacher, administrator, parent, etc.).
- Accessibility (e.g. `**/accessibility/*.spec.ts`).
- Critical paths: home, learn, certification (landing + one module), ecosystem, registry.

---

## 5. Confidence and Next Steps

- **State/district and SDPC runbook scope:** Built to the *minimized* nth-degree design; Utah and nav are in place.
- **Certification:** Content and module UX are there; quizzes and certificate are deferred and acceptable for demo + HCI.
- **404s:** Add **/contact** and **/pricing** (done in this pass), then the runbook’s “no 404s on nav” holds.

**Recommendation:**

1. **Confirm deploy** — Ensure ABYA is deployed and the production URL is known.
2. **Smoke-test** — Hit the demo path and every Header link; confirm no 404s.
3. **Run HCI on deployed** — Set `BASE_URL` to production and run Playwright; fix any failures (e.g. selectors, timing).
4. **Optionally** — Add `id="services"` to ABYA home or link Services to `/learn` for a better experience.

After that, you can rely on HCI against the deployed site as the regression baseline.
