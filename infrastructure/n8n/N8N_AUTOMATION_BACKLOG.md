# n8n Automation Backlog – Exhaustive List

**Purpose:** One exhaustive list of every n8n automation that could apply to WasatchVille. Use this to **trim** (drop what you won’t do) and **prioritize** (order what remains).  
**Last updated:** 2026-02-01

---

## How to use this list

- **Status:** Implemented | In repo | Planned | Optional (trim if not needed) | **Drop**
- **Trim:** Mark items as **Drop** or move to "Not doing" so we don’t chase things that don’t exist or don’t matter.
- **Prioritize:** Order the kept items (e.g. P0, P1, P2) in the roadmap section at the bottom.

---

## 1. Revenue & payments

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 1.1 | Stripe → daily_revenue + per-building | Webhook (payment_intent.succeeded, charge.succeeded) | daily_revenue, slctrips_revenue, abya_revenue, rocksalt_revenue, automation_mrr, pipelineiq_revenue | **Implemented** | JSON in repo; community n8n: hardcode or Supabase node |
| 1.2 | TripKit sales → city_metrics | Stripe webhook with metadata (e.g. product = TripKit, building_id = B002) | slctrips_revenue or slctrips_tripkit_sales | Optional | If TripKit sales are a separate product in Stripe; else covered by 1.1 |
| 1.3 | Treasury / aggregate revenue sync | Scheduled (e.g. daily) from Stripe API | treasury_funds, daily_revenue | Optional | If you want Stripe balance or rollup in city_metrics; else manual/dashboard |

---

## 2. Affiliates

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 2.1 | Amazon commission → city_metrics | Manual or scheduled (API/scrape when available) | slctrips_amazon_revenue (and rocksalt_amazon_revenue, academy_amazon_revenue, etc.) | **Implemented** (manual amount) | JSON in repo; replace Set with Amazon API when available |
| 2.2 | Awin / affiliate report → city_metrics | Manual import or scheduled (when Awin API/export exists) | slctrips_affiliate_revenue, rocksalt_affiliate_revenue, etc. | Planned (low) | Manual reconciliation for now; n8n when API/CSV export available |
| 2.3 | TikTok affiliate revenue → city_metrics | Manual or API when available | slctrips_affiliate_revenue or separate key | Optional | If TikTok Creator Marketplace pays; else fold into 2.2 or manual |

---

## 3. Social & engagement (by building)

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 3.1 | TikTok views → city_metrics | Schedule (e.g. daily) or Manual placeholder | slctrips_tiktok_views | **In repo** (placeholder) | Replace Set with TikTok API when ready; RPC set_metric_value |
| 3.2 | Spotify streams/listeners → city_metrics | Schedule (e.g. daily) | rocksalt_spotify_streams (or similar) | Planned | Rock Salt (B003); need Spotify API credentials |
| 3.3 | ConvertKit subscribers → city_metrics | Schedule (e.g. hourly) | academy_subscribers | Planned | Adult AI Academy (B004) |
| 3.4 | Instagram / YouTube / other social → city_metrics | Schedule | e.g. slctrips_instagram_followers | Optional | Only if you use and want in dashboard; trim if not |
| 3.5 | Rock Salt band count / bookings | App direct or n8n aggregate | rocksalt_band_count, rocksalt_bookings_completed | Optional | May be Supabase/app direct; n8n only if aggregate from external system |

---

## 4. Leads & forms

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 4.1 | Universal Lead Router | Webhook(s): wasatchwise-lead, adult-ai-academy-lead, ask-before-lead | Route to Supabase table or CRM; optional city_metrics (e.g. lead count) | Planned | One webhook per source; route by path or body to correct building/CRM |
| 4.2 | Form submission → Supabase | Webhook (form post) | Insert into leads/contacts table; optional notify Slack/email | Optional | Can be part of 4.1 or separate form-specific workflow |
| 4.3 | Ask Before You App – hot leads | Supabase or app | hot_leads (B006) | Optional | If B006 has a “hot leads” metric from Supabase; n8n only if syncing from elsewhere |

---

## 5. Alerts & notifications

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 5.1 | Threshold alert (e.g. revenue &gt; X) | Schedule: read city_metrics, IF value &gt; threshold | Slack or Telegram or email | Optional | “Notify me when slctrips_revenue &gt; $1000” |
| 5.2 | Daily/weekly digest | Schedule (cron) | Email or Slack with summary of city_metrics | Optional | Trim if you only use dashboard |
| 5.3 | Stripe payment failure / dispute | Webhook (charge.failed, etc.) | Slack/email alert | Optional | If you want ops alerts |

---

## 6. Other buildings & metrics (explicit or implied)

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 6.1 | Pipeline IQ – contracts / trainings | External system or manual | pipelineiq_* metrics | Optional | Only if you have an external source; else manual |
| 6.2 | Fanon Movies – views, affiliate | Analytics + Awin/manual | fanon_* metrics | Optional | Same as 6.1 |
| 6.3 | Automation Studio – clients, MRR | Stripe metadata (B010) | automation_clients, automation_mrr | Via 1.1 | Already covered by Stripe webhook with building_id |
| 6.4 | Active residents / user count | Supabase aggregate or app | active_residents | Optional | Usually app direct or Supabase view; n8n only if aggregating from multiple apps |
| 6.5 | NotebookLM / DAiTE | If external APIs exist | library_* or city_metrics | Optional | Only if you add such sources; trim if not |

---

## 7. Operational / meta

| # | Automation | Trigger | Writes to / does | Status | Notes |
|---|------------|---------|-------------------|--------|--------|
| 7.1 | Test city_metrics insert | Manual | test_workflow_insert | **Implemented** | Verify Supabase connection only |
| 7.2 | Backup / export city_metrics | Schedule | Export to S3/Google Sheet/CSV | Optional | Trim unless you need automated backups |
| 7.3 | Sync from external CRM to Supabase | Schedule (e.g. nightly) | Residents or leads table | Optional | Only if you have a CRM that isn’t Supabase |

---

## 8. Summary: what exists today vs what’s optional

**Implemented / in repo (keep):**  
1.1 Stripe revenue webhook, 2.1 Amazon commission (manual), 3.1 TikTok views (placeholder), 7.1 Test insert.

**Planned (documented):**  
2.2 Awin → city_metrics, 3.2 Spotify, 3.3 ConvertKit, 4.1 Universal Lead Router.

**Optional (trim if not needed):**  
1.2 TripKit separate metric, 1.3 Treasury sync, 2.3 TikTok affiliate, 3.4–3.5 other social/Rock Salt aggregates, 4.2–4.3 form-specific/hot leads, 5.1–5.3 alerts/digests, 6.1–6.5 other buildings, 7.2–7.3 backup/CRM sync.

**Drop:**  
Mark any row above as **Drop** and move to a “Not doing” section if you want to stop considering it.

---

## 9. Trimmed roadmap (fill after you trim)

After you trim, list only what you’re keeping in priority order. Example:

| Priority | Automation | Source (template or build) |
|----------|------------|----------------------------|
| P0 | (already done) | Stripe, Test, Amazon, TikTok placeholder |
| **P0** | **Utah Conditions Monitor (Content Factory #1)** | **🟢 LIVE** – `utah-conditions-monitor-v2.json`; every 6h → weather + AQ → content angles → `weather_alerts` |
| P1 | UTM Link Generator (Content Factory #2) | Planned – destination + campaign → tracked links for SMM |
| P1 | Performance Reporter (Content Factory #3) | Planned – Awin/TikTok → content performance digest |
| P1 | ConvertKit → academy_subscribers | Adopt template + adapt to set_metric_value |
| P1 | TikTok API (replace placeholder) | When API access ready |
| P2 | Universal Lead Router | Adopt webhook template + route by path |
| P2 | Spotify → rocksalt_* | Adopt template + adapt |
| P3 | Awin → city_metrics | When API/export available |
| — | (everything else) | Dropped or optional |

Link to template sources: [LOCKIN.md §0](LOCKIN.md#0-adopting-templates-and-community-workflows).

---

## 10. Content Factory (SLC Trips)

| # | Workflow | Status | Output |
|---|----------|--------|--------|
| 1 | Utah Conditions Monitor | 🟢 LIVE | `weather_alerts`; content angles; activity recommendations every 6h |
| 2 | UTM Link Generator | Planned | Tracked links from destination + campaign (slctrips-alta, etc.) |
| 3 | Performance Reporter | Planned | Awin clicks/conversions + TikTok views → weekly digest |
