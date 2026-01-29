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

---

## Troubleshooting: Build succeeds but site shows error in browser

If the Vercel deployment is **Ready** and runtime logs show 200s, but https://pipelineiq.net shows an error page:

### 1. Environment variables (most likely)

**Reconnecting Git does not copy env vars.** After connecting the monorepo, confirm in **Vercel → Settings → Environment Variables** that these exist for **Production** (and Preview if you use previews):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | App throws at runtime if missing (`lib/supabase/client.ts`, `server.ts`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Same as above |
| `MAIN_DOMAIN` | No | Defaults to `pipelineiq.net` in middleware |
| Cron secrets / SendGrid / Stripe / etc. | Per feature | See `.env.example` and `VERCEL_ENV_SETUP.md` |

If Supabase vars were only in the old Groove project, re-add them in the groove project (or re-import from the old project if Vercel supports it). Then **Redeploy** so the new build gets the vars.

### 2. Service worker / cache

The app registers a service worker (`/sw.js`). An old SW can serve a cached error page.

- Try **Incognito/Private** window, or  
- **Hard refresh**: DevTools → Application → Service Workers → Unregister, then reload, or  
- Open the **Vercel deployment URL** directly (e.g. `groove-git-main-wasatch-wises-projects.vercel.app`) to bypass custom domain/DNS.

### 3. Confirm what’s actually failing

- **Vercel deployment URL** (from the deployment’s “Domains” list): does the error appear there too? If it works there but not on pipelineiq.net, the issue is DNS or domain config.
- **Build logs**: any warnings about missing env at build time?
- **Runtime logs**: 500s or only 200/304? 500s suggest server-side throw (often missing env).
