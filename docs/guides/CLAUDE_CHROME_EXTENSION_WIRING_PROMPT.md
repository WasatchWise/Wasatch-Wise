# Claude Chrome Extension – Wiring Prompt

**Use this when you want the Chrome extension to help wire everything on site:** n8n, Stripe webhooks, Amazon Associates, slctrips, dashboard, and production domains. Cursor handles code/repo; the extension verifies and configures in the browser.

**Context for the extension:** Amazon Associates and TikTok affiliate are **already enrolled**. Do not suggest signing up for those programs. Focus on: payment info (if needed), linking, product lists, disclosure, and verification. See `civilization/realms/wasatchville/docs/AFFILIATE_ENROLLMENT_STATUS.md`.

---

## How to use

1. Open the **Claude Chrome extension** in your browser.
2. Copy the **entire prompt** below (from "You're helping wire…" through "…could check.").
3. Paste into the extension and send.
4. The extension will open the relevant sites, check configs, and report back.
5. Share the **RESULT / FINDINGS / BUGS / NEEDS CURSOR** block with Cursor so code/config fixes can be applied.

**Report format:** The extension should reply with **RESULT**, **FINDINGS**, **BUGS**, and **NEEDS CURSOR**. Anything that requires code, env, or repo changes goes in **NEEDS CURSOR** for Cursor to fix.

---

## Prompt (copy from here)

```
Context: Amazon Associates and TikTok affiliate are ALREADY ENROLLED. Do not suggest signing up. Focus on configuration, payment info, linking, and verification.

You're helping wire the WasatchWise stack end-to-end. You work in the browser; your co-worker (Cursor) owns the codebase. Run these wiring checks and report back in this exact format:

**RESULT:** Pass / Partial / Fail  
**FINDINGS:** [What you observed, with URLs and any errors]  
**BUGS:** [Issues fixable in the UI or by user action]  
**NEEDS CURSOR:** [Issues that require code/config changes—hand these to the dev in Cursor]

---

### 1. n8n (automation backbone)

- **URL:** http://localhost:5678 (user must have run `docker compose up -d` in `infrastructure/n8n` first).
- **Check:** Page loads (no "Cannot connect" or 5xx). If it errors, note: "n8n not reachable – is Docker running? Run `cd infrastructure/n8n && docker compose up -d`."
- **If n8n loads:**
  - **Workflows:** Do you see workflows listed? Expected at least: "Stripe → daily_revenue + per-building metrics", "Test: Insert city_metrics row", and optionally "Amazon Commission → city_metrics". If not, they need to be imported from the repo: `infrastructure/n8n/workflows/*.json` (Workflows → Import from File).
  - **Stripe webhook URL:** For the Stripe workflow, the webhook path is `stripe-webhook` (webhook id `stripe-revenue`). The full URL Stripe must call is: `https://<n8n-host>/webhook/stripe-webhook`. If n8n is only local, that host is localhost – Stripe cannot reach localhost; they need a tunnel (ngrok, Cloudflare Tunnel) or a deployed n8n. Note in FINDINGS: "Stripe webhook full URL: https://______/webhook/stripe-webhook (fill with n8n host)."
  - **Credentials:** We don't need to open credentials; just note if n8n prompts for setup (Supabase, Stripe) – "n8n may need Supabase/Stripe credentials in Settings or per-node."

Report: n8n reachable (yes/no), workflows present (list what you see), and Stripe webhook URL note.

---

### 2. Stripe (webhook → n8n → city_metrics)

- **URL:** https://dashboard.stripe.com (user must be logged in).
- **Go to:** Developers → Webhooks.
- **Check:**
  - Is there an endpoint pointing at n8n? Expected URL pattern: `https://<something>/webhook/stripe-webhook`. If none, BUG: "No Stripe webhook endpoint for n8n. Add endpoint URL: https://<your-n8n-host>/webhook/stripe-webhook."
  - If endpoint exists: Which events are selected? Should include at least `payment_intent.succeeded` and `charge.succeeded` (per repo workflow). Note in FINDINGS.
  - Signing secret: Stripe shows a signing secret (whsec_…). This must be stored in n8n (Credentials or env) for the webhook to verify requests. Note: "Webhook signing secret must be in n8n credentials; not visible here."

Report: Endpoint URL (yes/no, redact full URL if sensitive), events listed, and reminder about signing secret in n8n.

---

### 3. Amazon Associates (SLC Trips / affiliate)

- **URL:** https://affiliate-program.amazon.com (user must be logged in).
- **Check:**
  - **Account status:** Does the account show as active / in good standing? Any warnings about 3 sales in 180 days?
  - **Tracking ID:** Default tag is `wasatchwise20-20`. Note if you see it (e.g. in Tools or account summary).
  - **Product linking:** If you can open the Product Linking or SiteStripe help, note that product links should use format: `https://www.amazon.com/dp/{ASIN}?tag=wasatchwise20-20`. Repo product lists: `infrastructure/n8n/data/amazon/*.json` (ASINs filled via SiteStripe or Product Linking Tool).
- **On-site disclosure:** If you visit slctrips.com or any page with affiliate links, confirm there is a disclosure: "As an Amazon Associate I earn from qualifying purchases." If missing, NEEDS CURSOR: "Add Amazon disclosure to [URL]."

Report: Account status, tag confirmed (or not), disclosure on site (yes/no and URL).

---

### 4. SLC Trips (slctrips.com or app)

- **URL:** Production: https://slctrips.com (or the live URL). Local: http://localhost:3000 (if they're running the slctrips app).
- **Check:**
  - Site loads (no 5xx, no blank page).
  - **TripKits:** If there's a TripKits or guides section, open one link and confirm it loads.
  - **Affiliate / Amazon:** Any "gear" or "what I use" links? Do they use `tag=wasatchwise20-20` (or building tag)? Optional: right‑click a product link → copy link → check for `tag=`.
  - **Bio link / link-in-bio:** If they use Linktree, Beacons, or a custom page (e.g. slctrips.com/links/…), note the URL and that it exists. If they don't have one yet, note: "No central bio link page observed; see AMAZON_N8N_FEBRUARY_PLAN.md for link management options."

Report: slctrips loads (yes/no), TripKits reachable, affiliate links present (yes/no), bio link page (URL or "none").

---

### 5. WasatchWise Dashboard (city_metrics)

- **URL:** Production: https://www.wasatchwise.com/dashboard/command-center (or the dashboard URL). Local: http://localhost:3000/dashboard/command-center (if dashboard app is running).
- **Check:** Page loads. If it's the Wasatchville command center (isometric city, building health), note: "Dashboard loads." If you can trigger a city_metrics update (e.g. run n8n test workflow that inserts a metric), do so and confirm the UI updates (optional). Any console errors? Note in FINDINGS.

Report: Dashboard reachable (yes/no), any console/network errors.

---

### 6. Production domains (quick sanity)

- **www.wasatchwise.com** – Loads over HTTPS? Homepage and nav (e.g. Ask Before You App, Contact) work?
- **www.adultaiacademy.com** – Loads? Shows Adult AI Academy content (not generic WasatchWise)?

If any fail or show wrong content, add to FINDINGS and NEEDS CURSOR if it's a code/deploy issue.

---

### 7. Optional (if time / access)

- **Vercel:** dashboard.vercel.com – WasatchWise (and slctrips if separate) project(s): latest deploy status (Ready / Error). Domains: www.wasatchwise.com, www.adultaiacademy.com, slctrips.com – listed and verified?
- **Supabase:** supabase.com/dashboard – Project used by dashboard/n8n: key tables exist (e.g. city_metrics)? No critical log errors?
- **GitHub:** Repo – main branch exists, latest commit message. Actions (if any): last run success/fail.

---

When you're done, summarize:

- **RESULT:** Pass / Partial / Fail  
- **FINDINGS:** Bullet list with URL and what you saw.  
- **BUGS:** What the user can fix in the browser (e.g. add Stripe webhook, import n8n workflows).  
- **NEEDS CURSOR:** What requires code, env, or config (e.g. add Amazon disclosure, fix webhook URL in docs, add bio link route).

If you couldn't access something (not logged in, no Docker, private dashboard), say so in FINDINGS and still report everything you could check.
```

---

## Where to find more

| Topic | In repo |
|-------|--------|
| **Already enrolled (Amazon, TikTok)** | `civilization/realms/wasatchville/docs/AFFILIATE_ENROLLMENT_STATUS.md` – do not suggest signup |
| n8n setup, workflows, city_metrics | `infrastructure/n8n/README.md`, `infrastructure/n8n/workflows/README.md` |
| Stripe webhook workflow | `infrastructure/n8n/workflows/stripe-revenue-webhook.json` |
| Amazon + n8n February plan | `civilization/realms/wasatchville/docs/AMAZON_N8N_FEBRUARY_PLAN.md` |
| Amazon account, tags, disclosure | `civilization/realms/wasatchville/docs/AMAZON_ASSOCIATES.md` |
| Integration status, verification checklist | `civilization/realms/wasatchville/docs/INTEGRATION_LOG.md` |
| Cursor ↔ Chrome coordination, report format | `docs/plans/CURSOR_CHROME_AGENT_COORDINATION.md` |
| Full production checks (Vercel, Supabase, GitHub) | `docs/guides/CLAUDE_EXTENSION_BROWSER_CHECKS_PROMPT.md` |

---

## After the extension reports back

- **BUGS:** Fix in the browser (add Stripe webhook, import n8n workflows, verify domains).
- **NEEDS CURSOR:** Paste the list into Cursor; Cursor will fix code, env, or docs and can re-assign a verification task to the extension if needed.
