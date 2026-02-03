# WasatchVille Weather Service

**Realm:** WasatchVille  
**Service Type:** Shared Infrastructure  
**Created:** February 2, 2026  
**Status:** 🟢 Active (SLC Trips), 🟡 Expandable to other buildings

---

## Overview

The **WasatchVille Weather Service** is a shared infrastructure service that provides real-time weather data to all buildings in the realm. It uses the OpenWeather API and enables agents to make weather-aware content and operational decisions.

### Current Implementation

**Primary User:** SLC Trips (Amusement Park - B002)  
**API Provider:** OpenWeather API  
**Configuration:** `OPENWEATHER_API_KEY` or `NEXT_PUBLIC_OPENWEATHER_API_KEY`

---

## Use Case: February 2026 Content Strategy

### The Pattern

On **February 2, 2026**, the SLC Trips content team needed to align video production with current weather conditions:

**Current Conditions:**
- Alta: 60" base, 0" new snow, sunny 33°F
- Park City: 40" base, sunny 34°F
- Snowbird: 58" base, sunny 39°F
- Forecast: High pressure, no fresh snow, bluebird conditions through Feb 8

**Strategic Response:**
- **Week 1 (Feb 2-8):** Create high-quality cinematic content showcasing bluebird ski conditions, base depth reliability, luxury experiences
- **Week 2 (Feb 9-15):** Pattern change brings fresh snow → "Utah's Powder Is BACK" urgency content
- **Late Feb (16-28):** Transition to spring/national parks content

### Why Weather Matters

| Venture | Weather Impact | Content Strategy | Revenue Impact |
|---------|---------------|------------------|----------------|
| **SLC Trips** | Ski conditions, road trip weather, national park timing | Fresh snow = urgency content; stable weather = cinematic B-roll; spring warmth = parks transition | Affiliate bookings spike during storms, sunny days drive planning |
| **Rock Salt** | Outdoor concerts, festival planning, venue considerations | Weather affects outdoor shows, festival scheduling | Event cancellations/rescheduling |
| **Adult AI Academy** | Conference timing, workshop travel | Plan travel for corporate training | Client scheduling |
| **DAiTE** | Date activity suggestions | Weather-appropriate date ideas | User engagement |
| **Pipeline IQ** | Construction project scheduling, site visits | Weather delays affect project timelines | Lead qualification |

---

## Technical Architecture

### Current Implementation (SLC Trips)

```typescript
// apps/slctrips/src/app/api/weather/route.ts
export async function GET() {
  const API_KEY = process.env.OPENWEATHER_API_KEY || 
                  process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Salt Lake City,US&appid=${API_KEY}&units=imperial`,
    { next: { revalidate: 1800 } } // Cache 30 minutes
  );
  
  return Response.json(await response.json());
}
```

**Used In:**
- `apps/slctrips/src/components/WeatherWidget.tsx` - Homepage weather display
- `apps/slctrips/src/app/api/dan/chat/route.ts` - Dan Concierge (weather-aware recommendations)
- Content Security Policy: `api.openweathermap.org` whitelisted

### Proposed Shared Service

```typescript
// packages/wasatchville-weather/src/index.ts
export interface WeatherServiceConfig {
  apiKey: string;
  defaultLocation: string;
  cacheMinutes?: number;
  buildingId?: string; // For attribution
}

export class WasatchvilleWeatherService {
  constructor(config: WeatherServiceConfig) {
    this.config = config;
  }

  async getCurrentWeather(location?: string): Promise<WeatherData> {
    // Fetch current conditions
  }

  async getForecast(location?: string, days: number = 7): Promise<ForecastData> {
    // Fetch forecast
  }

  async getMultipleLocations(locations: string[]): Promise<WeatherData[]> {
    // Batch fetch for efficiency
  }

  async getSkiConditions(resorts: string[]): Promise<SkiConditionData[]> {
    // Specialized for ski resorts
  }

  // Content strategy helper
  async getContentTiming(venture: string): Promise<ContentWeatherAdvice> {
    // Returns recommendations based on weather patterns
    // Example: "Bluebird conditions - ideal for cinematic content"
    //          "Fresh snow incoming - create urgency content"
    //          "Spring warmth - pivot to parks content"
  }
}
```

---

## Building-Specific Use Cases

### B002: Amusement Park (SLC Trips)

**Primary Use:** Content strategy timing  
**Weather Triggers:**
- ❄️ Fresh snow → Ski urgency content, last-minute booking CTAs
- ☀️ Bluebird days → Cinematic B-roll, luxury/lifestyle content
- 🌡️ Spring warmth → National parks pivot, road trip planning
- 🌨️ Storm forecasts → Powder alerts, 48-hour booking windows

**Agent Integration:**
- **Park Director (A003):** Receives weather briefings to inform weekly content calendar
- **Director of Awin Monetization (A011):** Adjusts CTA urgency based on booking windows

**Example:**
```typescript
// Morning briefing for Park Director
const weather = await weatherService.getCurrentWeather('Salt Lake City');
const forecast = await weatherService.getForecast('Salt Lake City', 7);

if (forecast.snowIncoming && weather.currentSnow === 0) {
  return {
    alert: "Storm incoming in 3 days",
    recommendation: "Create 'powder is back' content NOW for post-storm release",
    contentAngle: "Before/after using this week's bluebird B-roll",
    urgency: "high"
  };
}
```

---

### B003: Concert Hall (Rock Salt)

**Primary Use:** Event planning, outdoor venue considerations  
**Weather Triggers:**
- 🌧️ Rain forecast → Indoor venue preference, reschedule alerts
- ☀️ Clear skies → Promote outdoor shows, summer concert series
- 🌡️ Extreme heat/cold → Venue capacity warnings

**Agent Integration:**
- **Concert Manager (A004):** Weather-aware booking recommendations
- **Tour Spider Rider:** Weather considerations in tour routing

**Example:**
```typescript
// Concert booking recommendation
const venueWeather = await weatherService.getForecast('Salt Lake City', 30);

if (venueWeather.hasRainDays(showDate)) {
  return {
    recommendation: "Indoor venue recommended for this date",
    alternatives: ["Urban Lounge", "The Depot", "Metro Music Hall"],
    outdoorBackup: "Gallivan Center (covered stage)"
  };
}
```

---

### B004: Community College (Adult AI Academy)

**Primary Use:** Corporate training travel, conference scheduling  
**Weather Triggers:**
- ✈️ Travel conditions → Workshop rescheduling
- 🌨️ Winter storms → Remote delivery pivot
- ☀️ Pleasant weather → In-person workshop promotion

**Agent Integration:**
- **Dean (A005):** Workshop scheduling recommendations

---

### B005: City Park (DAiTE)

**Primary Use:** Date activity suggestions  
**Weather Triggers:**
- ☀️ Sunny → Outdoor date ideas (parks, hiking, patios)
- 🌧️ Rainy → Indoor alternatives (museums, cafes, theaters)
- 🌨️ Snowy → Winter date ideas (ice skating, sledding, hot chocolate)

**Agent Integration:**
- **CYRAiNO AI:** Weather-aware date planning
- **Park Ranger (A006):** Community event recommendations

**Example:**
```typescript
// CYRAiNO date suggestion
const weather = await weatherService.getCurrentWeather('Salt Lake City');

if (weather.isSunny && weather.temp > 70) {
  return {
    suggestion: "Perfect patio weather!",
    dateIdeas: [
      "Sunset drinks at Red Rock Brewing patio",
      "Evening stroll at Liberty Park",
      "Outdoor concert at Gallivan Center"
    ]
  };
}
```

---

### B009: Telecom Tower (Pipeline IQ)

**Primary Use:** Construction project timing, site visit planning  
**Weather Triggers:**
- 🌧️ Rain delays → Project timeline adjustments
- ❄️ Winter conditions → Seasonal work stoppages
- ☀️ Favorable weather → Site visit recommendations

**Agent Integration:**
- **Project Director:** Weather-aware lead qualification
- **Pipeline timing:** Construction window optimization

**Example:**
```typescript
// Project viability check
const siteWeather = await weatherService.getForecast(projectLocation, 14);

if (siteWeather.hasMultipleRainDays()) {
  return {
    alert: "Weather delays likely for this project",
    timelineImpact: "+2 weeks estimated",
    recommendation: "Factor weather buffer into proposal"
  };
}
```

---

### B010: Automation Studio (AI Social Media Agency)

**Primary Use:** Client content strategy (weather-aware social media)  
**Weather Triggers:**
- Varies by client industry (retail, tourism, restaurants, services)

**Agent Integration:**
- **Automation Director:** Weather-aware content generation for clients

**Example:** Restaurant client
```typescript
// Weather-based content generation
const weather = await weatherService.getForecast(clientLocation, 3);

if (weather.isHotWeekend()) {
  return {
    contentIdea: "Beat the heat with our air-conditioned patio + cold drinks special",
    postTiming: "Thursday afternoon (prime weekend planning)",
    cta: "Reserve your cool spot now"
  };
}
```

---

## Agent Integration Patterns

### Morning Briefing Integration

All agents can receive weather context in their morning briefings:

```typescript
// Mayor's morning briefing (A001)
const cityWeather = await weatherService.getCurrentWeather('Salt Lake City');

briefing.weather = {
  current: cityWeather.summary, // "Sunny, 34°F"
  impact: [
    {
      building: "Amusement Park",
      alert: "Bluebird conditions - ideal for content creation today"
    },
    {
      building: "Concert Hall",
      alert: "Clear skies - outdoor venue bookings favorable"
    }
  ]
};
```

---

### Content Strategy Automation

**Weather-Aware Content Calendar:**

```typescript
// Weekly content planning
async function generateWeeklyContentPlan(buildingId: string) {
  const forecast = await weatherService.getForecast('Salt Lake City', 7);
  
  const plan = {
    week: getCurrentWeek(),
    weatherPattern: forecast.pattern, // "stable bluebird" | "storm incoming" | "spring transition"
    recommendations: []
  };

  if (buildingId === 'B002' && forecast.pattern === 'storm incoming') {
    plan.recommendations.push({
      day: forecast.stormDate,
      priority: "high",
      content: "Fresh powder urgency content",
      timing: "Post within 24-48 hours of snowfall",
      cta: "Last-minute booking offers",
      affiliateOpportunity: "Hotels + car rentals will spike"
    });
  }

  return plan;
}
```

---

### Real-Time Content Triggers

**Automated alerts when weather conditions match content opportunities:**

```typescript
// Background monitoring service
weatherService.onConditionChange(async (change) => {
  if (change.type === 'fresh_snow' && change.amount > 6) {
    // Alert Park Director
    await notify('A003', {
      alert: "Fresh snow detected",
      amount: `${change.amount}" at ${change.location}`,
      recommendation: "Create powder content within 24 hours",
      urgency: "high"
    });
  }

  if (change.type === 'bluebird_streak' && change.days >= 3) {
    await notify('A003', {
      alert: "Extended bluebird conditions",
      recommendation: "Capture high-quality B-roll for future use",
      timing: "Best light: golden hour (5-6pm)"
    });
  }
});
```

---

## Data Structure

### WeatherData Interface

```typescript
interface WeatherData {
  location: string;
  timestamp: Date;
  current: {
    temp: number;           // Fahrenheit
    feelsLike: number;
    condition: string;      // "Sunny" | "Cloudy" | "Snow" | "Rain"
    conditionId: number;    // OpenWeather condition code
    description: string;    // "clear sky" | "light snow"
    humidity: number;       // Percentage
    windSpeed: number;      // mph
    visibility: number;     // miles
  };
  forecast?: {
    daily: DailyForecast[];
    hourly: HourlyForecast[];
  };
  skiConditions?: {
    resort: string;
    baseDepth: number;      // inches
    newSnow24h: number;     // inches
    newSnow48h: number;
    liftsOpen: number;
    status: 'open' | 'closed' | 'limited';
  }[];
  contentStrategy?: {
    pattern: 'stable' | 'storm incoming' | 'fresh powder' | 'spring transition';
    recommendations: string[];
    timing: 'urgent' | 'planned' | 'long-term';
    bestFilmingHours?: string[];
  };
}
```

---

## Implementation Roadmap

### Phase 1: Extract SLC Trips Weather Service (Current) ✅
- [x] OpenWeather API integrated in SLC Trips
- [x] Weather Widget component
- [x] Dan Concierge weather-aware recommendations
- [x] Content strategy based on weather (February 2026 use case)

### Phase 2: Create Shared Package (Next)
- [ ] Extract weather service to `packages/wasatchville-weather`
- [ ] Add building-specific configuration
- [ ] Create agent integration helpers
- [ ] Add content strategy automation

### Phase 3: Expand to Other Buildings
- [ ] Rock Salt: Event planning integration
- [ ] DAiTE: Date suggestion integration
- [ ] Pipeline IQ: Project timing integration
- [ ] Automation Studio: Client content generation

### Phase 4: Advanced Features
- [ ] Historical weather data for trend analysis
- [ ] Weather-based revenue correlation tracking
- [ ] Automated content calendar adjustments
- [ ] Multi-location support for national expansion

---

## Configuration

### Environment Variables

```bash
# Required for all buildings
OPENWEATHER_API_KEY=your_api_key_here

# Optional: Building-specific locations
WEATHER_DEFAULT_LOCATION="Salt Lake City,US"
WEATHER_CACHE_MINUTES=30

# Ski resort monitoring (SLC Trips specific)
WEATHER_SKI_RESORTS="Alta,Snowbird,Park City,Brighton"
WEATHER_ENABLE_SKI_CONDITIONS=true
```

### Per-Building Config

```typescript
// apps/slctrips/weather.config.ts
export const weatherConfig = {
  buildingId: 'B002',
  defaultLocation: 'Salt Lake City,US',
  enableSkiConditions: true,
  resorts: ['Alta', 'Snowbird', 'Park City', 'Brighton'],
  contentStrategyEnabled: true,
  alertThresholds: {
    freshSnow: 6,        // inches
    bluebird: 3,         // consecutive days
    tempChange: 15,      // degrees F
  }
};
```

---

## Cost & Usage

### OpenWeather API Pricing

**Free Tier:**
- 1,000 calls/day
- Current weather + 5-day forecast
- Sufficient for WasatchVille current scale

**Usage Estimate:**
- Morning briefings: 11 agents × 1 call = 11 calls/day
- Content checks: ~10 calls/day (triggered by events)
- Widget updates: Cached 30 min = ~48 calls/day
- **Total: ~70 calls/day** (well within free tier)

**Scaling Considerations:**
- If expanding to multiple cities/locations: 500 calls/day still free
- Paid tier ($40/mo): 100,000 calls/month if needed

---

## Success Metrics

### Weather Service Performance

| Metric | Target | Current |
|--------|--------|---------|
| API Uptime | 99%+ | ✅ 95%+ (SLC Trips) |
| Cache Hit Rate | 80%+ | TBD |
| Response Time | <500ms | ✅ <300ms avg |
| Agent Integration | 11 agents | 2 agents (A003, A011) |

### Business Impact

| Building | Weather-Aware Content | Revenue Impact | Status |
|----------|----------------------|----------------|--------|
| SLC Trips (B002) | Yes | High - Affiliate bookings spike during storms | ✅ Active |
| Rock Salt (B003) | Partial | Medium - Event planning | 🟡 Manual |
| Adult AI Academy (B004) | No | Low - Travel planning | ⚪ Not integrated |
| DAiTE (B005) | No | Medium - Date suggestions | ⚪ Future |
| Pipeline IQ (B009) | No | High - Project timing | ⚪ Future |

---

## Related Documentation

- [SLC Trips SMM Content Guide](../../../apps/slctrips/docs/SMM_CONTENT_GUIDE.md)
- [February 2026 Content Execution](../../../apps/slctrips/docs/FEBRUARY_2026_CONTENT_EXECUTION.md)
- [Building Registry](./BUILDING_REGISTRY.md) - B002 uses weather service
- [Agent Roster](./AGENT_ROSTER.md) - A003 (Park Director) and A011 (Awin Director) use weather data

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-02 | Initial documentation based on SLC Trips use case |
| 2026-02-02 | Added expansion plan for other buildings |

---

*Last updated: February 2, 2026*  
*Next review: After Phase 2 implementation*
