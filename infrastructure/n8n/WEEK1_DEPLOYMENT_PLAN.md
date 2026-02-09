# Week 1 n8n Deployment Plan

**Assessment date:** February 9, 2026  
**Status:** Credentials and executions reviewed via n8n UI

---

## What We've Discovered

| Item | Status |
|------|--------|
| n8n running locally | ✅ http://localhost:5678 |
| Workflows | 8 total (Social Metrics ×4 variants, Rock Salt, Utah Conditions, TikTok Sync, Test Insert, NPS) |
| Failure rate | ⚠️ **90.9%** (10 failed / 11 prod executions) |
| Credentials in n8n | **2:** OpenAI account, Supabase account (both last updated 6 days ago) |

---

## Priority 1: Fix Existing Workflows (~2 hours)

### Credentials (n8n UI → Overview → Credentials)

- **OpenAI account** – Last updated 6 days ago. If any workflow uses it (e.g. AI steps), confirm the API key is valid and has quota.
- **Supabase account** – Last updated 6 days ago. Used by workflows that use the “Supabase” credential type. If the Supabase project URL or service role key was rotated, update here.

### Variables (n8n UI → Overview → Variables)

The **Social Metrics Webhook Ingest** workflow does **not** use the “Supabase account” credential. It uses **n8n Variables**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

So in addition to the Credentials tab, check **Variables**: if these are missing or outdated, the social metrics webhook will fail when writing to `social_post_metrics`.

### Recommended steps

1. **Variables:** Settings/Overview → **Variables** → ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set and match your Supabase project (Dashboard → Settings → API).
2. **Credentials:** Open **Supabase account** and **OpenAI account** → re-save with current values if you rotated keys.
3. **Test:** Run “Social Metrics Webhook Ingest” manually with a small test payload, or trigger from your app’s webhook URL and confirm rows in `social_post_metrics`.

---

## Priority 2: RSS → Social Automation (~3–4 hours)

**Goal:** Replace Wallabag + Airtable + GetLate with your existing stack.

**Suggested flow (no new SaaS):**

1. **RSS Feed (n8n)** – Poll `https://wasatchwise.com/rss` (or your blog RSS) on a schedule (e.g. hourly).
2. **LLM (OpenAI/Anthropic)** – Generate LinkedIn + X post copy from the feed item.
3. **Tracking** – Google Sheets (or Supabase table) to log published posts.
4. **Publish** – LinkedIn API node and Twitter/X API node (X may require paid API access).

**Repo reference:** Workflow JSONs live in `infrastructure/n8n/workflows/`. You can add a new workflow there and import it in n8n.

---

## Quick reference

- **Credentials:** http://localhost:5678/home/credentials  
- **Variables:** http://localhost:5678/home/variables (or Overview → Variables tab)  
- **Executions:** http://localhost:5678/home/executions (filter by Failed to see errors)  
- **Social webhook (local):** `POST http://localhost:5678/webhook/social-metrics` (or your public URL if using a tunnel)

---

*Next: Fix Variables + Credentials, then re-run failing workflows and add RSS → social workflow when ready.*
