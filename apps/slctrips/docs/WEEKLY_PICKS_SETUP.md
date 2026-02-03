# This Week's Picks – Dynamic (Utah Conditions Monitor)

**Purpose:** Drive the landing page "This Week's Picks" from the n8n Utah Conditions Monitor workflow.

---

## Flow

1. **n8n** runs every 6 hours → Conditions Router → **Deactivate** previous `weekly_picks` (set `is_active = false`) → **Insert** new row with current `content_angle`, `weather_*`, `recommendations`, `is_active = true`.
2. **Supabase** table `weekly_picks` holds the active row (same project n8n uses – usually dashboard).
3. **slctrips** homepage calls `GET /api/weekly-picks` → returns active row → section shows dynamic headline, weather badge, and recommendation cards.

---

## 1. Supabase: Create Tables (Daniel / SLC Trips project)

Run these on the **same Supabase project that n8n uses** (Daniel / SLC Trips).

**Required for “This Week’s Picks”:**

```sql
-- 011_weekly_picks.sql (required for landing page)
CREATE TABLE IF NOT EXISTS weekly_picks (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,
  content_angle TEXT NOT NULL,
  weather_temp INTEGER,
  weather_conditions VARCHAR(100),
  recommendations JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_weekly_picks_active ON weekly_picks(is_active, created_at DESC);
```

**Optional – for weather_alerts (history / high-urgency logging):**  
If you want the “Log to Supabase” node to succeed (no 404), also run:

```sql
-- 010_weather_alerts.sql (optional)
CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  mode VARCHAR(50) NOT NULL,
  temp INTEGER,
  conditions VARCHAR(100),
  aqi INTEGER,
  content_angle TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_timestamp ON weather_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_mode ON weather_alerts(mode);
```

If you skip `weather_alerts`, the workflow still completes: the “Log to Supabase” node is set to **Continue on fail**, so `weekly_picks` is still updated.

---

## 2. n8n: Use Updated Workflow

The workflow **utah-conditions-monitor-v2.json** now has:

- **Deactivate Previous Weekly Picks** – `PATCH weekly_picks?is_active=eq.true` with `{"is_active": false}`.
- **Insert Weekly Pick (Landing Page)** – `POST weekly_picks` with `mode`, `content_angle`, `weather_temp`, `weather_conditions`, `recommendations`, `is_active: true`.

Re-import the JSON from `infrastructure/n8n/workflows/utah-conditions-monitor-v2.json` (or add these nodes manually). Ensure n8n `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the project where `weekly_picks` lives.

---

## 3. slctrips: API and Env

- **API:** `GET /api/weekly-picks` reads the active `weekly_picks` row and returns `headline`, `weather`, `recommendations`, etc.
- **Env:**
  - If slctrips and dashboard use the **same** Supabase project: no extra env; the app’s `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used (and `weekly_picks` must exist in that project).
  - If they use **different** projects: set in slctrips (e.g. Vercel):
    - `DASHBOARD_SUPABASE_URL` = dashboard project URL  
    - `DASHBOARD_SUPABASE_SERVICE_ROLE_KEY` = dashboard service role key  

---

## 4. Homepage Behavior

- On load, the homepage calls `/api/weekly-picks`.
- If the response has `headline` and `recommendations`:
  - Subtitle shows **headline** (e.g. "☀️ Mild winter day - great for exploring").
  - Weather badge shows **temp** and **conditions** when present.
  - Cards are built from **recommendations** (name, type, link) with UTM params.
- If no active weekly pick (null or error), the section falls back to the existing logic (weather-aware rotation from `public_destinations`).

---

## Quick Checks

- **n8n:** Run workflow once; in Supabase check `SELECT * FROM weekly_picks ORDER BY created_at DESC LIMIT 1;`
- **API:** `curl https://your-slctrips-domain.com/api/weekly-picks` (or localhost) → should return one object with `headline`, `weather`, `recommendations`.
- **Homepage:** Reload; "This Week's Picks" should show the dynamic headline and recommendation cards when data exists.

---

## Files Touched

| Area | File |
|------|------|
| Migration | `apps/dashboard/lib/supabase/migrations/011_weekly_picks.sql` |
| n8n | `infrastructure/n8n/workflows/utah-conditions-monitor-v2.json` |
| API | `apps/slctrips/src/app/api/weekly-picks/route.ts` |
| Homepage | `apps/slctrips/src/app/page.tsx` (dynamic pick state, section UI) |
