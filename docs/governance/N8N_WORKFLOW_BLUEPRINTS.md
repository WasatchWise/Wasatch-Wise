# n8n Workflow Blueprints — Week 1–4 Priority Stack

**Purpose:** Turn the strategic plan’s automation sections into **specific n8n workflow blueprints** for solo execution.  
**Audit reference:** [N8N_AND_PIPELINE_IQ_AUDIT.md](./N8N_AND_PIPELINE_IQ_AUDIT.md)  
**Export location:** Build in n8n, then export JSON to `infrastructure/n8n/workflows/` per [workflows/README.md](../infrastructure/n8n/workflows/README.md).

---

## Prerequisites

- **n8n** deployed to a public URL (e.g. `https://n8n.wasatchwise.com` or n8n Cloud).
- **Credentials in n8n:** Supabase (hub), Gmail/Google SMTP (or Google Workspace), optional: LinkedIn, Twitter/X, Stripe.
- **Env in apps:** `LEAD_ROUTER_WEBHOOK_URL` = n8n webhook URL for lead router.

---

## Blueprint 1: Content distribution (blog → social → email)

**Goal:** One “publish” trigger → post to LinkedIn + Twitter/X + add to newsletter (or send snippet via email).

### Trigger options (pick one)

- **A. Webhook** — Vercel or a small “publish” script POSTs when a blog post goes live (payload: title, url, excerpt, image_url).
- **B. Schedule** — e.g. “Every Tue/Thu 8am” — you run manually or use a “content register” (Sheet/ Supabase) and workflow reads “next post” and publishes.
- **C. Manual** — “Run workflow” with input JSON (title, url, excerpt) for testing and one-off posts.

### Node sequence

| Order | Node type | Config summary |
|-------|-----------|----------------|
| 1 | **Webhook** (or Schedule / Manual) | Path e.g. `content-publish`. Body: `title`, `url`, `excerpt`, `image_url` (optional). |
| 2 | **Code** (optional) | Build platform-specific text (e.g. LinkedIn 3000 chars, Twitter 280, add hashtags). Output: `{ linkedinText, twitterText, emailSubject, emailBody }`. |
| 3 | **IF** (branch) | e.g. “Post to LinkedIn?” (or use separate workflows per channel). |
| 4a | **LinkedIn** (or HTTP Request) | Post `linkedinText` + `url` (and image if supported). Use n8n LinkedIn node or API. |
| 4b | **Twitter/X** (or HTTP Request) | Post `twitterText` + `url`. Use n8n Twitter node or API v2. |
| 4c | **Gmail / SMTP** | Send email: subject `emailSubject`, body `emailBody`, to “newsletter list” or a specific segment. Or trigger a “add to next newsletter” row in Supabase. |
| 5 | **Supabase** (optional) | Insert into `content_log` or `social_posts` (title, url, posted_at, channels) for analytics. |

### Credentials

- Supabase (if logging).
- Gmail / Google Workspace SMTP (or SendGrid if still in use).
- LinkedIn OAuth or API token; Twitter/X API v2 token.

### Success criteria

- One run with test payload results in: 1 LinkedIn post, 1 Twitter post, 1 email (or one row “ready for newsletter”).
- Export workflow as `content-distribution-blog-to-social-email.json`.

---

## Blueprint 2: Lead capture & nurture (form/quiz → webhook → Supabase → welcome sequence)

**Goal:** Any form or quiz submission (ABYA contact, quiz_audit, app_request) hits one webhook; n8n routes by `source`, writes to Supabase (and optionally CRM), and triggers a welcome/nurture email.

### Trigger

- **Webhook** — POST to e.g. `https://<n8n-host>/webhook/lead-router` or `/webhook/lead`.
- **Body (example):**  
  `{ "source": "contact_form" | "quiz_audit" | "abya_app_request", "name", "email", "organization", "role", "message"?, "audit_id"?, "analysis"?, ... }`

### Node sequence

| Order | Node type | Config summary |
|-------|-----------|----------------|
| 1 | **Webhook** | POST, path `lead-router`. Response: return 200 quickly (e.g. “Received”); do heavy work after respond. |
| 2 | **Code** | Normalize body: ensure `source`, `email`, `name`, `organization`, `role`; add `building_id` (e.g. B006 for ABYA), `received_at` (ISO). Output one item per lead. |
| 3 | **Switch** (or IF chain) | Route by `source`: `contact_form` → branch 1, `quiz_audit` → branch 2, `abya_app_request` → branch 3. |
| 4 | **Supabase** (each branch or merged) | Insert into shared `leads` or `contacts` table: source, email, name, organization, role, message, audit_id (if quiz), building_id, received_at. Use upsert key on `email` + `source` + date if you want to dedupe. |
| 5 | **Optional: Slack / Email** | Notify “New lead: {{ $json.email }} from {{ $json.source }}”. |
| 6 | **Respond to Webhook** | Return `{ ok: true, id: ... }` if you didn’t respond at trigger. |
| 7 | **Separate workflow or subflow: Welcome email** | Triggered by “new row in leads” (Supabase trigger or schedule that checks “last 5 min”) OR same workflow: after Supabase insert, call Gmail/SMTP to send welcome (e.g. “Thanks for reaching out…” with next step). |

### Welcome sequence (simple)

- **Email 1 (immediate):** “Thanks for contacting WasatchWise / completing the quiz…” + CTA (book call, download resource).
- **Email 2–3:** Can be a second n8n workflow triggered by “time since insert” (e.g. schedule every 15 min, query “leads where received_at > now() - 1 day and welcome_2_sent = false”, send Email 2, set flag). Or use a simple 2–3 step sequence in one workflow with **Wait** nodes (e.g. Wait 2 days → Email 2).

### Credentials

- Supabase (hub: `leads` or existing tables in WasatchWise project).
- Gmail / Google Workspace SMTP for welcome and optional notify.

### Success criteria

- ABYA contact form and quiz_audit both send to `LEAD_ROUTER_WEBHOOK_URL`; n8n writes one row per submission to Supabase and sends one welcome email within minutes.
- Export as `lead-router-abya-welcome.json` (or split into `lead-router.json` and `welcome-sequence.json` if preferred).

---

## Blueprint 3: Pipeline IQ → CRM integration

**Goal:** New leads/contacts from Pipeline IQ (e.g. Construction Wire scrapes) are synced to the central dashboard/CRM so they’re visible and actionable for WasatchWise (and so Pipeline IQ is the “utility” that feeds the funnel).

### Options

**A. n8n reads Pipeline IQ Supabase, writes to hub**  
- **Trigger:** Schedule (e.g. every 6 hours) or webhook called by Pipeline IQ app after a batch scrape.  
- **Flow:** n8n reads from Pipeline IQ Supabase `projects` or `contacts` (e.g. “where created_at > last_run”), maps to hub schema (e.g. `leads` or `pipelineiq_leads`), inserts into dashboard Supabase.  
- **Credentials:** Two Supabase connections (Pipeline IQ project + WasatchWise hub).

**B. Pipeline IQ app writes to hub directly**  
- App (or GitHub Action after scrape) POSTs to n8n webhook with summary of new leads; n8n writes to hub and optionally notifies.  
- **Trigger:** Webhook. **Body:** e.g. `{ "source": "pipelineiq", "vertical": "construction_wire", "leads": [ { "email", "name", "organization", ... } ] }`.  
- **Flow:** Webhook → Code (normalize) → Supabase (insert into `leads` with source = pipelineiq) → optional Slack/email.

**C. Dashboard reads Pipeline IQ DB**  
- Dashboard (or a small cron job) reads Pipeline IQ Supabase with a read-only key and displays in “Pipeline IQ” tab. No n8n needed for read path; n8n can still be used for “new lead” notifications.

**Recommended for Week 2–3:** **B** — keep Pipeline IQ app/Actions as owner of its DB; add one “sync” step (app or Action calls n8n webhook with new leads); n8n writes to hub and optionally updates `city_metrics` (e.g. `pipelineiq_new_leads_this_week`).

### Node sequence (Option B)

| Order | Node type | Config summary |
|-------|-----------|----------------|
| 1 | **Webhook** | POST, path `pipelineiq-sync`. Body: `source: "pipelineiq", leads: [ { ... } ]`. |
| 2 | **Code** | Map each lead to hub schema; add `source: pipelineiq`, `building_id` if needed. |
| 3 | **Supabase** | Insert into `leads` (or `pipelineiq_leads`); upsert key = email + source + date. |
| 4 | **Supabase** (optional) | Upsert `city_metrics`: e.g. `pipelineiq_new_leads_this_week` = count. |
| 5 | **Optional: Slack / Email** | “Pipeline IQ: N new leads from Construction Wire.” |

### Credentials

- Supabase (hub only for Option B).

### Success criteria

- After a Pipeline IQ scrape (or manual test payload), hub has new rows in `leads` (or equivalent) and optional metric in `city_metrics`. Export as `pipelineiq-to-crm-sync.json`.

---

## Blueprint 4: Weekly analytics digest (GA4 → Monday briefing)

**Goal:** Every Monday (or first weekday) morning, pull last 7 days of traffic/engagement from GA4 (or Cloudflare), format a short digest, and send by email (or post to Slack) for the Monday Corporate Briefing.

### Trigger

- **Schedule** — e.g. `0 12 * * 1` (Monday 12:00 UTC) or 6:00 AM Mountain.

### Node sequence

| Order | Node type | Config summary |
|-------|-----------|----------------|
| 1 | **Schedule** | Cron above. |
| 2 | **HTTP Request** or **Google Analytics** | GA4 Data API: fetch sessions, users, pageviews, top pages (last 7 days) for wasatchwise.com (and optionally askbeforeyouapp.com). Use service account or OAuth; filter by property_id. |
| 3 | **Code** | Format plain text or HTML: “WasatchWise weekly traffic: X sessions, Y users. Top pages: …”. Add Cloudflare numbers if you call Cloudflare API in same workflow. |
| 4 | **Gmail / SMTP** | Send to founder (or briefing list): subject “Monday Briefing – Traffic Digest”, body = formatted digest. |
| 5 | **Optional: Slack** | Post same digest to a #briefing channel. |

### Fallback if GA4 not ready

- **Cloudflare Analytics API** (if enabled): Fetch last 7 days requests/bandwidth; format and email. Less rich than GA4 but unblocks “we have numbers” for the briefing.

### Credentials

- Google (GA4): OAuth or service account with Analytics Read access.
- Gmail / SMTP for sending.
- Optional: Slack bot token; Cloudflare API token.

### Success criteria

- Every Monday you receive an email (or Slack message) with last week’s traffic summary. Export as `weekly-analytics-digest.json`.

---

## Implementation order (Week 1–4)

| Week | Focus | Workflows |
|------|--------|-----------|
| **1** | Deploy n8n; lead capture | Deploy n8n → build & activate Lead Router + welcome email (Blueprint 2). |
| **2** | Content distribution; Pipeline IQ fix | Blueprint 1 (content distribution); fix Pipeline IQ GitHub Actions; optionally start Blueprint 3 (webhook contract). |
| **3** | Pipeline IQ → CRM | Blueprint 3 (Pipeline IQ → hub); finish content distribution if needed. |
| **4** | Analytics digest | Blueprint 4 (weekly digest); GA4 or Cloudflare; wire into Monday briefing. |

---

## Export and versioning

After each workflow is built and tested:

1. In n8n: Workflows → [workflow] → ⋯ → Download/Export.
2. Save to `infrastructure/n8n/workflows/<kebab-name>.json`.
3. Strip any embedded secrets; rely on n8n Credentials and `.env` for production.
4. Update `workflows/README.md` with the new file and one-line description.

This keeps the automation stack in repo and recoverable and makes it the single source of truth for “what’s configured” vs “what needs building.”
