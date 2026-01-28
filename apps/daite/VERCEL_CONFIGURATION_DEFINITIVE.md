# Vercel Configuration - DEFINITIVE GUIDE

## ✅ CORRECT Configuration

### Root Directory Setting
**MUST BE SET TO:** `frontend`

**Where to set it:**
- Vercel Dashboard → Your Project → Settings → General
- Under "Build & Development Settings"
- Field: "Root Directory"
- Value: `frontend` (exactly this, no quotes, no trailing slash)

### Why `frontend`?

Your project structure:
```
DAiTE/                          ← Repository root
├── frontend/                   ← THIS is where Next.js lives
│   ├── package.json           ← Contains "next": "^15.0.0"
│   ├── next.config.js         ← Next.js config
│   ├── src/
│   └── ...
├── database/
├── docs/
└── vercel.json                ← This stays in root (fine)
```

**Vercel needs to:**
1. Find `package.json` with Next.js dependency
2. Run `npm install` 
3. Run `next build`

**If Root Directory = `frontend`:**
- ✅ Vercel looks in `frontend/package.json` → finds Next.js
- ✅ Build works

**If Root Directory = empty/blank:**
- ❌ Vercel looks in root `DAiTE/package.json` → Next.js not found
- ❌ Build fails

## Verification Steps

1. **Check Vercel Dashboard:**
   - Go to: https://vercel.com/wasatch-wises-projects/d-ai-te/settings/general
   - Scroll to "Build & Development Settings"
   - "Root Directory" should say: `frontend`

2. **If it's wrong, fix it:**
   - Click "Edit" or the field itself
   - Type: `frontend`
   - Click "Save"

3. **Verify your files exist:**
   ```bash
   # These should exist:
   frontend/package.json       ✅ (has "next": "^15.0.0")
   frontend/next.config.js     ✅
   frontend/src/               ✅
   ```

## After Fixing

1. **Trigger a new deployment:**
   - Option A: Go to Deployments tab → Click "Redeploy" on any deployment
   - Option B: Push to GitHub (auto-deploys if configured)

2. **Watch the build logs:**
   - Should see: "Installing dependencies..."
   - Should see: "next build"
   - Should see: "Build Completed" ✅

## Current Correct Settings Summary

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework | Next.js (auto-detected) |
| Build Command | `next build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` (auto-detected) |

## What NOT to Do

❌ Don't set Root Directory to empty/blank  
❌ Don't set Root Directory to `frontend/` (trailing slash)  
❌ Don't set Root Directory to `.` or `/`  
✅ DO set Root Directory to exactly: `frontend`

## Test After Configuration

Once Root Directory is set to `frontend`, the build should:
1. ✅ Clone repository
2. ✅ Change to `frontend/` directory
3. ✅ Find `package.json` with Next.js
4. ✅ Install dependencies (including Next.js)
5. ✅ Run `next build`
6. ✅ Deploy successfully

