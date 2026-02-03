# WasatchVille Hybrid Implementation Roadmap
**Synthesis of:** Current Codebase + Infrastructure Requirements  
**Status:** Ready to Execute - Starting Now  
**Last Updated:** January 26, 2026

---

## 🎯 Executive Summary

**Current State:** ~40% complete - Rendering engine works, data layer needs foundation  
**Critical Path:** Data unification → Real-time sync → Residents → Interactions  
**Timeline:** 6 weeks to fully functional Business REALMS platform

**Key Decision:** Use existing Supabase project (`wasatchwise`) as central warehouse - no need for new project.

---

## 📊 Current Assets Assessment

### ✅ What's Already Built (Leverage This)
1. **Rendering Engine** - PixiJS v8 + Next.js 14 fully functional
2. **All 12 Buildings** - Classes created, rendering on scene
3. **Isometric Math** - ProjectionUtility working perfectly
4. **Scene Graph** - Layers, viewport, grid all operational
5. **GlobalPulse Service** - Exists but needs Realtime upgrade
6. **Infrastructure Layer** - Underground utilities implemented
7. **Basic UI** - BuildingInspector, Win95Window components
8. **Supabase Client** - Already configured and working

### ⚠️ What Needs Building (Critical Gaps)
1. **Unified Schema** - WasatchVille-specific tables in existing Supabase
2. **Real-Time Subscriptions** - Replace polling with WebSocket
3. **ETL Pipeline** - Connect external data sources
4. **Resident System** - Customer visualization
5. **Asset Pipeline** - AI generation integration
6. **AI Executives** - LangChain setup

---

## 🚀 Hybrid Strategy: Build on What Exists

### Decision 1: Supabase Architecture ✅ DECIDED

**Recommendation:** Use existing `wasatchwise` Supabase project as central warehouse

**Why:**
- Already configured and working
- No migration needed
- Can add WasatchVille schema alongside existing tables
- Single connection simplifies everything

**Action:**
- Add WasatchVille tables to existing project
- Keep existing tables (districts, etc.) separate
- Use schema prefixing if needed: `wasatchville_*` tables

**Implementation:**
```sql
-- Add to existing Supabase project
-- No new project needed
CREATE SCHEMA IF NOT EXISTS wasatchville;
-- Or use public schema with prefix
```

---

### Decision 2: AI Model Selection ✅ DECIDED

**Recommendation:** Start with Vertex AI Gemini (you have it), add GPT-4 later

**Why:**
- Already configured ($0.02/month usage)
- Infrastructure ready
- Can scale up immediately
- Lower cost initially

**Action:**
- Use Gemini Flash for fast queries
- Use Gemini Pro for complex reasoning
- Add GPT-4 later for AI Executives if needed

---

### Decision 3: Asset Generation ✅ DECIDED

**Recommendation:** Hybrid approach - AI for buildings, open source for base tiles

**Why:**
- You have GeminiAssetGenerator.ts already
- Faster than manual creation
- Consistent base tiles from Kenney.nl
- Best of both worlds

**Action:**
- Use existing GeminiAssetGenerator for buildings
- Download base tileset from Kenney.nl
- Complete palette quantization pipeline

---

## 📅 Week-by-Week Execution Plan

---

## WEEK 1: Data Foundation (Days 1-5) ⚡ CRITICAL

### Day 1: Supabase Schema Setup

**Goal:** Create WasatchVille tables in existing Supabase project

#### Morning (2-3 hours):
- [ ] **Create Migration File**
  ```
  apps/dashboard/lib/supabase/migrations/wasatchville_001_core_tables.sql
  ```

- [ ] **Design Schema** (add to existing project):
  ```sql
  -- Core WasatchVille tables
  CREATE TABLE wasatchville_city_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key TEXT UNIQUE NOT NULL,
    value NUMERIC NOT NULL,
    trend TEXT CHECK (trend IN ('rising', 'falling', 'stable')),
    unit TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE wasatchville_residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    company_entity_id TEXT, -- CRM/Salesforce ID
    ltv_score NUMERIC DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    churn_probability FLOAT DEFAULT 0,
    grid_x INTEGER,
    grid_y INTEGER,
    tier TEXT CHECK (tier IN ('Free', 'Member', 'Gold', 'Platinum')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE wasatchville_building_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    agent_persona TEXT,
    data_access_scope JSONB,
    grid_x INTEGER DEFAULT 0,
    grid_y INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE wasatchville_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id TEXT REFERENCES wasatchville_building_registry(building_id),
    amount NUMERIC NOT NULL,
    description TEXT,
    source TEXT, -- 'stripe', 'awin', 'internal', etc.
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE wasatchville_system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    voltage NUMERIC DEFAULT 100, -- 0-100
    latency_ms NUMERIC,
    error_rate NUMERIC,
    last_checked TIMESTAMP DEFAULT NOW()
  );
  ```

#### Afternoon (2-3 hours):
- [ ] **Run Migration**
  ```bash
  cd apps/dashboard
  # Use Supabase CLI or run in dashboard
  supabase migration up
  ```

- [ ] **Seed Initial Data**
  ```sql
  -- Insert building registry for all 12 buildings
  INSERT INTO wasatchville_building_registry (building_id, type, grid_x, grid_y) VALUES
    ('wasatchwise-capitol', 'capitol', 0, 0),
    ('wasatchwise-bank', 'bank', -2, 1),
    ('adult-ai-academy', 'academy', 2, -1),
    -- ... all 12 buildings
  ```

- [ ] **Verify Tables**
  - Check Supabase dashboard
  - Verify all tables exist
  - Test basic queries

**Files to Create:**
- `apps/dashboard/lib/supabase/migrations/wasatchville_001_core_tables.sql`
- `apps/dashboard/lib/supabase/seeds/wasatchville_001_buildings.sql`

---

### Day 2: RLS Policies & Indexes

**Goal:** Secure data access and optimize queries

#### Tasks:
- [ ] **Create RLS Policies**
  ```sql
  -- Enable RLS
  ALTER TABLE wasatchville_residents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE wasatchville_city_metrics ENABLE ROW LEVEL SECURITY;
  
  -- Users can see their own resident data
  CREATE POLICY "Users see own resident"
    ON wasatchville_residents FOR SELECT
    USING (auth.uid() = user_id);
  
  -- Public read for city metrics (dashboard is public)
  CREATE POLICY "Public read city metrics"
    ON wasatchville_city_metrics FOR SELECT
    USING (true);
  ```

- [ ] **Create Indexes**
  ```sql
  CREATE INDEX idx_residents_tier ON wasatchville_residents(tier);
  CREATE INDEX idx_residents_grid ON wasatchville_residents(grid_x, grid_y);
  CREATE INDEX idx_metrics_key ON wasatchville_city_metrics(metric_key);
  CREATE INDEX idx_transactions_building ON wasatchville_transactions(building_id);
  ```

- [ ] **Test Policies**
  - Verify RLS works
  - Test different user roles

**Files to Create:**
- `apps/dashboard/lib/supabase/migrations/wasatchville_002_rls_policies.sql`
- `apps/dashboard/lib/supabase/migrations/wasatchville_003_indexes.sql`

---

### Day 3: Replace Polling with Realtime

**Goal:** Upgrade GlobalPulse to use Supabase Realtime

#### Morning (2-3 hours):
- [ ] **Update GlobalPulse.ts**
  - Remove polling interval
  - Add Realtime subscriptions
  - Implement proper cleanup

**Current Code (Scene.tsx):**
```typescript
// REMOVE THIS:
interval = window.setInterval(poll, 5000);
```

**New Code (GlobalPulse.ts):**
```typescript
// ADD THIS:
async subscribeToBuildingHealth(
  buildingId: string,
  callback: (health: BuildingHealth) => void
): Promise<() => void> {
  const channel = this.client
    .channel(`building-${buildingId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'wasatchville_city_metrics',
      filter: `metric_key=eq.${buildingId}_voltage`
    }, async (payload) => {
      const health = await this.calculateBuildingHealth(buildingId);
      callback(health);
    })
    .subscribe();

  return () => channel.unsubscribe();
}
```

#### Afternoon (2-3 hours):
- [ ] **Update Scene.tsx**
  - Remove polling code
  - Add Realtime subscriptions
  - Test real-time updates

**Files to Update:**
- `apps/dashboard/lib/supabase/GlobalPulse.ts`
- `apps/dashboard/app/dashboard/command-center/Scene.tsx`

---

### Day 4: Connect Buildings to Database

**Goal:** Buildings display real data from Supabase

#### Tasks:
- [ ] **Update BaseBuilding**
  - Accept building_id from config
  - Subscribe to Realtime updates
  - Update health from database

- [ ] **Update Scene.tsx**
  - Pass building_id to each building
  - Subscribe to health updates
  - Test data flow

- [ ] **Create Test Data**
  - Insert sample metrics
  - Verify buildings update
  - Test real-time changes

**Files to Update:**
- `apps/dashboard/lib/pixi/entities/BaseBuilding.ts`
- `apps/dashboard/app/dashboard/command-center/Scene.tsx`

---

### Day 5: Health Check & Monitoring

**Goal:** Add connection health monitoring

#### Tasks:
- [ ] **Create Latency Monitor**
  ```typescript
  // lib/supabase/LatencyMonitor.ts
  async function pingLatency(): Promise<number> {
    const start = Date.now();
    await supabase.from('wasatchville_system_health').select('id').limit(1);
    return Date.now() - start;
  }
  ```

- [ ] **Add Visual Indicator**
  - Show connection status in UI
  - Display latency
  - "Bad Weather" effect if >200ms

- [ ] **Test Scenarios**
  - Normal connection
  - Slow connection
  - Disconnected

**Files to Create:**
- `apps/dashboard/lib/supabase/LatencyMonitor.ts`

---

## WEEK 2: ETL Pipeline & External Data (Days 6-10)

### Day 6-7: n8n Workflow Setup

**Goal:** Connect external data sources

#### Tasks:
- [ ] **Set Up n8n Workflow**
  - Log into n8n (you have it)
  - Create workflow: "Sync to WasatchVille"

- [ ] **Connect SendGrid**
  - Webhook: Email events → Supabase
  - Update: `wasatchville_residents.engagement_score`
  - Test: Send email, see update

- [ ] **Connect Adult AI Academy** (if accessible)
  - Query: User data → residents table
  - Schedule: Every 5 minutes
  - Test: Verify data syncs

**n8n Workflow Structure:**
```
Trigger: SendGrid Webhook
  → Transform: Normalize email event
  → Action: Update Supabase wasatchville_residents
  → Action: Update wasatchville_city_metrics (email_volume)
```

---

### Day 8-9: QuickBooks Integration (Optional)

**Goal:** Sync financial data

#### Tasks:
- [ ] **Check QuickBooks API Access**
  - Verify API credentials
  - Test connection

- [ ] **Create Sync Script**
  - Query: Transactions → wasatchville_transactions
  - Update: Revenue metrics
  - Schedule: Hourly

**Files to Create:**
- `apps/dashboard/lib/ingestion/quickbooksSync.ts`

---

### Day 10: Google Cloud Health Sync

**Goal:** Infrastructure health monitoring

#### Tasks:
- [ ] **Create GCP Monitoring Sync**
  - Query: API latency → system_health.voltage
  - Update: Error rates → city_metrics
  - Schedule: Every 5 minutes

**Files to Create:**
- `apps/dashboard/lib/ingestion/gcpHealthSync.ts`

---

## WEEK 3: Resident System (Days 11-15)

### Day 11-12: Resident Entity

**Goal:** Create customer visualization

#### Tasks:
- [ ] **Create Resident Class**
  ```typescript
  // lib/pixi/entities/Resident.ts
  export class Resident extends Container {
    private ltv: number;
    private tier: string;
    private housing: Sprite;
    
    constructor(config: ResidentConfig) {
      // Create sprite based on LTV tier
      // Position on grid
    }
  }
  ```

- [ ] **Implement Housing Tiers**
  - Tier 1: Small tent (1x1)
  - Tier 2: House (1x1)
  - Tier 3: Brownstone (2x2)
  - Tier 4: Arcology (2x2)

**Files to Create:**
- `apps/dashboard/lib/pixi/entities/Resident.ts`
- `apps/dashboard/lib/pixi/entities/ResidentHousing.ts`

---

### Day 13-14: Resident Logic

**Goal:** Add movement and state

#### Tasks:
- [ ] **Movement System**
  - Basic pathfinding
  - Walk between buildings
  - Animation

- [ ] **State Machine**
  - Working, Resting, Commuting
  - Visual indicators

**Files to Create:**
- `apps/dashboard/lib/pixi/entities/ResidentMovement.ts`
- `apps/dashboard/lib/pixi/entities/ResidentStateMachine.ts`

---

### Day 15: Integration

**Goal:** Connect residents to database

#### Tasks:
- [ ] **Load from Database**
  - Query: wasatchville_residents
  - Create Resident instances
  - Position on grid

- [ ] **Real-Time Updates**
  - Subscribe to resident changes
  - Update visuals
  - Test updates

---

## WEEK 4: Building Interactions (Days 16-20)

### Day 16-17: Click Handlers

**Goal:** Make buildings interactive

#### Tasks:
- [ ] **Add Click Detection**
  - BaseBuilding.click event
  - Open BuildingInspector
  - Pass building data

- [ ] **Update BuildingInspector**
  - Show real metrics
  - Display health
  - Show revenue

**Files to Update:**
- `apps/dashboard/lib/pixi/entities/BaseBuilding.ts`
- `apps/dashboard/app/dashboard/command-center/components/BuildingInspector.tsx`

---

### Day 18-19: Building Modals

**Goal:** Specialized windows per building

#### Tasks:
- [ ] **Capitol Modal**
  - Mayor's Office dashboard
  - Global metrics
  - Executive summary

- [ ] **Bank Modal**
  - Budget window
  - Revenue breakdown
  - Tax/Commerce controls

- [ ] **Academy Modal**
  - Skill tree
  - Course progress
  - Student stats

**Files to Create:**
- `apps/dashboard/components/buildings/CapitolModal.tsx`
- `apps/dashboard/components/buildings/BankModal.tsx`
- `apps/dashboard/components/buildings/AcademyModal.tsx`

---

### Day 20: Data Queries

**Goal:** Buildings query their own data

#### Tasks:
- [ ] **Building-Specific Queries**
  - Each building queries its metrics
  - Display in modals
  - Test all buildings

---

## WEEK 5: AI Infrastructure (Days 21-25)

### Day 21-22: pgvector Setup

**Goal:** Enable vector search for AI Executives

#### Tasks:
- [ ] **Enable Extension**
  ```sql
  CREATE EXTENSION vector;
  ```

- [ ] **Create Embeddings Table**
  ```sql
  CREATE TABLE wasatchville_document_embeddings (
    id UUID PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536),
    source_building VARCHAR,
    metadata JSONB
  );
  ```

- [ ] **Create Index**
  ```sql
  CREATE INDEX ON wasatchville_document_embeddings
  USING ivfflat (embedding vector_cosine_ops);
  ```

---

### Day 23-24: LangChain Setup

**Goal:** First AI Executive (The Librarian)

#### Tasks:
- [ ] **Install Dependencies**
  ```bash
  npm install langchain @langchain/google-vertexai
  ```

- [ ] **Create Base Agent**
  ```typescript
  // lib/ai/LangChainAgent.ts
  export class BuildingAgent {
    constructor(buildingId: string, persona: string) {
      // Initialize LangChain agent
      // Configure tools
      // Set persona
    }
  }
  ```

- [ ] **Implement Librarian**
  - Access: document_embeddings
  - Tool: Vector search
  - Test: Ask questions

**Files to Create:**
- `apps/dashboard/lib/ai/LangChainAgent.ts`
- `apps/dashboard/lib/ai/BuildingAgents.ts`

---

### Day 25: Text-to-SQL

**Goal:** AI Executives can query database

#### Tasks:
- [ ] **Implement Text-to-SQL**
  - Generate SQL from natural language
  - Execute safely
  - Return results

- [ ] **Test with Banker**
  - Ask: "What's our revenue?"
  - Generate SQL
  - Display results

**Files to Create:**
- `apps/dashboard/lib/ai/TextToSQL.ts`

---

## WEEK 6: Asset Pipeline & Polish (Days 26-30)

### Day 26-27: Complete Asset Pipeline

**Goal:** Generate building sprites

#### Tasks:
- [ ] **Update GeminiAssetGenerator**
  - Use existing code
  - Add building prompts
  - Generate 3 buildings (Capitol, Bank, Library)

- [ ] **Complete Palette Quantization**
  - Use existing PaletteQuantizer
  - Test quantization
  - Verify VGA palette

- [ ] **Store Assets**
  - Upload to Supabase Storage
  - Create sprite sheets
  - Load into PixiJS

**Files to Update:**
- `apps/dashboard/lib/ai/GeminiAssetGenerator.ts`
- `apps/dashboard/lib/ai/PaletteQuantizer.ts`

---

### Day 28-29: Windows 95 UI

**Goal:** Complete interface

#### Tasks:
- [ ] **Start Menu**
  - Navigation
  - Building links

- [ ] **Ticker Tape**
  - Live alerts
  - City metrics

- [ ] **Budget Window**
  - Financial controls
  - Tax sliders

**Files to Create:**
- `apps/dashboard/components/ui/StartMenu.tsx`
- `apps/dashboard/components/ui/TickerTape.tsx`
- `apps/dashboard/components/ui/BudgetWindow.tsx`

---

### Day 30: Testing & Documentation

**Goal:** Verify everything works

#### Tasks:
- [ ] **End-to-End Testing**
  - All buildings clickable
  - Real-time updates work
  - Residents visible
  - AI Executives answer questions

- [ ] **Documentation**
  - Update README
  - Document API
  - Create user guide

---

## 🎯 Critical Success Factors

### Must-Have Before UI Development:
1. ✅ **Supabase Schema** - Data foundation
2. ✅ **Real-Time Sync** - Live updates
3. ✅ **Basic ETL** - External data flowing
4. ✅ **Resident System** - Customers visualized

### Nice-to-Have (Can Add Later):
- AI Executives (can use simple queries first)
- Complete asset pipeline (can use placeholders)
- Full Windows 95 UI (can use basic modals)

---

## 📋 Daily Standup Checklist

### Each Day, Verify:
- [ ] Database changes deployed
- [ ] Real-time subscriptions working
- [ ] No console errors
- [ ] Buildings rendering correctly
- [ ] Data flowing from external sources

---

## 🚨 Blockers & Solutions

### Blocker 1: "I don't have access to Adult AI Academy database"
**Solution:** Start with SendGrid only. Add other sources later.

### Blocker 2: "n8n setup is complex"
**Solution:** Use Supabase Edge Functions instead. Simpler for now.

### Blocker 3: "Asset generation takes too long"
**Solution:** Use placeholder graphics. Generate assets in parallel.

---

## 🎉 Week 1 Deliverable

**By End of Week 1, You Should Have:**
- ✅ WasatchVille schema in Supabase
- ✅ Real-time updates working (no polling)
- ✅ Buildings displaying data from database
- ✅ Connection health monitoring
- ✅ Foundation ready for Week 2

---

## 📚 Reference Documents

- **WASATCHVILLE_INFRASTRUCTURE.md** - Technical architecture
- **WASATCHVILLE_GAP_ANALYSIS.md** - What exists vs. needed
- **WASATCHVILLE_IMPLEMENTATION_ROADMAP.md** - Original roadmap
- **This Document** - Hybrid synthesis with immediate actions

---

**Status:** Ready to execute - Start with Day 1 tasks  
**Next Action:** Create Supabase migration file  
**Timeline:** 6 weeks to production-ready
