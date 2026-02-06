# Google Cloud & Google Workspace Setup — Claude Chrome Extension Reference

**Purpose:** Single reference so the Claude Chrome extension (or any agent working in the browser) knows exactly how WasatchWise expects Google Cloud and Google Workspace to be set up. Use this when configuring GCP projects, APIs, keys, domains, and (if applicable) Workspace.

**Repo context:** WasatchWise monorepo (`Wasatch-Wise`). Apps live under `apps/*`. Hosting: Vercel. Auth/DB: Supabase. AI: Claude, Gemini/Vertex, others.

---

## 1. Organization & project context

- **Organization (if applicable):** wasatchwise.com (ID: 810144673916).
- **Primary GCP context:** “Wasatch Wise HQ” (Google Cloud). Main product that uses Google heavily: **slctrips.com** (SLC Trips); Dan Concierge uses Gemini + Vertex AI + Google Maps APIs.
- **Folder structure (reference):** Environment-based folders mentioned in audits: 10-sandbox, 20-dev, 30-stage, 40-prod, SLCTrips, system-gsuite. When auditing or configuring, use the same project that already has Vertex AI (e.g. where Vertex AI API is enabled).

---

## 2. Google Cloud Platform (GCP) — What to set up

### 2.1 Project to use

- Use the **same GCP project** that already has Vertex AI and is used for Wasatch Wise HQ / SLC Trips.
- **Vertex AI (from code):** `chat-vertex-ai.ts` references:
  - `GOOGLE_CLOUD_PROJECT_ID` (example in comments: `cs-poc-ujrgyykgigo08lwlg6fdrrl`)  
  - `VERTEX_AI_LOCATION` (default `global`)  
  - `VERTEX_AI_EVENTS_DATASTORE_ID` (optional; for events search)

### 2.2 APIs to enable (Google Cloud Console)

Enable in **APIs & Services → Library** for the project that serves SLC Trips / Dan:

| API | Purpose |
|-----|--------|
| **Vertex AI API** | Dan Concierge, Vertex AI Search / RAG |
| **Generative Language API** (Gemini) | Dan chat via `GEMINI_API_KEY` |
| **Maps-related (same project):** | |
| Weather API | “Pack chains,” conditions for mountain routes |
| Air Quality API | Air quality for SLC/Utah |
| Places API (New) | Hours, “open now,” phone, verify “Call them” |
| Directions API | Drive times, traffic |
| (Optional) Routes API | Multi-stop itineraries |
| (Optional) Maps Grounding Lite | AI agents with fresh Maps data |

**Console:** https://console.cloud.google.com/apis/library — search by name and enable.

### 2.3 API keys and credentials

- **Gemini (Dan chat):** One API key for Gemini (Generative Language API).  
  - **Env var (slctrips):** `GEMINI_API_KEY`  
  - Used in: `apps/slctrips/src/app/api/dan/chat/route.ts`
- **Google Maps (Dan tools + images):** One key can cover Weather, Air Quality, Places (New), Directions (restrict by API in key settings if desired).  
  - **Env var (slctrips):** `GOOGLE_MAPS_API_KEY` (server-only preferred; use `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` only if key is referrer-restricted and safe for client.)  
  - Used in: same `route.ts` for `get_weather_conditions`, `get_air_quality`, `get_place_details`, `get_drive_time`; image proxy uses it for Place photos.
- **Vertex AI (optional events/RAG):** Service account or application default credentials in the same project.  
  - **Env vars:** `GOOGLE_CLOUD_PROJECT_ID`, `VERTEX_AI_LOCATION`, `VERTEX_AI_EVENTS_DATASTORE_ID`  
  - Used in: `apps/slctrips/src/app/api/dan/chat-vertex-ai.ts`

**Where to set:**  
- **Vercel:** slctrips project → Settings → Environment Variables (Production/Preview/Development as needed).  
- **Local:** `apps/slctrips/.env.local` (do not commit; use `.env.example` as template).

### 2.4 Other apps using Google

- **Rock Salt:** Uses Google Places / Maps-style keys in `apps/rock-salt` (see `apps/rock-salt/.env.example`). Can be same key with API restrictions or a separate key per app.  
- **Shared services doc:** `docs/architecture/SHARED_SERVICES.md` lists `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_CLOUD_PROJECT` for AI; `GOOGLE_MAPS_API_KEY` for Maps. Naming may differ per app (e.g. slctrips uses `GEMINI_API_KEY`).

---

## 3. Environment variables checklist (Google-related)

Use this when verifying or configuring env (Vercel, local, or n8n).

### SLC Trips (Vercel + .env.local)

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes (for Dan) | Gemini chat |
| `GOOGLE_MAPS_API_KEY` | Yes (for Dan tools) | Weather, Air Quality, Places, Directions |
| `GOOGLE_CLOUD_PROJECT_ID` | If using Vertex | Vertex AI / events datastore |
| `VERTEX_AI_LOCATION` | If using Vertex | e.g. `global` |
| `VERTEX_AI_EVENTS_DATASTORE_ID` | Optional | Vertex AI Search events |

Also needed for full app (non-Google): Supabase, Stripe, OpenWeather (optional), `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.slctrips.com`).

### Ask Before You App

No Google-specific env required for core ABYA; Supabase, Resend, etc. per `docs/guides/ENV_VARIABLES_CHECKLIST.md`.

### Rock Salt

Google keys in `apps/rock-salt/.env.example` (e.g. Maps, Places, Directions, Geocoding). Same GCP project or separate; if same, restrict key by API and optionally by referrer/IP.

### n8n

No Google-specific vars required in `infrastructure/n8n/.env.example` for core workflows. If a workflow uses Google (e.g. BigQuery, Sheets), add those credentials in n8n Credentials or in `.env` as documented for that workflow.

---

## 4. Domains and Vercel (so the extension knows where things live)

### 4.1 Domain → app mapping

| Domain | Vercel project (expected) | App path | Notes |
|--------|---------------------------|----------|--------|
| **askbeforeyouapp.com**, **www.askbeforeyouapp.com** | askbeforeyouapp | `apps/ask-before-you-app` | Root Directory must be `apps/ask-before-you-app` |
| **slctrips.com**, **www.slctrips.com** | slctrips | `apps/slctrips` | Dan, TripKits, Stripe webhooks |
| **www.wasatchwise.com** | wasatchwise | dashboard / main | HQ, dashboard, command center |
| **www.adultaiacademy.com** | wasatchwise | dashboard (rewrite to /adult-ai-academy) | AAA marketing; Content Factory is separate project |
| **therocksalt.com** (or Rock Salt prod URL) | rock-salt | `apps/rock-salt` | Events ingest: `POST /api/ingest-events`; needs `CRON_SECRET` |

### 4.2 Vercel settings to verify (per project)

- **Root Directory:** Must match app path (e.g. `apps/ask-before-you-app` for ABYA; no leading/trailing spaces).
- **Build / Install:** For monorepo, use repo/app instructions (e.g. ABYA: install from root `pnpm install --frozen-lockfile`, build `pnpm run build --filter=ask-before-you-app`).
- **Domains:** Add both apex and www where desired; DNS (e.g. Cloudflare) CNAME to Vercel as shown in dashboard.

### 4.3 References

- ABYA deploy: `apps/ask-before-you-app/docs/DEPLOY_ASKBEFOREYOUAPP_COM.md`
- Domain/AAA: `docs/guides/DOMAIN_AAA_SETUP.md`

---

## 5. Google Workspace (if applicable)

The codebase does **not** currently use Google Workspace (Gmail, Drive, Calendar) for auth or core app flows. Auth is Supabase; email is Resend/SendGrid/ConvertKit.

If you introduce **Google Workspace** (e.g. Gmail API, Calendar, Drive, or “Sign in with Google” for a future app):

1. **Domain verification:** In Google Admin (admin.google.com), verify the domains you use (e.g. wasatchwise.com, slctrips.com, askbeforeyouapp.com) so they can be used for OAuth consent or API access.
2. **OAuth 2.0 client:** Create a client in the same GCP project (APIs & Services → Credentials → Create OAuth 2.0 Client ID). Use Web application type; set authorized redirect URIs to your app origins (e.g. `https://www.slctrips.com/api/auth/callback`, Vercel preview URLs if needed).
3. **Scopes:** Request only the scopes needed (e.g. Gmail read-only, Calendar read, Drive read).
4. **Env:** Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel (or server env) and never expose the secret to the client.

If the extension is asked to “set up Google Workspace,” use the above as the checklist and align with the GCP project and domains in §2 and §4.

---

## 6. Quick links for the extension

- **GCP Console:** https://console.cloud.google.com  
- **APIs & Services (enable APIs):** https://console.cloud.google.com/apis/library  
- **Credentials (keys, OAuth):** https://console.cloud.google.com/apis/credentials  
- **Vertex AI:** https://console.cloud.google.com/vertex-ai  
- **IAM & Admin:** https://console.cloud.google.com/iam-admin  
- **Billing:** https://console.cloud.google.com/billing  
- **Vercel Dashboard:** https://vercel.com/dashboard  

---

## 7. What the Chrome extension should do

1. **Audit / align GCP:** Use `docs/guides/CLAUDE_GC_VERTEX_AI_INSTRUCTIONS.md` for full audit steps (projects, billing, IAM, Vertex AI, APIs, revenue opportunities).  
2. **Configure for this stack:** Ensure the project used by SLC Trips has the APIs in §2.2 enabled and that keys are created and restricted appropriately.  
3. **Verify env:** Confirm that in Vercel (slctrips project) and in any local/env docs the variables in §3 are present (values are secret; extension can check “set” vs “missing” if visible in UI).  
4. **Verify domains:** In Vercel, confirm each domain in §4.1 is attached to the correct project and that Root Directory matches the app path.  
5. **Workspace (if ever needed):** Follow §5 for domain verification and OAuth client setup in the same GCP project.

---

## 8. Related docs in repo

| Topic | Path |
|-------|------|
| Dan (Gemini + Vertex + Maps) | `apps/slctrips/docs/DAN_SOPHISTICATED_SPEC.md` |
| GCP/Vertex audit (extension) | `docs/guides/CLAUDE_GC_VERTEX_AI_INSTRUCTIONS.md` |
| Shared services (AI, Maps, etc.) | `docs/architecture/SHARED_SERVICES.md` |
| Env checklist (Vercel) | `docs/guides/ENV_VARIABLES_CHECKLIST.md` |
| ABYA deploy | `apps/ask-before-you-app/docs/DEPLOY_ASKBEFOREYOUAPP_COM.md` |
| Domain/AAA | `docs/guides/DOMAIN_AAA_SETUP.md` |
| Wiring (n8n, Stripe, domains) | `docs/guides/CLAUDE_CHROME_EXTENSION_WIRING_PROMPT.md` |
| Building/venture list | `civilization/realms/wasatchville/docs/BUILDING_REGISTRY.md` |

---

*Last updated: February 4, 2026*
