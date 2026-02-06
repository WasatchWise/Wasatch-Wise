# SendGrid → Google Workspace Migration Checklist (PipelineIQ)

**Context:** PipelineIQ email pipeline for **Mike@GetGroovin** (and related senders) currently uses SendGrid. Free tier ends **March 1, 2026**. This doc maps every integration point so you can rewire to Google when ready.

**Related:** `docs/guides/GOOGLE_CLOUD_AND_WORKSPACE_SETUP.md` for GCP/Workspace setup. Other apps in the monorepo that also use SendGrid: **slctrips**, **gmc-mag**, **the-rings** — migrate those separately when needed.

---

## Your options (recap)

| Option | Best for | Limit | Effort |
|--------|----------|--------|--------|
| **Google SMTP Relay** | Easiest swap | ~10k/day | Minimal code: swap SMTP creds |
| **Gmail API** | Transactional, full control | ~2k/day | One adapter layer |
| **Google Cloud Email API** | Scale / pay‑as‑you‑go | High | More setup |

**Recommendation:** Start with **Google SMTP Relay** (or Gmail API if you want open/click in your own DB). PipelineIQ already has a single send abstraction in `lib/utils/sendgrid.ts` — swapping that to a “send via Google” implementation will cover most call sites.

---

## PipelineIQ: Where SendGrid is used

### 1. Core send layer (single point to replace)

| File | What it does |
|------|----------------|
| `lib/utils/sendgrid.ts` | `sendEmailWithSendGrid()` — used by most flows. **Replace this with a Google-based sender** (SMTP or Gmail API) and keep the same interface. |

**Env vars today:** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME` (fallback: `GMAIL_USER`, `msartain@getgrooven.com`).

**After migration:** e.g. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (App Password) for Google SMTP, or Gmail API credentials.

---

### 2. Call sites (all use the util or @sendgrid/mail)

| File | Usage |
|------|--------|
| `app/api/cron/auto-outreach/route.ts` | `sendEmailWithSendGrid()` — automated outreach |
| `app/api/cron/auto-follow-up/route.ts` | `sendEmailWithSendGrid()` — follow-ups |
| `app/api/follow-up/route.ts` | `sendEmailWithSendGrid()` — manual follow-up |
| `app/api/send-email/route.ts` | `@sendgrid/mail` directly — **needs to be switched to your new sender** |
| `app/api/workflows/warm-call/trigger/route.ts` | `@sendgrid/mail` directly — warm-call emails; **switch to new sender** |
| `lib/workflows/warm-call/notification-service.ts` | `sendEmailWithSendGrid()` — warm-call notifications |
| `lib/notifications.ts` | `@sendgrid/mail` — alerts (e.g. `alerts@pipelineiq.net`); **switch to new sender** |
| `scripts/dispatch-emails.ts` | `sendEmailWithSendGrid()` |
| `scripts/full-blast-send.ts` | `sendEmailWithSendGrid()` + SendGrid suppression APIs (bounces, blocks, unsubscribes) |

**Action:** Either (a) make all of these use a single `sendEmail()` that backs onto Google, or (b) keep `sendEmailWithSendGrid` but implement it with Google under the hood.

---

### 3. SendGrid-specific APIs (need Google equivalents or workarounds)

| File | What it does |
|------|----------------|
| `scripts/full-blast-send.ts` | Fetches **suppression lists** from SendGrid: bounces, blocks, unsubscribes (`https://api.sendgrid.com/v3/suppression/*`). |
| `scripts/cleanup-bounces.ts` | Fetches bounces/blocks from SendGrid and syncs to your DB. |

**After migration:** Google doesn’t expose the same suppression APIs. Options: (1) maintain your own suppression table from **Gmail SMTP bounce feedback** or **Gmail API** (if used), (2) use **Google Workspace Admin** / support for block lists, or (3) rely on your existing DB if you already sync bounces there.

---

### 4. Webhooks (open/click/events)

| File | Purpose |
|------|--------|
| `app/api/webhooks/sendgrid/route.ts` | SendGrid Event Webhook → writes open/click/bounce etc. to your DB. |
| `app/api/webhooks/streak/route.ts` | Handles **SendGrid** webhook format (and Streak); updates activity from email events. |

**Env:** `SENDGRID_WEBHOOK_PUBLIC_KEY` for signature verification.

**After migration:**  
- **Gmail API:** track opens/clicks yourself (e.g. tracking pixels, link redirects) and write to the same DB tables.  
- **Google SMTP only:** no built-in webhook; you’d add your own open/click tracking (pixel + redirect endpoint) if you need it.

---

### 5. Env and secrets

**PipelineIQ (.env / Vercel):**

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL` (e.g. Mike@GetGroovin / noreply)
- `SENDGRID_FROM_NAME`
- `SENDGRID_WEBHOOK_PUBLIC_KEY` (webhook verification)

**Already in `.env.example` (SMTP fallback):**  
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` — can be repurposed for Google SMTP.

**GitHub Actions:**  
`.github/workflows/scheduled-outreach.yml` passes `SENDGRID_API_KEY`; switch to Google SMTP (or Gmail API) secrets when you migrate.

---

### 6. DNS (deliverability)

**Current (SendGrid):** SPF often includes `include:sendgrid.net`; DKIM from SendGrid dashboard.

**After migration:**  
- **Google SMTP / Gmail API:** SPF should include Google’s sending IPs (e.g. `include:_spf.google.com`).  
- Add/update DKIM in Google Admin (Workspace) or Gmail API domain verification.  
- Keep or add DMARC.

See `HCI_RUNTHROUGHS_MIKE.md` (SPF/DKIM/DMARC) and update for Google.

---

## Mike@GetGroovin pipeline – what to confirm when you migrate

1. **Triggers:** Which flows send as Mike@GetGroovin? (auto-outreach, follow-up, warm-call, send-email, etc.) — all are listed above.
2. **From/Reply-To:** Keep `SENDGRID_FROM_EMAIL` / `SENDGRID_FROM_NAME` (or equivalent) so “Mike Sartain” / reply-to stays correct.
3. **Tools:** Any Zapier/Make/n8n that send via SendGrid for GetGroovin should be switched to Google SMTP (or your new endpoint) in the same timeframe.
4. **Suppression:** If you rely on SendGrid’s suppression lists, plan the “own table + bounce handling” or Google-side approach before turning off SendGrid.

---

## Pre-migration checklist (when you’re ready)

- [ ] Choose: Google SMTP Relay vs Gmail API (vs both: SMTP for send, API for tracking).
- [ ] Implement `sendEmailWithGoogle()` (or refactor `sendEmailWithSendGrid` to use Google under the hood) in `lib/utils/` and keep same `SendGridEmailParams`-style interface where possible.
- [ ] Replace direct `@sendgrid/mail` usage in `app/api/send-email/route.ts`, `app/api/workflows/warm-call/trigger/route.ts`, `lib/notifications.ts` with the new sender.
- [ ] Decide open/click strategy: Gmail API or your own pixel + redirect; update `app/api/webhooks/sendgrid` or add new endpoint and DB writes.
- [ ] Plan suppression: own table + bounce handling or Google Admin; update `scripts/full-blast-send.ts` and `scripts/cleanup-bounces.ts` to use it.
- [ ] Add/update env vars (e.g. Google SMTP or Gmail API) in `.env.example`, Vercel, and GitHub Actions.
- [ ] Update DNS: SPF, DKIM, DMARC for Google sending.
- [ ] Test: send from each flow (auto-outreach, follow-up, warm-call, send-email, alerts) and verify Mike@GetGroovin and any other senders.
- [ ] Remove or archive: `SENDGRID_*` env vars, SendGrid webhook config, and (optional) `@sendgrid/mail` dependency.

---

## Other apps in the repo (for later)

- **slctrips:** Stripe webhook, trip kits, welcome wagon, resend confirmation — all use `@sendgrid/mail`; separate migration.
- **gmc-mag:** `scripts/send-to-jordi.js` uses SendGrid API.
- **the-rings:** `app/src/app/api/feedback/route.ts` uses SendGrid API.

You can do PipelineIQ first (Mike@GetGroovin), then the others when you’re ready.

---

*Doc created so you have one place to rewire SendGrid → Google when the time comes. No rush until March 1, 2026.*
