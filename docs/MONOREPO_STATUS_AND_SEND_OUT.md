# Monorepo status & send-out checklist

**Branch:** `main`  
**Last commit:** `9ea3d2a` — fix(groove): use pnpm from monorepo root for install and build  
**Updated:** 2026-02-05

Use this to see what’s in the repo, what’s changed locally, and how to get the “couple of new things” out the door.

---

## 1. Apps in the monorepo

| App (folder) | package name | Build | Typical deploy / note |
|--------------|--------------|--------|------------------------|
| **ask-before-you-app** | ask-before-you-app | Next.js | Vercel **askbeforeyouapp** → askbeforeyouapp.com |
| **dashboard** | dashboard | Next.js | Vercel **wasatchwise** (root build outputs dashboard) |
| **pipeline-iq** | grooveleads-pro | Next.js | Vercel **groove** — had install/build fixes |
| **slctrips** | slctrips-v2 | Next.js | Vercel **slctrips** |
| **rock-salt** | the-rock-salt | Next.js | Vercel **the-rock-salt** |
| **adult-ai-academy** | adult-ai-academy | Next.js | Vercel **adult-ai-academy** |
| **daite** (frontend) | frontend | Next.js | Vercel **d-ai-te** |
| **gmc-mag** | gmc-mag | Vite | Vercel **gmc_mag** |
| **the-rings** | app (nested) | Next.js | Vercel **the-rings** |
| **munchyslots** | munchyslots | Vite | — |
| **dublin-drive-live** | dublin-drive-live | Vite | — |

**CI:** On push/PR to `main`, GitHub Actions runs `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` (continue-on-error), and **`pnpm run build`** (Turbo builds all apps). Any app that fails build can fail CI.

---

## 2. Uncommitted changes (what’s “new” to send out)

### Ask Before You App (ask-before-you-app)

- **Modified:** Ecosystem pages (foundation for all 51 states), certification page (Start module + Take Quiz), request form, webhook route, validation, data README, ecosystem index.
- **New:** State foundation (CSV-derived): `lib/ecosystem/foundation-types.ts`, `lib/ecosystem/state-foundation-data.ts`; certification certificate + quiz (actions, certificate page, quiz page, quiz-questions); app request action + migration `010_app_requests.sql`; docs (BUILD_PLAN_POST_SDPC, CHROME_EXTENSION_STATE_RESEARCH_PROMPT, STATE_PROFILES_CSV_MAPPING); data CSV `state-student-privacy-ai-profiles-table1.csv`.
- **Send out:** Commit + push → Vercel **askbeforeyouapp** (Root Directory `apps/ask-before-you-app`) will deploy. New: 51 state overviews, certification quiz + certificate, request persistence, state-foundation as baseline.

### SLC Trips (slctrips)

- **Modified:** Launch rubric, Dan chat route, Stripe webhook, layout, DanConcierge.
- **New:** Docs (DAN_SOPHISTICATED_SPEC, LAUNCH_RUBRIC_CONTROL_RUN, LAUNCH_STATUS_2026-02-03, SOCIAL_* 2026-02-04/05, WHERE_TO_LOOK_WHEN_THINGS_BREAK), data folder, GlobalDanConcierge component.
- **Send out:** Commit + push → Vercel **slctrips** deploys.

### PipelineIQ (pipeline-iq / grooveleads-pro)

- **Modified:** `package.json` (e.g. lucide-react pin).
- **New:** `SENDGRID_TO_GOOGLE_MIGRATION.md`.
- **Send out:** You’ve had issues here in another conversation. Ensure Vercel **groove** uses Root Directory `apps/pipeline-iq` and pnpm install/build from monorepo root (see DEPLOYMENT_BRIEF_2026-02-05). Commit + push after any fixes.

### Rock Salt (rock-salt)

- **New:** Docs (CRON_SECRET_PLACES, EVENTS_CALENDAR_CLAUDE_EXTENSION_PROMPTS, N8N_*, n8n-workflow-venue-to-events.json), `api/ingest-events/`, migration `20260215_venue_sources_and_external_url.sql`.
- **Send out:** Commit + push → Vercel **the-rock-salt** deploys if that project is wired.

### Dashboard

- **New:** Migration `012_social_post_metrics.sql`.
- **Send out:** Deploys with **wasatchwise** (dashboard) when root build is used. Apply migration in Supabase for the project that uses this app.

### Other

- **Civilization/capitol/realms:** README and doc tweaks; HQ_TODO, BUILDING_REGISTRY, HQ_CHANGE_REQUEST_2026-02-03.
- **Infrastructure/n8n:** .env.example, docker-compose, workflows README, N8N_ABYA_TASKS.md, SOCIAL_MEDIA_PIPELINE.md, social-metrics-webhook-ingest.json.
- **Docs:** SHARED_SERVICES, GOOGLE_CLOUD_AND_WORKSPACE_SETUP, I18N_LANGUAGE_TRANSLATION_STRATEGY.

---

## 3. Send-out checklist (the “couple of new things”)

1. **Decide what to ship**
   - **ABYA:** State foundation (51 overviews), certification quiz/certificate, request form + DB + webhook emails.
   - **Slctrips:** Dan + Stripe + social docs and status.
   - **PipelineIQ:** Only if your other conversation has fixes ready; then deploy groove with correct root and env.
   - **Rock Salt / Dashboard / n8n:** If you’re shipping those this week, include in the same push or a follow-up.

2. **Pre-push**
   - From repo root: `pnpm run build --filter=ask-before-you-app` (and optionally `--filter=slctrips-v2`, `--filter=grooveleads-pro`) to confirm the apps you care about build.
   - If CI runs full `pnpm run build`, be aware that **wasatchwise** root build can still fail on pipeline-iq env validation (see DEPLOYMENT_BRIEF_2026-02-05) unless pipeline-iq is excluded or envs are set for CI.

3. **Commit and push**
   - Stage the apps/docs you want:  
     `git add apps/ask-before-you-app apps/slctrips ...`
   - Commit with a clear message, e.g.:  
     `feat(abya): state foundation (51 overviews), certification quiz/certificate, request persistence`
   - Push to `main`:  
     `git push origin main`

4. **After push**
   - **askbeforeyouapp.com:** Vercel project **askbeforeyouapp** (Root: `apps/ask-before-you-app`) will deploy. Confirm in Vercel dashboard.
   - **Slctrips:** Vercel **slctrips** will deploy.
   - **PipelineIQ:** Only if you fixed and pushed; then check Vercel **groove** and env vars.
   - **Migrations:** Run any new SQL (e.g. ABYA `010_app_requests.sql`, dashboard `012_social_post_metrics.sql`) in the correct Supabase project if not yet applied.

---

## 4. Quick reference

- **ABYA deploy:** [DEPLOY_ASKBEFOREYOUAPP_COM.md](../apps/ask-before-you-app/docs/DEPLOY_ASKBEFOREYOUAPP_COM.md)
- **Last deployment brief:** [DEPLOYMENT_BRIEF_2026-02-05.md](reports/DEPLOYMENT_BRIEF_2026-02-05.md)
- **PipelineIQ / groove:** Same brief + SENDGRID_TO_GOOGLE_MIGRATION.md in pipeline-iq app. If build fails at *environment validation during Next.js page data collection*, use the **Groove env validation** checklist below.
- **Turbo:** Builds all apps under `apps/*` that define a `build` script in package.json

---

## 5. Groove (pipeline-iq) — env validation at build time (fixed in app)

Builds were failing at *environment validation during Next.js page data collection* even though **SUPABASE_SERVICE_ROLE_KEY** and **ORGANIZATION_ID** are set in Vercel for All Environments. The cause was **app code**, not Vercel:

- **`lib/config/env.ts`** runs strict env validation (getEnv()) when the module loads and `NODE_ENV === 'production'`.
- During **`next build`**, Next sets `NODE_ENV=production`, so the validator ran at **build time** and called `process.exit(1)` on failure (e.g. if build-time env differed or wasn’t fully available in that phase).

**Fix applied:** In `apps/pipeline-iq/lib/config/env.ts`, the “validate on module load” block now **skips** when `NEXT_PHASE === 'phase-production-build'`, so validation does not run during `next build`. It still runs at **runtime** in production, so missing vars will still be caught when the app runs.

**If you need to re-check Vercel:** Ensure **SUPABASE_SERVICE_ROLE_KEY** and **ORGANIZATION_ID** are set and enabled for **Production** (and **Preview** if you want PR builds). After the code fix, a redeploy or push should allow the build to complete.
