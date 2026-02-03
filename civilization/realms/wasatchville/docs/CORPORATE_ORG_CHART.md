# Corporate Org Chart & Wiring – WasatchVille

**Realm:** WasatchVille  
**Purpose:** Single map of the **entire corporate org chart**: who does what, who has access to what, when things are done. Details live in the linked docs; this is the wiring diagram.  
**Last updated:** 2026-02-01

---

## What we’re building

We’re **building and wiring the whole corporate org**: structure (buildings, agents, sectors), responsibilities (who does what), access (who has access to what), and cadence (when things are done). Everything below links to the docs where each piece is defined and maintained.

---

## 1. Structure (org chart)

| Layer | What it is | Where it’s defined |
|-------|------------|--------------------|
| **Buildings** | Ventures (B001 Capitol … B011 Cinema): SLC Trips, Rock Salt, Adult AI Academy, Pipeline IQ, etc. | [BUILDING_REGISTRY.md](BUILDING_REGISTRY.md) |
| **Agents** | Roles: Mayor (A001), CFO (A002), Park Director (A003), Director of Awin Monetization (A011), etc. | [AGENT_ROSTER.md](AGENT_ROSTER.md) |
| **Sectors** | Cross-building areas: Awin Monetization, Media & Advertising, Affiliate Umbrella, Finance | [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md), [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md), [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md), [AFFILIATE_UMBRELLA_ORG.md](AFFILIATE_UMBRELLA_ORG.md) |
| **Reporting** | Who reports to whom (e.g. Director A011 → Mayor; Director ↔ Park Director for slctrips) | Per-sector: e.g. [AWIN_SECTOR_ORG.md §1](AWIN_SECTOR_ORG.md) |

**One-line org:** Mayor (A001) at top; building leads (Park Director, Concert Manager, Dean, etc.) and sector leads (Director of Awin Monetization A011) report/collaborate with Mayor; CFO and Bank feed finance; agents have defined data access and responsibilities.

---

## 2. Who does what (responsibilities)

| Role / system | Responsibility | Where it’s defined |
|---------------|----------------|-------------------|
| **Mayor (A001)** | Strategy, prioritization, cross-venture focus | [AGENT_ROSTER.md](AGENT_ROSTER.md) |
| **CFO (A002)** | Revenue attribution, city_metrics, finance view | [AGENT_ROSTER.md](AGENT_ROSTER.md) |
| **Park Director (A003)** | SLC Trips content, TikTok, TripKits, placement | [AGENT_ROSTER.md](AGENT_ROSTER.md), [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) |
| **Director of Awin Monetization (A011)** | Awin/Booking.com programmes, link audits, affiliate strategy, report NEEDS CURSOR | [AGENT_ROSTER.md](AGENT_ROSTER.md), [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) |
| **Cursor (codebase)** | Implement affiliates.ts, city_metrics, n8n workflows, fix NEEDS CURSOR items | [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md), [LOCKIN.md](../../../infrastructure/n8n/LOCKIN.md) |
| **n8n** | Run workflows: Stripe → city_metrics, TikTok views, ConvertKit, lead router, etc. | [INTEGRATION_LOG.md](INTEGRATION_LOG.md), [N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md) |
| **User (John)** | Deploy, Awin dashboard actions, final decisions, credentials | Per-sector access tables |

Other agents (Concert Manager, Dean, Superintendent, etc.): see [AGENT_ROSTER.md](AGENT_ROSTER.md). Sector-specific procedures (e.g. “Add new Awin merchant”, “Request code change”): see sector org docs (e.g. [AWIN_SECTOR_ORG.md §4](AWIN_SECTOR_ORG.md)).

---

## 3. Who has access to what (access controls)

| Asset / system | Who has access | Where it’s defined |
|----------------|----------------|--------------------|
| **Awin dashboard** | User (John); Director (Chrome extension) when user’s session is open | [AWIN_SECTOR_ORG.md §5](AWIN_SECTOR_ORG.md) |
| **Supabase (WasatchWise)** | Apps + n8n (service_role); dashboard (authenticated read where RLS applies) | [AWIN_SECTOR_ORG.md §5](AWIN_SECTOR_ORG.md), [INTEGRATION_LOG.md](INTEGRATION_LOG.md) |
| **n8n** | User (local Docker or deployed); workflows use Supabase env / credentials | [LOCKIN.md](../../../infrastructure/n8n/LOCKIN.md) |
| **Repo (code + docs)** | Cursor + user; secrets in env only, not in repo | [AWIN_SECTOR_ORG.md §5](AWIN_SECTOR_ORG.md) |
| **Vercel / deploys** | User (Vercel dashboard); env vars per project | [AWIN_SECTOR_ORG.md §5](AWIN_SECTOR_ORG.md) |
| **city_metrics** | Read: dashboard, agents. Write: n8n (RPCs), dashboard (if allowed), manual | [INTEGRATION_LOG.md](INTEGRATION_LOG.md) |
| **Stripe** | User (Stripe dashboard); n8n (webhook receiver); apps (Stripe API with keys in env) | [INTEGRATION_LOG.md](INTEGRATION_LOG.md) |

Per-sector access (e.g. Awin credentials, who can accept invitations): see sector org doc (e.g. [AWIN_SECTOR_ORG.md §5](AWIN_SECTOR_ORG.md)). Broader “data access” per agent (scope, permissions): see [AGENT_ROSTER.md](AGENT_ROSTER.md) per agent.

---

## 4. When things are done (cadence & triggers)

| What | When / trigger | Where it’s defined |
|------|----------------|--------------------|
| **Stripe → city_metrics** | On payment (webhook) | [INTEGRATION_LOG.md](INTEGRATION_LOG.md), [N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md) |
| **TikTok views → city_metrics** | Schedule (e.g. daily); or manual placeholder | [LOCKIN.md](LOCKIN.md), workflow tiktok-views-sync |
| **ConvertKit → academy_subscribers** | Schedule (e.g. hourly) when workflow exists | [N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md) |
| **Director (Awin) platform audit** | Monthly, or after major slctrips deploy | [AWIN_SECTOR_ORG.md §6b](AWIN_SECTOR_ORG.md) |
| **Link verification (Awin)** | Per deploy or weekly during link changes | [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) |
| **Review cadence (Awin sector)** | Per AWIN_SECTOR_ORG §6b (KPIs, escalation) | [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) |
| **Content cadence (SLC Trips)** | Park Director / Content Council; align posting frequency and themes | [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) |
| **Lead router** | When webhook receives lead (wasatchwise-lead, academy-lead, etc.) | [N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md) |

Other schedules (Spotify, Awin report import, backups, digests): see [N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md). Ordinance-level retention and review: [ORD-0002](../../../city-hall/ordinances/ORD-0002-record-retention-and-archives.md).

---

## 5. How the pieces connect

```
                    Mayor (A001)
                         |
    +--------------------+--------------------+
    |                    |                    |
  CFO (A002)    Building leads (A003…)   Sector leads (A011…)
    |                    |                    |
    v                    v                    v
city_metrics      Buildings (B002…)     Awin / Media / etc.
    ^                    |                    |
    |                    v                    v
  n8n  <---------- INTEGRATION_LOG, workflows, triggers
  Stripe, TikTok, ConvertKit, webhooks
```

- **Structure** = BUILDING_REGISTRY + AGENT_ROSTER + sector docs.  
- **Who does what** = AGENT_ROSTER (responsibilities) + AWIN_SECTOR_ORG (procedures) + LOCKIN (n8n).  
- **Who has access** = AWIN_SECTOR_ORG §5 + INTEGRATION_LOG + env/credentials.  
- **When** = N8N_AUTOMATION_BACKLOG (workflow triggers) + AWIN_SECTOR_ORG §6b (review cadence) + MEDIA_AND_ADVERTISING_SECTOR (content cadence).

---

## 6. Index of linked docs (wiring)

| Doc | Covers |
|-----|--------|
| [REALM_SPEC.md](REALM_SPEC.md) | Ventures, data integrations, build vs buy principle |
| [BUILDING_REGISTRY.md](BUILDING_REGISTRY.md) | Buildings (B001–B011), metrics, data sources |
| [AGENT_ROSTER.md](AGENT_ROSTER.md) | Agents (A001–A011), roles, responsibilities, data access |
| [AWIN_MONETIZATION_SECTOR.md](AWIN_MONETIZATION_SECTOR.md) | Awin sector mission, current state, phases |
| [AWIN_SECTOR_ORG.md](AWIN_SECTOR_ORG.md) | Awin org chart, staff, policies, procedures, access, KPIs, cadence, escalation |
| [MEDIA_AND_ADVERTISING_SECTOR.md](MEDIA_AND_ADVERTISING_SECTOR.md) | TikTok, SLC Trips, content, distribution, monetization |
| [AFFILIATE_UMBRELLA_ORG.md](AFFILIATE_UMBRELLA_ORG.md) | Amazon, Awin, TikTok umbrella; who owns what |
| [INTEGRATION_LOG.md](INTEGRATION_LOG.md) | n8n, Stripe, city_metrics, data sources, workflows |
| [infrastructure/n8n/LOCKIN.md](../../../infrastructure/n8n/LOCKIN.md) | n8n verification, production, templates |
| [infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md](../../../infrastructure/n8n/N8N_AUTOMATION_BACKLOG.md) | Exhaustive n8n list; trim and prioritize |
| [BUILD_VS_BUY.md](BUILD_VS_BUY.md) | Prefer buy/adopt; build only when differentiator |
| [city-hall/ordinances/](../../../city-hall/ordinances/) | Privacy, record retention (ORD-0001, ORD-0002) |

When you add a new building, agent, sector, or integration: update the right doc above and, if it affects “who does what” or “who has access” or “when,” add a line to this org chart so the map stays one place.

---

## Holding pattern (as of 2026-02-01)

**Build vs buy:** Default = buy/adopt first; build only when nothing fits or it's a differentiator. n8n: adopt templates, adapt last node to city_metrics.

**TikTok Views Sync:** P0 done (placeholder end-to-end). P1 when ready: search n8n TikTok templates first → adopt/adapt to `set_metric_value` RPC → keep custom minimal. Holding until TikTok API credentials or a template source is available.

**n8n backlog:** P0 done (Stripe, Amazon, TikTok placeholder, Test). P1 next: ConvertKit → academy_subscribers, TikTok API. P2: Lead Router, Spotify. P3: Awin → city_metrics when API/export exists. No action required until you have credentials or choose the next P1/P2 item.
