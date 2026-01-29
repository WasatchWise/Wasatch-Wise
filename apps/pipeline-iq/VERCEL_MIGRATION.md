# Pipeline IQ (Groove) → Monorepo Vercel Migration

**Live site:** pipelineiq.net  
**Vercel project:** groove (currently connected to standalone Groove repo)

## Pre-flight (in monorepo)

- [x] `vercel.json` in this directory (`apps/pipeline-iq/`) with `framework`, `installCommand`, `buildCommand`, and existing crons
- [ ] Optional: sync latest from standalone WasatchWise/Groove into `apps/pipeline-iq/` if standalone is ahead

## Vercel steps

1. **Vercel → groove project → Settings → Git**
   - **Disconnect** current repository (Groove standalone).

2. **Connect** to `WasatchWise/Wasatch-Wise` (same GitHub org/account).

3. **Settings → General → Root Directory**
   - Set to: **`apps/pipeline-iq`**
   - Save. (This directory contains the Next.js `package.json` and `vercel.json`.)

4. **Env vars**
   - Ensure Supabase, SendGrid, Stripe, cron secrets, and any API keys are set in Vercel. Confirm after first deploy.

5. **Deploy**
   - Push a commit to `main` on Wasatch-Wise, or use **Redeploy** on the latest commit from Wasatch-Wise.

6. **Verify**
   - https://pipelineiq.net
   - Auth / dashboard, projects, contacts, campaigns
   - Cron jobs (scrape, auto-outreach, auto-follow-up, auto-archive, update-goals) remain configured in `vercel.json`

## Root directory note

The Next.js app lives at **`apps/pipeline-iq/`** (single level; no nested `frontend/` like daite). The same directory has crons defined in `vercel.json`; they are preserved in the monorepo config.
