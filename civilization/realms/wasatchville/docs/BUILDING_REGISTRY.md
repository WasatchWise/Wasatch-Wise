# BUILDING_REGISTRY: WasatchVille

**Realm:** WasatchVille
**Last Updated:** 2025-01-25
**Total Buildings:** 8 (expandable)

---

## Building Index

| ID | Name | Venture | Status |
|----|------|---------|--------|
| B001 | Capitol Building | Wasatch Wise HQ | 🟢 Active |
| B002 | Amusement Park | SLC Trips | 🟢 Active |
| B003 | Concert Hall | Rock Salt | 🟢 Active |
| B004 | Community College | Adult AI Academy | 🟡 Building |
| B005 | City Park | DAiTE | 🟡 Building |
| B006 | Board of Education | Ask Before You App | 🟢 Active |
| B007 | Bank | Financial Operations | 🟢 Active |
| B008 | Library | NotebookLM Hub | 🟢 Active |

---

## B001: Capitol Building

### Identity
| Property | Value |
|----------|-------|
| Building ID | B001 |
| Building Name | Capitol Building |
| Business Entity | Wasatch Wise LLC |
| Building Type | Government - Capitol |
| Icon | 🏛️ |
| Sprite | `/assets/sprites/capitol.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 45, y: 35 } |
| Size Category | Large |
| Footprint | 3x3 tiles |
| Z-Index | 100 (foreground) |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Wasatch Wise LLC (holding company) |
| Purpose | Corporate headquarters, brand hub |
| Workers | John (Mayor) |
| Output | Strategic direction, cross-venture coordination |
| Health | Overall portfolio performance |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| totalRevenue | Treasury | Stripe (aggregate) | Currency |
| activeVentures | Departments | Manual | Number |
| monthlyGrowth | Growth Rate | Calculated | Percentage |
| cashRunway | Runway | Bank balance / burn | Months |

### Data Sources
```javascript
{
  stripe: {
    type: 'aggregate',
    accounts: ['all'],
    metrics: ['revenue', 'mrr', 'transactions']
  },
  manual: {
    fields: ['ventures_count', 'key_milestones']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Thriving | Revenue up 20%+ | Golden glow, flag waving |
| Healthy | Metrics on target | Normal appearance |
| Attention | Any metric yellow | Slight smoke |
| Critical | Cash runway < 2 months | Red pulse, alarm icon |

### Agent Assignment
- **Primary:** Mayor (strategic oversight)
- **Secondary:** CFO (financial health)

### Template Notes
- **Reusable:** Yes - standard "HQ" building type
- **Genre-Specific:** Capitol aesthetic is city-builder specific
- **Config Points:** Name, metrics, thresholds, sprite

---

## B002: Amusement Park

### Identity
| Property | Value |
|----------|-------|
| Building ID | B002 |
| Building Name | Amusement Park |
| Business Entity | SLC Trips |
| Building Type | Entertainment - Theme Park |
| Icon | 🎢 |
| Sprite | `/assets/sprites/amusement-park.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 15, y: 25 } |
| Size Category | Large |
| Footprint | 4x3 tiles |
| Z-Index | 90 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | SLC Trips platform |
| Purpose | Tourism content & trip planning |
| Visitors | Website visitors, TikTok viewers |
| Rides | Individual destinations (1000+) |
| Ticket Sales | Affiliate revenue, TripKit sales |
| Popularity | Social media engagement |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| destinations | Rides | Supabase | Number |
| pageViews | Visitors Today | Analytics | Number |
| tiktokViews | TikTok Views | TikTok API | Number (K/M) |
| revenue | Ticket Sales | Stripe | Currency |

### Data Sources
```javascript
{
  supabase: {
    table: 'destinations',
    metrics: ['count', 'categories', 'regions']
  },
  tiktok: {
    account: 'slctrips',
    metrics: ['views', 'followers', 'engagement']
  },
  stripe: {
    product: 'tripkit',
    metrics: ['sales', 'revenue']
  },
  analytics: {
    property: 'slctrips.com',
    metrics: ['pageviews', 'users', 'sessions']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Viral | TikTok views > 100K/week | Fireworks, crowds |
| Popular | Traffic up 20%+ | Busy, lights on |
| Normal | Steady metrics | Standard operation |
| Slow | Traffic down 20%+ | Fewer visitors, dim |

### Agent Assignment
- **Primary:** Park Director (content strategy)
- **Secondary:** Marketing Manager (social media)

### Interior View (Phase 2)
When clicked, expands to show:
- Individual "rides" (destination categories)
- "Guest satisfaction" (engagement metrics)
- "Maintenance" (content updates needed)
- Mt. Olympians character gallery

### Template Notes
- **Reusable:** Yes - "content platform" building type
- **Genre Variations:** Theme park (city), Arena (RTS), Training Ground (RPG)
- **Config Points:** Platform name, social accounts, product name

---

## B003: Concert Hall

### Identity
| Property | Value |
|----------|-------|
| Building ID | B003 |
| Building Name | Concert Hall |
| Business Entity | Rock Salt |
| Building Type | Culture - Entertainment Venue |
| Icon | 🎸 |
| Sprite | `/assets/sprites/concert-hall.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 60, y: 45 } |
| Size Category | Medium |
| Footprint | 3x2 tiles |
| Z-Index | 85 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Rock Salt platform |
| Purpose | SLC music community hub |
| Performers | Artists in database |
| Shows | Radio shows, playlists |
| Audience | Listeners, subscribers |
| Box Office | Sponsorships, affiliate revenue |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| artists | Artists | Supabase | Number |
| venues | Venues | Supabase | Number |
| radioListeners | Listeners | Streaming | Number |
| subscribers | Subscribers | Email list | Number |

### Data Sources
```javascript
{
  supabase: {
    tables: ['artists', 'venues', 'shows'],
    metrics: ['count', 'new_this_month']
  },
  streaming: {
    platform: 'mixcloud', // or custom
    metrics: ['plays', 'listeners', 'duration']
  },
  email: {
    provider: 'convertkit',
    list: 'rock_salt',
    metrics: ['subscribers', 'open_rate']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Live Show | Active radio stream | Lights flashing, crowd |
| Popular | Listeners up | Marquee lit, busy |
| Normal | Steady metrics | Standard appearance |
| Dark | No recent activity | Lights off, quiet |

### Agent Assignment
- **Primary:** Concert Manager (music industry)
- **Secondary:** Booking Agent (Tour Spider Rider)

### Interior View (Phase 2)
When clicked, expands to show:
- Current "programming" (radio schedule)
- "Artist roster" (featured artists)
- "Upcoming shows" (events calendar)
- "Box office" (revenue breakdown)

### Template Notes
- **Reusable:** Yes - "community platform" building type
- **Genre Variations:** Concert Hall (city), Tavern (RPG), Barracks (RTS)
- **Config Points:** Platform name, music sources, venue database

---

## B004: Community College

### Identity
| Property | Value |
|----------|-------|
| Building ID | B004 |
| Building Name | Community College |
| Business Entity | Adult AI Academy |
| Building Type | Education - School |
| Icon | 🎓 |
| Sprite | `/assets/sprites/college.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 30, y: 55 } |
| Size Category | Medium |
| Footprint | 3x2 tiles |
| Z-Index | 80 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Adult AI Academy |
| Purpose | AI training for businesses |
| Students | Course enrollees |
| Courses | Training modules |
| Degrees | Certifications |
| Tuition | Course revenue |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| enrollees | Students | LMS | Number |
| courses | Courses | Manual | Number |
| completions | Graduates | LMS | Number |
| revenue | Tuition | Stripe | Currency |

### Data Sources
```javascript
{
  lms: {
    platform: 'teachable', // or custom
    metrics: ['enrollments', 'completions', 'progress']
  },
  stripe: {
    products: ['courses', 'certifications'],
    metrics: ['sales', 'revenue', 'refunds']
  },
  manual: {
    fields: ['courses_count', 'upcoming_courses']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Graduation | Completion spike | Caps in air, celebration |
| Class in Session | Active enrollees | Lights on, people inside |
| Enrollment Open | New course launch | Banner, "NOW ENROLLING" |
| Break | Low activity | Quiet, minimal lights |

### Agent Assignment
- **Primary:** Dean (curriculum strategy)
- **Secondary:** Registrar (enrollment tracking)

### Template Notes
- **Reusable:** Yes - "education/training" building type
- **Genre Variations:** College (city), Academy (RPG), Training Center (RTS)
- **Config Points:** Course platform, pricing, curriculum topics

---

## B005: City Park

### Identity
| Property | Value |
|----------|-------|
| Building ID | B005 |
| Building Name | City Park |
| Business Entity | DAiTE |
| Building Type | Recreation - Park |
| Icon | 🌳 |
| Sprite | `/assets/sprites/city-park.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 50, y: 60 } |
| Size Category | Medium |
| Footprint | 3x3 tiles |
| Z-Index | 75 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | DAiTE dating platform |
| Purpose | AI-powered authentic connections |
| Park Visitors | App users |
| Benches | Matching algorithm |
| Meetups | Successful connections |
| Park Events | Feature launches |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| users | Park Visitors | App DB | Number |
| matches | Connections | App DB | Number |
| conversionRate | Bench Success | Calculated | Percentage |
| nps | Happiness Score | Surveys | Number |

### Data Sources
```javascript
{
  app: {
    platform: 'supabase', // DAiTE backend
    metrics: ['users', 'matches', 'messages', 'dates']
  },
  analytics: {
    property: 'daite.app',
    metrics: ['signups', 'retention', 'engagement']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Romance | Successful match | Hearts floating, couples |
| Busy | High user activity | Many people walking |
| Pleasant | Normal activity | Birds, sunshine |
| Quiet | Low activity | Fewer visitors |

### Agent Assignment
- **Primary:** Park Ranger (community management)
- **Secondary:** CYRAiNO (the dating AI itself)

### Template Notes
- **Reusable:** Yes - "social platform" building type
- **Genre Variations:** Park (city), Inn (RPG), Cantina (sci-fi)
- **Config Points:** Platform name, key metrics, user terminology

---

## B006: Board of Education

### Identity
| Property | Value |
|----------|-------|
| Building ID | B006 |
| Building Name | Board of Education |
| Business Entity | Ask Before You App |
| Building Type | Government - Regulatory |
| Icon | 📚 |
| Sprite | `/assets/sprites/board-of-ed.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 70, y: 30 } |
| Size Category | Medium |
| Footprint | 2x2 tiles |
| Z-Index | 85 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Privacy consulting & ABYA |
| Purpose | Student data privacy expertise |
| Regulations | Compliance frameworks |
| Inspectors | Consulting engagements |
| Report Cards | Privacy assessments |
| Policy | Training materials |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| clients | Districts Served | CRM | Number |
| trainings | Sessions Delivered | Calendar | Number |
| assessments | Audits Completed | Manual | Number |
| revenue | Contract Value | Stripe | Currency |

### Data Sources
```javascript
{
  crm: {
    platform: 'notion', // or custom
    metrics: ['clients', 'pipeline', 'contracts']
  },
  calendar: {
    source: 'google',
    metrics: ['trainings_scheduled', 'completed']
  },
  stripe: {
    products: ['consulting', 'assessments'],
    metrics: ['revenue', 'invoices']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| In Session | Active consulting | Meeting in progress |
| Preparing | Upcoming engagement | Lights on, busy |
| Available | Open for clients | "Open" sign |
| Building Case | Legal prep | Serious, documents |

### Agent Assignment
- **Primary:** Superintendent (compliance strategy)
- **Secondary:** Legal Advisor (USBE case)

### Template Notes
- **Reusable:** Yes - "consulting/compliance" building type
- **Genre Variations:** Board (city), Temple (RPG), Command Center (RTS)
- **Config Points:** Specialty area, client terminology, deliverable types

---

## B007: Bank

### Identity
| Property | Value |
|----------|-------|
| Building ID | B007 |
| Building Name | First National Bank |
| Business Entity | Financial Operations |
| Building Type | Finance - Bank |
| Icon | 🏦 |
| Sprite | `/assets/sprites/bank.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 40, y: 20 } |
| Size Category | Medium |
| Footprint | 2x2 tiles |
| Z-Index | 90 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Financial management |
| Purpose | Cash flow, treasury, taxes |
| Vault | Bank accounts |
| Transactions | Revenue/expenses |
| Interest | Investment returns |
| Loans | Credit lines, financing |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| balance | Vault Balance | Bank API | Currency |
| monthlyBurn | Monthly Burn | Calculated | Currency |
| runway | Runway | Calculated | Months |
| taxReserve | Tax Reserve | Manual | Currency |

### Data Sources
```javascript
{
  banking: {
    provider: 'plaid', // or manual
    accounts: ['checking', 'savings', 'business'],
    metrics: ['balance', 'transactions']
  },
  accounting: {
    platform: 'quickbooks', // or manual
    metrics: ['income', 'expenses', 'burn_rate']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Prosperous | Runway > 12 months | Golden glow, guards |
| Stable | Runway 6-12 months | Normal, secure |
| Cautious | Runway 3-6 months | Dimmer, concern |
| Critical | Runway < 3 months | Red alert, alarm |

### Agent Assignment
- **Primary:** Bank Manager (daily finances)
- **Secondary:** CFO (from Capitol, strategic finance)

### Template Notes
- **Reusable:** Yes - universal "finance" building
- **Genre Variations:** Bank (city), Treasury (RPG), Supply Depot (RTS)
- **Config Points:** Accounts, runway thresholds, tax rate

---

## B008: Library

### Identity
| Property | Value |
|----------|-------|
| Building ID | B008 |
| Building Name | City Library |
| Business Entity | NotebookLM Hub |
| Building Type | Archives - Library |
| Icon | 📖 |
| Sprite | `/assets/sprites/library.png` |

### Position & Size
| Property | Value |
|----------|-------|
| Grid Position | { x: 25, y: 40 } |
| Size Category | Small |
| Footprint | 2x2 tiles |
| Z-Index | 80 |

### Business Mapping
| Game Concept | Business Reality |
|--------------|------------------|
| Building | Documentation & knowledge base |
| Purpose | Institutional memory, SOPs |
| Books | NotebookLM notebooks |
| Archives | Historical documents |
| Research | Claude conversations |
| Librarian | Knowledge retrieval |

### Metrics Displayed
| Metric | Label | Source | Format |
|--------|-------|--------|--------|
| notebooks | Volumes | NotebookLM | Number |
| documents | Documents | Manual | Number |
| lastUpdated | Last Catalog Update | System | Date |
| searches | Research Queries | Analytics | Number |

### Data Sources
```javascript
{
  notebooklm: {
    account: 'wasatch_wise',
    metrics: ['notebooks', 'sources', 'activity']
  },
  manual: {
    fields: ['key_documents', 'categories']
  }
}
```

### Visual States
| State | Trigger | Visual |
|-------|---------|--------|
| Active Research | Recent queries | Lights on, activity |
| Well-Stocked | Documentation current | Organized, calm |
| Needs Update | Stale documents | Dusty, dim |
| Archived | Low usage | Quiet, preserved |

### Agent Assignment
- **Primary:** Librarian (knowledge retrieval)

### Template Notes
- **Reusable:** Yes - "documentation" building type
- **Genre Variations:** Library (city), Archives (RPG), Intel Center (RTS)
- **Config Points:** Knowledge sources, categories, search integration

---

## Future Buildings (Empty Lots)

Reserved spaces for future ventures:

| Lot ID | Location | Potential Use |
|--------|----------|---------------|
| LOT01 | { x: 80, y: 50 } | PipelineIQ (if productized) |
| LOT02 | { x: 10, y: 60 } | Starmy/Manlyman music ventures |
| LOT03 | { x: 55, y: 15 } | Future venture TBD |

Empty lots display as:
- Grassy area with "FOR DEVELOPMENT" sign
- Click to see "Future Plans" modal
- Agent: City Planner (discusses potential uses)

---

## Building Interaction Patterns

### Click Behavior
1. Single click → Select building (show info panel)
2. Double click → Enter building (interior view)
3. Right click → Quick actions menu

### Hover Behavior
1. Hover → Show tooltip with name + key metric
2. Extended hover (2s) → Expand tooltip with status

### Alert Indicators
- 🔴 Critical: Pulsing red, alert icon
- 🟡 Warning: Yellow badge, attention needed
- 🟢 Healthy: No indicator (default)
- 🌟 Excellent: Sparkle effect, celebration

---

## Changelog

| Date | Building | Change |
|------|----------|--------|
| 2025-01-25 | All | Initial registry created |
