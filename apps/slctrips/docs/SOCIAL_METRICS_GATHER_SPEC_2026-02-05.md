# Social Metrics Gather Spec — Intern / Claude Chrome Extension

**For:** 10:36 meeting, Thursday, February 5, 2026 — SLC Trips social media team  
**Post in scope:** Valentine TripKit 22-second video (went out Wednesday, Feb 4)  
**Purpose:** Define what to gather from TikTok, Facebook, and Instagram so we can align with the February plan and fill the Week 1 Report (due Feb 9).

---

## Post to locate

- **Asset:** 22-second Valentine TripKit video  
- **Campaign:** `slctrips-valentines`  
- **Link (by platform):**
  - TikTok / Instagram / Facebook → `slctrips.com/tripkits/valentines-getaways` with `utm_source=tiktok|instagram|facebook`, `utm_medium=social`, `utm_campaign=slctrips-valentines`

Identify the **same creative** on each platform (caption/hook: “20 romantic road trips from Salt Lake,” Valentine’s TripKit, link in bio, etc.).

---

## Per-platform: what to capture

### TikTok

| Field | What to record | Why (February plan / SMM) |
|-------|----------------|---------------------------|
| **Views** | Exact number shown on post | Week 1 “Total views” + compare to prior “5 romantic road trips” (36K); account momentum (+226% last 7 days). |
| **Likes** | Count | Engagement rate, benchmark vs. saves. |
| **Comments** | Count | Engagement; reply opportunity. |
| **Saves** | Count (if visible) | **Purchase intent** — we treat saves as key signal (see VALENTINES_RESEARCH_2026, 1,508 saves on similar angle). |
| **Shares** | Count (if visible) | Reach and virality. |
| **Caption** | Copy/paste or link | Confirm CTA and link-in-bio mention. |
| **Pinned comment** | Text + whether link is present | Brief says: “Pin a comment with the link or ‘Full guide in bio’.” |
| **Post URL** | Full URL | For Week 1 “Content Posted” and repeat runs. |
| **Post date/time** | As shown | Confirm Feb 4 and ~12:00 PM if possible. |

### Instagram (Reels/Feed)

| Field | What to record | Why |
|-------|----------------|-----|
| **Views** (Reels) or **Impressions** (if available) | Number | Week 1 performance snapshot. |
| **Likes** | Count | Engagement. |
| **Comments** | Count | Engagement + comment themes. |
| **Saves** | Count (if visible) | Intent signal. |
| **Shares** (or “sends”) | If visible | Reach. |
| **Caption** | Copy/paste or link | CTA/link-in-bio consistency. |
| **Pinned comment** | Text + link check | Same as TikTok. |
| **Post URL** | Full URL | Reporting + future runs. |
| **Post date/time** | As shown | Alignment with Feb 4. |

### Facebook

| Field | What to record | Why |
|-------|----------------|-----|
| **Views** / **Reach** | Number(s) shown | Week 1 snapshot. |
| **Reactions** (like, love, etc.) | Count or breakdown | Engagement. |
| **Comments** | Count | Engagement. |
| **Shares** | Count | Reach. |
| **Caption** | Copy/paste or link | CTA consistency. |
| **Post URL** | Full URL | Reporting. |
| **Post date/time** | As shown | Feb 4 alignment. |

---

## Comment themes (all platforms)

For **Week 1 Report** and **SMM sync** we need:

- **What are people asking?** (e.g. “Which one are you doing for Valentine’s?”)  
- **What are they saying?** (favorites, debate, “link?” etc.)  
- **Any recurring questions** we should answer in a pinned comment or follow-up post.

Capture 3–5 representative comment snippets per platform (no PII); note if link-in-bio is being asked for.

---

## How this feeds the February plan

1. **Week 1 Report (due Feb 9)** — FEBRUARY_2026_CONTENT_EXECUTION.md  
   - **Content Posted:** links to this post on TikTok, Instagram, Facebook.  
   - **Performance Snapshot:** total views, top performer (by platform), engagement rate.  
   - **Comments themes:** as above.

2. **Weekly sync** — SMM_CONTENT_GUIDE.md  
   - Content posted (links + platforms).  
   - Top performing posts (views, engagement).  
   - Comments/DMs themes.

3. **Awin / site** (separate from Chrome Extension)  
   - Clicks and TripKit page visits with `utm_campaign=slctrips-valentines` (analytics/Awin).  
   - Conversions (bookings) — from Awin dashboard, not from social UIs.

4. **Valentine brief “After you post”** — SOCIAL_BRIEF_2026-02-04_VALENTINE_VIDEO.md  
   - Confirm pinned comment and link-in-bio are in place.  
   - Use comment themes to inform replies (“Which one are you doing for Valentine’s?” / “Link in bio for all 20”).

---

## Output format for the intern / Chrome Extension

Prefer a **single structured snapshot** (e.g. JSON or table) per run, with:

- **Run date/time** (e.g. 2026-02-05 10:36).  
- **Post identified:** platform, post URL, post date/time.  
- **Metrics:** views, likes, comments, saves, shares (per platform, with “N/A” if not visible).  
- **Copy:** caption + pinned comment text (and whether link is present).  
- **Comment themes:** 3–5 short snippets + “link?” or “which one?” etc.

That way we can drop the numbers into the Week 1 Report and compare day-over-day (e.g. Thursday vs Friday) without re-defining what “gather” means.

---

## Quick checklist for 10:36 meeting

- [ ] Agree on **exact post** (same 22s video on TikTok, IG, FB).  
- [ ] Confirm **who** runs the gather (intern vs. automated Chrome Extension) and **how often** (e.g. daily until Feb 9, then weekly).  
- [ ] Confirm **where** the snapshot lives (Doc, Sheet, Supabase, or repo).  
- [ ] Remind: **Awin/clicks** for `slctrips-valentines` stay in analytics; this spec is **in-app social metrics only**.

---

---

**Pipeline (month-scale):** For automated ingest and a single place for all post metrics, see **infrastructure/n8n/workflows/SOCIAL_MEDIA_PIPELINE.md** — content register at `apps/slctrips/data/social/`, n8n webhook → Supabase `social_post_metrics`. POST snapshot JSON (same shape as this spec) to the webhook, or drop files in `data/social/snapshots/` for file-based ingest.

*Sources: SOCIAL_BRIEF_2026-02-04_VALENTINE_VIDEO.md, FEBRUARY_2026_CONTENT_EXECUTION.md, SMM_CONTENT_GUIDE.md, VALENTINES_RESEARCH_2026.md.*
