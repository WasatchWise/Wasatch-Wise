# n8n Workflow Exports

Workflows you build in n8n should be **exported here as JSON** so they are:

- **Version-controlled** – Recoverable and reviewable in git
- **Recoverable** – If you nuke Docker or move to n8n Cloud, re-import from these files
- **Documentation** – Business Realms templates live here (e.g. “Stripe → city_metrics pipeline”)

---

## Export from n8n

1. Open the workflow in n8n (http://localhost:5678).
2. **⋯** (menu) → **Download** (or **Export**).
3. Save as `workflows/<descriptive-name>.json`, e.g.:
   - `stripe-to-city-metrics.json`
   - `tiktok-views-sync.json`
   - `daily-metrics-digest.json`

**Naming:** Use kebab-case and a name that describes what the workflow does. Avoid spaces.

---

## Import into n8n

1. In n8n: **Workflows** → **Import from File** (or **⋯** → **Import**).
2. Choose the `.json` file from this folder.
3. Reconnect credentials (Supabase, Stripe, etc.) – n8n does not store secrets in the export; you’ll set them again in the UI or via env.

---

## Sensitive data

Exported JSON can contain **node config** but n8n typically does **not** embed credential values in the file. Still:

- Don’t commit real API keys or passwords in workflow JSON.
- If a workflow ever contains secrets, strip them before committing or add that file to `.gitignore` and keep a redacted version in the repo.

---

## Suggested first exports

| Workflow idea | Filename | Purpose |
|---------------|----------|---------|
| **Test insert (pre-made)** | `test-city-metrics-insert.json` | Import this first: Manual trigger → insert one row into `city_metrics` (metric_key: `test_workflow_insert`). Add your Supabase credential in n8n, run it, then check the dashboard. |
| **Stripe → daily_revenue** | `stripe-revenue-webhook.json` | Webhook: Stripe events → IF payment_intent.succeeded → Extract amount → HTTP POST to Supabase RPC `increment_daily_revenue`. **HTTP node uses $env.SUPABASE_URL / $env.SUPABASE_SERVICE_ROLE_KEY** — set Authentication to **None** (no credential). |
| **Amazon → city_metrics** | `amazon-commission-to-city-metrics.json` | Manual trigger → Set amount (default 0) → HTTP POST to Supabase RPC `upsert_revenue_metric` for `slctrips_amazon_revenue`. Replace “Set amount” with Amazon API/scrape when reporting is available. See `../data/amazon/` and civilization docs `AMAZON_N8N_FEBRUARY_PLAN.md`. |
| TikTok / social sync | `tiktok-views-sync.json` | Update `slctrips_tiktok_views` gauge |
| ConvertKit → enrollees | `convertkit-to-city-metrics.json` | Update `academy_subscribers` gauge |

**Product data:** `../data/amazon/*.json` – SLC Trips Amazon product categories for link generator / bio page workflows. Fill ASINs via SiteStripe or Product Linking Tool.

Once you create and run a workflow, export it here so the repo stays the source of truth and Docker is just the runtime.
