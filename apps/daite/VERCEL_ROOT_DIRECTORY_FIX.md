# Vercel Root Directory Fix

## The Problem

When running `vercel --prod` from inside the `frontend/` directory, you get:
```
Error: The provided path "~/Desktop/John's Stuff/Wasatch Wise/DAiTE/frontend/frontend" does not exist.
```

This happens because:
- You're running `vercel --prod` from inside `frontend/` directory
- Vercel project settings have Root Directory set to `frontend`
- So it's looking for `frontend/frontend` (doubled)

## Solution: Fix in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - https://vercel.com/wasatch-wises-projects/d-ai-te/settings

2. **Settings → General**
   - Find "Root Directory"
   - **Option A** (Recommended): Set to `frontend` and run CLI from repo root
   - **Option B**: Set to empty/root (leave blank) if running from `frontend/` directory

3. **Recommended Configuration**
   - Root Directory: `frontend`
   - Then always run `vercel --prod` from the **repository root** (not from inside frontend/)
   - OR use GitHub integration (auto-deploys on push)

## Quick Fix: Deploy from Root Directory

```bash
# From repository root (NOT from inside frontend/)
cd "/Users/johnlyman/Desktop/John's Stuff/Wasatch Wise/DAiTE"
vercel --prod --cwd frontend
```

Or better yet, just use GitHub integration and let it auto-deploy when you push!

