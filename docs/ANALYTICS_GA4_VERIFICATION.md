# GA4 Verification – Primary Vercel Deployments

**GA4 Property:** wasatch-wise-hq  
**Measurement ID:** `G-ZSBWEM6WD8` (default; override with `NEXT_PUBLIC_GA_MEASUREMENT_ID`)

## Where GA4 is implemented

| Deployment | App | GA4 component | Env var |
|------------|-----|----------------|--------|
| **wasatchwise.com** | `apps/dashboard` | `GoogleAnalytics.tsx` in root layout | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| **askbeforeyouapp.com** | `apps/ask-before-you-app` | `GoogleAnalytics.tsx` in root layout | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| **adultaiacademy.com** | Currently redirects / under dashboard | Use dashboard GA4 if served from same app | Same as dashboard |

## Vercel env check

1. **Dashboard (WasatchWise):** Project → Settings → Environment Variables.  
   Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set for Production (or leave unset to use fallback `G-ZSBWEM6WD8`).

2. **Ask Before You App:** Same variable for Production (and Preview if you want GA in preview).

3. **Adult AI Academy:** If it becomes a separate Vercel project, add the same variable and a GA4 component in that app’s root layout.

## GA4 data streams (Google Analytics)

In GA4 (Admin → Data Streams), add one stream per site:

- **wasatchwise.com** – Web, URL = production domain.
- **askbeforeyouapp.com** – Web, URL = production domain.
- **adultaiacademy.com** – When live, add stream.

Same Measurement ID can be used for all; GA4 uses the stream to segment by site.

## Quick verification

1. Open site in production (or preview with GA enabled).
2. Open DevTools → Network, filter by `gtag` or `google-analytics`.
3. In GA4: Reports → Realtime; visit the page and confirm the hit.

## Debug mode (Realtime not showing)

If scripts load but Realtime shows 0 users, enable GA4 debug so events appear in **Admin → DebugView**:

1. In Vercel, add **Production** env var: `NEXT_PUBLIC_GA_DEBUG` = `true` (on the project you’re testing).
2. Redeploy, then open GA4 → **Admin → DebugView**.
3. Visit the site; events show in DebugView within seconds. Remove the env var and redeploy when done.

## Code references

- **Dashboard:** `apps/dashboard/app/layout.tsx` (renders `<GoogleAnalytics />`).
- **Dashboard component:** `apps/dashboard/components/GoogleAnalytics.tsx`.
- **Ask Before You App:** `apps/ask-before-you-app/app/layout.tsx` (renders `<GoogleAnalytics />`).
- **ABYA component:** `apps/ask-before-you-app/components/GoogleAnalytics.tsx`.

Both components only inject the script when `NODE_ENV === 'production'` and a measurement ID is present.
