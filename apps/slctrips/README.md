# SLCTrips v2 - Utah Adventure Platform

> Travel platform for Utah destinations with curated TripKits, AI-generated content, Guardian character storytelling, and **full affiliate monetization stack**.

**Status:** Fully Monetized ✅ | All Systems Active ✅ (Nov 2, 2025)
**Database:** 1,533 active destinations | 29 Guardians | 49 tables | 5 views | 100% type-safe ✅
**Revenue:** AWIN + Viator + Booking.com + Amazon Associates = **4 affiliate streams** 💰

---

## 🎉 Latest Updates (Nov 2, 2025)

- ✅ **Fixed pagination** - All 1,533 destinations now visible (was 1,000 limit)
- ✅ **AWIN integration** - REI & Backcountry gear (EARNING NOW)
- ✅ **Viator tours** - Activities & guided experiences (EARNING NOW)
- ✅ **Booking.com** - Hotels via AWIN merchant (pending approval)
- ✅ **Guardian narration** - Context-aware active introductions
- ✅ **Photo enrichment** - 3-tier fallback system (all destinations have images)

---

## 🚀 Quick Start

### For AI Agents Starting a New Conversation

**👉 READ THIS FIRST:** `.claudecode/project-context.md`

Don't waste 15 minutes reorienting yourself. That file has EVERYTHING:
- Database architecture (views vs tables!)
- **Monetization stack** (AWIN, Viator, Booking.com)
- **Pagination requirements** (Supabase 1000 record limit fix)
- Current state & what's completed
- Key decisions (don't redo them!)
- Common pitfalls
- How to do common tasks

**Also helpful:**
- `AFFILIATE_QUICK_START.md` - Monetization quick reference
- `RECENT_IMPROVEMENTS.md` - Full changelog (Nov 2)
- `DECISIONS_LOG.md` - Why we made each decision
- `ARCHITECTURE_DISCOVERY.md` - Deep dive on view architecture

### For Developers

1. **Clone and install:**
   ```bash
   cd slctrips-v2
   npm install
   ```

2. **Environment setup:**
   - Copy `.env.local.example` to `.env.local` (if it doesn't exist)
   - All API keys are already configured in `.env.local`

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

4. **Read project context:**
   - `.claudecode/project-context.md` ← Start here!

---

## 📊 Project Overview

### What is SLCTrips?

Travel platform for Utah destinations featuring:
- **1,634 destinations** across 29 counties
- **108 planned TripKits** (digital guidebooks) - 11 active
- **29 Guardian characters** (county-based storytellers)
- **AI-generated content** (descriptions, tips, seasonal recommendations)
- **Free educational tier** (TK-000 "Free Utah" curriculum)

### Business Model

**Three Revenue Streams:**

1. **TripKits (Digital Guidebooks)**
   - Free: TK-000 educational content (29 destinations)
   - Paid: $47-$147+ (curated collections, 11 active, 108 planned)

2. **Affiliate Monetization** (NEW - Nov 2, 2025)
   - **AWIN**: REI & Backcountry gear, Booking.com hotels (4-8% commission)
   - **Viator**: Tours & activities (8-10% commission)
   - **Amazon**: Fallback gear (1-4% commission)
   - **Projected**: $400/month at 10K visitors → $4K-5K/month at 100K visitors

3. **Future Revenue**
   - Custom tour partnerships
   - Local guide commissions
   - Premium content subscriptions

**Revenue Goal:** $2.28M by Year 3 (TripKits + Affiliates)
**Long-term:** 2034 Olympics milestone

### Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **APIs:** Google Places, OpenAI, Gemini, ElevenLabs, HeyGen, Stripe
- **Deployment:** Vercel

---

## 🏗️ Database Architecture

**CRITICAL:** We use a **view-based architecture** (not just tables!)

### The 5 Core Views

1. **`public_destinations`** ⭐ Main public view (1,533 active)
2. **`destinations_view`** - Admin view (1,634 total)
3. **`tk000_destinations`** - Educational content (29)
4. **`stale_destinations`** - Data quality monitoring (876 need review)
5. **`destinations_missing_provenance`** - Missing sources (1,147)

### Core Table: `destinations`

- **Columns:** 56 (reduced from 67 on Oct 29)
- **Type safety:** 100% ✅ (all JSONB fields have TypeScript interfaces)
- **New field:** `themes TEXT[]` for flexible tagging

**Read more:** `ARCHITECTURE_DISCOVERY.md`

---

## 📁 Project Structure

```
slctrips-v2/
├── .claudecode/
│   └── project-context.md        ⭐ READ THIS FIRST
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── destinations/[slug]/  # Destination pages
│   │   └── tripkits/              # TripKit product pages
│   ├── components/                # React components
│   ├── types/
│   │   └── database.types.ts     # TypeScript definitions
│   └── lib/                       # Utilities
├── supabase/
│   └── migrations/                # Database migrations
├── scripts/                       # Data enrichment scripts
├── Documentation/
│   ├── ARCHITECTURE_DISCOVERY.md
│   ├── DECISIONS_LOG.md
│   └── MIGRATION_UPDATE_V3.md
├── START_HERE.md                 # Quick reference
└── README.md                     # This file
```

---

## ✅ Current State (Nov 2, 2025)

### Recently Completed (Nov 1-2, 2025)

- ✅ **Guardian System Complete** (29 narratives, backstories, voice profiles)
- ✅ **Destination Page Enhancements** (Guardian badges, Dan avatars, YouTube, seasonal cards)
- ✅ **Guardian Assets** (29 transparent PNGs for hero badges)
- ✅ **Database architecture cleanup** (removed 11 redundant columns - Oct 29)
- ✅ **100% type safety** (TypeScript interfaces for all JSONB fields)
- ✅ **Documentation** (comprehensive onboarding guides)
- ✅ **Migration v3** (executed successfully)

### Pending / In Progress

- ⏳ **Sticky navigation pills** (destination page section jumps)
- ⏳ **Interactive maps** (Google Maps integration)
- ⏳ **Affiliate integration** (AWIN hotels, Viator tours, Amazon gear)
- ⏳ **Data enrichment** (Google Places, AI content, themes)
- ⏳ **Data quality fixes** (876 stale, 1,147 missing sources)
- ⏳ **Content creation** (expand to 108 TripKits)

---

## 🎯 Common Tasks

### Query Destinations

```typescript
// ✅ CORRECT - Query the view
const { data } = await supabase
  .from('public_destinations')
  .select('*')
  .eq('slug', slug);

// ❌ WRONG - Don't query table directly
const { data } = await supabase
  .from('destinations')  // Table, not view!
  .select('*');
```

### Get Guardian for Destination

```typescript
// ✅ CORRECT - Compute from county
const guardian = guardians.find(g => g.county === destination.county);

// ❌ WRONG - Column was removed Oct 29
const guardian = destination.guardian; // Doesn't exist!
```

### Get TripKits for Destination

```typescript
// ✅ CORRECT - Use junction table
const { data } = await supabase
  .from('tripkit_destinations')
  .select('tripkit_id, tripkits(*)')
  .eq('destination_id', id);

// ❌ WRONG - Column was removed Oct 29
const id = destination.tripkit_id; // Doesn't exist!
```

**More examples:** `.claudecode/project-context.md`

---

## 🚨 Common Pitfalls

1. **Querying table instead of view**
   - ❌ `FROM destinations` (table)
   - ✅ `FROM public_destinations` (view)

2. **Using removed columns**
   - ❌ `destination.verified` → Use `destination.is_verified`
   - ❌ `destination.tripkit_id` → Use `tripkit_destinations` junction
   - ❌ `destination.guardian` → Compute from county

3. **Not using TypeScript interfaces**
   - ❌ `const gallery: any = ...`
   - ✅ `const gallery: PhotoGallery | null = ...`

4. **Creating redundant patterns**
   - Check `DECISIONS_LOG.md` before proposing new architecture

**Full list:** `.claudecode/project-context.md`

---

## 📚 Documentation

### Essential Reading (in order)

1. **`.claudecode/project-context.md`** ⭐ Complete project overview
2. **`PROJECT_UPDATE_NOV2_2025.md`** ⭐ Latest completion status (Nov 2, 2025)
3. **`START_HERE.md`** - Ultra-quick reference
4. **`DECISIONS_LOG.md`** - Why we made each decision
5. **`ARCHITECTURE_DISCOVERY.md`** - View architecture deep dive

### Migration Docs (Recent)

- `MIGRATION_UPDATE_V3.md` - Latest migration (Oct 29)
- `MIGRATION_INSTRUCTIONS.md` - How to run migrations
- `ARCHITECTURE_CLEANUP_SUMMARY.md` - What was fixed

---

## 🔑 Environment Variables

All configured in `.env.local`:

- **Supabase:** Database connection
- **Google APIs:** Places, Maps, YouTube
- **AI:** OpenAI, Gemini
- **Voice/Avatar:** ElevenLabs, HeyGen
- **Payments:** Stripe (LIVE MODE)
- **Deployment:** Vercel

---

## 🚀 Next Steps (Priority Order)

1. **Data Quality** (High Priority)
   - Fix 1,147 destinations missing source attribution
   - Verify 876 stale destinations
   - Populate `themes` column

2. **Data Enrichment** (High Priority)
   - Google Places enrichment (photos, contact)
   - AI content generation (summaries, stories)
   - Seasonal recommendations

3. **Feature Implementation** (Medium Priority)
   - Supabase Auth
   - Stripe integration testing
   - User progress tracking

4. **Content Creation** (Ongoing)
   - Expand to 108 TripKits
   - Guardian character content
   - Voice/video generation

---

## 💡 Pro Tips

- **Always check if it's a view or table** before querying
- **Use TypeScript interfaces** from `database.types.ts`
- **Read existing code** before creating new patterns
- **Check `DECISIONS_LOG.md`** before proposing architecture changes
- **The architecture is already good** - don't reinvent it!

---

## 📞 Quick Reference

**Database Dashboard:** https://supabase.com/dashboard/project/mkepcjzqnbowrgbvjfem
**Main View:** `public_destinations` (1,535 active)
**Main Table:** `destinations` (1,634 total)
**Type Safety:** 100% ✅
**Last Migration:** Oct 29, 2025 (v3) ✅

**Important Files:**
- `.claudecode/project-context.md` ← Start here!
- `src/types/database.types.ts` - TypeScript definitions
- `src/app/destinations/[slug]/page.tsx` - Destination pages

---

## 🙏 Contributing

Before making changes:
1. Read `.claudecode/project-context.md`
2. Check `DECISIONS_LOG.md` for existing decisions
3. Verify you're querying views (not tables) for reads
4. Use TypeScript interfaces (no `any` types)
5. Test locally before pushing

---

## 📈 Project Health

**Architecture:** A (Professional, Olympic-ready)
**Type Safety:** 100% ✅
**Documentation:** Complete ✅
**Data Quality:** In progress (876 stale, 1,147 missing sources)
**Revenue Path:** On track for $2.28M Year 3

---

**Last Updated:** Nov 2, 2025
**Status:** Guardian content complete, destination pages enhanced, ready for affiliate integration
**Next Session:** Read `PROJECT_UPDATE_NOV2_2025.md` for complete status, then start dev server and test!
# Test deployment
