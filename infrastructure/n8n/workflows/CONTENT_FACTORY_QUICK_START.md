# Content Factory – Quick Start

**Content Factory Workflow #1 is LIVE.**  
**Last updated:** February 2, 2026

---

## 🟢 Utah Conditions Monitor v2 – Publish (Run Every 6 Hours)

The workflow is **already scheduled** to run every 6 hours. To publish it:

1. Open n8n: **http://localhost:5678**
2. Open the workflow **"Utah Conditions Monitor v2 (Air Quality Optional)"**
3. Toggle **Activate** (top right) to **ON** (green)

That’s it. It will run at **12a, 6a, 12p, 6p** (or your configured interval).

**No redeploy needed** – the "Every 6 Hours" trigger is built into the workflow.

---

## 📊 Check Supabase Logs

To see stored conditions:

1. Open your **Dashboard Supabase** project → **SQL Editor**
2. Run:

```sql
-- Latest condition
SELECT * FROM weather_alerts ORDER BY timestamp DESC LIMIT 1;

-- Last 24 hours
SELECT timestamp, mode, temp, conditions, content_angle
FROM weather_alerts
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- All WINTER_MILD / POWDER_DAY etc.
SELECT * FROM weather_alerts WHERE mode = 'WINTER_MILD' ORDER BY timestamp DESC;
```

---

## 🏭 Next Content Factory Workflows

| # | Workflow | Purpose |
|---|----------|---------|
| **2** | **UTM Link Generator** | Input: destination slug + campaign → output: full URL with `utm_source`, `utm_medium`, `utm_campaign` for SMM/link-in-bio |
| **3** | **Performance Reporter** | Input: Awin (or manual) clicks/conversions + TikTok views → output: weekly digest (or `city_metrics` updates) for content team |

Say which one you want next and we’ll build it.
