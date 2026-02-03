# n8n – Agentic Backbone for WasatchVille & Business Realms

**WasatchVille** is your interface to run all business through agentic work: departments, agents, and councils live in the dashboard; **n8n** is the automation layer that feeds data into the city and runs tasks (Stripe, TikTok, approvals, etc.). This same pattern will power **Business Realms** for future clients.

**Lock-in playbook:** **[LOCKIN.md](LOCKIN.md)** — step-by-step verification (local + production), current workflows, and roadmap.

**What n8n supports:** **[N8N_SUPPORTED.md](N8N_SUPPORTED.md)** — triggers, integrations, city_metrics contract, and quick decision rule.

## Quick start (local, Docker)

1. **Copy env and set Postgres + optional Supabase:**

   ```bash
   cd infrastructure/n8n
   cp .env.example .env
   # Edit .env: set POSTGRES_PASSWORD, and SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY if workflows will write to city_metrics
   ```

2. **Start n8n:**

   ```bash
   docker compose up -d
   ```

3. **Open n8n:** http://localhost:5678  
   Create your first workflow; credentials (Supabase, Stripe, etc.) can be stored in n8n or passed via env.

4. **Stop:**

   ```bash
   docker compose down
   ```

## Architecture: one central Supabase

**One hub:** The WasatchWise dashboard uses a single Supabase project. All your businesses (SLC Trips, Pipeline IQ, Adult AI Academy, etc.) feed into the **same** `city_metrics` table that the dashboard reads. n8n writes to that central Supabase regardless of which business the data comes from.

So you need exactly one Supabase credential for n8n:

- **SUPABASE_URL** – The WasatchWise project URL (the one your dashboard uses), e.g. `https://xxxxx.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY** – Same project (Supabase → Settings → API → service_role)

Put these in **`.env`** so every workflow that writes to `city_metrics` uses the same hub. Other credentials (Stripe, TikTok, Spotify, etc.) are per-service and go in n8n’s Credentials UI as you build those workflows.

## Credentials: where to store them

| Credential | Where | Why |
|------------|--------|-----|
| SUPABASE_URL | `.env` | Every workflow writes to the same city_metrics (hub). |
| SUPABASE_SERVICE_ROLE_KEY | `.env` | Same. |
| Stripe API key | `.env` or n8n Credentials UI | One Stripe account for all; your choice. |
| TikTok (SLC Trips) | n8n Credentials UI | Specific to one building. |
| Spotify (Rock Salt) | n8n Credentials UI | Specific to one building. |
| 11Labs, HeyGen, ConvertKit | n8n Credentials UI | Per-service, per workflow. |

**Summary:** One cohesive set for Supabase (the hub) in `.env`; per-service credentials for everything else in n8n’s Credentials UI.

## Workflows: export and version control

To avoid Docker (or n8n Cloud) being the only source of truth:

- **Export** each workflow from n8n (⋯ → Download/Export) and save as JSON in **`workflows/`**.
- Use descriptive kebab-case names (e.g. `stripe-to-city-metrics.json`, `tiktok-views-sync.json`).
- **Import** from those files when you reinstall n8n or move to another host; reconnect credentials in the UI.

See **`workflows/README.md`** for the full export/import pattern and naming rules. That way workflows are version-controlled, recoverable, and serve as Business Realms templates.

## Docker disk usage

Docker can accumulate images and volumes. To stay on top of it:

- **Check usage:** `docker system df`
- **Clean unused images/containers/networks:** `docker system prune -a` (does not remove named volumes by default)
- **Our volumes:** This setup uses `n8n_postgres_data` and `n8n_data`. If you remove them (e.g. `docker compose down -v`), you lose n8n’s DB and workflow storage—but you can re-import from `workflows/` and start fresh.

Keeping workflow JSON in `workflows/` means you can safely prune or reset Docker without losing your automation logic.

## What n8n does here

- **Data pipelines** – Stripe, TikTok, Spotify, ConvertKit, Supabase, etc. → **city_metrics** so buildings and agents see live data.
- **Task automation** – Scheduled or webhook-triggered jobs (e.g. daily digest, lead routing, content pipelines).
- **Human-in-the-loop** – Approval flows (e.g. Telegram/Slack/email) that pause workflows until you approve; results can write back to Supabase or trigger other workflows.
- **Agentic glue** – Connect external events to “department” behavior: e.g. new Stripe payment → update vault_balance; new subscriber → update enrollees. The dashboard agents read from **city_metrics** and conversation history.

Design workflows so they are **realm-aware**: use consistent `metric_key` naming (e.g. `slctrips_content_posts`, `pipelineiq_revenue`) so the same patterns can be reused in future Business Realms.

## Writing to WasatchVille: city_metrics

The dashboard reads from **city_metrics** – a key-value KPI store for dashboard gauges (see `apps/dashboard/lib/supabase/command-control-schema.sql`).

| Column            | Type           | Notes |
|-------------------|----------------|--------|
| metric_key        | VARCHAR(100)   | **PRIMARY KEY** – unique key like `daily_revenue`, `active_residents` |
| value             | NUMERIC(15,2)  | Current value |
| previous_value    | NUMERIC(15,2)  | For trend calculation |
| trend             | VARCHAR(20)    | `rising`, `falling`, `stable`, `volatile` |
| unit              | VARCHAR(50)    | `USD`, `count`, `percentage`, etc. |
| category          | VARCHAR(50)    | `financial`, `technical`, `engagement` |
| display_name      | VARCHAR(255)   | Human-readable label for dashboard |
| critical_threshold| NUMERIC(15,2)  | Alert if crossed |
| last_updated      | TIMESTAMPTZ    | Auto-set |

**Example (Supabase node in n8n):**
UPSERT into `city_metrics` with `metric_key: slctrips_content_posts`, `value: 42`, `unit: count`, `category: engagement`, `display_name: SLC Trips Posts`. The dashboard will show the updated gauge.

Use the **Supabase** node with your project's **service role** key (from `.env`) so n8n can insert/update.

### Event logs vs. KPI gauges

`city_metrics` is for **dashboard gauges** (current state). For **event logs** (each Stripe payment, each content post), consider:
- A separate `city_events` table with timestamps and building_id
- Or increment counters in `city_metrics` and store details elsewhere

For now, workflows can update `city_metrics` gauges; we'll add an events table when we need historical logs.

## Building IDs (WasatchVille)

| building_id | Building        | Venture           |
|-------------|-----------------|-------------------|
| B001       | Capitol         | Wasatch Wise HQ   |
| B002       | Amusement Park  | SLC Trips         |
| B003       | Concert Hall    | Rock Salt         |
| B004       | Community College | Adult AI Academy |
| B005       | City Park       | DAiTE             |
| B006       | Board of Education | Ask Before You App |
| B007       | Bank            | Financial Ops     |
| B008       | Library         | NotebookLM Hub    |

## Stripe webhook – production

**Stripe cannot reach localhost.** For Stripe to send events to n8n you must either:

1. **Deploy n8n** (e.g. Cloud Run, Railway, Render) and in Stripe Dashboard → Developers → Webhooks add endpoint `https://<your-n8n-host>/webhook/stripe-webhook` with events `payment_intent.succeeded` and `charge.succeeded`, then store the signing secret (whsec_…) in n8n credentials; or  
2. **Use a tunnel** (ngrok, Cloudflare Tunnel) to expose localhost and use the tunnel URL in Stripe (good for testing only).

---

## Deploying beyond local (e.g. Cloud Run)

- Use the same image `docker.n8n.io/n8nio/n8n` and set `N8N_HOST` / `N8N_PROTOCOL` (e.g. `https`) and secure auth (e.g. `N8N_BASIC_AUTH_ACTIVE=true` or OIDC).
- Attach a Postgres instance (Cloud SQL or managed Postgres) and set the `DB_*` env vars.
- Store secrets in Secret Manager and inject into the container; keep Supabase service role key out of version control.

## Learning for Business Realms

As you build workflows and refine the dashboard:

- **Document patterns** – Which workflows map to which buildings/agents; how you use councils vs single agents.
- **Keep realm config in one place** – Building IDs, metric names, and sources live in realm docs (e.g. WasatchVille’s BUILDING_REGISTRY, REALM_SPEC) and in the seed/migrations; n8n workflows should reference these, not hardcode ad hoc IDs.
- **Reusability** – A “Stripe → city_metrics” or “ConvertKit → city_metrics” workflow is a template; for a new realm you swap building_id and metric names from that realm’s registry.

This repo is the reference implementation: WasatchVille is the first “realm”; the interface and n8n patterns we establish here become the blueprint for Business Realms.
