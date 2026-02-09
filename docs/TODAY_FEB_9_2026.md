# Today: Feb 9, 2026 (~3:00 PM)

**Goal:** Infrastructure underneath the newsletter—not the newsletter itself. One clear list, one clear way to send, so when you’re ready for newsletter you’re not scrambling.

---

## What you do (15 min max)

### 1. Git cleanup (once, 30 sec)

```bash
git update-ref -d "refs/heads/main 2"
git remote prune origin
```

### 2. GA4 data streams (if not done)

- Open [Google Analytics](https://analytics.google.com) → property **wasatch-wise-hq**.
- **Admin** → **Data Streams**.
- Add/confirm a **Web** stream for:
  - **wasatchwise.com** (production URL)
  - **askbeforeyouapp.com** (production URL)
- Same measurement ID everywhere is fine; streams separate traffic by site.

### 3. Decide: how do we send email?

| Option | Effort | Cost |
|--------|--------|------|
| **Keep Resend** (current) | None | Paid tier when you scale |
| **Switch to Google Apps Script** | ~15 min once | $0 (Gmail/Workspace) |

- If **Resend**: no change. Contact form, quiz, and audit already use it.
- If **Apps Script**: open [docs/GOOGLE_APPS_SCRIPT_SENDGRID_REPLACEMENT.md](../GOOGLE_APPS_SCRIPT_SENDGRID_REPLACEMENT.md), create the script, deploy as Web App, add `GOOGLE_APPS_SCRIPT_EMAIL_URL` and `GOOGLE_APPS_SCRIPT_EMAIL_TOKEN` to the **dashboard** project in Vercel. Then we can point the contact form (and later newsletter) to that URL.

One decision, then either “do nothing” or “deploy script + add 2 env vars.”

---

## What’s already in place (no action)

- **List:** `email_captures` in Supabase. Contact form, AI Readiness Quiz, and Audit all write there with `source` and `lead_magnet`. Newsletter signups can go to the same table (e.g. `source: 'newsletter'` or a dedicated lead_magnet).
- **Sending:** Dashboard uses Resend (see [apps/dashboard/lib/email/send.ts](../apps/dashboard/lib/email/send.ts)). Apps Script is an alternative, not required for infra.
- **Content:** Blog → n8n RSS → Claude → Google Sheet (social copy) is in [infrastructure/n8n/workflows/RSS_TO_SOCIAL_SETUP.md](../infrastructure/n8n/workflows/RSS_TO_SOCIAL_SETUP.md). Newsletter “get latest post + send to list” comes later.

---

## When you’re ready for the newsletter

1. Add a “Newsletter” or “Weekly brief” signup (form or CTA) that inserts into `email_captures` with a consistent `source` or `lead_magnet`.
2. Use the same sender you chose above (Resend or Apps Script) to send.
3. Optionally: n8n workflow “every week: get latest from blog/Sheet → build email → send to list from Supabase.”

No new infra needed beyond what you set up today (list + sender).

---

## Summary

| Task | Who | Time |
|------|-----|------|
| Git prune | You | 30 sec |
| GA4 streams | You | 2–5 min |
| Resend vs Apps Script | You (decision) | 0 or ~15 min |
| Newsletter-ready doc / optional table | Already done above | — |

After this, “infrastructure underneath the newsletter” is done. Newsletter setup is just: add signup → same list, same sender.
