# DAiTE → Monorepo Vercel Migration

**Live site:** www.daiteapp.com  
**Vercel project:** d-ai-te (currently connected to standalone DAiTE repo)

## Pre-flight (in monorepo)

- [x] `vercel.json` in this directory (`apps/daite/frontend/`) with `installCommand`, `buildCommand`, and security headers
- [ ] Optional: sync latest from standalone WasatchWise/DAiTE into `apps/daite/` if standalone is ahead

## Vercel steps

1. **Vercel → d-ai-te project → Settings → Git**
   - **Disconnect** current repository (DAiTE standalone).

2. **Connect** to `WasatchWise/Wasatch-Wise` (same GitHub org/account).

3. **Settings → General → Root Directory**
   - Set to: **`apps/daite/frontend`**
   - Save. (This is the Next.js app directory; it contains `package.json` and this `vercel.json`.)

4. **Env vars**
   - Ensure in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and any Gemini/API keys (see `ADD_TO_VERCEL.md` in parent). Confirm after first deploy.

5. **Deploy**
   - Push a commit to `main` on Wasatch-Wise, or use **Redeploy** on the latest commit from Wasatch-Wise.

6. **Verify**
   - https://www.daiteapp.com
   - Auth (login/signup, Supabase callback)
   - Dashboard, Discover, Matches, Messages, Dates, Challenges
   - CYRAiNO onboarding / profile building
   - No "Invalid supabaseUrl" or Supabase errors in console

## Root directory note

The deployable Next.js app is **`apps/daite/frontend/`**. The parent `apps/daite/` contains database scripts, docs, and other assets; only `frontend/` has the Next.js `package.json` and `next build` setup.
