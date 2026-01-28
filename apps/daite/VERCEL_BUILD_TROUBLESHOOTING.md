# Next.js + Vercel Build Troubleshooting Guide

## Step 1: Clean Everything and Reinstall

```bash
# Remove all generated files and caches
rm -rf node_modules .next yarn.lock .yarn/cache

# Clear yarn cache
yarn cache clean

# Fresh install
yarn install

# Verify build works locally
yarn build
```

## Step 2: Commit Changes

After a clean install, these files typically change:
- `package.json` (version pinning)
- `yarn.lock` (fresh lockfile)
- `tsconfig.json` (Next.js may auto-update jsx setting)

```bash
git add package.json yarn.lock tsconfig.json
git commit -m "Fix dependencies and rebuild lockfile"
git push origin main
```

## Step 3: Handle Git Lock Issues

If you get "fatal: cannot lock ref 'HEAD'" error:

```bash
rm -f .git/refs/heads/main.lock
```

## Step 4: Handle Corrupted Git Refs

If git fetch fails with "bad object refs/remotes/origin/dependabot":

```bash
rm -rf .git/refs/remotes/origin/dependabot
git fetch origin main
```

## Step 5: Force Vercel Deploy (if webhook doesn't trigger)

GitHub → Vercel webhooks sometimes fail silently. Force deploy via CLI:

```bash
vercel --prod
```

## Notes

- The "lockfile missing swc dependencies" warning is cosmetic and doesn't affect builds
- If you see `package-lock.json` warning, delete it (don't mix npm/yarn)
- Always verify git status shows "up to date with origin/main" before assuming push worked

