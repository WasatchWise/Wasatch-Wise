# SLC Trips — Social Media Data

**Purpose:** Source of truth for what we track and where metrics go. Feeds the n8n social pipeline and Week 1 reports.

---

## Contents

| File | Purpose |
|------|---------|
| `posts-register.json` | List of posts we care about (platform, URL, campaign). n8n or scripts can read this to know what to fetch or accept. |
| `snapshots/` | *(optional)* When using "file in folder": drop snapshot JSON here; n8n can read from repo (e.g. raw GitHub URL) on a schedule. |

---

## How the pipeline uses this

1. **Content register** (`posts-register.json`) — Add a row when you plan or publish a post. Campaign ID must match UTM (e.g. `slctrips-valentines`). Used by future API-sync workflow and by humans to know what’s in scope.
2. **Metrics** — Either:
   - **Webhook:** SMM or Chrome Extension POSTs a snapshot to n8n; n8n writes to Supabase `social_post_metrics`. No file drop needed.
   - **File in folder:** You save a snapshot JSON under `snapshots/` (e.g. `snapshot-2026-02-07.json`), commit and push. n8n runs on a schedule and fetches the file from GitHub raw (or a GitHub Action calls the n8n webhook when this path changes). n8n parses and inserts into `social_post_metrics`.

See: `infrastructure/n8n/workflows/SOCIAL_MEDIA_PIPELINE.md`.

---

## Snapshot JSON format (for webhook or file)

Send (or save) one object per run. Each `posts` entry becomes one row in `social_post_metrics`.

```json
{
  "run_at": "2026-02-07T18:00:00Z",
  "source": "slctrips",
  "posts": [
    {
      "platform": "tiktok",
      "post_url": "https://www.tiktok.com/@slctrips/video/7603074047374576910",
      "campaign_id": "slctrips-valentines",
      "posted_at": "2026-02-04T18:10:00Z",
      "views": 200,
      "likes": 5,
      "comments": 1,
      "saves": 2,
      "shares": 3
    },
    {
      "platform": "instagram",
      "post_url": "https://www.instagram.com/p/DUWIikAEeWW/",
      "campaign_id": "slctrips-valentines",
      "posted_at": "2026-02-04T18:10:00Z",
      "views": 12,
      "accounts_reached": 10,
      "likes": 0,
      "comments": 0,
      "saves": 0,
      "shares": 0
    },
    {
      "platform": "facebook",
      "post_url": "https://www.facebook.com/reel/1620802586040202/",
      "campaign_id": "slctrips-valentines",
      "posted_at": "2026-02-04T18:21:00Z",
      "views": 25,
      "likes": 0,
      "comments": 1,
      "shares": 1,
      "reactions": 0
    }
  ]
}
```

Optional per-post: `extra` (object) for platform-specific fields (e.g. `watch_time`, `demographics`).
