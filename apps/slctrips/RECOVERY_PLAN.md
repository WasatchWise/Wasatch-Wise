# Recovery Plan: Disable Related Destinations

## Problem

The "Related Destinations" section is causing a critical "Something Went Wrong" error on destination pages (e.g., `el-paisa-grill`) in production. The recent fix to `sanitizeDestination` was insufficient to resolve the underlying hydration or data structure mismatch.

## Immediate Solution (Emergency Fix)

**Action:** completely disable the "Related Destinations" section in `src/app/destinations/[slug]/page.tsx`.
**Goal:** Restore the main destination page content immediately so users can access the site.

## Changes

Modified `src/app/destinations/[slug]/page.tsx` to return `null` immediately before rendering the "Explore {County}" section.

## Verification

After deployment, we will verify:

1. `el-paisa-grill` page loads successfully.
2. The "Explore {County}" section is absent (expected).
3. No error overlay is present.
