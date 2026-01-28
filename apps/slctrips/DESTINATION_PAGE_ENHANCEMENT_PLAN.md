# Destination Page Enhancement Plan
**Date:** November 2, 2025
**Goal:** Transform destination pages with Guardian storytelling + Dan's practical guide + Genspark template design

---

## Content Strategy

### Two-Voice Approach

**1. Guardian Voice = Cultural Storyteller**
- Local authority for their county
- Educational/historical context
- "Why this place matters"
- Storytelling, lore, significance
- Links to Guardian page for deeper county exploration

**2. Dan Voice = Practical Travel Guide**
- Real-world logistics
- Where to stay, eat, pack
- Money-saving hacks
- Road warrior survival intel
- Honest assessments ("skip this if...")

---

## Visual Design Integration

### Hero Section
**Elements:**
- Full-width hero image (destination photo)
- Guardian transparent avatar badge (60-80px) in top-left
  - Positioned near destination name
  - Tooltip: "Guardian of [County Name]"
  - Links to Guardian's page
- White text with enhanced shadow (already fixed for accessibility)
- Quick stats badges (drive time, category, etc.)

### Content Layout
```
[Hero with Guardian Badge]

[Guardian's Story Section]
"About This Destination - As told by [Guardian Name]"
[Guardian narrative with signature/link]

[Photo Gallery Carousel]

[YouTube Video Section] (if video_url exists)

[Dan's Practical Guide - Tabbed/Sectioned]
├─ What Dan Packs
├─ Where Dan Stays
├─ Where Dan Eats
├─ Road Warrior Intel
└─ Dan's Pro Tips

[Seasonal Strategy Cards]

[Interactive Map]

[Related Destinations]
```

---

## Database Schema Additions

### New Fields Needed in `destinations` Table

```sql
-- Campsite/RV Information
ALTER TABLE destinations ADD COLUMN campsite_recommendations JSONB DEFAULT '[]';
-- Structure: [{"name": "Ruby's Inn RV Park", "type": "RV/Tent", "booking_url": "", "price_range": "$$", "amenities": ["showers", "hookups"]}]

-- Supply/Gas Stops
ALTER TABLE destinations ADD COLUMN supply_stops JSONB DEFAULT '{}';
-- Structure: {
--   "last_gas": {"name": "Ruby's Inn", "distance_miles": 0, "services": ["gas", "grocery", "restaurant"]},
--   "last_grocery": {"name": "Bryce Canyon General Store", "distance_miles": 3},
--   "cell_service_warning": "No service for 50+ miles south on Highway 12"
-- }

-- Road Warrior Critical Intel
ALTER TABLE destinations ADD COLUMN road_warrior_intel JSONB DEFAULT '{}';
-- Structure: {
--   "cell_service": "Full LTE coverage" | "Spotty - Verizon best" | "NO SERVICE 50+ miles",
--   "gas_warning": "Last gas for 110 miles",
--   "water_refill": ["Visitor Center (free)", "Trailhead (seasonal)"],
--   "emergency_services": "Nearest hospital: Richfield - 78 miles north"
-- }

-- Restaurant/Food Spots (enhance existing nearby_food)
ALTER TABLE destinations ADD COLUMN dining_recommendations JSONB DEFAULT '[]';
-- Structure: [{"name": "Ruby's Inn Cowboy Buffet", "type": "buffet", "price": "$$$", "distance_miles": 0, "specialty": "All-you-can-eat"}]
```

### Migration Script
Create: `/Users/johnlyman/Desktop/slctrips-v2/slctrips-v2/supabase/migrations/YYYYMMDDHHMMSS_add_road_warrior_fields.sql`

---

## Component Architecture

### New Components to Create

**1. GuardianBadge.tsx** (Hero overlay)
```tsx
interface GuardianBadgeProps {
  guardian: {
    display_name: string;
    county: string;
    image_url_transparent: string;
    animal_type: string;
  };
}
```

**2. GuardianStory.tsx** (Main content section)
```tsx
interface GuardianStoryProps {
  guardian: {
    display_name: string;
    county: string;
    backstory: string;
    image_url: string;
  };
  destinationName: string;
}
```

**3. DansGuide.tsx** (Tabbed practical guide)
```tsx
interface DansGuideProps {
  destination: {
    gear_recommendations: any[];
    hotel_recommendations: any[];
    campsite_recommendations: any[];
    dining_recommendations: any[];
    supply_stops: any;
    road_warrior_intel: any;
    ai_tips: string;
  };
}
```

**4. YouTubeEmbed.tsx** (Video section)
```tsx
interface YouTubeEmbedProps {
  videoUrl: string;
  title: string;
}
```

**5. SeasonalCards.tsx** (Best time to visit)
```tsx
interface SeasonalCardsProps {
  seasons: {
    spring: boolean;
    summer: boolean;
    fall: boolean;
    winter: boolean;
  };
  currentSeason: string;
}
```

**6. InteractiveMap.tsx** (Google Maps integration)
```tsx
interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  name: string;
  supplyStops?: any[];
}
```

**7. RoadWarriorAlert.tsx** (Critical safety info)
```tsx
interface RoadWarriorAlertProps {
  intel: {
    cell_service: string;
    gas_warning?: string;
    emergency_services: string;
  };
}
```

---

## Affiliate Integration Strategy

### Amazon Associates
**Integration Points:**
- "What Dan Packs" section
- Affiliate tag: `wasatchwise-20`
- Use Amazon Product Advertising API for:
  - Product images
  - Current pricing
  - Prime badge
  - Star ratings
- Link structure: `https://www.amazon.com/dp/[ASIN]?tag=wasatchwise-20`

### AWIN Network
**Integration Points:**
- Hotel booking links (Booking.com, Expedia)
- Car rental recommendations
- Publisher ID: `a70a92f6-d44c-46fa-869b-b898dc5efbc6`
- Deep links to specific hotels from `hotel_recommendations`

### Viator Tours
**Integration Points:**
- "Tours & Activities" section
- API Key: `27667c52-5c00-4e88-959f-edfd717ec22b`
- Display from `tour_recommendations` with live pricing
- Book button with affiliate tracking

### YouTube Data API
**Integration Points:**
- Video embed with related content
- API Key: `AIzaSyDKBoNppz8Wxnh7ri9GLs6LatMjrg7-as8`
- Auto-fetch related destination videos

---

## Critical Road Warrior Intel Database

### I-70 Corridor (Utah)
**Longest stretch without services in US Interstate System**
- Distance: ~110 miles (Salina to Green River)
- No gas, food, lodging, or services
- Limited to NO cell service
- Emergency: CDOT call boxes every few miles

**Needs to be in database for affected destinations:**
- Capitol Reef National Park
- Goblin Valley State Park
- Green River (town)
- Moab area
- Canyonlands NP

### Continental Divide Trail (CDT) - Utah Segment
**One of the "Triple Crown" of US Hiking Trails**
- Total Length: 3,100 miles (Mexico to Canada)
- Utah Segment: ~160 miles through northern Utah
- Route: Crosses High Uintas Wilderness, passes through Cache County
- Elevation: 8,000-13,000+ feet
- Season: June-September only (snow rest of year)
- Difficulty: Expert-level backpacking
- Resupply Points (Utah):
  - Manila, UT (start/northern entry)
  - Mirror Lake Highway access (seasonal - closes in winter)
  - Evanston, WY (nearest major town north)

**Critical Safety Intel:**
```json
{
  "trail_info": {
    "name": "Continental Divide Trail - Utah Segment",
    "difficulty": "Expert/Extreme",
    "permits_required": "Wilderness permit for High Uintas",
    "water_sources": "Seasonal - streams and alpine lakes (filter required)",
    "cell_service": "NONE - expect zero service for entire Utah segment",
    "emergency_protocol": "Personal Locator Beacon (PLB) or satellite messenger REQUIRED",
    "wildlife": "Black bears, moose, mountain lions - bear canister required",
    "weather_hazards": [
      "Afternoon thunderstorms (daily in summer)",
      "Snow possible any month",
      "Hypothermia risk even in July/August",
      "Lightning exposure above treeline"
    ],
    "navigation": "GPS and paper maps required - trail often unmarked",
    "nearest_medical": "Evanston Regional Hospital (WY) - 50+ miles from most sections"
  }
}
```

**TripKit Potential:**
- "CDT Thru-Hiker's Utah Resupply Guide"
- "Continental Divide Trail: Utah Section Prep"
- "High Uintas CDT Access Points"

### Other Critical Gaps
- Highway 12 Scenic Byway (Boulder to Torrey - 32 miles, no services)
- Highway 95 (Hanksville to Blanding - 122 miles)
- Highway 24 through Capitol Reef
- Pony Express Trail (remote 4WD route - 133 miles, zero services)
- Burr Trail (Boulder to Bullfrog - 66 miles dirt, limited services)

### Database Entry Example
```json
{
  "road_warrior_intel": {
    "route_warnings": [
      {
        "route": "I-70 West from Green River",
        "distance": "110 miles",
        "last_services": "Green River (all services)",
        "next_services": "Salina",
        "cell_service": "NO SERVICE - Emergency call boxes only",
        "recommendation": "Fill up gas, grab food/water, use restroom before leaving Green River"
      }
    ],
    "emergency_contact": "Utah Highway Patrol: *11 (if service available)",
    "seasonal_considerations": "Winter: I-70 can close for snow. Check road conditions."
  }
}
```

---

## Page Structure with Sticky Navigation

### Navigation Pills
Sticky bar with smooth scroll:
- Overview (Guardian's Story)
- Gallery
- Video (if exists)
- Dan's Guide
- Seasons
- Map
- Nearby

### Genspark Template CSS Integration
Import design system from template:
- Color variables (--great-salt-blue, --pioneer-gold, --canyon-red, --navy-ridge)
- Card styles with hover effects
- Badge system (icon-badge classes)
- Section headers with icons
- Guardian tale box styles
- Dan's box styles
- Seasonal card grid
- Responsive breakpoints

---

## Enhanced Sidebar

### Quick Info Card
- Drive from SLC Airport
- County (links to Guardian)
- Price range
- Duration needed
- Best season
- Crowd level indicator

### Contact & Hours Card
- Address with "Get Directions" link
- Phone (click to call)
- Website link
- Operating hours table (highlight current day)
- Email

### Practical Details Card
- Pet policy (icon + details)
- Parking (cost, availability)
- Accessibility (wheelchair, facilities)
- Restrooms (availability, quality)
- Cell service status
- WiFi availability

### Nearby Card
- Related destinations (same county/region)
- Distance and drive time
- Quick description

---

## SEO & Technical Enhancements

### Schema Markup
```json
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "[Destination Name]",
  "description": "[Description]",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[LAT]",
    "longitude": "[LON]"
  },
  "address": "[Address]",
  "telephone": "[Phone]",
  "openingHours": "[Hours]",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[Rating]",
    "reviewCount": "[Count]"
  }
}
```

### Meta Tags
```tsx
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const destination = await getDestination(params.slug);

  return {
    title: `${destination.name} - ${destination.county} | SLCTrips`,
    description: destination.description?.slice(0, 160),
    openGraph: {
      title: destination.name,
      description: destination.description,
      images: [destination.image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: destination.name,
      description: destination.description,
      images: [destination.image_url],
    },
  };
}
```

---

## Implementation Priority

### Phase 1: Core Content (Week 1)
1. ✅ Hero accessibility fix (COMPLETED)
2. Guardian badge in hero
3. Guardian story section
4. Enhanced "Dan's Guide" structure
5. Road Warrior Alert component

### Phase 2: Visual Enhancement (Week 2)
1. Genspark template CSS integration
2. Sticky navigation pills
3. Seasonal strategy cards
4. Enhanced sidebar design
5. Card hover effects

### Phase 3: Media & Maps (Week 3)
1. YouTube video embeds
2. Interactive Google Maps
3. Photo gallery enhancements
4. Guardian images (transparent PNGs)

### Phase 4: Affiliates & Monetization (Week 4)
1. Amazon product widgets
2. AWIN hotel booking links
3. Viator tour cards
4. Affiliate disclosure sections

### Phase 5: Data Population (Ongoing)
1. Add campsite_recommendations to destinations
2. Add supply_stops data
3. Add road_warrior_intel
4. Add dining_recommendations
5. Critical route warnings (I-70, Highway 12, etc.)

---

## API Credentials Reference

```bash
# YouTube Data API
YOUTUBE_API_KEY=AIzaSyDKBoNppz8Wxnh7ri9GLs6LatMjrg7-as8

# Viator Tours
VIATOR_API_KEY=27667c52-5c00-4e88-959f-edfd717ec22b

# AWIN Affiliate
AWIN_KEY=a70a92f6-d44c-46fa-869b-b898dc5efbc6

# Amazon Associates
AMAZON_AFFILIATE_TAG=wasatchwise-20
AMAZON_AFFILIATE_LINK=https://www.amazon.com/b?node=48482381011&linkCode=ll2&tag=wasatchwise-20...
AMAZON_AFFILIATE_SHORT=https://amzn.to/3X83cfW

# Google APIs (already configured)
GOOGLE_PLACES_API_KEY=AIzaSyBvOkBwGJgZhY8LE9bKVvT7lQHgW4Wjzm8
```

---

## Success Metrics

### User Engagement
- Time on destination pages (target: 3+ minutes)
- Scroll depth (target: 75%+)
- Guardian link click-through rate
- Related destination exploration rate

### Monetization
- Amazon affiliate clicks & conversions
- Hotel booking click-through rate (AWIN)
- Viator tour bookings
- TripKit purchases from destination pages

### Safety Impact
- Road Warrior Alert views
- I-70 safety info engagement
- Emergency contact usage tracking

### Content Quality
- Guardian story completion rate
- Dan's Guide section engagement
- Video play rate
- Map interactions

---

## Notes for Implementation

### Guardian Data
- Use `destinations.county` to match with `guardians.county`
- Query: `SELECT * FROM guardians WHERE county = $1`
- Fallback: If no match, use generic "Utah Traveler" persona
- Image path: `/images/Guardians - Transparent/[COUNTY].png`

### Dan's Content
- `ai_tips` field can be used for "Dan's Pro Tips"
- Combine with structured data from new fields
- Voice: Casual, honest, practical
- Include dollar signs ($, $$, $$$) for pricing

### Responsive Design
- Mobile: Stack sidebar below content
- Tablet: Maintain 2-column layout
- Desktop: Full template with sidebar
- Sticky nav: Hide on mobile scroll down, show on scroll up

### Performance
- Lazy load images below fold
- Defer affiliate widgets
- Cache Guardian data (changes infrequently)
- Server-side render critical content
- Client-side hydrate interactive elements

---

## Files to Create/Modify

### New Files
- `/src/components/GuardianBadge.tsx`
- `/src/components/GuardianStory.tsx`
- `/src/components/DansGuide.tsx`
- `/src/components/YouTubeEmbed.tsx`
- `/src/components/SeasonalCards.tsx`
- `/src/components/InteractiveMap.tsx`
- `/src/components/RoadWarriorAlert.tsx`
- `/src/styles/destination-enhancements.css` (Genspark template styles)
- `/supabase/migrations/[timestamp]_add_road_warrior_fields.sql`

### Files to Modify
- `/src/app/destinations/[slug]/page.tsx` (main destination page)
- `/src/types/database.ts` (add new field types)
- `/src/lib/affiliates.ts` (affiliate link generators)

### Reference Files
- `/home/user/slctrips_universal_template.html` (Genspark design template)
- Current working page: `/src/app/destinations/[slug]/page.tsx` (458 lines)

---

## Testing Checklist

- [ ] Guardian badge displays correctly in hero
- [ ] Guardian story section loads county-specific Guardian
- [ ] Transparent PNG renders properly on various backgrounds
- [ ] Dan's Guide tabs/sections work on all devices
- [ ] Road Warrior Alert shows for critical routes
- [ ] YouTube embeds don't break without video_url
- [ ] Affiliate links include proper tracking parameters
- [ ] Mobile layout doesn't break
- [ ] Accessibility: Screen readers can navigate
- [ ] Performance: Lighthouse score 90+
- [ ] I-70 warning shows for affected destinations
- [ ] Map renders location pins correctly

---

**Ready for implementation when you are!**
