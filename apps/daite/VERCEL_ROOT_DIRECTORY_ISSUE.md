# Vercel Root Directory Fix - Next.js Not Detected

## The Problem

Vercel error: `No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.`

## The Solution

The Root Directory in Vercel must be set to `frontend` (where your `package.json` with Next.js is located).

## Quick Fix Steps

1. **Go to Vercel Dashboard**
   - https://vercel.com/wasatch-wises-projects/d-ai-te/settings/general

2. **Find "Root Directory"**
   - Under "Build & Development Settings"
   - Should be set to: `frontend` ✅
   - **NOT** empty or blank ❌
   - **NOT** `frontend/` (with trailing slash) ❌

3. **If it's wrong, fix it:**
   - Type: `frontend` (exactly like this, no quotes, no trailing slash)
   - Click "Save"

4. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on the failed deployment
   - OR trigger a new deployment with a push

## Why This Happens

- Your `package.json` with Next.js is in `frontend/package.json`
- If Root Directory is empty/blank, Vercel looks in the repo root (where there's no package.json)
- Root Directory must point to the folder containing your Next.js app

## Verification

After fixing, the build should show:
- ✅ "Installing dependencies..."
- ✅ "next build"
- ✅ Build completes successfully

## Current Correct Configuration

- **Root Directory**: `frontend`
- **Framework**: Next.js (auto-detected)
- **package.json location**: `frontend/package.json`
- **Next.js version**: 15.0.0 (in dependencies)

