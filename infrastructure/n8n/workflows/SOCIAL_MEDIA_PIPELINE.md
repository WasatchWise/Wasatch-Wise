# Social Media Pipeline — SLC Trips (TikTok, Instagram, Facebook, YouTube)

**Purpose:** Turn “one post at a time” into a repeatable pipeline: content register, metrics in one place, n8n automation so the social/marketing branch runs as a well-oiled machine.

---

## Overview

| Piece | What it does |
|-------|----------------|
| **Content register** | `apps/slctrips/data/social/posts-register.json` — list of posts we track (platform, URL, campaign). Add rows when you plan or publish. |
| **Metrics storage** | Supabase `social_post_metrics` — time-series per post (views, likes, comments, saves, shares, etc.). One row per capture. |
| **n8n: webhook ingest** | POST a snapshot JSON → n8n parses and inserts into `social_post_metrics`. Use from Chrome Extension, script, or manual curl. |
| **n8n: file-in-folder (optional)** | Drop a snapshot file in repo (e.g. `snapshots/snapshot-2026-02-07.json`); n8n runs on schedule and fetches from GitHub raw (or GitHub Action calls webhook). |
| **n8n: API sync (future)** | When Meta/YouTube/TikTok APIs are connected: read register, call APIs per post, write to same table. |

---

## 1. Content register

**Path:** `apps/slctrips/data/social/posts-register.json`

- **campaigns:** Map of campaign_id → name, utm_campaign, link.
- **posts:** Each post has id, campaign_id, posted_at, asset description, and **platforms** (array of platform + post_url).

When you add a new post for the month (e.g. Alta 60" video, Snowbird $50 hack), add an entry to `posts` with TikTok/IG/FB/YouTube URLs once they’re live. The register is the single source of truth for “what we’re measuring.”

---

## 2. Metrics storage (Supabase)

**Table:** `social_post_metrics` (migration `012_social_post_metrics.sql` in dashboard).

| Column | Purpose |
|--------|---------|
| source | e.g. `slctrips` (building/realm) |
| platform | tiktok, instagram, facebook, youtube |
| post_url | Link to the post |
| campaign_id | e.g. slctrips-valentines |
| posted_at | When the post went live |
| captured_at | When we captured this snapshot |
| views, likes, comments, saves, shares, reactions, accounts_reached | Counts |
| extra | JSONB for platform-specific (watch_time, demographics) |

No unique constraint on (post_url, captured_at): we keep full time-series. Dashboards or Week 1 reports query by campaign_id and captured_at.

---

## 3. How to get data into the pipeline

### Option A — Webhook (recommended to start)

1. **Get the n8n webhook URL** after importing `social-metrics-webhook-ingest.json` and activating the workflow.
2. **Send a snapshot** (see `apps/slctrips/data/social/README.md` for JSON format):
   - From **browser/extension:** use a small script or fetch to POST the JSON to the webhook.
   - From **curl:**  
     `curl -X POST https://your-n8n/webhook/social-metrics -H "Content-Type: application/json" -d @snapshot-2026-02-07.json`
   - From **Google Sheets / Airtable:** use n8n “Trigger from Google Sheets” or “Webhook called by Zapier” and map columns to the same JSON shape, then have n8n insert.

No “folder” needed: you run the gather (Chrome Extension or manual), then POST the result once.

### Option B — File in folder (repo)

1. **Save snapshot to repo:** e.g. `apps/slctrips/data/social/snapshots/snapshot-2026-02-07.json`. Commit and push.
2. **n8n runs on a schedule** (e.g. daily 6 PM):
   - **HTTP Request** node: GET your repo’s raw file (e.g. GitHub: `https://raw.githubusercontent.com/.../main/apps/slctrips/data/social/snapshots/snapshot-2026-02-07.json`). You can use a “latest” convention (e.g. a file `latest.json` that you overwrite, or a small API that returns the latest snapshot URL).
   - **Code** or **Set** node: parse JSON and output one item per post (same shape as webhook payload).
   - **Supabase** node: insert each item into `social_post_metrics`.

Alternatively: **GitHub Action** on push to `apps/slctrips/data/social/snapshots/*.json` that calls the same n8n webhook with the file content. Then you don’t need n8n to know GitHub URLs; you just drop the file and push.

### Option C — APIs (future)

- **Meta (Facebook/Instagram):** Graph API with a Business account and App — get post insights (views, reach, engagement). n8n: HTTP Request + OAuth or token.
- **YouTube:** Data API v3 — channel and video stats (views, likes, comments). n8n: HTTP Request + API key or OAuth.
- **TikTok:** TikTok for Developers — Research/Display API; availability depends on product. When you have credentials, add an n8n workflow that reads `posts-register.json` (from raw GitHub or from Supabase if you mirror it), calls the API per TikTok URL, and writes to `social_post_metrics`.

Until then, **webhook + manual/Chrome Extension gather** is the pipeline. APIs add automatic daily sync later.

---

## 4. n8n workflows

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| **Social metrics webhook ingest** | `social-metrics-webhook-ingest.json` | Webhook POST | Receives snapshot JSON; loops over `posts`; inserts each into `social_post_metrics`. |
| **Social metrics from file (optional)** | *(you can duplicate webhook workflow and change trigger to Schedule + HTTP Request to raw GitHub)* | Schedule or manual | Fetches snapshot from URL; same insert logic. |
| **TikTok views sync** | `tiktok-views-sync.json` | Manual (placeholder) | Still exists for single gauge `slctrips_tiktok_views`; can be fed from a rollup of `social_post_metrics` (e.g. sum of latest TikTok views per campaign) if you want dashboard gauge. |

---

## 5. End-to-end flow for the month

1. **Plan:** Add February posts to `posts-register.json` as you schedule them (or add when they go live).
2. **Gather:** SMM or Chrome Extension collects metrics from TikTok, IG, Facebook, (YouTube) using the same spec (see `apps/slctrips/docs/SOCIAL_METRICS_GATHER_SPEC_2026-02-05.md`).
3. **Send:** POST the snapshot to the n8n webhook (or drop file in `snapshots/` and use file-based flow).
4. **Store:** n8n writes to `social_post_metrics`. You get time-series for every post.
5. **Report:** Week 1 Report (and any dashboard) reads from `social_post_metrics` (or exports from Supabase). Awin stays separate (analytics dashboard).

Adding YouTube is the same: add a `youtube` entry to the snapshot JSON and ensure `social_post_metrics` and the n8n workflow accept `platform: youtube`. The table already supports it.

---

## 6. Quick start

1. **Apply migration** `012_social_post_metrics.sql` in Supabase (dashboard project).
2. **Import** `social-metrics-webhook-ingest.json` in n8n; set Supabase credentials (service role); activate workflow; copy webhook URL.
3. **Test:** POST a minimal snapshot (one post, one platform) to the webhook; check `social_post_metrics` in Supabase.
4. **Use:** After each gather (e.g. Friday EOD), build the snapshot JSON and POST it (or save to `snapshots/` and run file-based workflow if configured).

Once this runs, the “social media branch” has a single place for what we track (register), where metrics live (Supabase), and how they get in (webhook or file). APIs later make the “gather” step automatic for platforms that support it.
