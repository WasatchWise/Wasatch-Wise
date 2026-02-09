# n8n Automation Architecture & Pipeline IQ Audit

**Date:** February 9, 2026  
**Purpose:** Map what’s configured vs what needs building for solo execution; lock in Pipeline IQ as Strategic Asset and n8n as the solo execution backbone.  
**Cross-reference:** Corporate Strategic Plan 2026, Governance (CORPORATE_MISSION_POLICIES_PROCEDURES_ACTS.md), infrastructure/n8n/

---

## Strategic decisions (for plan update)

1. **Pipeline IQ = Strategic Asset (Utility Platform)**  
   Not “fix or sunset.” Pipeline IQ is retained and expanded as a **utility platform** for lead and market intelligence. Current Construction Wire scrapers are fixed for existing verticals; net-new K-12 district intelligence sources are added per the expansion vision below.

2. **Solo execution model powered by n8n**  
   No hiring until **$250K+ revenue**. All distribution, lead capture, Pipeline IQ → CRM, and analytics digest run through n8n (and existing apps). n8n is the automation backbone for solo execution.

---

## 1. Current n8n instance status

### 1.1 Is n8n already deployed?

| Question | Answer |
|----------|--------|
| **Deployed?** | **Local only.** Docker Compose in `infrastructure/n8n/`; runs at **http://localhost:5678**. |
| **Self-hosted (Vercel/Railway) or n8n Cloud?** | **Neither.** No production deployment is configured in repo. README describes “Deploying beyond local (e.g. Cloud Run)” as a future step. |
| **Production URL** | **None.** Webhooks from Vercel (ABYA, WasatchWise), Stripe, or external services cannot reach localhost. |

**Implication:** For Week 1–4 automations to work with live apps and Stripe, n8n must be deployed to a public host (e.g. Railway, Render, n8n Cloud, or Cloud Run) and the base URL documented. Until then, workflows can be built and tested locally; production triggers (webhooks, cron) will not fire.

### 1.2 What workflows currently exist?

All of these are **in repo** (exported JSON or documented). “Status” = whether they are imported, configured, and runnable in your n8n instance.

| Workflow | File | Purpose | Status |
|----------|------|---------|--------|
| Social metrics webhook ingest | `workflows/social-metrics-webhook-ingest.json` | POST snapshot → parse → insert `social_post_metrics` (SLC Trips) | In repo; needs Supabase creds + **deployed n8n** for webhook URL |
| Stripe revenue → city_metrics | `workflows/stripe-revenue-webhook.json` | Stripe payment events → dashboard KPIs | In repo; needs Stripe webhook secret + **deployed n8n** |
| Test city_metrics insert | `workflows/test-city-metrics-insert.json` | Manual trigger → one row in `city_metrics` | In repo; for testing Supabase connection |
| TikTok views sync | `workflows/tiktok-views-sync.json` | Placeholder (set 0); replace with TikTok API when ready | In repo; placeholder |
| Utah conditions monitor | `workflows/utah-conditions-monitor-v2.json` | Every 6h → weather + AQ → content angles → `weather_alerts` | In repo; Content Factory #1 |
| Amazon commission → city_metrics | `workflows/amazon-commission-to-city-metrics.json` | Manual/scheduled amount → slctrips_amazon_revenue | In repo |

**Planned but not yet built (no JSON):**

- **Universal Lead Router** (N8N_ABYA_TASKS.md): Webhook → route by `source` (contact_form, quiz_audit, abya_app_request) → Supabase/CRM + optional notify. **Priority for Week 1–4.**
- **Content distribution** (blog → social → email): Not implemented. **Priority for Week 1–4.**
- **Pipeline IQ → CRM integration**: No n8n workflow yet; Pipeline IQ today writes to its own Supabase. **Priority for Week 1–4.**
- **Weekly analytics digest** (GA4 → Monday briefing): Not implemented. **Priority for Week 1–4.**

### 1.3 What credentials are already connected?

From `infrastructure/n8n/.env.example` and README:

| Credential | Where | Status |
|------------|--------|--------|
| **Supabase** (hub: city_metrics, social_post_metrics) | `.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Example only; you must set in real `.env` |
| **Stripe** | Optional in `.env` or n8n Credentials UI | Not in example; add when using Stripe webhook |
| **Rock Salt** (events ingest) | `CRON_SECRET`, `ROCK_SALT_URL` | Optional; for Rock Salt pipeline |
| **TikTok / Spotify / ConvertKit** | Placeholders in .env.example | “Add as needed”; not configured |
| **Google** (Gmail, Sheets, GA4) | Not in .env.example | Not configured; needed for email + analytics digest |
| **LinkedIn / Twitter** | Not in .env.example | Not configured; needed if automating social posting |

**Summary:** Supabase is the only credential explicitly required for existing workflows. Content distribution and analytics digest will need **Google** (Gmail API or SMTP, optional Sheets, GA4). Lead router only needs **Supabase** (and optional Slack/email). Pipeline IQ → CRM needs **Supabase** (Pipeline IQ DB and/or dashboard hub).

---

## 2. Pipeline IQ current state + expansion vision

### 2.1 What do the existing scrapers target?

| Scraper / Job | What it does | Data source | Where it writes |
|---------------|--------------|-------------|------------------|
| **Scheduled Construction Wire Scrape** | `scripts/scrape-construction-wire-enhanced.ts` | **Construction Wire** (constructionwire.com): hotel, multifamily, senior_living, student_housing projects | Pipeline IQ Supabase: `projects`, contacts |
| **Scheduled Scraper (The Hunter)** | Same script as above (workflow name is legacy) | Same: Construction Wire | Same |

**Clarification:** “The Hunter” in the workflow title is just the workflow name (not a separate service). **Hunter.io is no longer used or needed** (previously email enrichment; deprecated). Both GitHub Actions run the same Construction Wire enhanced scraper (with different matrix/inputs).

**Current state:**  
- **Construction Wire only.** Verticals: hotel, multifamily, senior_living, student_housing (all construction/real estate).  
- **No K-12 district data** is scraped today.  
- **GitHub Actions:** Both workflows are **failing** (per Monday briefing). Fix = debug Actions (secrets, Puppeteer, script args) so the existing scraper runs reliably; expansion is additive.

### 2.2 Expansion vision (Pipeline IQ as utility platform)

Pipeline IQ is positioned as a **strategic asset** for intelligence that serves WasatchWise/ABYA/Adult AI Academy. Potential expansion sources (to be prioritized and scoped):

| Source type | Examples | Serves |
|-------------|----------|--------|
| **K-12 district intelligence** | Board agendas, RFPs, bond/levy docs, policy updates | WasatchWise consulting, ABYA |
| **SDPC compliance / deadlines** | SDPC announcements, registry changes, compliance deadlines | ABYA, certification |
| **Superintendent / tech director job changes** | New decision-makers (e.g. job boards, district press) | WasatchWise outreach |
| **State AI policy updates** | Utah Office of AI Policy, state ed dept, legislation | WasatchWise content + sales |
| **Other** | EdTech vendor news, RFP aggregators | Optional later |

**Implementation note:** Each of the above is a **new** scraper or API integration. Construction Wire fix is separate (restore existing jobs). Expansion can be phased: e.g. Phase A = fix Construction Wire + add one K-12 source (e.g. Utah AI policy or district RFPs); Phase B = SDPC + job changes; etc.

---

## 3. Priority automation stack (Week 1–4)

Aligned with the strategic plan and solo execution model:

| Priority | Automation | Purpose | Week target |
|----------|-------------|---------|-------------|
| **1** | **Content distribution** | Blog → social (LinkedIn, Twitter) → email (newsletter); one publish, many channels | Week 1–2 |
| **2** | **Lead capture & nurture** | Form/quiz submission → webhook → Supabase/CRM → welcome sequence (email) | Week 1–2 |
| **3** | **Pipeline IQ → CRM** | New leads/contacts from Pipeline IQ (or Construction Wire) → dashboard hub / WasatchWise CRM table | Week 2–3 |
| **4** | **Weekly analytics digest** | GA4 (or Cloudflare) → aggregate → Monday briefing (email or Slack) | Week 3–4 |

**Which automation is highest priority for Week 1 execution?**

- **Lead capture & nurture** is the best **Week 1** candidate:  
  - Unblocks measurable lead flow (form/quiz → Supabase + welcome email).  
  - Requires: deploy n8n (or use a single webhook endpoint), Universal Lead Router workflow, and a simple welcome sequence (e.g. Gmail API or Google Workspace).  
  - Does not depend on GA4 being fully populated yet.  
- **Content distribution** is a close second: it compounds every post and can be built in parallel once n8n is deployed and credentials (e.g. LinkedIn, Gmail) are in place.

So: **Week 1 execution priority = Lead capture & nurture (Universal Lead Router + welcome email).** Content distribution can start in Week 1 in parallel if n8n is deployed early.

---

## 4. Summary: configured vs to build

| Area | Configured | To build |
|------|------------|----------|
| **n8n** | Local Docker; workflow JSONs in repo; Supabase-centric | Deploy n8n to a public URL; add Google (and optional Stripe/LinkedIn/Twitter) credentials |
| **Content distribution** | None | Workflow: trigger on “new post” (manual/schedule/webhook) → post to LinkedIn/Twitter → add to newsletter |
| **Lead capture & nurture** | ABYA payloads and webhook spec (N8N_ABYA_TASKS.md) | Universal Lead Router workflow; welcome sequence (e.g. Gmail/Apps Script or n8n) |
| **Pipeline IQ → CRM** | Pipeline IQ writes to its own Supabase | n8n workflow or app: sync/forward new Pipeline IQ leads to dashboard `city_metrics` or shared leads table |
| **Weekly analytics digest** | None | Workflow: schedule (e.g. Monday 6am) → fetch GA4 (or Cloudflare) → format → email/Slack |
| **Pipeline IQ scrapers** | Construction Wire enhanced script; 2 GitHub Actions (both failing) | Fix Actions; optionally add K-12 sources per expansion vision |

---

## 5. Next steps

1. **Deploy n8n** to a public host; document base URL and webhook paths.  
2. **Implement Universal Lead Router** (see N8N_WORKFLOW_BLUEPRINTS.md); point ABYA (and other apps) to n8n webhook.  
3. **Add welcome email** (Gmail API or Google Workspace) after lead router.  
4. **Fix Pipeline IQ** GitHub Actions (Construction Wire); then plan first K-12 expansion source.  
5. **Add content distribution** workflow (blog → social → email).  
6. **Add weekly analytics digest** (GA4/Cloudflare → Monday briefing).

---

**Document control**  
- **References:** `infrastructure/n8n/README.md`, `N8N_ABYA_TASKS.md`, `N8N_AUTOMATION_BACKLOG.md`, `apps/pipeline-iq/.github/workflows/`, Corporate Strategic Plan 2026.  
- **Next review:** After n8n is deployed and Week 1 workflows are live.
