# What n8n Supports – WasatchVille Reference

**Purpose:** Establish what n8n can do so decisions are clear. When someone asks "can n8n do X?" this doc is the source of truth.  
**Last updated:** 2026-02-01

---

## Triggers (how workflows run)

| Trigger | n8n support | Use case |
|---------|-------------|----------|
| Webhook (inbound HTTP) | ✅ Native | Stripe, forms, lead capture, external APIs calling us |
| Schedule (cron) | ✅ Native | Daily/hourly sync (TikTok, ConvertKit, Spotify, digests) |
| Manual | ✅ Native | Test runs, one-off imports |
| Supabase realtime | ✅ Via Supabase node / webhooks | React to DB changes (optional) |

---

## Integrations (data sources & targets)

| Integration | n8n support | Notes |
|-------------|-------------|-------|
| **Supabase** | ✅ Native node | Insert, update, upsert, RPC calls. Use for `city_metrics`. |
| **Stripe** | ✅ Native node + webhook | Payments, customers, subscriptions. Webhook receives events. |
| **TikTok** | ⚠️ HTTP / custom | No official node. Use HTTP Request + TikTok API when credentials exist. |
| **Spotify** | ✅ Native node | Streams, playlists, artist data. |
| **ConvertKit** | ✅ Native node | Subscribers, tags, sequences. |
| **Awin** | ⚠️ HTTP / CSV | No official node. API if available; else manual CSV import. |
| **Amazon Associates** | ⚠️ No direct API | Report scraping or manual entry until API/export exists. |
| **Slack** | ✅ Native node | Alerts, digests, approvals. |
| **Telegram** | ✅ Native node | Alerts, human-in-the-loop. |
| **Email (SMTP, SendGrid)** | ✅ Native nodes | Notifications, confirmations. |
| **Google Sheets** | ✅ Native node | Export, import, sync. |
| **HTTP Request** | ✅ Native node | Any REST API; use when no specific node exists. |

---

## Writing to city_metrics

n8n writes to WasatchWise Supabase via:

| Method | How | Used by |
|--------|-----|---------|
| **RPC** | `increment_daily_revenue(amount)` | Stripe webhook |
| **RPC** | `upsert_revenue_metric(p_metric_key, p_amount_to_add, ...)` | Stripe, Amazon |
| **RPC** | `set_metric_value(p_metric_key, p_value, ...)` | TikTok, ConvertKit, Spotify |
| **Direct insert/upsert** | Supabase node → `city_metrics` | Alternative if RPCs don't fit |

**Schema:** `metric_key` (PK), `value`, `previous_value`, `trend`, `unit`, `category`, `display_name`, `critical_threshold`, `last_updated`.

---

## Established: what we use today

| Workflow | Trigger | Writes | Status |
|----------|---------|--------|--------|
| Stripe revenue | Webhook | daily_revenue, per-building | Implemented |
| Test insert | Manual | test_workflow_insert | Implemented |
| Amazon commission | Manual (Set node) | slctrips_amazon_revenue | Implemented |
| TikTok views | Manual (placeholder) | slctrips_tiktok_views | Placeholder – wire API when ready |

---

## Established: what we can add (when ready)

| Automation | n8n supports | Blocker |
|------------|--------------|---------|
| TikTok API → slctrips_tiktok_views | ✅ HTTP node | TikTok API credentials |
| ConvertKit → academy_subscribers | ✅ ConvertKit node | Credentials |
| Spotify → rocksalt_* | ✅ Spotify node | Credentials |
| Lead router (webhook → route by path) | ✅ Webhook + Switch/IF | None |
| Awin → city_metrics | ⚠️ HTTP or CSV | Awin API/export availability |
| Threshold alerts (Slack/Telegram) | ✅ Schedule + IF + Slack/Telegram | None |

---

## What n8n does NOT support (out of scope)

| Need | Limitation | Workaround |
|------|------------|------------|
| Amazon Associates reporting | No official API for affiliates | Manual entry or scraping |
| Real-time agent chat | n8n is async pipelines | Dashboard/Claude API handles chat |
| Direct Stripe → SLC Trips app | Apps have own webhooks | n8n is for city_metrics; apps use their endpoints |

---

## Quick decision rule

**Can n8n do it?**  
- Data in → data out (API, webhook, schedule)? → **Yes, n8n supports it.**  
- Need a native node? → Check [n8n integrations](https://n8n.io/integrations/).  
- No node? → Use **HTTP Request** + API docs.  
- Human approval in the loop? → **Yes**, Telegram/Slack/Email nodes can pause and resume.  

**Should n8n do it?**  
- Feeds `city_metrics` or automates tasks across systems? → **Yes.**  
- App-specific logic (checkout, auth)? → **No**, keep in app code.
