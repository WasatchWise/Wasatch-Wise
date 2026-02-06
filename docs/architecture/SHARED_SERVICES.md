# WasatchWise Shared Services Architecture

**Created:** February 2, 2026  
**Purpose:** Document shared infrastructure services used across multiple ventures

---

## Overview

As WasatchWise grows to 10+ ventures, certain services are shared infrastructure rather than per-app implementations. This document tracks what's shared, who uses it, and how to expand.

**Philosophy:** Build once, use everywhere. Reduce duplicated code and API costs.

---

## Active Shared Services

### 1. Weather Service

**Provider:** OpenWeather API  
**Package:** `packages/wasatchville-weather` (future) or per-app integration  
**Current Implementation:** SLC Trips (`apps/slctrips/src/app/api/weather/route.ts`)

**Purpose:** Real-time weather data for content strategy, event planning, and operational decisions.

**Active Users:**
- **SLC Trips:** Content timing (ski conditions, bluebird filming days, storm urgency content)
- **Rock Salt:** Event planning, outdoor venue considerations (manual currently)

**Planned Users:**
- **Adult AI Academy:** Corporate training travel, workshop scheduling
- **DAiTE:** Weather-appropriate date suggestions via CYRAiNO
- **Pipeline IQ:** Construction project timing, site visit planning
- **Automation Studio:** Client content strategy (weather-aware social media)

**Configuration:**
```bash
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_DEFAULT_LOCATION="Salt Lake City,US"
WEATHER_CACHE_MINUTES=30
```

**Cost:** Free tier (1,000 calls/day) - Current usage ~70 calls/day

**Documentation:** [WasatchVille Weather Service](../civilization/realms/wasatchville/docs/WEATHER_SERVICE.md)

---

### 2. Affiliate Infrastructure

**Providers:** AWIN, Viator, Amazon Associates, others  
**Package:** `apps/slctrips/src/lib/affiliates.ts` (to be extracted)  
**Future:** `packages/wasatchwise-affiliates`

**Purpose:** Monetize content through affiliate partnerships with campaign-specific tracking.

**Active Users:**
- **SLC Trips:** Hotels (Booking.com/AWIN), car rentals, tours (Viator), outdoor gear (Amazon)
- **Adult AI Academy:** Course tools, books, software (Amazon)

**Planned Users:**
- **Rock Salt:** Concert tickets, music gear, merch
- **Fanon Movies:** Streaming services, DVDs, movie merch
- **Pipeline IQ:** Construction tools, software

**Campaign Prefix Pattern:**
```typescript
// Each building has its own campaign prefix
{
  'B002': 'slctrips-',      // SLC Trips
  'B003': 'rocksalt-',      // Rock Salt
  'B004': 'academy-',       // Adult AI Academy
  'B009': 'pipelineiq-',    // Pipeline IQ
  'B011': 'fanon-'          // Fanon Movies
}
```

**Configuration:**
```bash
# AWIN
NEXT_PUBLIC_AWIN_AFFILIATE_ID=2060961
AWIN_BOOKING_COM_MERCHANT=6776

# Amazon
AMAZON_AFFILIATE_TAG=wasatchwise20-20

# Viator
VIATOR_API_KEY=your_api_key_here
```

**Documentation:** [AWIN Monetization Sector](../civilization/realms/wasatchville/docs/AWIN_MONETIZATION_SECTOR.md)

---

### 3. Supabase Infrastructure

**Provider:** Supabase  
**Type:** Per-app databases with shared authentication patterns

**Active Instances:**
- **SLC Trips:** Destinations, TripKits, user accounts, purchases
- **Ask Before You App:** States, districts, certifications, privacy evaluations
- **Rock Salt:** Artists, venues, shows, spider riders
- **Dashboard:** City metrics, building data, agent interactions
- **Pipeline IQ:** Projects, leads, campaigns, enrichment data
- **DAiTE:** Users, matches, profiles, conversations

**Shared Patterns:**
- RLS (Row Level Security) enabled on all client-facing tables
- Common migration structure (`lib/supabase/migrations/`)
- Standardized client initialization
- Consistent environment variable naming

**Configuration:**
```bash
# Per-app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

### 4. Stripe Payment Infrastructure

**Provider:** Stripe  
**Type:** Per-app Stripe accounts with shared patterns

**Active Users:**
- **SLC Trips:** TripKits, Welcome Wagon, StayKits, gift purchases
- **Ask Before You App:** Certification purchases
- **Rock Salt:** Spider Rider publication fees, premium features
- **Adult AI Academy:** Course enrollments
- **Pipeline IQ:** SaaS subscriptions (GrooveLeads Pro)

**Shared Patterns:**
- Standardized checkout flow (`/api/stripe/create-checkout`)
- Webhook handling (`/api/webhooks/stripe` or `/api/stripe/webhook`)
- Success page pattern (`/checkout/success`)
- Stripe-to-Supabase fulfillment pattern

**Configuration:**
```bash
# Per-app
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Documentation:** [Week Priorities - Revenue Critical Paths](../docs/WEEK_OF_2026-02-02_PRIORITIES.md)

---

### 5. AI Service Infrastructure

**Providers:** OpenAI, Google (Gemini/Vertex AI), HeyGen, ElevenLabs, Claude  
**Type:** Shared API keys, per-app implementations

**Active Users:**
- **SLC Trips:** Dan Concierge (Claude/OpenAI), content generation
- **Ask Before You App:** Privacy evaluation, NDPA alignment checks
- **Rock Salt:** Spider Rider generation, venue compatibility
- **Adult AI Academy:** Course content, personalized learning paths
- **Pipeline IQ:** Project enrichment (Gemini), campaign generation, video (HeyGen)
- **Dashboard:** Agent chat (OpenAI)

**Shared Patterns:**
- Log AI usage to `ai_content_log` table (SLC Trips pattern)
- Rate limiting and cost tracking
- Fallback patterns when APIs are unavailable

**Configuration:**
```bash
# Shared across apps
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
GOOGLE_CLOUD_PROJECT=...
HEYGEN_API_KEY=...
ELEVENLABS_API_KEY=...
ANTHROPIC_API_KEY=...
```

---

### 6. Automation Infrastructure (n8n)

**Provider:** n8n (self-hosted or cloud)  
**Type:** Cross-app workflow automation

**Active Workflows:**
- **Amazon Associates:** Automated revenue tracking → Dashboard metrics
- **Affiliate reconciliation:** AWIN/Viator → Supabase city_metrics
- **Email notifications:** Stripe webhooks → SendGrid/ConvertKit
- **Social media:** TikTok metrics → Dashboard
- **Data sync:** Cross-platform metric aggregation

**Configuration:**
```bash
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/...
```

**Documentation:** [n8n Workflows README](../infrastructure/n8n/workflows/README.md)

---

## Planned Shared Services

### 7. Google Maps Integration (Future)

**Use Cases:**
- **SLC Trips:** Destination mapping, route planning, "near me" features
- **Rock Salt:** Venue locations, tour routing
- **DAiTE:** Date location suggestions
- **Pipeline IQ:** Construction project mapping

**Configuration:**
```bash
GOOGLE_MAPS_API_KEY=...
```

---

### 8. Analytics & Tracking (Future)

**Providers:** Google Analytics 4, Vercel Analytics, custom tracking  
**Type:** Unified analytics dashboard across all ventures

**Configuration:**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

---

### 9. Email Service (Partial)

**Provider:** SendGrid / ConvertKit / Resend  
**Current:** Per-app implementations  
**Future:** Shared email infrastructure

**Configuration:**
```bash
SENDGRID_API_KEY=...
CONVERTKIT_API_KEY=...
```

---

### 10. Language Translation (i18n) (Planned)

**Purpose:** UI language translation across all WasatchWise sites so every app can serve users in their preferred language (e.g. English, Spanish).

**Current:** No app has full UI translation. SLC Trips has **voice** language detection for Dan (ElevenLabs TTS) only.

**Planned:**
- **Pattern:** Same i18n approach on every site (locale detection, message files, translated UI). Per-app message files (e.g. `messages/en.json`, `messages/es.json`).
- **Stack:** `next-intl` for Next.js apps; `react-i18next` for Vite/other React apps.
- **First languages:** English (default), Spanish (high impact for K–12 and families).
- **Rollout order:** Ask Before You App, SLC Trips, Dashboard, Rock Salt, then others.

**Documentation:** [I18N Language Translation Strategy](I18N_LANGUAGE_TRANSLATION_STRATEGY.md)

---

## Service Cost Tracking

### Monthly Costs (Estimated)

| Service | Provider | Cost | Usage Level |
|---------|----------|------|-------------|
| Weather API | OpenWeather | $0 | Free tier (1K calls/day) |
| Affiliate Networks | AWIN, Amazon | $0 | Commission-based |
| Supabase | Supabase | ~$25/app | Multiple instances |
| Stripe | Stripe | 2.9% + $0.30 | Per transaction |
| AI APIs | OpenAI, Google | ~$100/mo | Variable by usage |
| n8n | Self-hosted/Cloud | $0-$20 | Workflow count |
| **Total Infrastructure** | | **~$300-500/mo** | All services |

---

## Expansion Pattern

### Adding a New Shared Service

1. **Identify the need:** Does 2+ apps use this service?
2. **Document current usage:** Who uses it, how, and why?
3. **Extract to shared package:** `packages/[service-name]/` or shared `lib/`
4. **Create configuration interface:** Standard env vars, per-app config
5. **Update Building Registry:** Add to shared infrastructure section
6. **Update this document:** Document the service and users

### Example: Weather Service Extraction

```bash
# Current
apps/slctrips/src/app/api/weather/route.ts

# Future
packages/wasatchville-weather/
  ├── src/
  │   ├── index.ts           # Main service
  │   ├── types.ts           # Shared types
  │   ├── config.ts          # Configuration
  │   └── utils/
  │       ├── cache.ts       # Caching logic
  │       ├── forecast.ts    # Forecast parsing
  │       └── content.ts     # Content strategy helpers
  ├── package.json
  └── README.md
```

---

## Agent Integration

### Weather Service Example

All WasatchVille agents can receive weather context:

```typescript
// Morning briefing for any agent
import { WasatchvilleWeatherService } from '@wasatchwise/weather';

const weatherService = new WasatchvilleWeatherService({
  apiKey: process.env.OPENWEATHER_API_KEY,
  defaultLocation: 'Salt Lake City,US',
  buildingId: 'B002' // For attribution
});

// Agent A003 (Park Director) morning briefing
const weather = await weatherService.getCurrentWeather();
const contentAdvice = await weatherService.getContentTiming('slctrips');

briefing.weather = {
  current: weather.current.condition,
  temp: weather.current.temp,
  recommendation: contentAdvice.recommendations[0]
};
```

---

## Related Documentation

- [WasatchVille Building Registry](../civilization/realms/wasatchville/docs/BUILDING_REGISTRY.md)
- [WasatchVille Agent Roster](../civilization/realms/wasatchville/docs/AGENT_ROSTER.md)
- [WasatchVille Weather Service](../civilization/realms/wasatchville/docs/WEATHER_SERVICE.md)
- [AWIN Monetization Sector](../civilization/realms/wasatchville/docs/AWIN_MONETIZATION_SECTOR.md)
- [Week Priorities](../docs/WEEK_OF_2026-02-02_PRIORITIES.md)
- [I18N Language Translation Strategy](I18N_LANGUAGE_TRANSLATION_STRATEGY.md)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-02 | Initial documentation: Weather, Affiliate, Supabase, Stripe, AI, n8n |
| 2026-02-02 | Added expansion pattern and agent integration examples |
| 2026-02-03 | Added planned shared service: Language Translation (i18n) |

---

*Last updated: February 2, 2026*  
*Next review: Quarterly or when new shared service is added*
