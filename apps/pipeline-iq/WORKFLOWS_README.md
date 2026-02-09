# Pipeline IQ – Upload & Email Only (No Scraping)

Pipeline IQ is maintained for **uploading data** and **sending emails** only. Scraping (Construction Wire, etc.) is no longer used; data is brought in via other means.

## What Pipeline IQ does now

1. **Upload** – Add projects and contacts manually (dashboard), or via any import/API you use. No scheduled scrapers.
2. **Send emails** – Use the in-app email flows and `/api/send-email` (SendGrid or, when migrated, Google Apps Script). Cron jobs for auto-outreach and follow-up can stay if you use them.

## GitHub Actions

- The root workflow that ran the Construction Wire scraper has been **removed** (no more scheduled or manual scrapes).
- Any workflows under `apps/pipeline-iq/.github/workflows/` are **not run by GitHub** (only root `.github/workflows/` runs) and are effectively deprecated. You can delete that folder if you want to tidy up.

## Email configuration

- **SendGrid:** Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` (or org config) for `/api/send-email`, campaigns, follow-ups, and warm-call notifications.
- **Optional migration:** See repo `docs/GOOGLE_APPS_SCRIPT_SENDGRID_REPLACEMENT.md` to replace SendGrid with Google Workspace (Gmail API via Apps Script) for zero-cost sending.

## Verifying upload + email

- **Upload:** Dashboard → Projects (add project) or Contacts; use any existing import scripts/APIs you have.
- **Email:** Dashboard → send from a contact/project, or call `POST /api/send-email` with valid auth and payload.
