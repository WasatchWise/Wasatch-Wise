# WasatchVille Implementation Roadmap
**Project:** Business REALMS - Gamified Enterprise Operating System  
**Current Status:** ~40% Complete - Foundation Built, Data Layer Needed  
**Last Updated:** January 26, 2026

---

## 🎯 Current State Summary

### ✅ What's Working
- **Rendering Engine:** PixiJS v8 + Next.js 14 fully integrated
- **Isometric System:** 2:1 dimetric projection implemented
- **Building System:** All 12 building types created and rendering
- **Scene Graph:** Layers, viewport, grid all functional
- **Basic UI:** BuildingInspector, Win95Window components exist
- **Infrastructure Layer:** Underground utilities layer implemented

### ⚠️ Critical Gaps
- **Supabase Schema:** Missing WasatchVille-specific tables
- **Real-Time Sync:** Using polling instead of Realtime subscriptions
- **Resident System:** Not implemented (customers not visualized)
- **Asset Pipeline:** AI generation exists but not integrated
- **Data Ingestion:** No external data sync (CRM, payments, etc.)

---

## 📋 Phase-by-Phase Implementation Plan

---

## Phase 1: Data Foundation (Weeks 1-2) ⚠️ CRITICAL

**Goal:** Establish data layer so buildings can display real information

### Week 1: Supabase Schema

#### Day 1-2: Core Tables
- [ ] **Create Migration:** `wasatchville_schema.sql`
  - [ ] `residents` table (customers/users)
  - [ ] `city_metrics` table (global KPIs)
  - [ ] `building_registry` table (building config)
  - [ ] `transactions` table (revenue events)
- [ ] **Run Migration:** Deploy to Supabase
- [ ] **Verify:** Tables exist and accessible

**Files to Create:**
```
apps/dashboard/lib/supabase/migrations/
  └── wasatchville_001_core_tables.sql
```

#### Day 3-4: RLS Policies & Functions
- [ ] **Create RLS Policies:** Row-level security
- [ ] **Create Helper Functions:** SQL utilities
- [ ] **Test Access:** Verify permissions work

**Files to Create:**
```
apps/dashboard/lib/supabase/migrations/
  └── wasatchville_002_rls_policies.sql
  └── wasatchville_003_functions.sql
```

#### Day 5: Seed Data
- [ ] **Create Seed Script:** Initial building registry
- [ ] **Populate Buildings:** All 12 buildings in database
- [ ] **Test Queries:** Verify data retrieval

**Files to Create:**
```
apps/dashboard/lib/supabase/seeds/
  └── wasatchville_001_buildings.sql
```

---

### Week 2: Real-Time Data Sync

#### Day 1-2: Replace Polling with Realtime
- [ ] **Update GlobalPulse:** Use Supabase Realtime
- [ ] **Remove Polling:** Delete interval-based updates
- [ ] **Add Error Handling:** Reconnection logic
- [ ] **Test Subscriptions:** Verify WebSocket connection

**Files to Update:**
```
apps/dashboard/lib/supabase/GlobalPulse.ts
apps/dashboard/app/dashboard/command-center/Scene.tsx
```

#### Day 3-4: Connect Buildings to Data
- [ ] **Update BaseBuilding:** Accept health data from Realtime
- [ ] **Wire Up Subscriptions:** Each building subscribes to its data
- [ ] **Test Updates:** Change database, see building update

**Files to Update:**
```
apps/dashboard/lib/pixi/entities/BaseBuilding.ts
apps/dashboard/app/dashboard/command-center/Scene.tsx
```

#### Day 5: Latency Monitoring
- [ ] **Add Heartbeat:** Connection health check
- [ ] **Visual Indicator:** Show connection status
- [ ] **Error Recovery:** Auto-reconnect on failure

**Files to Create:**
```
apps/dashboard/lib/supabase/LatencyMonitor.ts
```

---

## Phase 2: Core Features (Weeks 3-4)

### Week 3: Resident System

#### Day 1-2: Resident Entity
- [ ] **Create Resident Class:** Base entity
- [ ] **LTV-Based Housing:** Visual tier system
- [ ] **Basic Sprite:** Placeholder graphics

**Files to Create:**
```
apps/dashboard/lib/pixi/entities/Resident.ts
apps/dashboard/lib/pixi/entities/ResidentHousing.ts
```

#### Day 3-4: Resident Logic
- [ ] **Movement System:** Basic pathfinding
- [ ] **State Machine:** Working, Resting, Commuting
- [ ] **Spawn Logic:** Create residents from database

**Files to Create:**
```
apps/dashboard/lib/pixi/entities/ResidentMovement.ts
apps/dashboard/lib/pixi/entities/ResidentStateMachine.ts
```

#### Day 5: Integration
- [ ] **Connect to Database:** Load residents from Supabase
- [ ] **Real-Time Updates:** Residents update on data changes
- [ ] **Visual Feedback:** Housing tiers render correctly

---

### Week 4: Building Interactions

#### Day 1-2: Click Handlers
- [ ] **Add Click Detection:** BaseBuilding click events
- [ ] **Open Inspector:** BuildingInspector on click
- [ ] **Pass Data:** Building health/metrics to inspector

**Files to Update:**
```
apps/dashboard/lib/pixi/entities/BaseBuilding.ts
apps/dashboard/app/dashboard/command-center/Scene.tsx
```

#### Day 3-4: Building-Specific Modals
- [ ] **Capitol Modal:** Mayor's Office dashboard
- [ ] **Bank Modal:** Budget window
- [ ] **Academy Modal:** Skill tree/LMS
- [ ] **Other Buildings:** Specialized modals

**Files to Create:**
```
apps/dashboard/components/buildings/
  ├── CapitolModal.tsx
  ├── BankModal.tsx
  ├── AcademyModal.tsx
  └── ...
```

#### Day 5: Data Queries
- [ ] **Building Data Fetching:** Query building-specific data
- [ ] **Display in Modals:** Show real metrics
- [ ] **Test Interactions:** Click buildings, see data

---

## Phase 3: Data Integration (Weeks 5-6)

### Week 5: External Data Sync

#### Day 1-2: CRM Integration
- [ ] **Create Sync Script:** Salesforce/CRM → residents
- [ ] **ETL Pipeline:** Extract, transform, load
- [ ] **Schedule Job:** Run periodically

**Files to Create:**
```
apps/dashboard/lib/ingestion/crmSync.ts
apps/dashboard/scripts/sync-crm.ts
```

#### Day 3-4: Payment Integration
- [ ] **Stripe Webhook:** Payment events → transactions
- [ ] **Update Revenue:** Real-time revenue updates
- [ ] **Test Flow:** Make payment, see building update

**Files to Create:**
```
apps/dashboard/app/api/webhooks/stripe/route.ts
apps/dashboard/lib/ingestion/paymentSync.ts
```

#### Day 5: Google Cloud Health
- [ ] **Monitoring API:** GCP → city_metrics
- [ ] **Voltage Calculation:** API latency → voltage
- [ ] **Visual Updates:** Infrastructure layer reflects health

**Files to Create:**
```
apps/dashboard/lib/integrations/GoogleCloudHealth.ts
```

---

### Week 6: SendGrid Integration

#### Day 1-2: Post Office Building
- [ ] **Create Entity:** PostOfficeBuilding class
- [ ] **Visual Design:** Mail trucks, letter icons
- [ ] **Add to Scene:** Place in city

**Files to Create:**
```
apps/dashboard/lib/pixi/entities/PostOfficeBuilding.ts
```

#### Day 3-4: Email Event Webhooks
- [ ] **SendGrid Webhook:** Email events → Supabase
- [ ] **Update Residents:** Open/click events
- [ ] **Visual Feedback:** Letter icons on houses

**Files to Create:**
```
apps/dashboard/app/api/webhooks/sendgrid/route.ts
apps/dashboard/lib/integrations/SendGridWebhook.ts
```

#### Day 5: Deliverability Monitoring
- [ ] **Gridlock Visualization:** Too many emails = traffic
- [ ] **Bounce Handling:** Invalid addresses flagged
- [ ] **Test Scenarios:** Send emails, see visualization

---

## Phase 4: UI & Polish (Weeks 7-8)

### Week 7: Windows 95 Interface

#### Day 1-2: Start Menu
- [ ] **Install react95:** Or create custom components
- [ ] **Create Start Menu:** Navigation system
- [ ] **Add Menu Items:** Link to building modals

**Files to Create:**
```
apps/dashboard/components/ui/StartMenu.tsx
```

#### Day 3-4: Ticker Tape & Budget Window
- [ ] **Ticker Tape:** Live alerts from city_metrics
- [ ] **Budget Window:** Financial controls
- [ ] **Tax/Commerce Controls:** Commission sliders

**Files to Create:**
```
apps/dashboard/components/ui/TickerTape.tsx
apps/dashboard/components/ui/BudgetWindow.tsx
```

#### Day 5: Toolbox
- [ ] **Interaction Modes:** Pointer, magnifying glass, bulldozer
- [ ] **Zone Tool:** Highlight grid areas
- [ ] **Tool Switching:** UI for mode selection

**Files to Create:**
```
apps/dashboard/components/ui/Toolbox.tsx
```

---

### Week 8: Asset Pipeline

#### Day 1-2: AI Asset Generation
- [ ] **Complete Gemini Integration:** Building asset generation
- [ ] **Palette Quantization:** 256-color VGA palette
- [ ] **Isometric Conversion:** 2:1 dimetric projection

**Files to Update:**
```
apps/dashboard/lib/ai/GeminiAssetGenerator.ts
apps/dashboard/lib/ai/PaletteQuantizer.ts
```

#### Day 3-4: Asset Management
- [ ] **Asset Storage:** Supabase Storage or Cloud Storage
- [ ] **Sprite Sheet Generation:** Optimize draw calls
- [ ] **Texture Loading:** Load assets into PixiJS

**Files to Create:**
```
apps/dashboard/lib/assets/AssetManager.ts
apps/dashboard/lib/assets/SpriteSheetBuilder.ts
```

#### Day 5: Replace Placeholders
- [ ] **Generate Building Assets:** All 12 buildings
- [ ] **Replace Graphics:** Use real sprites
- [ ] **Test Rendering:** Verify assets display correctly

---

## Phase 5: Advanced Features (Weeks 9-12)

### Week 9-10: AI Executive System

- [ ] **LangChain Setup:** Agent framework
- [ ] **RAG System:** Vector store (pgvector)
- [ ] **Text-to-SQL:** Query generation
- [ ] **Persona System:** Building-specific agents
- [ ] **Safety Layer:** Query validation

**Files to Create:**
```
apps/dashboard/lib/ai/LangChainAgent.ts
apps/dashboard/lib/ai/BuildingAgents.ts
apps/dashboard/lib/ai/TextToSQL.ts
apps/dashboard/lib/ai/RAGSystem.ts
```

---

### Week 11-12: Polish & Optimization

- [ ] **Performance Optimization:** Culling, batching
- [ ] **Visual Effects:** Disasters, weather
- [ ] **Sound System:** MIDI-style sounds
- [ ] **Documentation:** Complete API docs
- [ ] **Testing:** End-to-end tests

---

## 🚀 Quick Start Guide

### Step 1: Set Up Supabase Schema (Day 1)

```bash
# Navigate to dashboard
cd apps/dashboard

# Create migration file
touch lib/supabase/migrations/wasatchville_001_core_tables.sql

# Add schema (see WASATCHVILLE_INFRASTRUCTURE.md for SQL)

# Run migration
supabase migration up
```

### Step 2: Replace Polling with Realtime (Day 2)

```typescript
// Update GlobalPulse.ts to use Realtime subscriptions
// Remove polling interval from Scene.tsx
// Test: Change database, see building update
```

### Step 3: Add Building Click Handlers (Day 3)

```typescript
// Add click event to BaseBuilding
// Open BuildingInspector on click
// Pass building data to inspector
```

### Step 4: Create Resident Entity (Day 4-5)

```typescript
// Create Resident.ts
// Implement LTV-based housing
// Add to scene
```

---

## 📊 Progress Tracking

### Phase 1: Data Foundation
- [ ] Week 1: Supabase Schema (0/5 days)
- [ ] Week 2: Real-Time Sync (0/5 days)

### Phase 2: Core Features
- [ ] Week 3: Resident System (0/5 days)
- [ ] Week 4: Building Interactions (0/5 days)

### Phase 3: Data Integration
- [ ] Week 5: External Data Sync (0/5 days)
- [ ] Week 6: SendGrid Integration (0/5 days)

### Phase 4: UI & Polish
- [ ] Week 7: Windows 95 Interface (0/5 days)
- [ ] Week 8: Asset Pipeline (0/5 days)

### Phase 5: Advanced Features
- [ ] Week 9-10: AI Executive System (0/10 days)
- [ ] Week 11-12: Polish & Optimization (0/10 days)

**Total Progress:** 0/60 days (0%)

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- ✅ Supabase schema deployed
- ✅ Real-time updates working (no polling)
- ✅ Buildings display data from database
- ✅ Connection health monitored

### Phase 2 Complete When:
- ✅ Residents visible on map
- ✅ Buildings clickable
- ✅ Building modals show real data
- ✅ Basic interactions working

### Phase 3 Complete When:
- ✅ External data syncing
- ✅ Email events visualized
- ✅ Infrastructure health displayed
- ✅ Revenue updates in real-time

### Phase 4 Complete When:
- ✅ Complete Windows 95 interface
- ✅ All buildings have real assets
- ✅ UI polished and functional
- ✅ Performance optimized

### Phase 5 Complete When:
- ✅ AI Executives answering questions
- ✅ Advanced features working
- ✅ Production-ready
- ✅ Fully documented

---

## 📚 Reference Documents

- **WASATCHVILLE_INFRASTRUCTURE.md** - Complete technical architecture
- **WASATCHVILLE_GAP_ANALYSIS.md** - What exists vs. what's needed
- **This Document** - Implementation roadmap

---

## 🚨 Critical Path

**The critical path to getting WasatchVille functional:**

1. **Supabase Schema** (Week 1) - Blocks everything
2. **Real-Time Sync** (Week 2) - Enables live updates
3. **Resident System** (Week 3) - Core feature
4. **Building Interactions** (Week 4) - User engagement

**Everything else builds on these foundations.**

---

**Status:** Ready to begin Phase 1  
**Next Action:** Create Supabase schema migration  
**Timeline:** 12 weeks to production-ready
