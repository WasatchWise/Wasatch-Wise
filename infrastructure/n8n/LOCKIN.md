# n8n Automation Lock-In – WasatchVille

**Purpose:** Single playbook to verify, run, and extend n8n automations that feed `city_metrics`.  
**Last updated:** 2026-02-01

**Exhaustive backlog:** [N8N_AUTOMATION_BACKLOG.md](N8N_AUTOMATION_BACKLOG.md) — full list of every n8n automation (revenue, affiliates, social, leads, alerts, etc.) so you can **trim** (drop what you won’t do) and **prioritize** (order what remains). Use it instead of hunting for things that don’t exist.

---

## 0. Adopting templates and community workflows

You don’t have to build everything from scratch. Use templates to get 80% of the way, then adapt to our schema (city_metrics, building_id, WasatchWise Supabase).

### Where to find workflows

| Source | What it is | URL |
|--------|------------|-----|
| **Official n8n** | 7,888+ community templates; categories: AI, Sales, IT Ops, Marketing, Document Ops, Support | [n8n.io/workflows](https://n8n.io/workflows/) |
| **In-app** | In n8n: **Templates** (left sidebar or ⋮) → browse by app/category → one-click use | n8n UI → Templates |
| **n8n Resources** | 5,600+ free templates, one-click copy, AI search, MCP bridges | [n8nresources.dev](https://www.n8nresources.dev/) |
| **n8n Templates (me)** | 9,000+ templates, AI-generated from description | [n8ntemplates.me](https://n8ntemplates.me/) |
| **HaveWorkflow** | Marketplace with n8n section | [haveworkflow.com/marketplace/n8n-templates](https://haveworkflow.com/marketplace/n8n-templates/) |

### Map “what we want” → what to search for

| Our goal | Search / category | Then adapt |
|----------|-------------------|------------|
| Stripe → DB | “Stripe Supabase” or “Stripe webhook database” | Point webhook at our URL; write to city_metrics via our RPCs (increment_daily_revenue, upsert_revenue_metric) |
| TikTok / social stats → DB | “TikTok” or “social analytics API” (may be HTTP + API) | Replace target with set_metric_value → slctrips_tiktok_views |
| ConvertKit → DB | “ConvertKit” or “email subscribers database” | Write to city_metrics (academy_subscribers) or our RPC |
| Lead routing | “Lead router” or “webhook form Supabase” / “Marketing” | Add webhook path; route to Supabase or CRM; optional city_metrics |
| Marketing / campaigns | Category **Marketing** on n8n.io/workflows | Use for ideas; wire last node to our Supabase / city_metrics |
| Slack / Telegram alerts | “Slack Supabase” or “Telegram webhook” | Trigger from our workflows or city_metrics thresholds |

### How to adopt a template

1. **Import** – From n8n.io/workflows click **Use workflow** (or copy JSON and in n8n: Import from URL/File).
2. **Credentials** – Attach your Supabase, Stripe, TikTok, etc. in n8n (community: no $env; use credentials or hardcode per LOCKIN §5.1).
3. **Adapt** – Change the “write” step to our contract: Supabase RPC (`upsert_revenue_metric`, `set_metric_value`) or insert/update `city_metrics` with our `metric_key` names (e.g. slctrips_tiktok_views, academy_subscribers).
4. **Export** – Save to `workflows/<name>.json` and document in LOCKIN §1 and INTEGRATION_LOG.

Using templates gets you a working flow fast; adapting the last mile to city_metrics and our RPCs keeps everything in one dashboard.

---

## 1. Current State

### Implemented (in repo, ready to import)

| Workflow | File | Trigger | Writes to | Notes |
|----------|------|---------|-----------|--------|
| **Stripe Revenue Webhook** | `workflows/stripe-revenue-webhook.json` | Stripe webhook (`payment_intent.succeeded`, `charge.succeeded`) | `daily_revenue`, per-building keys (B002→slctrips_revenue, etc.) | Needs: webhook URL in Stripe, signing secret in n8n. See §3. |
| **Test city_metrics insert** | `workflows/test-city-metrics-insert.json` | Manual | `test_workflow_insert` | Use first to verify Supabase from n8n. |
| **Amazon Commission → city_metrics** | `workflows/amazon-commission-to-city-metrics.json` | Manual (amount set in node) | `slctrips_amazon_revenue` | Replace "Set amount" with API/scrape when Amazon reporting is available. |
| **TikTok Views Sync** | `workflows/tiktok-views-sync.json` | Manual (placeholder) or Schedule | `slctrips_tiktok_views` | **Placeholder:** Manual → Set views (0) → RPC `set_metric_value`. Replace "Set views" with TikTok API node when API access is ready. Community n8n: hardcode URL + service_role in HTTP node or use Supabase node Execute Function. See migration `009_slctrips_tiktok_views.sql`. |

**Supabase RPCs used:** `increment_daily_revenue(amount_to_add)`, `upsert_revenue_metric(p_metric_key, p_amount_to_add, ...)`, `set_metric_value(p_metric_key, p_value, ...)` — see migrations `001`, `007`, `008`, `009_slctrips_tiktok_views.sql`.

### Planned (not yet in repo)

| Workflow | Metric key(s) | Source | Priority |
|----------|----------------|--------|----------|
| TikTok API integration | (replace Set in tiktok-views-sync) | TikTok Business/Display API | High – wire when API access ready |
| ConvertKit → city_metrics | `academy_subscribers` | ConvertKit API | High – Adult AI Academy |
| Spotify → city_metrics | Rock Salt metrics | Spotify API | Medium – Rock Salt |
| Universal Lead Router | — | Webhooks (`wasatchwise-lead`, `academy-lead`, etc.) | Medium – route leads by building |
| Awin → city_metrics | `slctrips_affiliate_revenue`, etc. | Awin report/export | Low – manual reconciliation for now |

---

## 2. Local Verification (lock-in steps)

Do these in order so n8n is fully operational locally.

### 2.1 Environment

```bash
cd infrastructure/n8n
cp .env.example .env
```

Edit `.env` and set at minimum:

- `POSTGRES_PASSWORD` (and optionally `POSTGRES_USER`, `POSTGRES_DB`)
- `SUPABASE_URL` – WasatchWise project URL (dashboard’s Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` – Same project, Settings → API → service_role

Do **not** commit `.env`.

### 2.2 Start n8n

```bash
docker compose up -d
```

Open **http://localhost:5678**. If you use basic auth, set `N8N_BASIC_AUTH_ACTIVE=true` and credentials in `.env`.

### 2.3 Import workflows

1. In n8n: **Workflows** → **Import from File** (or ⋯ → **Import**).
2. Import in this order:
   - `workflows/test-city-metrics-insert.json`
   - `workflows/amazon-commission-to-city-metrics.json`
   - `workflows/stripe-revenue-webhook.json`
3. **Full lock-in = all 3 workflows.** If you only have the Stripe workflow (e.g. 1 workflow in n8n), import the other two from `workflows/test-city-metrics-insert.json` and `workflows/amazon-commission-to-city-metrics.json`. For **Test** and **Amazon**: attach your Supabase credential to the Supabase/HTTP node. **If you use n8n community/self-hosted:** the repo workflows use `$env.SUPABASE_URL` and `$env.SUPABASE_SERVICE_ROLE_KEY` in HTTP nodes; community edition does **not** support `$env.*` (Enterprise only). You will see "access to env vars denied" and failed runs. Apply the fix in **§5.1** (hardcode in HTTP nodes or use Supabase nodes).

### 2.4 Import Test and Amazon workflows (if not already present)

**How to import in n8n:** Open any workflow → top-right **⋯** (three dots) → **Import from File** (or **Import from URL**). Select the JSON file; n8n creates a new workflow from it. Alternatively: **Workflows** list → **Add workflow** → **⋯** → **Import from File**.

| Workflow | File | After import |
|----------|------|--------------|
| **Test** | `workflows/test-city-metrics-insert.json` | Has **Supabase** node (Manual Trigger → Insert city_metrics). **No $env.** Attach your Supabase credential to the "Insert city_metrics" node. Run once to verify. |
| **Amazon** | `workflows/amazon-commission-to-city-metrics.json` | Has **HTTP** node using `$env.SUPABASE_URL` and `$env.SUPABASE_SERVICE_ROLE_KEY`. On community n8n you must fix it per **§5.1** (hardcode URL + service_role in the HTTP node, or replace with Supabase node Execute Function `upsert_revenue_metric`). |

**Test workflow does not use HTTP or $env** — it uses the native Supabase node; only the credential needs to be attached.

### 2.5 Verify Supabase → city_metrics

1. Open workflow **Test: Insert city_metrics row**.
2. Add/select Supabase credential on the "Insert city_metrics" node.
3. **Execute Workflow** (manual trigger).
4. In Supabase (Table Editor or SQL): confirm a row in `city_metrics` with `metric_key = 'test_workflow_insert'`.

If this fails: check `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, RLS (service_role bypasses RLS), and that `city_metrics` table exists (see `apps/dashboard/lib/supabase/command-control-schema.sql` or migrations).

### 2.6 Verify Amazon commission workflow (optional)

1. Open **Amazon Commission → city_metrics**.
2. On **community/self-hosted n8n** the Amazon workflow also uses `$env.*` in the HTTP node; apply the same fix as Stripe (§5.1): hardcode URL + service_role in the HTTP node, or replace with a Supabase node (Execute Function → `upsert_revenue_metric`).
3. Run once (default amount 0). Check `city_metrics` for `slctrips_amazon_revenue` (value should be 0 or increment).

### 2.7 Stripe webhook (local = tunnel required)

Stripe cannot POST to `localhost`. To test the Stripe workflow locally:

1. Expose n8n with a tunnel: e.g. `ngrok http 5678` or Cloudflare Tunnel to `localhost:5678`.
2. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**:
   - URL: `https://<tunnel-host>/webhook/stripe-webhook`
   - Events: `payment_intent.succeeded`, `charge.succeeded`
3. Copy the **Signing secret** (whsec_…). In n8n: **Credentials** → create **Stripe API** credential (or Webhook credential if your n8n version uses it for verification), paste the secret. Attach to the **Stripe Webhook** node if the node supports verification.
4. Activate the **Stripe → daily_revenue + per-building metrics** workflow (toggle **Active**).
5. Send a test payment (Stripe test mode) with optional `metadata.building_id` (e.g. `B002` for slctrips). Confirm `daily_revenue` and, if present, `slctrips_revenue` update in `city_metrics`.

---

## 3. Production Lock-In (Stripe + n8n)

For live Stripe events you need n8n reachable by Stripe.

1. **Deploy n8n** (e.g. Cloud Run, Railway, Render) with:
   - Same workflow JSON (import from repo).
   - Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (from Secret Manager or platform env).
   - Postgres for n8n’s own DB (or use n8n Cloud).

2. **Stripe webhook endpoint**
   - URL: `https://<your-n8n-host>/webhook/stripe-webhook`
   - Events: `payment_intent.succeeded`, `charge.succeeded`
   - Copy **Signing secret** into n8n Credentials (and link to webhook node if applicable).

3. **Stripe metadata**
   - For per-building revenue, set `metadata.building_id` on the PaymentIntent/Charge (e.g. `B002`, `B003`). The workflow maps them to `slctrips_revenue`, `rocksalt_revenue`, etc. (see workflow JSON: `BUILDING_TO_METRIC` in the Code node).

4. **Activate** the Stripe workflow in n8n and run a test payment; confirm `city_metrics` in Supabase updates.

---

## 4. Roadmap (next workflows to lock in)

Suggested order:

1. **TikTok Views Sync** – Placeholder workflow in repo (`tiktok-views-sync.json`). Replace "Set views" with TikTok API node when Business/Display API access is ready; then add Schedule trigger (e.g. daily). Metric: `slctrips_tiktok_views` via RPC `set_metric_value`. High impact for SLC Trips launcher data loop.
2. **ConvertKit → city_metrics** – ConvertKit API → `academy_subscribers`. High for Adult AI Academy.
3. **Universal Lead Router** – Webhook(s) by building → route to Supabase or CRM; optional `city_metrics` (e.g. lead count).
4. **Spotify** – Rock Salt streams/listeners when ready.
5. **Awin → city_metrics** – When Awin reporting API or export is available; map campaigns to `slctrips_affiliate_revenue`, etc.

When you build a new workflow: export it to `workflows/<name>.json`, add a row to the table in §1 and to `civilization/realms/wasatchville/docs/INTEGRATION_LOG.md` (n8n Workflows section).

---

## 5. Troubleshooting

### 5.1 Community/self-hosted n8n – no $env support

**Symptom:** Stripe (or Amazon) workflow fails with **"access to env vars denied"** on the "Update daily_revenue" or "Update building metric" / "Upsert slctrips_amazon_revenue" node.

**Cause:** n8n **community/self-hosted** does **not** support:

- **Environment variables** (`$env.SUPABASE_URL`, `$env.SUPABASE_SERVICE_ROLE_KEY`) – Enterprise only  
- **n8n Variables** (`$vars.*`) – paid feature

The repo workflows use `$env.*` in HTTP nodes, so they fail when n8n denies access. Some runs may succeed if credentials are attached elsewhere or cached; failures are consistent when the node explicitly reads `$env`.

**Fix (choose one):**

| Option | What to do | When to use |
|--------|------------|-------------|
| **A. Hardcode in HTTP nodes** | In the Stripe workflow: open "Update daily_revenue" and "Update building metric" HTTP nodes. Replace `{{ $env.SUPABASE_URL }}` with your Supabase URL (e.g. `https://xxxxx.supabase.co`) and `{{ $env.SUPABASE_SERVICE_ROLE_KEY }}` with your service_role key. Do the same in the Amazon workflow’s "Upsert slctrips_amazon_revenue" node. Save and re-activate. | Local/dev only. Do **not** commit credentials; acceptable for local `.env`-only use. For production, use n8n Cloud/Enterprise or Option B with credential. |
| **B. Use Supabase node instead of HTTP** | Replace the HTTP request nodes with the native **Supabase** node. Select your existing Supabase credential. Use **Execute Function** (or equivalent) to call `increment_daily_revenue` and `upsert_revenue_metric` with the same parameters (e.g. `amount_to_add`, `p_metric_key`, `p_amount_to_add`). No `$env` needed; credential holds URL and key. | Preferred for production; credential stays in n8n, no secrets in workflow JSON. Re-export the workflow after editing and add to repo (e.g. `stripe-revenue-webhook.json` overwrite or a `-supabase-node` variant). |

**Security:** For production, prefer Option B or n8n Cloud/Enterprise so secrets are not in workflow JSON. For local lock-in, Option A is acceptable if `.env` and workflow exports are not committed with real keys.

**Step-by-step (Stripe workflow):**

- **Option A (hardcode):** (1) Open "Update daily_revenue" HTTP node. URL: replace `{{ $env.SUPABASE_URL }}` with your Supabase URL (e.g. `https://xxxxx.supabase.co`)/rest/v1/rpc/increment_daily_revenue. (2) Headers: set `apikey` and `Authorization: Bearer <key>` to your service_role key (Supabase → Settings → API). (3) Repeat for "Update building metric" (URL: …/rpc/upsert_revenue_metric; body stays `p_metric_key`, `p_amount_to_add`). (4) Save and test. Do **not** commit the workflow JSON if it contains the key.
- **Option B (Supabase node):** (1) Delete "Update daily_revenue" HTTP node. Add **Supabase** node → Operation: **Execute Function**, Credential: your Supabase account, Function: `increment_daily_revenue`, Parameter: `amount_to_add` = `{{ $json.amount }}`. (2) Delete "Update building metric" HTTP node. Add Supabase node → Execute Function, Function: `upsert_revenue_metric`, Parameters: `p_metric_key` = `{{ $json.building_metric_key }}`, `p_amount_to_add` = `{{ $json.amount }}` (the Code node outputs `building_metric_key`, not `metric_key`). (3) Save, test, then **Export** and overwrite `workflows/stripe-revenue-webhook.json` so the repo has the credential-free version.

---

### 5.2 Other Stripe workflow failures

If the Stripe workflow still fails after fixing §5.1, check in order:

| Check | What to do |
|-------|------------|
| **RPC permissions** | In Supabase: `increment_daily_revenue` and `upsert_revenue_metric` must be executable by `service_role`. See migrations `001_increment_daily_revenue.sql`, `007_building_scoped_revenue.sql`. |
| **Event shape** | Workflow expects `payment_intent.succeeded` or `charge.succeeded`. Other events (e.g. `invoice.paid`) correctly hit "Respond Skip"; only filter-passing events run the Supabase/HTTP nodes. |
| **HTTP/Supabase node error** | Open a failed execution and see which node failed. Error message will show 4xx/5xx or auth issues. |
| **building_id mapping** | Unknown `metadata.building_id` only skips per-building metric; `daily_revenue` still updates. To add a building, edit the Code node’s `BUILDING_TO_METRIC` and re-export. |

After fixing: run a test payment and confirm a green execution and updated `city_metrics`.

---

## 6. Quick reference

| Item | Value |
|------|--------|
| n8n UI (local) | http://localhost:5678 |
| Stripe webhook path | `/webhook/stripe-webhook` (webhook id: `stripe-revenue`) |
| Env vars (repo HTTP nodes) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **community n8n does not support $env**; use §5.1 (hardcode or Supabase node). |
| Building → metric (Stripe) | B002→slctrips_revenue, B006→abya_revenue, B003→rocksalt_revenue, B010→automation_mrr, B009→pipelineiq_revenue |

See **README.md** in this folder for architecture, credentials, and `city_metrics` schema. See **workflows/README.md** for export/import and naming.

---

## Lock-in checklist (self-audit)

Use this to confirm full lock-in or to report status (e.g. to Director/Chrome extension).

**Final lock-in (6 steps):**

| Step | Action | Notes |
|------|--------|--------|
| 1 | Import Test workflow | `workflows/test-city-metrics-insert.json` (⋯ → Import from File) |
| 2 | Attach Supabase credential | On "Insert city_metrics" node only; Test has no HTTP/$env |
| 3 | Run Test workflow once | Execute → check `city_metrics` for `metric_key = 'test_workflow_insert'` |
| 4 | Import Amazon workflow | `workflows/amazon-commission-to-city-metrics.json` |
| 5 | Fix Amazon HTTP node | Per §5.1: hardcode URL + service_role, or replace with Supabase node Execute Function `upsert_revenue_metric` |
| 6 | Save Amazon workflow | Publish. Stripe already fixed & active = lock-in complete. |

**Full checklist:**

- [ ] n8n running (http://localhost:5678 or production URL)
- [ ] All 3 workflows imported: Stripe, Test, Amazon (see §2.3, §2.4)
- [ ] Supabase credential attached to Test and Amazon; if community n8n, Stripe/Amazon HTTP nodes fixed per §5.1 (hardcode or Supabase node)
- [ ] Test workflow run at least once → row `test_workflow_insert` in `city_metrics`
- [ ] Stripe workflow active; webhook URL and signing secret configured
- [ ] Failed Stripe executions resolved: §5.1 if "access to env vars denied"; §5.2 for RPC, event shape, building_id
- [ ] **If Option A (hardcode) was used:** Do **not** Export or commit the Stripe (or Amazon) workflow JSON — it would contain the service_role key. Keep the fixed workflow only in your local n8n instance. For a shareable version, switch to Option B (Supabase node) and then export.
