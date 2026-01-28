# Architecture & Design Decisions Log

This document tracks **WHY** we made specific decisions. When a future agent or developer asks "why did we do it this way?", the answer is here.

---

## Database Architecture

### Decision: Use view-based architecture instead of direct table queries

**Date:** Pre-existing (discovered Oct 29, 2025)
**Status:** ✅ Keep (Professional-grade pattern)

**Why:**
- **Separation of concerns:** Views provide clean public API, tables handle storage
- **Security:** Views can filter/restrict access (e.g., hide draft destinations)
- **Flexibility:** Can create multiple views for different audiences without changing tables
- **Examples:**
  - `public_destinations` → Public-facing, active only
  - `tk000_destinations` → Educational content only
  - `stale_destinations` → Data quality monitoring

**Alternative considered:** Direct table queries with filters everywhere
**Why rejected:** Inconsistent filtering, security risks, harder to maintain

---

### Decision: Remove redundant columns (Oct 29, 2025)

**Date:** Oct 29, 2025
**Status:** ✅ Executed (Migration v3)

**Columns removed:**
- `verified` (duplicate of `is_verified`)
- `tripkit_id` (use `tripkit_destinations` junction table)
- `guardian`, `character_ids` (compute from county)
- `recommended_gear`, `gear_recommendations` (use `destination_affiliate_gear` table)
- `ar_anchor_id`, `ar_content_url`, `digital_collectibles`, `badges` (unused future-proofing)
- `weather_info`, `trip_history`, `ugc_submissions` (should be separate tables)

**Why:**
- **Redundancy:** Multiple sources of truth cause sync issues
- **Bloat:** 16% of columns were unused or redundant
- **Maintainability:** Fewer columns = clearer purpose
- **Performance:** Smaller row size = better query performance

**Alternative considered:** Keep everything "just in case"
**Why rejected:** YAGNI principle - add when needed, not speculatively

---

### Decision: Add `themes TEXT[]` column for flexible classification

**Date:** Oct 29, 2025
**Status:** ✅ Executed (Migration v3)

**Why:**
- **Flexibility:** Can add new themes without schema changes
- **Multiple tags:** Destinations can have multiple themes
- **Performance:** GIN index enables fast theme-based queries
- **Complements existing:** Works alongside specialized tables (`water_destinations`, etc.)

**Example:**
```sql
themes = ['water', 'family-friendly', 'summer-only', 'spiritual']
```

**Alternative considered:** Only use specialized theme tables
**Why rejected:** Too rigid - would need new table for every theme

---

### Decision: Keep specialized theme tables (water, morbid, film, mystery)

**Date:** Oct 29, 2025 (confirmed during cleanup)
**Status:** ✅ Keep alongside themes array

**Why:**
- **Structured data:** Theme tables can have theme-specific fields
- **Curated collections:** Explicit membership in themed collections
- **Both approaches complement:**
  - Tables = curated, structured
  - Themes array = flexible, emergent

**Example:** `water_destinations` might have `temperature`, `depth`, `safety_rating` specific to water activities

**Alternative considered:** Only use themes array
**Why rejected:** Loses ability to have theme-specific metadata

---

### Decision: Use junction tables for many-to-many relationships

**Date:** Pre-existing (best practice)
**Status:** ✅ Standard pattern

**Examples:**
- `tripkit_destinations` (destinations ↔ tripkits)
- `destination_affiliate_gear` (destinations ↔ gear)

**Why:**
- **Normalized:** Prevents data duplication
- **Flexible:** Easy to add/remove relationships
- **Queryable:** Can get all TripKits for destination, or all destinations for TripKit
- **Additional metadata:** Junction can store relationship-specific data (e.g., order, featured)

**Alternative considered:** Store arrays of IDs in JSONB
**Why rejected:** Harder to query, no referential integrity, can't join efficiently

---

### Decision: Compute Guardian from county, don't store

**Date:** Oct 29, 2025 (removed `guardian` column)
**Status:** ✅ Executed

**Why:**
- **1:1 mapping:** Each county has exactly one Guardian
- **Single source of truth:** Guardian data lives in `guardians` table
- **No sync issues:** Can't have mismatched county/guardian
- **Easy to update:** Change Guardian assignment in one place

**Code:**
```typescript
const guardian = guardians.find(g => g.county === destination.county);
```

**Alternative considered:** Store guardian_id in destinations table
**Why rejected:** Redundant with county, can get out of sync

---

## Type Safety

### Decision: Create TypeScript interfaces for ALL JSONB fields

**Date:** Oct 29, 2025
**Status:** ✅ Executed

**Interfaces created:**
- `PhotoGallery`, `PhotoGalleryItem`
- `Activity`
- `NearbyRecommendation`
- `ContactInfo`, `SocialMediaUrls`
- `LearningObjective`, `FieldTripStop`
- `HistoricalTimelineEvent`, `EventDate`
- `AffiliateLinks`

**Why:**
- **Type safety:** Catch errors at compile time, not runtime
- **IDE autocomplete:** Better developer experience
- **Documentation:** Interfaces serve as inline documentation
- **Refactoring:** Safe to rename/restructure fields

**Before:**
```typescript
const gallery: any = destination.photo_gallery; // ❌ No safety
```

**After:**
```typescript
const gallery: PhotoGallery | null = destination.photo_gallery; // ✅ Type-safe
```

**Alternative considered:** Leave as `any` types
**Why rejected:** Error-prone, no IDE support, hard to maintain

---

## Content Strategy

### Decision: TK-000 is free with no affiliate content

**Date:** Pre-existing business decision
**Status:** ✅ Active

**Why:**
- **Educational mission:** Free Utah curriculum for schools
- **Trust building:** Demonstrate value before asking for purchase
- **SEO:** Free content drives organic traffic
- **Ethics:** Educational content shouldn't have affiliate marketing

**Implementation:**
```typescript
const isFromTK000 = searchParams.from === 'tk-000';
if (!isFromTK000) {
  // Show WhatDanPacks affiliate recommendations
}
```

**Alternative considered:** Monetize everything
**Why rejected:** Undermines educational mission, bad optics for schools

---

### Decision: Use Guardian characters for storytelling

**Date:** Pre-existing (core product strategy)
**Status:** ✅ Active (29 Guardians created)

**Why:**
- **Differentiation:** Unique to SLCTrips, can't be copied
- **Engagement:** Stories more memorable than dry facts
- **Personality:** Each county has unique voice/character
- **Merchandising:** Future potential (plushies, etc.)
- **Voice content:** ElevenLabs API for Guardian narration

**Example:** Dan (Wasatch County Guardian) has warm, encouraging voice for families

**Alternative considered:** Generic narrator or no storytelling
**Why rejected:** Commoditized, less engaging, no brand differentiation

---

### Decision: Use multiple AI providers (OpenAI, Gemini, ElevenLabs)

**Date:** Pre-existing
**Status:** ✅ Active

**Why:**
- **Best tool for job:**
  - Gemini for descriptions (faster, cheaper)
  - OpenAI for complex content
  - ElevenLabs for voice (best quality)
- **Redundancy:** If one provider goes down, use another
- **Cost optimization:** Use cheapest option that meets quality bar

**Alternative considered:** Single AI provider for everything
**Why rejected:** Vendor lock-in, higher costs, single point of failure

---

## Development Practices

### Decision: Use Next.js 14 App Router (not Pages Router)

**Date:** Pre-existing
**Status:** ✅ Active

**Why:**
- **Modern:** Latest Next.js paradigm
- **Server components:** Better performance, SEO
- **File-based routing:** Intuitive structure
- **Future-proof:** Pages Router is legacy

**Alternative considered:** Pages Router or different framework
**Why rejected:** Pages Router is old, other frameworks lack Next.js ecosystem

---

### Decision: Deploy on Vercel (not AWS, not self-hosted)

**Date:** Pre-existing
**Status:** ✅ Active

**Why:**
- **Seamless Next.js integration:** Made by same company
- **Zero config:** Push to deploy
- **Edge network:** Fast global performance
- **Serverless:** Automatic scaling
- **Analytics:** Built-in performance monitoring

**Alternative considered:** AWS, DigitalOcean, self-hosted
**Why rejected:** More complex, requires DevOps, slower iteration

---

## Rejected Ideas (Don't Propose These Again)

### ❌ Create AR/VR features now
**Why rejected:** Not ready, would be unused fields (we just removed them!)
**When to revisit:** When we have AR/VR strategy and resources

### ❌ Build custom CMS for destination management
**Why rejected:** Supabase Dashboard + SQL Editor works fine
**When to revisit:** If non-technical team members need to edit destinations regularly

### ❌ Add gamification (badges, achievements, collectibles)
**Why rejected:** Not core to product, adds complexity (we just removed these columns!)
**When to revisit:** After core product is successful and we want engagement hooks

### ❌ Store weather data in database
**Why rejected:** Weather changes constantly, would be stale immediately
**When to revisit:** Never - use real-time weather APIs

### ❌ Create separate tables for user trip history and UGC in destinations table
**Why rejected:** Already removed these columns - separate concerns
**Correct approach:** Create dedicated `user_trips` and `destination_ugc` tables when needed

### ❌ Store all photos in database
**Why rejected:** Database bloat, expensive storage
**Correct approach:** Store URLs (Google Places, Supabase Storage)

---

## Pending Decisions (Need to be made)

### ⏳ Should we materialize the `public_destinations` view for performance?

**Context:** Views are computed on each query, materialized views cache results

**Options:**
1. Keep as regular view (current)
2. Convert to materialized view with scheduled refresh
3. Use query caching instead

**Factors to consider:**
- Current query performance is acceptable
- 1,634 destinations isn't huge
- Views are simple joins, not complex computations
- Would need refresh strategy

**Recommendation:** Monitor performance, only materialize if queries become slow

---

### ⏳ How to handle destination photos: Google Places vs Supabase Storage vs both?

**Context:** Currently using Google Places API, but could also store uploads

**Options:**
1. Google Places only (current)
2. Supabase Storage for user uploads + Google Places
3. Migrate all to Supabase Storage

**Factors to consider:**
- Google Places: Free, always up-to-date, but Google's terms
- Supabase Storage: Full control, but need moderation, costs money
- Hybrid: Best of both but more complex

**Recommendation:** Start with Google, add Supabase for UGC when we have moderation

---

## How to Use This Log

**When making a new decision:**
1. Add entry with date, status, why, alternatives considered
2. Update if decision changes
3. Move to "Rejected" section if reversed

**When questioning an existing decision:**
1. Find it in this log
2. Read the "Why" and "Alternatives considered"
3. If context has changed, propose new decision with updated reasoning

**When an agent proposes something:**
1. Check if it's in "Rejected Ideas"
2. Check if it conflicts with existing decisions
3. If new, add to "Pending Decisions" until confirmed

---

**Last Updated:** Oct 29, 2025
**Maintained By:** Architecture discussions, agent sessions, team decisions
