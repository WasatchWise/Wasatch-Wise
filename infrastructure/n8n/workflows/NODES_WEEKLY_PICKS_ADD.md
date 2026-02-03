# Add Weekly Picks Nodes to Utah Conditions Monitor

**Use this if your workflow only has "Log to Supabase" and doesn't write to `weekly_picks` yet.**

---

## Flow to Add

After **Conditions Router** (or "Conditions Router1"), add a **second branch** that runs in parallel with "High Urgency? → Log to Supabase":

```
Conditions Router
    ├── High Urgency? → Log to Supabase (weather_alerts)   ← already there
    └── Deactivate Previous Weekly Picks → Insert Weekly Pick (Landing Page)   ← ADD THIS
```

---

## Node 1: Deactivate Previous Weekly Picks

**Add after:** Conditions Router (connect from Conditions Router to this node).

| Setting | Value |
|--------|--------|
| **Name** | Deactivate Previous Weekly Picks |
| **Method** | PATCH |
| **URL** | `{{ $env.SUPABASE_URL }}/rest/v1/weekly_picks?is_active=eq.true` |
| **Headers** | |
| `apikey` | `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}` |
| `Authorization` | `Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}` |
| `Content-Type` | `application/json` |
| `Prefer` | `return=minimal` |
| **Body** (JSON) | `{"is_active": false}` |

---

## Node 2: Insert Weekly Pick (Landing Page)

**Add after:** Deactivate Previous Weekly Picks (connect Deactivate → Insert).

| Setting | Value |
|--------|--------|
| **Name** | Insert Weekly Pick (Landing Page) |
| **Method** | POST |
| **URL** | `{{ $env.SUPABASE_URL }}/rest/v1/weekly_picks` |
| **Headers** | Same as Node 1: apikey, Authorization, Content-Type, Prefer |
| **Body** (JSON) | See below |

**Body:** Use **"Using Fields Below"** mode (not raw JSON) so expressions evaluate correctly. Add 6 body parameters:

| Name | Value (Expression) | Mode |
|------|--------------------|------|
| `mode` | `{{ $('Conditions Router1').first().json.mode }}` | Expression |
| `content_angle` | `{{ $('Conditions Router1').first().json.contentAngle }}` | Expression |
| `weather_temp` | `{{ $('Conditions Router1').first().json.weather.temp }}` | Expression |
| `weather_conditions` | `{{ $('Conditions Router1').first().json.weather.conditions }}` | Expression |
| `recommendations` | `{{ $('Conditions Router1').first().json.recommendations }}` | Expression |
| `is_active` | `true` | Fixed |

**Steps:** Add Body Field for each row above; toggle **Expression** on for the Value (except `is_active`). If your router node has a different name, replace `Conditions Router1` in the expressions.

---

## Connections

1. **Conditions Router** → **Deactivate Previous Weekly Picks** (new connection; keep existing connection to "High Urgency?").
2. **Deactivate Previous Weekly Picks** → **Insert Weekly Pick (Landing Page)**.

---

## Verify

1. Run the workflow once.
2. In Supabase: `SELECT * FROM weekly_picks ORDER BY created_at DESC LIMIT 1;` — you should see one row with `is_active = true`.
3. Call `GET /api/weekly-picks` or open the SLC Trips homepage — "This Week's Picks" should show the dynamic headline and recommendation cards.

---

## Or Re-import Full Workflow

The file `utah-conditions-monitor-v2.json` in this folder already includes these two nodes and connections. You can:

1. Export your current workflow (backup).
2. Import `utah-conditions-monitor-v2.json` (may create a duplicate workflow).
3. Copy the Deactivate + Insert nodes (and their connections) from the imported workflow into your existing one, then delete the duplicate.

Use the table/body above if you prefer to add the two nodes by hand.

---

## Troubleshooting

**"Bad request - Empty or invalid json"** on Insert Weekly Pick:
- Raw JSON body often fails because expressions don't evaluate. Use **"Using Fields Below"** and add each field as a Body Parameter with Expression mode for the value.
