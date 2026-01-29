# Streamlining: Move Vercel from Standalone Repos to Monorepo

**Short answer:** The standalones don’t need to be “moved into” the monorepo — the code is already in `apps/`. Streamlining means **pointing each Vercel project at `Wasatch-Wise` and setting the correct Root Directory**.

---

## Current state

| Vercel Project    | Domain              | Today’s Git Repo        | In Monorepo?        |
|-------------------|---------------------|--------------------------|---------------------|
| wasatchwise       | wasatchwise.vercel.app | Wasatch-Wise ✅        | apps/dashboard       |
| askbeforeyouapp   | willoh-puce.vercel.app | Wasatch-Wise ✅        | apps/ask-before-you-app |
| **slctrips**      | www.slctrips.com    | slctrips-v2 (standalone) | apps/slctrips ✅     |
| **the-rock-salt** | www.therocksalt.com | therocksalt (standalone) | apps/rock-salt ✅    |
| the-rings        | www.getintherings.com | Wasatch-Wise ✅        | apps/the-rings/TheRings/app |
| d-ai-te          | www.daiteapp.com     | Wasatch-Wise ✅         | apps/daite/frontend  |
| **groove**       | pipelineiq.net       | Groove (standalone)     | apps/pipeline-iq ✅  |
| **adult-ai-academy** | adult-ai-academy.vercel.app | adultaiacademy (standalone) | apps/adult-ai-academy ✅ |
| gmc_mag           | gmcmag.vercel.app    | — (not connected)       | apps/gmc-mag         |
| www.johnlyman.net | www.johnlyman.net    | Lyman (standalone)      | (not in monorepo)    |

**Bold** = still on a standalone repo but the app already exists under `apps/`.

**Migration progress (6 of 7):** gmc_mag ✅, adult-ai-academy ✅, slctrips ✅, rock-salt ✅, the-rings ✅, daite ✅ → remaining: pipeline-iq (Groove).

---

## Do standalones need to be under the monorepo?

**Functionally, no.** You can keep deploying from separate repos.

**For streamlining, yes — use the monorepo:**

- One repo to manage (Wasatch-Wise).
- One place for shared config (Turborepo, MCP, docs).
- Same pattern as ABYA and dashboard.
- Fewer repos to maintain and secure.

The code is already in `apps/`; the only change is **where Vercel pulls from** and the **Root Directory** per project.

---

## Important: Sync before switching

Standalone repos may have **newer commits** than the monorepo copy. Before you point Vercel at the monorepo:

1. **Compare** the standalone’s `main` with `apps/<app>/` in Wasatch-Wise (e.g. diff or “last updated”).
2. If the standalone is ahead, **merge or copy** the missing changes into the monorepo (e.g. merge the standalone into a branch, then into `main` of Wasatch-Wise, or one-time copy of changed files).
3. **Then** switch the Vercel project to Wasatch-Wise and set Root Directory.

Otherwise you might deploy an older version from the monorepo.

---

## Vercel settings per project (after sync)

| Vercel Project    | New Git Connection | Root Directory              |
|-------------------|--------------------|-----------------------------|
| slctrips          | WasatchWise/Wasatch-Wise | `apps/slctrips`        |
| the-rock-salt     | WasatchWise/Wasatch-Wise | `apps/rock-salt`       |
| the-rings         | WasatchWise/Wasatch-Wise | `apps/the-rings/TheRings/app` |
| d-ai-te           | WasatchWise/Wasatch-Wise | `apps/daite/frontend`  |
| groove            | WasatchWise/Wasatch-Wise | `apps/pipeline-iq`     |
| adult-ai-academy  | WasatchWise/Wasatch-Wise | `apps/adult-ai-academy` |
| gmc_mag           | WasatchWise/Wasatch-Wise | `apps/gmc-mag` (after connecting Git) |

**Lyman (www.johnlyman.net):** Only move if you add it to the monorepo (e.g. `apps/lyman`); otherwise leave it on WasatchWise/Lyman.

---

## Step-by-step (one project at a time)

1. **Sync code** (if needed): Merge or copy latest from standalone into `apps/<app>/` in Wasatch-Wise; push to `main`.
2. **Vercel:** Project → Settings → Git → **Disconnect** current repository.
3. **Vercel:** **Connect** to `WasatchWise/Wasatch-Wise` (same GitHub account/org).
4. **Vercel:** Settings → General → **Root Directory** → set to the value in the table (e.g. `apps/slctrips`). Save.
5. **Env vars:** Already in Vercel; no need to re-add unless you use different names. Double-check after first deploy.
6. **Deploy:** Trigger a deploy (e.g. push a small commit or “Redeploy” in Vercel).
7. **Test:** Hit the production URL and key flows (auth, payments, etc.).
8. **Optional:** Archive the old standalone repo on GitHub (e.g. WasatchWise/slctrips-v2) so it’s read-only and clearly deprecated.

Repeat for the next project. Easiest to start with the one that changes least (e.g. adult-ai-academy or gmc-mag).

---

## Suggested order

1. **gmc_mag** — Connect Git to Wasatch-Wise, Root Directory `apps/gmc-mag` (no standalone to sync).
2. **adult-ai-academy** — Usually low churn; sync then switch.
3. **slctrips** — High traffic; sync carefully, then switch and test.
4. **the-rock-salt** — Same idea; sync then switch.
5. **the-rings** — Root is `apps/the-rings/TheRings/app` (Next.js app lives in `app/`; `vercel.json` added there).
6. **d-ai-te** — Root is `apps/daite/frontend`.
7. **groove** (Pipeline IQ) — Root is `apps/pipeline-iq`.

---

## After everything is on the monorepo

- Update **CORPORATE_INFRASTRUCTURE.md** so every Vercel project lists Git = Wasatch-Wise and its Root Directory.
- Optionally **archive** the old GitHub repos (slctrips-v2, therocksalt, TheRings, DAiTE, Groove, adultaiacademy) so the single source of truth is Wasatch-Wise.

If you tell me which project you want to do first (e.g. slctrips or adult-ai-academy), I can give a concrete sync + Vercel checklist for that one.

---

**gmc_mag:** After connecting Vercel to Wasatch-Wise and setting Root Directory to `apps/gmc-mag`, trigger a **new** deployment (push to main or use Vercel "Redeploy" from the *new* repo's latest commit). Do not "Redeploy" an old deployment—that reuses a commit from the previous repo.
