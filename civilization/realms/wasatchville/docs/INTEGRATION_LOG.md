# INTEGRATION_LOG: WasatchVille

**Realm:** WasatchVille  
**Purpose:** Data connections and automation that feed the city (city_metrics, agents, councils).  
**Last Updated:** 2025-02-01

---

## Overview

WasatchVille is the **reference implementation** for Business Realms. Its interface (dashboard command center, buildings, agents, councils) is where you conduct business through agentic work. Integrations and automation live in two places:

1. **Supabase** – Primary data store: departments, agents, councils, **city_metrics**, conversations. The dashboard and agent chat API read/write here.
2. **n8n** – Agentic backbone: pipelines that push data into **city_metrics**, scheduled tasks, webhooks, and human-in-the-loop flows. n8n does not replace the dashboard; it feeds it and extends it.

All integrations should be **realm-aware**: use building IDs and metric names from this realm’s BUILDING_REGISTRY and REALM_SPEC so patterns can be reused for future client realms.

**Sector view:** [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) — Media / advertising sector: TikTok as launcher for SLC Trips (B002), affiliates, partnerships, and how to maximize TikTok for the Amusement Park.

---

## n8n

| Item | Value |
|------|--------|
| **Role** | Data pipelines, task automation, human-in-the-loop |
| **Location** | `infrastructure/n8n/` (Docker Compose + README) |
| **Local UI** | http://localhost:5678 after `docker compose up -d` |
| **Writes to** | Supabase `city_metrics` (and optionally other tables) |

**Conventions for WasatchVille workflows:**

- **metric_key:** Unique key per gauge (e.g. `daily_revenue`, `slctrips_tiktok_views`, `academy_subscribers`). Use prefix for building-specific metrics.
- **value / unit / category:** Match the `city_metrics` schema – this is a KPI key-value store, not a time-series log.
- **Credentials:** Supabase service role in n8n (or env) for inserts; Stripe/TikTok/Spotify/ConvertKit as needed per workflow.

**Note:** `city_metrics` is for dashboard gauges (current state). For event logs (each transaction, each post), we'll add a `city_events` table when needed.

See **infrastructure/n8n/README.md** for quick start, city_metrics contract, and building ID table.

---

## Planned / Documented Data Sources

| Source | Data Type | Refresh | Metric Keys | Status |
|--------|-----------|---------|-------------|--------|
| Stripe | Revenue, transactions | Webhook / scheduled | `daily_revenue`, `treasury_funds` | Planned – n8n → city_metrics |
| Stripe | Per-building revenue | Webhook | `slctrips_revenue`, `abya_revenue`, `rocksalt_revenue`, `automation_mrr`, `pipelineiq_revenue` | Implemented – metadata branching |
| Supabase | Destinations, users | Real-time / sync | `active_residents` | App direct; n8n for aggregates |
| TikTok API | Views, engagement | Hourly | `slctrips_tiktok_views` | Planned – n8n |
| Spotify API | Streams, listeners | Daily | `rocksalt_spotify_streams` | Planned – n8n |
| ConvertKit | Subscribers, opens | Hourly | `academy_subscribers` | Planned – n8n |
| Manual | Milestones, notes | On-demand | Various | Via dashboard / agents |
| Automation Studio | Clients, MRR | Manual / Stripe | `automation_clients`, `automation_mrr` | Via Stripe metadata (B010) |
| AWIN / Affiliates | Per-building affiliate revenue | Manual / reconciliation | `slctrips_affiliate_revenue`, `rocksalt_affiliate_revenue`, etc. | Manual – AWIN reports by campaign |

---

## Affiliate Infrastructure Expansion (City-Wide Initiative)

**Current state:** Affiliates live in SLC Trips only (`apps/slctrips/src/lib/affiliates.ts`); campaign names are `slctrips-*`.

**Goal:** Extract affiliate system so any building can use it with configurable `campaignPrefix` / `building_id`.

**Buildings that can plug in:**

| Building | Campaign Prefix | Use Case |
|----------|-----------------|----------|
| SLC Trips (B002) | `slctrips-*` | Hotels, gear, tours |
| Rock Salt (B003) | `rocksalt-*` | Concert tickets, merch |
| Adult AI Academy (B004) | `academy-*` | Course tools, books |
| Fanon Movies (B011) | `fanon-*` | Streaming, DVDs, merch |
| Pipeline IQ (B009) | `pipelineiq-*` | Construction tools |

**Extraction path:**
1. Create `packages/wasatchwise-affiliates` or shared `lib/affiliates` with configurable `campaignPrefix`.
2. Per-building attribution: AWIN/Viator report by campaign; map to `{building}_affiliate_revenue` in city_metrics via n8n or manual reconciliation.
3. Each building imports the shared affiliate link generators with its prefix.

**In-depth review (2025-01-31):** [AFFILIATE_REVIEW_2025-01-31.md](AFFILIATE_REVIEW_2025-01-31.md) and [AFFILIATE_REVIEW_2025-01-31.json](AFFILIATE_REVIEW_2025-01-31.json) — current merchant assessment, gaps by building, new merchant recommendations, Rock Salt affiliate types, and config snippets for REI, Sweetwater, Coursera, ExpressVPN, Canva, B&H, Home Depot, StubHub. Top actions: fix Amazon attribution, launch Rock Salt affiliates, add 6 high-priority merchants.

**Amazon Associates:** [AMAZON_ASSOCIATES.md](AMAZON_ASSOCIATES.md) — account and building tags (`wasatchwise20-20`, `wasatchwise20-slc20`, etc.), 180-day rule, disclosure, link generation, and reporting to city_metrics via `upsert_revenue_metric`.

---

## n8n Workflows

| Workflow | Purpose | Metric Keys | Status |
|----------|---------|-------------|--------|
| `stripe-revenue-webhook` | Stripe payment_intent.succeeded → increment daily_revenue + per-building metrics | `daily_revenue`, `slctrips_revenue`, `abya_revenue`, etc. | Implemented |
| `test-city-metrics-insert` | Manual test insert | `test_workflow_insert` | Template available |
| `tiktok-views-sync` | SLC Trips TikTok views | `slctrips_tiktok_views` | Planned |
| `convertkit-to-city-metrics` | Academy subscribers | `academy_subscribers` | Planned |

---

## n8n Automation Status (Implemented vs Planned)

### Implemented (in repository)

- **Stripe Revenue Webhook** (`infrastructure/n8n/workflows/stripe-revenue-webhook.json`)
  - Events: `payment_intent.succeeded`, `charge.succeeded`
  - Maps `building_id` metadata → city_metrics keys
  - Updates: `daily_revenue`, `slctrips_revenue`, `abya_revenue`, `rocksalt_revenue`, `automation_mrr`, `pipelineiq_revenue`
  - **Status:** JSON in repo; **production verification needed** (Stripe webhook URL, secret in n8n credentials)
- **Test Workflow** (`infrastructure/n8n/workflows/test-city-metrics-insert.json`)
  - Manual trigger → one row into `city_metrics` (`test_workflow_insert`)
  - Use to verify Supabase connection from n8n

### Planned (not yet in repo)

- **TikTok Views Sync** (SLC Trips) — TikTok API → `slctrips_tiktok_views` in city_metrics
- **Spotify Plays** (Rock Salt) — Spotify API → Rock Salt metrics
- **ConvertKit Subscribers** (Adult AI Academy) — ConvertKit API → `academy_subscribers` in city_metrics
- **Universal Lead Router** — Webhooks: `wasatchwise-lead`, `adult-ai-academy-lead`, `ask-before-lead`; route leads to appropriate systems

### Verification checklist

- [ ] n8n Docker container running (`docker compose up -d` in `infrastructure/n8n`)
- [ ] Stripe webhook endpoint configured (Stripe Dashboard → Developers → Webhooks)
- [ ] Stripe webhook secret stored in n8n Credentials (not in code/env)
- [ ] Test payment → n8n execution → city_metrics update confirmed
- [ ] Supabase connection tested (run `test-city-metrics-insert` workflow)

**Webhook URL (Stripe):** n8n path is `/webhook/stripe-webhook` (webhook id `stripe-revenue`). Full URL e.g. `https://your-n8n-host/webhook/stripe-webhook`. For local dev, use a tunnel (ngrok, Cloudflare Tunnel).

---

## Webhooks (inbound)

Future: lead capture, form submissions, and other events can hit n8n webhooks, then:

- Enrich and route to Supabase or other systems.
- Update **city_metrics** (e.g. lead count per building).
- Trigger approval flows (human-in-the-loop).

Document specific webhook URLs and payloads here as they are added.

---

## Wiring report follow-up (2025-02-01)

From Chrome Extension wiring check:

- **Dashboard 404 at wasatchwise.com/dashboard/command-center:** Command center lives in `apps/dashboard` at route `/dashboard/command-center`. The **wasatchwise** Vercel project currently deploys the main marketing site (ask-before-you-app or root app), not the dashboard app. To expose the command center: (1) Deploy the dashboard app (e.g. as a separate Vercel project or subdomain like `dashboard.wasatchwise.com`), or (2) Configure the wasatchwise project to build/serve the dashboard app and route `/dashboard/*` to it. No code change required; this is a deployment/domain decision.
- **adultaiacademy.com serving wrong content:** In Vercel, assign **www.adultaiacademy.com** (and adultaiacademy.com) to the **adult-ai-academy** project, not the wasatchwise project. Vercel Dashboard → adult-ai-academy project → Settings → Domains → Add domain.
- **n8n Stripe webhook – production:** Stripe cannot call localhost. For live Stripe events: (1) Deploy n8n (e.g. Cloud Run, Railway, Render) and set Stripe webhook URL to `https://<your-n8n-host>/webhook/stripe-webhook`, or (2) Use a tunnel (ngrok, Cloudflare Tunnel) to localhost and use the tunnel URL in Stripe. Store the Stripe webhook signing secret in n8n credentials.

---

## Changelog

| Date | Change |
|------|--------|
| 2025-02-01 | Wiring report follow-up: dashboard 404, adultaiacademy.com domain, n8n Stripe production note. |
| 2025-02-01 | Added n8n Automation Status (Implemented vs Planned), verification checklist, Stripe webhook URL note. |
| 2025-01-31 | Linked affiliate in-depth review (AFFILIATE_REVIEW_2025-01-31.md / .json); top actions and config additions. |
| 2025-01-31 | Added per-building Stripe revenue metrics, affiliate infrastructure expansion, n8n workflows table. |
| 2025-01-31 | Updated to match actual city_metrics schema (metric_key KPI store, not building_id log). |
| 2025-01-31 | Added INTEGRATION_LOG; n8n documented as agentic backbone; link to infrastructure/n8n. |
