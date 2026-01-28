# Fix Vercel Root Directory Issue

## The Problem

Vercel CLI is looking for `frontend/frontend` because:
1. The `.vercel` folder is inside `frontend/` directory
2. Vercel project settings have Root Directory = `frontend`
3. This causes path doubling

## Solution 1: Fix in Vercel Dashboard (RECOMMENDED)

1. **Go to Vercel Dashboard**
   - https://vercel.com/wasatch-wises-projects/d-ai-te/settings/general

2. **Settings → General → Root Directory**
   - Currently set to: `frontend` ❌
   - **Change to:** (leave blank/empty) ✅
   - OR set to root directory of repo (if deploying from root)

3. **Save Settings**

4. **Try deploying again**
   ```bash
   cd frontend
   vercel --prod
   ```

## Solution 2: Use GitHub Integration (BEST)

Instead of using CLI, just use GitHub integration:
- Vercel Dashboard → Settings → Git
- Verify repository is connected
- Root Directory should be set to `frontend` in dashboard
- Auto-deploy on push to `main`

Then just push to GitHub and it auto-deploys!

## Solution 3: Move .vercel to Root

If you want to deploy from root directory:
```bash
# Move .vercel folder to root
mv frontend/.vercel .vercel

# Deploy from root
cd "/Users/johnlyman/Desktop/John's Stuff/Wasatch Wise/DAiTE"
vercel --prod
```

But Root Directory in Vercel must still be set to `frontend`.

## Quick Check

Run this to see current Vercel config:
```bash
cat frontend/.vercel/project.json
```

Expected: Should show project ID for `d-ai-te`

