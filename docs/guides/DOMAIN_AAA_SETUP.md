# Domain Setup: Adult AI Academy vs Content Factory

**Goal:** www.adultaiacademy.com → AAA marketing page (dashboard app). Content Factory stays separate on its own URL.

---

## Current (Wrong)

| Vercel project      | App              | Domain                    |
|---------------------|------------------|----------------------------|
| adult-ai-academy    | Content Factory  | www.adultaiacademy.com ❌  |
| wasatchwise         | Dashboard (AAA page at /adult-ai-academy) | www.wasatchwise.com ✅ |

## Target

| Vercel project      | App              | Domain                    |
|---------------------|------------------|----------------------------|
| adult-ai-academy    | Content Factory  | adult-ai-academy.vercel.app (or rename project → content-factory.vercel.app) |
| wasatchwise         | Dashboard        | www.wasatchwise.com + **www.adultaiacademy.com** ✅ |

---

## Step 1: Free the AAA domain (adult-ai-academy project)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Open the **adult-ai-academy** project.
3. **Settings** → **Domains**.
4. Find **www.adultaiacademy.com** → click **⋯** → **Remove**.
5. Confirm. Content Factory will stay live at **adult-ai-academy.vercel.app** (or whatever the project’s default URL is).

---

## Step 2: Point AAA domain to Dashboard (wasatchwise project)

1. In Vercel Dashboard, open the **wasatchwise** project.
2. **Settings** → **Domains**.
3. Click **Add**.
4. Enter: **www.adultaiacademy.com**.
5. Add. Vercel will show DNS instructions if the domain isn’t already on Vercel.
6. If the domain was previously on the adult-ai-academy project, DNS may already point to Vercel; propagation can take a few minutes.

---

## Step 3 (Optional): Rename project for clarity

- In **adult-ai-academy** project: **Settings** → **General** → **Project Name** → change to **content-factory**.
- New default URL: **content-factory.vercel.app** (or your team’s prefix). Update any bookmarks/links.
- **Product name:** Use **Content Factory** (or **Wasatchville Factory** if you prefer that branding). Same app either way.

---

## Content Factory (Wasatchville Factory): where it lives

- **Option A (later):** Subdomain — e.g. **factory.wasatchwise.com** or **content.wasatchwise.com**. Add domain in Content Factory project when ready.
- **Option B (now):** Keep on Vercel default — **adult-ai-academy.vercel.app** (or **content-factory.vercel.app** after rename). No custom domain needed if it’s internal.
- **Option C (later):** Separate domain — e.g. contentfactory.io when you productize.

**Recommendation:** Rename the project to **content-factory** so the URL is **content-factory.vercel.app**. Use **Content Factory** or **Wasatchville Factory** as the product name in the app UI—your choice. Leave it on the Vercel default URL for now; add a subdomain (e.g. factory.wasatchwise.com) later if needed.

---

## Verification

After Step 1 + 2:

- **www.adultaiacademy.com** → AAA marketing page. The dashboard app **rewrites** the root path to `/adult-ai-academy` when the host is adultaiacademy.com (see `apps/dashboard/middleware.ts`), so the AAA marketing page (adults/upskilling copy) is shown at the root.
- **adult-ai-academy.vercel.app** (or content-factory.vercel.app) → Content Factory app, no AAA domain attached.

## Branding (AAA + nav) and deploy

- **Code:** AAA page copy (adults, upskilling, Gen X/Xennials), nav (AAA out of header, footer only), and Content Factory branding are in the repo.
- **Live:** The **new** deployment is failing at `pnpm run build` (6 errors in build logs). The **previous** deployment is still serving both URLs, so they show **old** content (homepage on both; no AAA rewrite yet).
- **Next:** Fix the build errors (check Vercel build logs for the 6 errors), then redeploy. After a successful deploy: www.adultaiacademy.com will show the AAA marketing page at root (rewrite); www.wasatchwise.com will show the updated nav and homepage.

---

---

## Deploying Content Factory (after branding/code changes)

The **adult-ai-academy** (Content Factory) Vercel project is separate from **wasatchwise**. To get the new "CONTENT FACTORY" branding live:

**Option A – Deploy from Vercel Dashboard (simplest)**  
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **adult-ai-academy** project.  
2. Open the **Deployments** tab.  
3. Click **Redeploy** on the latest deployment, or push the branch that’s connected to trigger a new build.

**Option B – Deploy from CLI**  
The project’s **Root Directory** must be set correctly. If you get an error like “path …/apps/adult-ai-academy/apps/adult-ai-academy does not exist”:  
1. In Vercel → **adult-ai-academy** → **Settings** → **General** → **Root Directory**.  
2. Set to **.** (current directory) so deploys from `apps/adult-ai-academy` use that folder as root.  
3. From repo root: `cd apps/adult-ai-academy && vercel link` (link to adult-ai-academy project if needed), then `vercel --prod`.

---

---

## Vercel build fix (lockfile)

If builds fail with **ERR_PNPM_OUTDATED_LOCKFILE** (e.g. lockfile not up to date with `apps/slctrips/package.json`):

- **Immediate:** Root **vercel.json** has `"installCommand": "pnpm install --no-frozen-lockfile"` so the next deploy can complete.
- **Permanent:** Run `pnpm install --no-frozen-lockfile` at repo root, commit **pnpm-lock.yaml**, push. Then you can remove the `installCommand` override from **vercel.json** to restore frozen-lockfile for reproducible builds.

---

**Last updated:** January 29, 2026
