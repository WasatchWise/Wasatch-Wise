# SLCTrips Data Enrichment Master Plan

## 🎯 Goal
Transform every destination into a rich, story-driven experience with complete, accurate data and category-specific layouts.

---

## 📊 Current Data Gaps

### Critical (0% Complete - 1,000 destinations missing)
- `website_url`, `phone_number`, `hours_of_operation`
- `video_url`, `social_media_urls`
- `event_dates`, `weather_info`
- `activities`, `historical_timeline`

### High Priority (<20% Complete)
- `guardian` (2.7% - only 27 destinations)
- `accessibility_rating` (15.9%)
- `popularity_score` (16.4%)
- `contact_info` (18.9%)

### Medium Priority (20-50% Complete)
- `source_notes` (20%)
- `ai_tips` (38%)
- `tripkit_id` (40.6%)

---

## 🚀 Enrichment Strategy

### Phase 1: Google Places Data (Immediate)
**Goal**: Fill critical business information

**What to Enrich:**
- `website_url` - Official website
- `phone_number` - Contact phone
- `hours_of_operation` - Business hours
- `price_level` - $ to $$$$
- `rating` - Google rating (1-5)
- `review_count` - Number of reviews
- `place_id` - Google Place ID (for future updates)

**Source**: Google Places API
**Priority**: ALL categories
**Estimate**: 2-3 hours to process 1,500 destinations

---

### Phase 2: Yelp Enhancement (Next)
**Goal**: Add social proof and detailed attributes

**What to Enrich:**
- Yelp rating and review count
- Price range
- Popular dishes (restaurants)
- Attributes (outdoor seating, wheelchair accessible, etc.)
- Photos (additional gallery images)

**Source**: Yelp Fusion API
**Priority**: Restaurants, Breweries, Coffee shops, Attractions
**Estimate**: 1-2 hours

---

### Phase 3: AI Storytelling (Parallel)
**Goal**: Create engaging narratives for each destination

**What to Generate:**
- `ai_story` - Rich, compelling backstory (200-300 words)
- `ai_tips` - Local insider tips
- `fun_facts` - 3-5 interesting facts
- `best_time_to_visit` - Seasonal recommendations
- `instagram_spots` - Photo-worthy locations

**Source**: OpenAI GPT-4
**Priority**: Featured destinations first, then all
**Estimate**: 2-3 hours for all destinations

---

### Phase 4: Weather Integration (Quick Win)
**Goal**: Show live, relevant weather data

**What to Add:**
- Current conditions at destination
- 5-day forecast
- Best season to visit
- Weather-based activity suggestions

**Source**: OpenWeatherMap API
**Priority**: Outdoor destinations (hiking, skiing, lakes)
**Estimate**: 30 minutes

---

### Phase 5: Category-Specific Data
**Goal**: Tailor content to destination type

#### Restaurants & Breweries
- Menu highlights
- Signature dishes/beers
- Chef/brewer story
- Dietary options
- Ambiance tags

#### Hiking & Outdoor
- Trail difficulty (easy/moderate/hard)
- Elevation gain
- Trail length
- Dog-friendly
- Season recommendations
- Required permits

#### Museums & Art
- Current exhibitions
- Admission prices
- Guided tour info
- Accessibility features
- Educational programs

#### Events & Festivals
- Event dates
- Ticket prices
- Lineup/schedule
- Parking info
- Family-friendly rating

---

## 🎨 Category-Specific Page Layouts

### Restaurant/Brewery Layout
```
Hero Image
├─ Name & Rating (Yelp + Google)
├─ Price Level & Hours
├─ Quick Info (Cuisine, Ambiance, Best for)
├─ Story Section
│  ├─ Origin story
│  ├─ Chef/Brewer profile
│  └─ What makes it special
├─ Menu Highlights (with photos)
├─ Local Tips
│  ├─ Best time to visit
│  ├─ Parking tips
│  └─ Insider recommendations
├─ Subtle Gear Section
│  └─ "Planning a food tour? Here's what locals bring..."
└─ Map & Directions
```

### Hiking/Outdoor Layout
```
Hero Image
├─ Trail Stats (Distance, Elevation, Difficulty)
├─ Current Weather
├─ Trail Story
│  ├─ Historical context
│  ├─ Geological features
│  └─ Why it's special
├─ What to Expect
│  ├─ Trail conditions
│  ├─ Wildlife
│  └─ Views & highlights
├─ Season Guide
│  └─ Best times with weather patterns
├─ Essential Gear (Contextual)
│  └─ "For this trail, experienced hikers recommend..."
├─ Safety Info
└─ Map & Trailhead Directions
```

### Museum/Art Layout
```
Hero Image
├─ Current Exhibitions
├─ Admission & Hours
├─ Cultural Story
│  ├─ Historical significance
│  ├─ Notable collections
│  └─ Impact on community
├─ Visitor Experience
│  ├─ Tour options
│  ├─ Educational programs
│  └─ Special events
├─ Accessibility Info
├─ Nearby Dining (Subtle suggestion)
│  └─ "Make it a day trip..."
└─ Map & Parking
```

---

## 💡 Affiliate Link Strategy - Less Pushy, More Helpful

### Current Problem
- Two separate gear sections (redundant)
- Feels like ads, not recommendations
- Not contextual to destination type

### New Approach: "What Locals Bring"

#### Example: Hiking Destination
```markdown
## What Experienced Hikers Bring on This Trail

Based on trail conditions and local knowledge:

**For the Ascent:**
- [Lightweight hiking poles](link) - The switchbacks are steep, these help
- [Trail running shoes](link) - Rocky sections, you'll want good grip
- [Hydration pack](link) - No water sources past mile 2

**For Comfort:**
- [Sun hat](link) - Zero shade above treeline
- [Layers](link) - Temperature drops 20° at summit

💡 *These aren't requirements - just what locals have found helpful*
```

#### Example: Restaurant
```markdown
## Make It a Food Crawl

If you're exploring breweries today:

**Helpful to Have:**
- [Portable phone charger](link) - For photos & navigation
- [Small cooler bag](link) - To bring home favorites
- [Ride share app credit](link) - Stay safe

💡 *Planning a bigger food tour? Check our [Brewery TripKit](link)*
```

---

## 🔧 Technical Implementation

### Scripts to Create
1. `scripts/enrich-from-google-places.js` - Batch Google Places enrichment
2. `scripts/enrich-from-yelp.js` - Yelp data overlay
3. `scripts/generate-ai-stories.js` - OpenAI storytelling
4. `scripts/add-category-specific-data.js` - Custom fields per category
5. `scripts/test-weather-api.js` - Weather integration test

### Page Components to Update
1. `src/app/destinations/[slug]/page.tsx` - Dynamic layout based on category
2. `src/components/DestinationLayout/` - New folder with category layouts:
   - `RestaurantLayout.tsx`
   - `HikingLayout.tsx`
   - `MuseumLayout.tsx`
   - `EventLayout.tsx`
   - `DefaultLayout.tsx`
3. `src/components/GearRecommendations.tsx` - Contextual, story-driven
4. `src/components/WeatherWidget.tsx` - Live weather for destination

---

## 📅 Execution Order

### Today (MVP - 4 hours)
1. ✅ Run Google Places enrichment (2 hrs)
2. ✅ Test weather API (30 min)
3. ✅ Create RestaurantLayout component (1 hr)
4. ✅ Update affiliate sections to be contextual (30 min)

### Tomorrow (Polish - 3 hours)
1. Run AI storytelling script (2 hrs)
2. Add Yelp data overlay (1 hr)

### This Week (Complete - 5 hours)
1. Create all category-specific layouts (3 hrs)
2. Add category-specific data fields (1 hr)
3. Final testing and polish (1 hr)

---

## 🎯 Success Metrics

### Data Completeness
- [ ] 100% of destinations have website/phone/hours
- [ ] 100% of destinations have AI story
- [ ] 100% of restaurants have menu highlights
- [ ] 100% of hikes have difficulty ratings
- [ ] Weather showing for all outdoor destinations

### User Experience
- [ ] Category-specific layouts deployed
- [ ] Affiliate links feel helpful, not pushy
- [ ] Pages load with rich, engaging content
- [ ] No more "incomplete" feeling

---

## 🚀 Let's Execute

Ready to start Phase 1: Google Places enrichment?
This will give us website, phone, hours, ratings for all 1,500 destinations.

**Command**: `node scripts/enrich-from-google-places.js`

Let's make every destination page incredible.
