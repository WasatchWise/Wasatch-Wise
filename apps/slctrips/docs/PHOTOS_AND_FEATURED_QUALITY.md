# Photos & Featured Quality Controls

Landing and "This Week's Picks" should show travel-worthy destinations with good photos, not generic or wrong imagery (e.g. construction, random houses).

---

## How we restrict quality

### 1. Random Destination Picker (landing)

- **First:** Only picks from destinations where `featured = true` OR `is_featured = true`, and `image_url` is not null (up to 100).
- **Fallback:** If none, uses any destination with `image_url`, ordered by `popularity_score` desc so stronger picks appear first.

So "Pick a Random Destination" will not show uncurated entries (e.g. Ashland house-under-construction) unless they are explicitly featured.

### 2. This Week's Picks (fallback rotation)

- **Per drive-time category:** After fetching up to 50 destinations with images, we **prefer featured only**: if any have `featured` or `is_featured`, we score and pick only from that subset.
- **Fallback:** If a category has no featured destinations, we use all 50 (so sections don’t disappear).

So the landing "This Week's Picks" grid only shows featured destinations when the category has at least one.

### 3. Dynamic weekly picks (n8n)

- When `weekly_picks` has an active row, the landing shows **recommendations** from that row (name, type, link). Those are curated in n8n/dashboard; they do not use destination images on the landing (no photo in that block). Image quality here is not applicable.

---

## Image sources & APIs

- **Destination images:** `public_destinations.image_url` (Supabase). Can be Supabase storage, Google Place Photo, or other URLs.
- **Google Place photos:** Use `/api/image-proxy?url=...` so the correct API key is applied and 403s are avoided. See `image-proxy/route.ts`.
- **Guardian hero:** Guardian county page hero uses a **place in that county** (first featured destination with image, or first with image); if the URL is Google, it goes through the image proxy. Fallback: guardian illustration, then default placeholder.

---

## Auditing and fixing bad photos

### Find destinations that might be wrong

- **Featured but bad image:** In Supabase (or SQL), list featured destinations and spot-check `image_url` and names:
  ```sql
  SELECT id, name, slug, image_url, featured, is_featured
  FROM public_destinations
  WHERE (featured = true OR is_featured = true) AND image_url IS NOT NULL
  ORDER BY name
  LIMIT 200;
  ```
- **Landing candidates:** Random picker and weekly picks both use the above logic, so anything with `featured`/`is_featured` can appear. Review those first.

### Fixes

1. **Unfeature bad entries**  
   Set `featured = false` and `is_featured = false` for destinations with wrong/generic photos (e.g. construction, irrelevant). They stay in the DB and on destination pages but won’t appear in random picker or weekly picks.

2. **Replace the image**  
   Update `image_url` in `public_destinations` (or the source table) with a better photo URL. Re-run the audit query to confirm.

3. **Blocklist (optional)**  
   If you need to exclude specific slugs from landing without touching the DB, add a client- or server-side filter that skips those slugs when building random/weekly pick lists. Prefer fixing data (1–2) over blocklists.

---

## Summary

| Surface              | Quality rule                                                                 |
|----------------------|-------------------------------------------------------------------------------|
| Random picker        | Featured (or is_featured) with image only; else high popularity_score.       |
| This Week's Picks    | Per category: use only featured when any exist; else all with image.         |
| Guardian county hero | Place image from county (featured first), then guardian art, then placeholder. |
| Image proxy          | Used for Google Place Photo URLs so API key is applied.                      |

Keep `featured` / `is_featured` as the main lever for “safe for landing”; audit and unfeature or fix images when you see bad examples.

*Last updated: 2026-02-02*
