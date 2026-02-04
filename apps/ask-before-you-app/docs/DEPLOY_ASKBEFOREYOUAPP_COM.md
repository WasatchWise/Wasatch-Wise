# Get the Designed ABYA App Live at askbeforeyouapp.com

**Problem:** askbeforeyouapp.com in the browser doesn’t match what we designed. The designed app lives in this repo at `apps/ask-before-you-app`. This checklist gets that app deployed and the domain pointing to it.

---

## 0. Fix the build (lucide-react)

Recent Vercel builds were failing with:

```text
Module not found: Can't resolve './shared/src/utils.js' (in lucide-react)
Module not found: Can't resolve './icons/map-pin.js' (in lucide-react)
```

This comes from **lucide-react 0.562.x** with Next.js 15. The repo is set up to fix it by:

1. **Root `package.json`** has a **pnpm override** so `lucide-react` is resolved to **0.468.0** (and the root dependency is set to `0.468.0`).
2. **You must update the lockfile once** so Vercel gets that version:
   - From repo root run: **`pnpm install --no-frozen-lockfile`**
   - Commit the updated **`pnpm-lock.yaml`** and push.

Vercel uses **`pnpm install --frozen-lockfile`**, so the lockfile must already contain 0.468.0. After you push the updated lockfile, the next deploy should build successfully.

If you prefer not to change the lockfile for the whole monorepo, you can remove the override and pin only in `apps/ask-before-you-app/package.json` to `"lucide-react": "0.468.0"`, then run `pnpm install --no-frozen-lockfile` and commit the lockfile so ABYA’s dependency is 0.468.0.

---

## 1. Confirm the app builds

From the **repo root**:

```bash
pnpm run build --filter=ask-before-you-app
```

If this fails, fix the build (TypeScript, lint, missing deps) before deploying.

---

## 2. Vercel project that serves askbeforeyouapp.com

One Vercel project should own **askbeforeyouapp.com** (and **www.askbeforeyouapp.com**) and deploy **this** app.

### 2.1 Which project?

- In [Vercel Dashboard](https://vercel.com/dashboard), find the project that has **askbeforeyouapp.com** (or **www.askbeforeyouapp.com**) under **Settings → Domains**.
- Doc reference: that project is often named **askbeforeyouapp** (e.g. `willoh-puce.vercel.app`), and should be connected to the **Wasatch-Wise** repo.

### 2.2 Git and root directory

- **Repository:** Connected to **WasatchWise/Wasatch-Wise** (or your monorepo repo).
- **Root Directory:** **`apps/ask-before-you-app`** (required so Vercel builds this app, not the dashboard or another app).

If Root Directory is blank or something else (e.g. `apps/dashboard`), the wrong app is being built. Set it to **`apps/ask-before-you-app`** and save.

**Important:** Enter the value with **no leading or trailing spaces**. If you see the build error *"The specified Root Directory \"   apps/ask-before-you-app\" does not exist"*, the field has extra spaces—clear it and type exactly: `apps/ask-before-you-app`.

### 2.3 Build and install (monorepo)

This app’s **`vercel.json`** already sets:

- **Install Command:** `cd ../.. && pnpm install --frozen-lockfile` (run from monorepo root).
- **Build Command:** `cd ../.. && pnpm run build --filter=ask-before-you-app`.

So Vercel should **not** override these with “auto” for a monorepo. In the project:

- **Settings → General:**  
  - **Root Directory:** `apps/ask-before-you-app`  
  - **Build Command:** leave empty to use the app’s `vercel.json`, or set explicitly: `cd ../.. && pnpm run build --filter=ask-before-you-app`  
  - **Install Command:** leave empty to use the app’s `vercel.json`, or set: `cd ../.. && pnpm install --frozen-lockfile`

If the project was created without “Root Directory”, Vercel may be building from the repo root and serving a different app (e.g. dashboard). **Setting Root Directory to `apps/ask-before-you-app` is the critical fix.**

---

## 3. Domains

- **Settings → Domains:**  
  - **askbeforeyouapp.com** and **www.askbeforeyouapp.com** should both be listed and point to **this** project.
- If they’re on a different project (e.g. a “coming soon” or dashboard project), **remove** them from that project and **add** them to the project that builds `apps/ask-before-you-app`.

DNS (e.g. Cloudflare) should point **askbeforeyouapp.com** and **www** to Vercel (CNAME to `cname.vercel-dns.com` or the value Vercel shows). If that’s already set, no DNS change is needed when you only fix the Vercel project and redeploy.

---

## 4. Deploy the latest design

1. **Push** your latest ABYA changes to the branch Vercel deploys from (usually `main`).
2. In Vercel, either let the push trigger a deploy or use **Deployments → Redeploy** on the latest deployment.
3. After the deploy succeeds, open **https://askbeforeyouapp.com** (and **https://www.askbeforeyouapp.com**). You should see the designed app: campaign home, “Ask Before You App”, nav to Learn, Certification, State resources, etc.

---

## 5. If it still shows the wrong site

- **Wrong app (e.g. dashboard or “coming soon”):** The domain is almost certainly still assigned to a different Vercel project, or Root Directory is wrong. Re-check **Settings → Domains** (which project owns the domain) and **Settings → General → Root Directory** (`apps/ask-before-you-app`).
- **Build error: "The specified Root Directory does not exist":** The Root Directory field often has **leading or trailing spaces**. In **Settings → General → Root Directory**, clear the field and type exactly `apps/ask-before-you-app` (no spaces), then save and redeploy.
- **Old version of ABYA:** Redeploy from the correct branch after a push; clear cache or do a hard refresh (e.g. Cmd+Shift+R).
- **Build fails in Vercel:** Check the build logs. Common issues: missing env (e.g. `NEXT_PUBLIC_SUPABASE_URL`), Root Directory with spaces (see above), or install/build not running from monorepo root. Ensure Install Command and Build Command match the app’s `vercel.json` or the values in §2.3.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Run `pnpm run build --filter=ask-before-you-app` at repo root; fix any errors. |
| 2 | In Vercel, open the project that has askbeforeyouapp.com. |
| 3 | Set **Root Directory** to **`apps/ask-before-you-app`**. |
| 4 | Confirm **Build Command** uses the monorepo build (see §2.3). |
| 5 | Confirm **askbeforeyouapp.com** and **www** are on this project under Domains. |
| 6 | Push latest ABYA code and redeploy; test https://askbeforeyouapp.com. |

Once the domain is assigned to the project that builds `apps/ask-before-you-app` and a successful deploy runs, the browser will show the designed ABYA app.

---

## Post-launch: HCI test plan for SDPC leadership

To verify the live site is not breaking and to share a standard checklist with SDPC leadership, use **[HCI_TEST_PLAN_SDPC_LEADERSHIP.md](./HCI_TEST_PLAN_SDPC_LEADERSHIP.md)**. It includes smoke tests, critical user journeys by persona (Parent, Educator, Administrator, Student), page-by-page checks, accessibility (WCAG 2.1 AA), and how to run the automated Playwright HCI suite against production.
