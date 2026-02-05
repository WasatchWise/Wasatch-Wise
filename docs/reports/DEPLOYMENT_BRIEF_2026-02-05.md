# Cabinet deployment brief — 2026-02-05

**Commit:** `3c9e7a2` — fix(trinity): Brands nav/footer to external domains, adultaiacademy.com rewrites  
**Scope:** Monorepo production deployments (main → Production)

---

## Summary

| Project           | State  | Build time | Note                          |
|-------------------|--------|------------|-------------------------------|
| **wasatchwise**   | Error  | 3m 7s      | grooveleads-pro env validation; fix in repo |
| **groove**        | Error  | 18s        | Install failed; fix applied    |
| gmc_mag           | Ready  | 35s        | OK                            |
| the-rings         | Ready  | 44s        | OK                            |
| slctrips          | Ready  | 1m 51s     | OK                            |
| askbeforeyouapp   | Ready  | 1m 2s      | OK                            |
| the-rock-salt     | Ready  | 1m 2s      | OK                            |
| adult-ai-academy  | Ready  | 43s        | OK                            |
| d-ai-te           | Ready  | 45s        | OK                            |

**7 of 9** production deployments are current and ready.

---

## 1. Groove (pipeline-iq / grooveleads-pro) — **fix applied**

**Cause:** Install failed with `ERESOLVE`: root has `react@19.0.0`, while `lucide-react@^0.303.0` (in `apps/pipeline-iq`) only supports `react@^16.5.1 || ^17.0.0 || ^18.0.0`. The groove deployment was using **npm** for install (project or app-level override), so it did not benefit from the root `pnpm.overrides` that pin `lucide-react` to `0.468.0`.

**Change in repo:**

- **`apps/pipeline-iq/package.json`**  
  Pinned `lucide-react` to `0.468.0` (React 19–compatible) so install resolves whether the project uses npm or pnpm.

**Recommended Vercel setting (monorepo alignment):**

- In Vercel → **groove** project → **Settings → Build & Development**:
  - Set **Install Command** to: `pnpm install --frozen-lockfile`  
  - (Or remove the override so the root `vercel.json` `installCommand` is used.)

After the next push (or a redeploy with the dependency change), groove should build successfully. If the groove project is configured with **Root Directory** = `apps/pipeline-iq`, the `lucide-react` pin alone should fix the npm install; if it builds from repo root, switching to pnpm is recommended for consistency.

---

## 2. Wasatchwise — **root cause identified, fix in repo**

**Root cause:** The wasatchwise deployment builds from repo root with `pnpm run build`, so Turbo builds **all** apps—including **grooveleads-pro** (pipeline-iq). The wasatchwise project only deploys the **dashboard** app. grooveleads-pro’s build fails **environment validation** (required at build time):

- `SUPABASE_SERVICE_ROLE_KEY`: Required  
- `ORGANIZATION_ID`: Required  

So the Trinity HCI fixes are fine; the failure is grooveleads-pro (which has its own Vercel project, **groove**) being built unnecessarily and failing on missing env vars.

**Fix applied (in repo):**

- **Root `vercel.json`**  
  Added `buildCommand`: `pnpm --filter dashboard run build` so the wasatchwise deployment builds **only** the dashboard app and skips grooveleads-pro (and other apps) entirely.

**After merge/push:** Redeploy wasatchwise (or let the next push trigger a build). No Vercel UI change needed—the build command is now in code.

---

## Monorepo alignment (principles)

- **Install:** Prefer a single install command for the repo. Root `vercel.json` already sets `installCommand`: `pnpm install --frozen-lockfile`. All Vercel projects that build from the repo root should use this (or leave Install Command unset so this applies).
- **Dependencies:** Use the root `pnpm.overrides` (and, where needed, app-level pins) so that React and key peer deps (e.g. `lucide-react`) are consistent across apps and work with React 19.
- **Build:** Each project’s build command should match the monorepo (e.g. `pnpm run build` at root, or the appropriate `turbo`/filter command if the project is configured that way).

---

## Action items

| Project       | Issue                                      | Fix                                                                 | Status        |
|---------------|--------------------------------------------|---------------------------------------------------------------------|---------------|
| **wasatchwise** | Build failed: grooveleads-pro env validation | Root `vercel.json`: `buildCommand` = `pnpm --filter dashboard run build` | Ready to deploy |
| **groove**      | Install failed: lucide-react peer dep       | `lucide-react` pinned to `0.468.0` in pipeline-iq (committed)       | Ready to redeploy |

**After both fixes deploy:** Run the [Trinity verification checklist](#trinity-verification-checklist) below.

---

## Trinity verification checklist (post-deploy)

Run once wasatchwise deployment succeeds. Goal: confirm God (WasatchWise) → Jesus (ABYA) / Holy Ghost (Adult AI Academy) domain separation.

### Navigation

- [ ] Go to **wasatchwise.com** → **Brands** → **Adult AI Academy** → opens **adultaiacademy.com** in new tab, Adult AI Academy content
- [ ] **Brands** → **Ask Before You App** → opens **askbeforeyouapp.com** in new tab, ABYA content

### Footer

- [ ] On wasatchwise.com footer (Resources): **Adult AI Academy** → adultaiacademy.com (new tab)
- [ ] Footer: **Ask Before You App** → askbeforeyouapp.com (new tab)

### Direct domain

- [ ] Open **adultaiacademy.com** in browser → loads Adult AI Academy content; URL stays adultaiacademy.com (rewrite, not redirect)
- [ ] Open **www.adultaiacademy.com** → same result

### Mobile

- [ ] wasatchwise.com on mobile → hamburger → **Brands** → Adult AI Academy and Ask Before You App links work

### Sign-off

- [ ] All cross-references between Trinity members work → **Trinity LOCKED DOWN**
