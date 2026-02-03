# WasatchVille Gap Analysis
**Date:** January 26, 2026  
**Status:** Infrastructure Assessment - What Exists vs. What's Needed

---

## ✅ What Already Exists

### 1. Core Rendering Engine ✅
- [x] **PixiJS v8 Integration** - Scene.tsx implemented
- [x] **Next.js 14 Integration** - Client component with dynamic rendering
- [x] **Viewport System** - pixi-viewport integrated
- [x] **Grid Rendering** - Isometric grid drawn
- [x] **Layer System** - Grid, Infrastructure, Buildings layers

**Files:**
- `apps/dashboard/app/dashboard/command-center/Scene.tsx`
- `apps/dashboard/lib/pixi/ProjectionUtility.ts`

---

### 2. Building System ✅
- [x] **BaseBuilding Class** - Abstract base implemented
- [x] **All Building Types** - 12 building classes created:
  - CapitolBuilding
  - BankBuilding
  - AcademyBuilding
  - SchoolBuilding
  - IndustrialBuilding
  - CasinoBuilding
  - TelecomBuilding
  - VenueBuilding
  - AmusementBuilding
  - RecCenterBuilding
  - TVStationBuilding
  - ParkBuilding

**Files:**
- `apps/dashboard/lib/pixi/entities/BaseBuilding.ts`
- `apps/dashboard/lib/pixi/entities/*.ts` (all building types)

---

### 3. Isometric Math ✅
- [x] **ProjectionUtility** - Grid-to-screen conversion
- [x] **Z-Index Sorting** - Basic sorting implemented
- [x] **Coordinate System** - Grid coordinates defined

**Files:**
- `apps/dashboard/lib/pixi/ProjectionUtility.ts`

---

### 4. Data Infrastructure ✅ (Partial)
- [x] **GlobalPulse Service** - Real-time data service
- [x] **Supabase Client** - Database connection
- [x] **API Endpoint** - `/api/pulse/buildings` route
- [x] **Health Polling** - 5-second interval updates

**Files:**
- `apps/dashboard/lib/supabase/GlobalPulse.ts`
- `apps/dashboard/app/api/pulse/buildings/route.ts`

---

### 5. UI Components ✅ (Partial)
- [x] **BuildingInspector** - Modal for building details
- [x] **Win95Window** - Windows 95 style component
- [x] **Basic Overlay** - Status text overlay

**Files:**
- `apps/dashboard/app/dashboard/command-center/components/BuildingInspector.tsx`
- `apps/dashboard/app/dashboard/command-center/components/Win95Window.tsx`

---

### 6. Infrastructure Layer ✅
- [x] **InfrastructureLayer Class** - Underground utilities
- [x] **Toggle Functionality** - 'i' key to show/hide

**Files:**
- `apps/dashboard/lib/pixi/layers/InfrastructureLayer.ts`

---

## ⚠️ What's Missing or Incomplete

### 1. Supabase Schema ❌
**Status:** Needs Implementation  
**Priority:** CRITICAL

#### Missing:
- [ ] **residents table** - Customer/user data
- [ ] **city_metrics table** - Global KPIs
- [ ] **building_registry table** - Building configuration
- [ ] **transactions table** - Revenue events
- [ ] **RLS Policies** - Row-level security
- [ ] **Realtime Subscriptions** - WebSocket channels

#### What Exists:
- Basic Supabase setup
- Some schema files in `lib/supabase/` but may not match WasatchVille needs

#### Action Required:
- Create migration files for WasatchVille-specific schema
- Set up Realtime subscriptions
- Configure RLS policies

**Files to Create:**
- `apps/dashboard/lib/supabase/migrations/wasatchville_schema.sql`
- `apps/dashboard/lib/supabase/migrations/wasatchville_rls.sql`

---

### 2. Real-Time Data Sync ❌
**Status:** Partial - Polling Only  
**Priority:** CRITICAL

#### Missing:
- [ ] **Supabase Realtime** - WebSocket subscriptions
- [ ] **Event-Driven Updates** - Instead of polling
- [ ] **Latency Monitoring** - Connection health
- [ ] **Error Handling** - Reconnection logic

#### What Exists:
- Polling mechanism (5-second intervals)
- Basic health data fetching

#### Action Required:
- Replace polling with Realtime subscriptions
- Implement proper event handlers
- Add connection monitoring

**Files to Create/Update:**
- `apps/dashboard/lib/supabase/RealtimeSubscriptions.ts`
- Update `GlobalPulse.ts` to use Realtime

---

### 3. Resident System ❌
**Status:** Not Implemented  
**Priority:** HIGH

#### Missing:
- [ ] **Resident Entity** - Customer visualization
- [ ] **LTV-Based Housing** - Visual tier system
- [ ] **Movement Logic** - Pathfinding
- [ ] **State Machine** - Working, Resting, Commuting
- [ ] **Sentiment Visualization** - Decay shader

#### Action Required:
- Create Resident class
- Implement housing tiers
- Add movement/pathfinding
- Create visual effects

**Files to Create:**
- `apps/dashboard/lib/pixi/entities/Resident.ts`
- `apps/dashboard/lib/pixi/entities/ResidentHousing.ts`
- `apps/dashboard/lib/pixi/entities/ResidentMovement.ts`

---

### 4. Asset Pipeline ❌
**Status:** Not Implemented  
**Priority:** HIGH

#### Missing:
- [ ] **AI Asset Generation** - Gemini/Nano Banana integration
- [ ] **Palette Quantization** - 256-color VGA palette
- [ ] **Isometric Conversion** - 2:1 dimetric projection
- [ ] **Asset Storage** - Supabase Storage or Cloud Storage
- [ ] **Sprite Sheet Generation** - Optimize draw calls

#### What Exists:
- `lib/ai/GeminiAssetGenerator.ts` - Basic generator exists
- `lib/ai/PaletteQuantizer.ts` - Quantizer exists

#### Action Required:
- Complete asset generation pipeline
- Set up asset storage
- Create sprite sheets
- Generate building assets

**Files to Create/Update:**
- `apps/dashboard/lib/assets/AssetManager.ts`
- `apps/dashboard/lib/assets/SpriteSheetBuilder.ts`
- Update `GeminiAssetGenerator.ts` with building prompts

---

### 5. Building Interactions ❌
**Status:** Partial - Inspector Only  
**Priority:** HIGH

#### Missing:
- [ ] **Click Handlers** - Building-specific interactions
- [ ] **AI Executives** - LangChain integration
- [ ] **Building Modals** - Specialized windows per building
- [ ] **Data Queries** - Text-to-SQL for building data

#### What Exists:
- BuildingInspector component (generic)
- Building click detection (needs implementation)

#### Action Required:
- Add click handlers to buildings
- Create building-specific modals
- Implement AI Executive system

**Files to Create:**
- `apps/dashboard/lib/pixi/interactions/BuildingClickHandler.ts`
- `apps/dashboard/components/buildings/*.tsx` (building-specific modals)
- `apps/dashboard/lib/ai/LangChainAgent.ts`

---

### 6. Windows 95 UI System ❌
**Status:** Partial - Basic Components Only  
**Priority:** MEDIUM

#### Missing:
- [ ] **Start Menu** - Navigation system
- [ ] **Ticker Tape** - Live alerts
- [ ] **Budget Window** - Financial controls
- [ ] **Toolbox** - Interaction modes
- [ ] **Complete Win95 Theme** - react95 or custom

#### What Exists:
- Win95Window component (basic)
- Basic overlay text

#### Action Required:
- Install/implement react95 or custom Win95 components
- Create Start Menu
- Create Ticker Tape
- Create Budget Window
- Create Toolbox

**Files to Create:**
- `apps/dashboard/components/ui/StartMenu.tsx`
- `apps/dashboard/components/ui/TickerTape.tsx`
- `apps/dashboard/components/ui/BudgetWindow.tsx`
- `apps/dashboard/components/ui/Toolbox.tsx`

---

### 7. Data Ingestion Pipeline ❌
**Status:** Not Implemented  
**Priority:** HIGH

#### Missing:
- [ ] **CRM Sync** - Salesforce/CRM → residents table
- [ ] **Payment Sync** - Stripe → transactions table
- [ ] **Cloud Health Sync** - Google Cloud → city_metrics
- [ ] **SendGrid Integration** - Email events → residents
- [ ] **Webhook Handlers** - External event processing

#### Action Required:
- Create ETL scripts
- Set up webhook endpoints
- Configure batch jobs
- Integrate external APIs

**Files to Create:**
- `apps/dashboard/lib/ingestion/crmSync.ts`
- `apps/dashboard/lib/ingestion/paymentSync.ts`
- `apps/dashboard/lib/ingestion/cloudHealthSync.ts`
- `apps/dashboard/app/api/webhooks/sendgrid/route.ts`

---

### 8. AI Executive System ❌
**Status:** Not Implemented  
**Priority:** MEDIUM (Future Feature)

#### Missing:
- [ ] **LangChain Setup** - Agent framework
- [ ] **RAG System** - Vector store (pgvector)
- [ ] **Text-to-SQL** - Query generation
- [ ] **Persona System** - Building-specific agents
- [ ] **Safety Layer** - Query validation

#### Action Required:
- Set up LangChain
- Configure pgvector
- Create agent classes
- Implement text-to-SQL

**Files to Create:**
- `apps/dashboard/lib/ai/LangChainAgent.ts`
- `apps/dashboard/lib/ai/BuildingAgents.ts`
- `apps/dashboard/lib/ai/TextToSQL.ts`
- `apps/dashboard/lib/ai/RAGSystem.ts`

---

### 9. SendGrid Integration ❌
**Status:** Not Implemented  
**Priority:** MEDIUM

#### Missing:
- [ ] **Post Office Building** - Visual email hub
- [ ] **Email Event Webhooks** - SendGrid → Supabase
- [ ] **Visual Feedback** - Mail trucks, letter icons
- [ ] **Deliverability Monitoring** - Gridlock visualization

#### Action Required:
- Create PostOfficeBuilding entity
- Set up webhook handler
- Create visual effects
- Integrate with SendGrid API

**Files to Create:**
- `apps/dashboard/lib/pixi/entities/PostOfficeBuilding.ts`
- `apps/dashboard/app/api/webhooks/sendgrid/route.ts`
- `apps/dashboard/lib/integrations/SendGridWebhook.ts`

---

### 10. Google Cloud Integration ❌
**Status:** Not Implemented  
**Priority:** MEDIUM

#### Missing:
- [ ] **System Voltage Metric** - API latency → voltage
- [ ] **Health Monitoring** - Visual status indicators
- [ ] **Alert System** - Brownout/outage visualization
- [ ] **Infrastructure Visualization** - Underground utilities

#### What Exists:
- InfrastructureLayer (basic)

#### Action Required:
- Integrate Google Cloud Monitoring API
- Create voltage calculation
- Add visual effects
- Connect to InfrastructureLayer

**Files to Create:**
- `apps/dashboard/lib/integrations/GoogleCloudHealth.ts`
- `apps/dashboard/lib/pixi/effects/BrownoutEffect.ts`

---

## 📊 Implementation Priority Matrix

### Phase 1: Critical Foundation (Weeks 1-2)
**Must complete before building features**

1. ✅ **Supabase Schema** - Data foundation
2. ✅ **Real-Time Data Sync** - Live updates
3. ✅ **Resident System** - Customer visualization
4. ✅ **Asset Pipeline** - Visual assets

**Status:** Schema and Realtime are blockers

---

### Phase 2: Core Features (Weeks 3-4)
**Essential functionality**

1. ✅ **Building Interactions** - Click handlers, modals
2. ✅ **Data Ingestion** - External data sync
3. ✅ **Windows 95 UI** - Complete interface
4. ✅ **SendGrid Integration** - Email visualization

---

### Phase 3: Advanced Features (Weeks 5-6)
**Enhancement and intelligence**

1. ✅ **AI Executive System** - LangChain integration
2. ✅ **Google Cloud Integration** - Infrastructure health
3. ✅ **Advanced Visual Effects** - Disasters, weather
4. ✅ **Performance Optimization** - Culling, batching

---

## 🔧 Quick Wins (Can Do Now)

### 1. Complete Supabase Schema
**Time:** 2-3 hours  
**Impact:** HIGH - Unblocks everything

- Create migration files
- Set up tables
- Configure RLS

### 2. Replace Polling with Realtime
**Time:** 2-3 hours  
**Impact:** HIGH - Better performance

- Update GlobalPulse to use Realtime
- Remove polling interval
- Add error handling

### 3. Add Building Click Handlers
**Time:** 1-2 hours  
**Impact:** MEDIUM - Improves UX

- Add click detection to BaseBuilding
- Open BuildingInspector on click
- Pass building data to inspector

### 4. Create Resident Entity
**Time:** 3-4 hours  
**Impact:** HIGH - Core feature

- Create Resident class
- Add basic sprite
- Implement LTV-based housing

---

## 📋 Next Steps Checklist

### Immediate (This Week)
- [ ] **Create Supabase Schema** - All tables, RLS, functions
- [ ] **Implement Realtime Subscriptions** - Replace polling
- [ ] **Add Building Click Handlers** - Basic interactions
- [ ] **Create Resident Entity** - Basic implementation

### Short-term (Next 2 Weeks)
- [ ] **Complete Asset Pipeline** - Generate building assets
- [ ] **Build Data Ingestion** - External API sync
- [ ] **Implement Windows 95 UI** - Complete interface
- [ ] **Add SendGrid Integration** - Email visualization

### Medium-term (Next Month)
- [ ] **AI Executive System** - LangChain integration
- [ ] **Google Cloud Integration** - Health monitoring
- [ ] **Advanced Features** - Visual effects, optimizations

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- ✅ Supabase schema deployed and working
- ✅ Real-time updates working (no polling)
- ✅ Buildings clickable and show data
- ✅ Basic residents visible on map

### Phase 2 Complete When:
- ✅ All buildings have interactions
- ✅ External data syncing to database
- ✅ Complete Windows 95 interface
- ✅ Email events visualized

### Phase 3 Complete When:
- ✅ AI Executives answering questions
- ✅ Infrastructure health visualized
- ✅ Performance optimized
- ✅ Production-ready

---

**Current Status:** ~40% Complete  
**Blockers:** Supabase Schema, Realtime Subscriptions  
**Next Priority:** Complete Phase 1 foundation
