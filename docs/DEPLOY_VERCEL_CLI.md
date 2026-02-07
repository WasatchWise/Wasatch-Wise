# Vercel CLI Deployment Guide

## Why "Deploying..." Hangs

When you run `vercel deploy --prod`, the CLI shows "Deploying" immediately but can appear to hang for 5–15+ minutes. This is normal for a large monorepo.

**Root cause** (from tracing the [Vercel CLI source](https://github.com/vercel/vercel)):

1. **Before the first event** – the CLI must:
   - `buildFileTree()` – scan the entire project (respecting `.vercelignore`)
   - `hashes()` – compute SHA hashes for every file (or pack with `--archive=tgz`)

2. The "Deploying" spinner runs during this phase. No progress is shown until the first event (`hashes-calculated`) is yielded.

3. For a monorepo with many apps, docs, and source files, hashing thousands of files is CPU-intensive and slow.

## Faster Deploys

### Use `--archive=tgz`

This packs the project into a tarball before upload instead of hashing each file. Often significantly faster:

```bash
vercel deploy --prod --yes --archive=tgz
```

### Enable debug output

To see what the CLI is doing:

```bash
DEBUG=1 vercel deploy --prod --yes
```

### Don't wait for build (`--no-wait`)

Get the deployment URL immediately without waiting for the remote build:

```bash
vercel deploy --prod --yes --no-wait
```

## `.vercelignore` (Root)

The root `.vercelignore` excludes everything not needed by the dashboard build:

- Large directories: `Documents/`, `Archive/`, `Media/`, `WolfTok/`, `civilization/`, `infrastructure/`, `docs/`, `scripts/`
- All non-dashboard apps: `apps/ask-before-you-app/`, `apps/slctrips/`, `apps/rock-salt/`, etc.
- Media files, build artifacts, and misc

This keeps the file count low for CLI deploys from root. Each app that deploys independently (ABYA via Git, SLCTrips, etc.) uses its own Vercel project with its own root directory, so the root `.vercelignore` doesn't affect them.

## Projects in This Monorepo

| Project | Vercel Project | Root Dir | Deploy Method |
|---------|----------------|----------|---------------|
| Dashboard | wasatchwise | (root) | CLI from repo root |
| Ask Before You App (askbeforeyouapp.com) | ask-before-you-app | apps/ask-before-you-app | **Git push** (primary) or CLI from that dir |
| SLCTrips | slctrips-v2 | apps/slctrips | Separate project |
| Rock Salt | the-rock-salt | apps/rock-salt | Separate project |
| Others | Various | Various | Git or CLI |

**ABYA** is typically deployed via **Git integration**: push to `main` and Vercel deploys automatically. The project uses Root Directory `apps/ask-before-you-app`. See [DEPLOY_ASKBEFOREYOUAPP_COM.md](../apps/ask-before-you-app/docs/DEPLOY_ASKBEFOREYOUAPP_COM.md).

## Deploy Commands

### Using the deploy script (recommended)

```bash
./scripts/deploy.sh dashboard   # Deploy dashboard only
./scripts/deploy.sh abya        # Deploy ABYA only
./scripts/deploy.sh             # Deploy both (default)
```

### Deploy Dashboard (wasatchwise project)

From repo root:

```bash
vercel deploy --prod --yes --archive=tgz
```

### Deploy ABYA via CLI (ask-before-you-app project)

ABYA is usually deployed via Git. To force a CLI deploy:

```bash
cd apps/ask-before-you-app
vercel link  # link to ask-before-you-app project if not already
vercel deploy --prod --yes --archive=tgz
```

Note: ABYA's `vercel.json` expects to run from monorepo context (`cd ../..`), so the project needs Root Directory set to `apps/ask-before-you-app` in Vercel Dashboard.

## Troubleshooting

- **15,000-file limit:** Use `--archive=tgz` (already in deploy script). Also ensure `.vercelignore` excludes unused apps.
- **Still hangs:** Run with `DEBUG=1` and watch for `Building file tree...` and `Found N files`. Large N = slow.
- **Timeouts in Cursor/sandbox:** Run `vercel deploy` in your own terminal – builds can take 10+ minutes.
- **Wrong app deployed:** Check Vercel project Settings → Root Directory. ABYA needs `apps/ask-before-you-app`.
- **npm login expired:** If `npm i vercel@latest` fails, run `npm logout` then `npm login` to refresh the token.
