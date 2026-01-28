# TripKit Creation Playbook

> **The Secret Sauce**: SLC International Airport is #1 for rental car travelers in America. Every TripKit is positioned as "Land at SLC -> Rent a car -> Explore the Intermountain West."

---

## Phase 1: Research & Content Gathering

### 1.1 Create NotebookLM Source Library (50-100 sources)

**Target**: Build a comprehensive knowledge base for AI-assisted content generation.

#### Source Categories:
1. **Official Sources (10-15)**
   - Destination official websites
   - National Park Service / Forest Service pages
   - State tourism boards (visitutah.com, etc.)
   - Local chamber of commerce

2. **Expert Content (15-20)**
   - Local blog posts and trip reports
   - Expert review sites (AllTrails, Mountain Project, OnTheSnow)
   - Travel magazines (Outside, Backpacker, SKI)
   - Academic/historical sources

3. **Community Knowledge (10-15)**
   - Reddit trip reports (r/Utah, r/skiing, r/hiking)
   - TripAdvisor reviews (aggregate insights)
   - Local Facebook groups
   - Forum discussions

4. **Media Sources (10-15)**
   - YouTube video transcripts
   - Podcast episode notes
   - Documentary information
   - News articles

5. **Practical Guides (5-10)**
   - Gear guides
   - Safety resources
   - Permit/access information
   - Seasonal guides

### 1.2 Curate YouTube Videos (5-10 videos, 100K+ views)

**Why 100K+ views?**: Proven quality, engaging content, algorithm-tested.

#### Video Selection Criteria:
- [ ] Views: 100K+ (minimum)
- [ ] Recent: Within last 3 years (ideally)
- [ ] Quality: Good production value
- [ ] Educational: Teaches something useful
- [ ] Engaging: High like ratio, positive comments
- [ ] Legal: Embeddable (privacy-enhanced mode)

#### Video Categories to Find:
| Category | Example Search | Tab Placement |
|----------|----------------|---------------|
| Overview/Intro | "[destination] complete guide" | Planning |
| Beginner Tips | "[activity] beginner guide" | Essentials |
| History/Culture | "[destination] history documentary" | History |
| Pro Tips | "[destination] tips locals know" | On The Mountain |
| Seasonal | "[destination] [season] conditions" | Planning |

---

## Phase 2: Content Structure (4 Tabs)

### Tab Architecture

```
TripKit Resource Center
├── 🎿 Beginner Essentials (blue)
│   ├── Getting Started Guide
│   ├── Gear Checklist
│   ├── Rentals & Sizing
│   ├── First Day Tips
│   └── [Beginner YouTube videos]
│
├── 🏔️ History & Culture (purple)
│   ├── Origins & History
│   ├── Notable Stories
│   ├── Local Legends
│   ├── Cultural Significance
│   └── [Documentary/History videos]
│
├── ⛷️ On The Mountain/Trail (green)
│   ├── Difficulty Ratings
│   ├── Best Routes/Runs
│   ├── Safety & Conditions
│   ├── Pro Tips
│   └── [Action/POV videos]
│
└── 📅 Planning Your Trip (orange)
    ├── Getting There from SLC Airport (REQUIRED)
    ├── When to Go
    ├── Where to Stay (Booking.com)
    ├── Car Rental Guide
    ├── Passes & Permits
    └── [Overview videos]
```

### Resource Types

```typescript
interface Resource {
  id: string;           // kebab-case identifier
  title: string;        // Display title
  type: 'guide' | 'gear' | 'terminology' | 'sizing' | 'faq' | 'media';
  icon: string;         // Emoji
  content?: string;     // Markdown content
  items?: ResourceItem[]; // For lists (gear, terminology)
  media?: {             // For video/audio embeds
    type: 'youtube' | 'podcast' | 'carousel';
    videoId?: string;
    title?: string;
    channel?: string;
    views?: string;
  };
}
```

---

## Phase 3: SLC Airport Hub Positioning (CRITICAL)

### Every Planning Tab MUST Include:

#### 1. "Getting There from SLC Airport" Resource

```markdown
### From Salt Lake City International Airport

**Drive Time:** [X] hours ([X] miles)
**Route:** [I-X → Exit X → Highway X]
**GPS:** [Latitude, Longitude]

### Rental Car Recommendations
SLC Airport is the #1 airport for rental car road trips in America.

| Provider | Best For | Link |
|----------|----------|------|
| Enterprise | 5+ day trips | [Book →](affiliate-link) |
| Budget | Weekend getaways | [Book →](affiliate-link) |
| National | SUVs for winter | [Book →](affiliate-link) |

### Road Trip Extensions
- [Nearby destination 1] (+30 min)
- [Nearby destination 2] (+1 hr)
- [Multi-day loop option]
```

#### 2. Drive Time Callout

Always include:
- Exact drive time from SLC Airport
- Mile distance
- Best route with exit numbers
- GPS coordinates for destination

---

## Phase 4: Monetization Integration

### 4.1 Booking.com (Accommodations)

**Placement**: Planning Tab - "Where to Stay" resource

```markdown
### Where to Stay

#### Near [Destination]

**Budget-Friendly**
- [Hotel Name] - $XX/night
  [Book on Booking.com →](affiliate-link)

**Mid-Range**
- [Hotel Name] - $$X/night
  [Book on Booking.com →](affiliate-link)

**Premium/Unique**
- [Lodge/Cabin] - $XXX/night
  [Book on Booking.com →](affiliate-link)

*Bookings support SLCTrips.com at no extra cost to you.*
```

### 4.2 AWIN Affiliates (Gear & Shopping)

**Placement**: Essentials Tab - "Gear Checklist" resource

```markdown
### Essential Gear

**The Basics**
- [ ] [Item 1] - [Shop at REI →](awin-link)
- [ ] [Item 2] - [Shop at Backcountry →](awin-link)

**Nice to Have**
- [ ] [Item 3] - [Shop at REI →](awin-link)

*Gear links support SLCTrips.com. We only recommend products we trust.*
```

### 4.3 Monetization by Tab

| Tab | Primary Monetization |
|-----|---------------------|
| Essentials | AWIN gear links (REI, Backcountry) |
| History | Books, documentaries (Amazon) |
| On The Mountain | Lessons, guided tours (Viator) |
| Planning | Booking.com, car rentals, flights |

---

## Phase 5: Database Migration

### SQL Migration Template

```sql
-- TripKit Resource Migration: [TK-XXX]
-- Created: [Date]

-- Update TripKit resources JSON
UPDATE tripkits
SET resources = '[
  {
    "id": "getting-there",
    "title": "Getting There from SLC Airport",
    "type": "guide",
    "icon": "✈️",
    "content": "### From Salt Lake City International Airport\n\n**Drive Time:** X hours..."
  },
  {
    "id": "gear-checklist",
    "title": "Essential Gear",
    "type": "gear",
    "icon": "🎒",
    "items": [
      {"label": "Item 1", "value": "Description..."}
    ]
  },
  {
    "id": "youtube-overview",
    "title": "Video: Complete Guide",
    "type": "media",
    "icon": "🎬",
    "media": {
      "type": "youtube",
      "videoId": "XXXXXXXXXXX",
      "title": "Video Title",
      "channel": "Channel Name",
      "views": "1.2M"
    }
  }
]'::jsonb
WHERE code = 'TK-XXX';
```

### CATEGORY_MAP Update

When adding resources, update `TripKitResourceCenter.tsx`:

```typescript
const CATEGORY_MAP: Record<string, TabCategory> = {
  // Existing...
  'new-resource-id': 'essentials', // or history, mountain, planning
};
```

---

## Phase 6: Quality Checklist

### Before Publishing

#### Content Quality
- [ ] 50+ sources in NotebookLM
- [ ] 5-10 YouTube videos (100K+ views each)
- [ ] All 4 tabs have meaningful content
- [ ] No broken embeds or links

#### SLC Airport Positioning
- [ ] "Getting There from SLC Airport" resource exists
- [ ] Drive time prominently displayed
- [ ] Rental car guide included
- [ ] GPS coordinates provided

#### Monetization
- [ ] Booking.com "Where to Stay" resource
- [ ] AWIN gear links in Essentials tab
- [ ] Car rental affiliate links
- [ ] Affiliate disclosure text included

#### Technical
- [ ] Resources JSON is valid
- [ ] CATEGORY_MAP updated for all resource IDs
- [ ] Images optimized and accessible
- [ ] YouTube videos use privacy-enhanced mode

---

## Quick Reference: Resource ID Naming

```
Category Prefixes:
- getting-*     → Planning tab
- gear-*        → Essentials tab
- history-*     → History tab
- safety-*      → On The Mountain tab
- youtube-*     → Varies by content
- booking-*     → Planning tab
```

---

## TripKit Creation Workflow Summary

```
1. RESEARCH (Day 1-2)
   └── Build NotebookLM (50-100 sources)
   └── Curate YouTube videos (5-10, 100K+ views)
   └── Identify affiliate opportunities

2. STRUCTURE (Day 2-3)
   └── Organize content into 4 tabs
   └── Write markdown for each resource
   └── Add media embeds

3. SLC POSITIONING (Day 3)
   └── Create "Getting There" resource
   └── Add drive times and routes
   └── Include rental car recommendations

4. MONETIZATION (Day 3-4)
   └── Add Booking.com links
   └── Add AWIN gear links
   └── Include disclosure text

5. MIGRATION (Day 4)
   └── Create SQL migration
   └── Update CATEGORY_MAP
   └── Test in staging

6. DEPLOY (Day 4-5)
   └── Run migration
   └── Verify on production
   └── Test all embeds and links
```

---

*Every TripKit becomes a switchboard—zero to hero.*

Last Updated: December 2025
