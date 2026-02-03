# Landing Page & TripKit Visibility

**Questions:** Do we need TripKit thumbnails on the landing page? Should we re-look at the entire landing page design?

**Update:** A **Featured TripKits carousel** is now on the homepage (after "Meet the Guardians", before "Book Your Adventure"). It shows 3–4+ cards in a horizontal scroll: Morbid Misdeeds, Haunted Highway, Unexplained Utah, Ski Utah, Movie Madness, Valentine's, Meet the Guardians, Secret Springs. Order and list are in `src/components/FeaturedTripKitsCarousel.tsx` (`FEATURED_TRIPKIT_CODES`).

---

## Current state

| Section | What’s there | TripKits? |
|--------|----------------|-----------|
| **Hero** | “1 Airport • 1000+ Destinations”, search, two CTAs | “Get Your TripKit” button → `/tripkits` (no thumbnail) |
| **Drive time** | Bullseye, pills, RandomDestinationPicker | No |
| **Featured block** | Full section for one product | **One TripKit only:** “Meet the Guardians” (TK-000, free) — custom copy, no card/thumbnail |
| **Book Your Adventure** | Affiliate CTA | No |
| **This Week’s Picks** | Dynamic destination picks (n8n or fallback) | Destinations only, no TripKits |
| **Why SLCTrips?** | Three value props | “TripKits” is text only (no images, no links) |

**Summary:** Paid TripKits (e.g. Valentine’s) are **not** visible on the homepage. Discovery is via nav “TripKits” or the single “Get Your TripKit” button. Only the free TripKit gets a dedicated section.

---

## Do we need TripKit thumbnails on the landing page?

**It depends on the goal.**

- **Yes, if:** You want to surface seasonal/paid TripKits (e.g. Valentine’s) and convert visitors who don’t click “TripKits” in the nav. Thumbnails (or a small “Featured TripKits” row) make the product tangible and support TikTok → “full guide” CTA.
- **No, if:** You prefer a minimal homepage and are fine with all TripKit discovery on `/tripkits`. The current design is consistent; you’re just not using the homepage for TripKit conversion.

**Recommendation:** Add a **lightweight “Featured TripKits” row** (e.g. 2–3 cards with cover image, name, price, link). Options:
- **A. Static featured:** e.g. Valentine’s + Meet the Guardians + one other; you choose in code or CMS.
- **B. Dynamic:** Fetch 2–3 TripKits (e.g. `featured = true` or “most recent” / “seasonal”) and render the same card component you use on `/tripkits` (or a compact variant). Ensures thumbnails and pricing are correct.

Placement: after “This Week’s Picks” or between the free TripKit block and “Book Your Adventure” so paid and free both get visibility.

---

## Do we need to re-look at the entire landing page?

**Short answer:** The page is coherent and works. The main gap is **TripKit visibility**, not a full redesign.

**What’s working:**
- Clear value prop (1 airport, 1000+ destinations, drive-time framing).
- Strong free TripKit section (Meet the Guardians).
- Weekly picks add freshness; Book Your Adventure supports affiliate.
- “Why SLCTrips?” reinforces destinations + TripKits + Guardians.

**Worth revisiting (in order):**

1. **TripKit discovery**  
   Add TripKit thumbnails or a “Featured TripKits” row (see above) so seasonal/paid kits (e.g. Valentine’s) are visible without relying on the nav.

2. **CTA hierarchy**  
   Hero has “Explore Destinations” (primary) and “Get Your TripKit” (secondary). If TripKits are a key revenue driver, consider swapping or testing (e.g. seasonal: “Get the Valentine’s Guide” as primary when relevant).

3. **Seasonal / campaign blocks**  
   Optional: a small “Right now” or “This month” block that highlights one paid TripKit (e.g. Valentine’s) with a single CTA. Could be data-driven (e.g. “featured_tripkit_id” or slug in config) so you don’t hardcode every campaign.

4. **“This Week’s Picks” and TripKits**  
   Today it’s destinations only. You could later allow one “pick” to be a TripKit (e.g. from n8n or config) and render a small TripKit card in that grid. Lower priority than a dedicated Featured TripKits row.

5. **Mobile / visual hierarchy**  
   Quick pass: ensure hero headline and primary CTA are above the fold on small screens; Featured TripKits row doesn’t overwhelm the drive-time section.

---

## Next steps

| Priority | Action |
|----------|--------|
| 1 | Decide: add a “Featured TripKits” row with thumbnails (A or B above) or keep discovery only on `/tripkits`. |
| 2 | If adding: implement a small section that fetches 2–3 TripKits and reuses (or adapts) the `/tripkits` card with `cover_image_url`, name, price, link. |
| 3 | Optional: add a seasonal “featured” slug (e.g. Valentine’s) so the hero or a banner can point to it during campaigns. |
| 4 | Optional: full landing-page audit (copy, CTA order, mobile) once TripKit visibility is in place. |

---

*Created: February 2026*
