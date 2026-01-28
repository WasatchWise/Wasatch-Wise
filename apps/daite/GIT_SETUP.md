# Git Repository Setup for Vercel

## The Problem
Your local directory isn't a git repository, but Vercel is trying to clone from `github.com/WasatchWise/DAiTE`. The `frontend/` directory needs to be committed and pushed to GitHub so Vercel can see it.

## Solution: Connect to GitHub Repository

### Step 1: Initialize Git (if not already initialized)
```bash
cd "/Users/johnlyman/Desktop/John's Stuff/Wasatch Wise/DAiTE"
git init
```

### Step 2: Connect to GitHub Remote
```bash
git remote add origin https://github.com/WasatchWise/DAiTE.git
```

Or if the remote already exists:
```bash
git remote set-url origin https://github.com/WasatchWise/DAiTE.git
```

### Step 3: Check Current Status
```bash
git status
git remote -v
```

### Step 4: Add and Commit Frontend Directory
```bash
# Add all files (including frontend/)
git add frontend/
git add .
git commit -m "Add frontend Next.js PWA application"
```

### Step 5: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

Or if you already have a main branch with commits:
```bash
git pull origin main --allow-unrelated-histories  # If branches diverged
git push origin main
```

## Verify on GitHub

After pushing, verify on GitHub that:
1. ✅ The `frontend/` directory exists
2. ✅ `frontend/package.json` is visible
3. ✅ `frontend/next.config.js` is visible
4. ✅ `frontend/src/` directory is present

## Then Retry Vercel Deployment

Once `frontend/` is visible on GitHub:
1. Go to Vercel Dashboard
2. Set Root Directory to: `frontend` (no trailing slash)
3. Redeploy

Vercel will now be able to:
- ✅ Clone the repository
- ✅ Find the `frontend/` directory
- ✅ Detect Next.js framework
- ✅ Build successfully

## Quick Commands Summary

```bash
cd "/Users/johnlyman/Desktop/John's Stuff/Wasatch Wise/DAiTE"

# Initialize and connect
git init
git remote add origin https://github.com/WasatchWise/DAiTE.git

# Stage and commit
git add .
git commit -m "Add complete Next.js PWA frontend"

# Push to GitHub
git push -u origin main
```

## If You Get "Remote Already Exists" Error

If the remote already exists, just update it:
```bash
git remote set-url origin https://github.com/WasatchWise/DAiTE.git
git push -u origin main
```

