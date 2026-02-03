# WasatchVille Infrastructure & Architecture
**Project:** Business REALMS - Gamified Enterprise Operating System  
**Status:** Architecture & Planning Phase  
**Last Updated:** January 26, 2026

---

## 🎯 Executive Summary

WasatchVille is a SimCity 2000-style isometric business operating system that transforms abstract KPIs into a living, breathing digital metropolis. This document outlines the foundational infrastructure required before building individual features.

**Core Philosophy:** Game-to-Business (G2B) mapping - every organizational challenge has a ludological analog.

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router) + PixiJS v8
- **Backend:** Supabase (PostgreSQL + Realtime)
- **AI:** Vertex AI (Gemini/Nano Banana) for asset generation
- **Integration:** SendGrid, Google Cloud, various APIs

---

## 🏗️ Infrastructure Prerequisites

### Phase 0: Foundation (MUST COMPLETE FIRST)

These components must be built before any game features can be implemented.

---

## 1. Core Rendering Engine

### 1.1 PixiJS v8 Integration with Next.js 14

**Status:** ⚠️ Critical - Must be completed first  
**Priority:** HIGHEST

#### Requirements:
- [ ] **Dynamic Import Setup** - Prevent SSR conflicts
- [ ] **PixiJS v8 Async Initialization** - Proper lifecycle management
- [ ] **WebGL/WebGPU Renderer** - Auto-detect with fallback
- [ ] **Memory Management** - Proper cleanup on unmount
- [ ] **React Strict Mode Compatibility** - Handle double-mounting

#### Implementation Pattern:
```typescript
// app/dashboard/page.tsx
import dynamic from 'next/dynamic';

const WasatchVilleStage = dynamic(
  () => import('@/components/game/WasatchVilleStage'),
  { 
    ssr: false,
    loading: () => <p>Loading Simulation...</p> 
  }
);
```

#### Files to Create:
- `components/game/WasatchVilleStage.tsx` - Main PixiJS container
- `lib/pixi/ApplicationManager.ts` - PixiJS lifecycle management
- `lib/pixi/utils/ProjectionUtility.ts` - Isometric math utilities

**Dependencies:**
- `pixi.js@^8.0.0`
- `next@^14.0.0`

---

### 1.2 Isometric Projection System

**Status:** ⚠️ Critical - Foundation for all rendering  
**Priority:** HIGHEST

#### Requirements:
- [ ] **2:1 Dimetric Projection** - SimCity 2000 aesthetic
- [ ] **Grid-to-Screen Transformation** - Convert (x,y) to screen coords
- [ ] **Screen-to-Grid Transformation** - Mouse click detection
- [ ] **Z-Index Calculation** - Depth sorting for occlusion
- [ ] **Tile Constants** - TILE_WIDTH: 64px, TILE_HEIGHT: 32px

#### Implementation:
```typescript
// lib/pixi/utils/ProjectionUtility.ts
export const ISO = {
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  
  toScreen: (gridX: number, gridY: number) => ({
    x: (gridX - gridY) * (64 / 2),
    y: (gridX + gridY) * (32 / 2)
  }),
  
  toGrid: (screenX: number, screenY: number) => ({
    x: Math.floor((screenX / 32) + (screenY / 16)) / 2,
    y: Math.floor((screenY / 16) - (screenX / 32)) / 2
  }),
  
  calculateZIndex: (gridX: number, gridY: number, height: number = 0) => {
    return (gridX + gridY) + (height * 0.001);
  }
};
```

#### Files to Create:
- `lib/pixi/utils/ProjectionUtility.ts` - Complete isometric math
- `lib/pixi/utils/DepthSorter.ts` - Z-index sorting logic

**Dependencies:**
- None (pure math)

---

### 1.3 Scene Graph Architecture

**Status:** ⚠️ Critical - Organizes all visual elements  
**Priority:** HIGHEST

#### Layer Hierarchy:
```
Application (Root)
└── Viewport (Pan/Zoom/Cull)
    └── WorldContainer
        ├── GridLayer (Z: 0) - Static terrain
        ├── InfrastructureLayer (Z: 1) - Underground utilities
        ├── CompositeEntityLayer (Z: 2) - Buildings + Residents (sortable)
        ├── SelectionLayer (Z: 3) - Cursor highlights
        └── WeatherEffectLayer (Z: 4) - Particles
```

#### Requirements:
- [ ] **Viewport Container** - Pan, zoom, cull functionality
- [ ] **Layer Separation** - Logical organization
- [ ] **Sortable Children** - Dynamic depth sorting
- [ ] **Culling Optimization** - Only render visible tiles
- [ ] **Event Handling** - Click, hover, drag detection

#### Files to Create:
- `lib/pixi/scene/IsometricStage.tsx` - Main stage component
- `lib/pixi/scene/layers/GridLayer.ts` - Terrain rendering
- `lib/pixi/scene/layers/InfrastructureLayer.ts` - Underground view
- `lib/pixi/scene/layers/CompositeEntityLayer.ts` - Buildings + Residents
- `lib/pixi/scene/layers/SelectionLayer.ts` - UI overlays
- `lib/pixi/scene/ViewportManager.ts` - Camera controls

**Dependencies:**
- `pixi-viewport` (optional, or custom implementation)
- `pixi.js@^8.0.0`

---

## 2. Data Architecture

### 2.1 Supabase Schema Design

**Status:** ⚠️ Critical - Data foundation  
**Priority:** HIGHEST

#### Core Tables:

**residents** (Customers/Users)
```sql
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**city_metrics** (Global KPIs)
```sql
CREATE TABLE city_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT UNIQUE NOT NULL, -- 'system_voltage', 'treasury_funds', etc.
  value NUMERIC NOT NULL,
  trend TEXT CHECK (trend IN ('rising', 'falling', 'stable')),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

**building_registry** (AI Executives Configuration)
```sql
CREATE TABLE building_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT UNIQUE NOT NULL, -- 'capitol', 'bank', 'academy'
  type TEXT NOT NULL,
  agent_persona TEXT, -- LangChain system prompt
  data_access_scope JSONB, -- RLS policy definitions
  grid_x INTEGER,
  grid_y INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**transactions** (Revenue Events)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT REFERENCES building_registry(building_id),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Requirements:
- [ ] **Schema Migration** - Create all tables
- [ ] **RLS Policies** - Row-level security
- [ ] **Indexes** - Performance optimization
- [ ] **Triggers** - Auto-update timestamps
- [ ] **Functions** - Helper SQL functions

#### Files to Create:
- `supabase/migrations/001_initial_schema.sql` - Core tables
- `supabase/migrations/002_building_registry.sql` - Building config
- `supabase/migrations/003_rls_policies.sql` - Security
- `supabase/migrations/004_functions.sql` - Helper functions

**Dependencies:**
- Supabase project configured
- PostgreSQL access

---

### 2.2 Real-Time Data Synchronization

**Status:** ⚠️ Critical - Live updates  
**Priority:** HIGHEST

#### Requirements:
- [ ] **Supabase Realtime Client** - WebSocket connection
- [ ] **Channel Subscriptions** - Postgres changes
- [ ] **Event Handlers** - React state updates
- [ ] **Latency Monitoring** - Connection health
- [ ] **Error Handling** - Reconnection logic

#### Implementation:
```typescript
// lib/supabase/GlobalPulse.ts
import { createClient } from '@supabase/supabase-js';

export class GlobalPulse {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  subscribeToMetrics(callback: (metrics: CityMetrics) => void) {
    return this.supabase
      .channel('global-pulse')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'city_metrics' },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
}
```

#### Files to Create:
- `lib/supabase/GlobalPulse.ts` - Real-time service
- `lib/supabase/hooks/useRealtimeMetrics.ts` - React hook
- `lib/supabase/hooks/useBuildingHealth.ts` - Building-specific hook

**Dependencies:**
- `@supabase/supabase-js@^2.0.0`
- Supabase Realtime enabled

---

### 2.3 Data Ingestion Pipeline

**Status:** ⚠️ Important - External data sync  
**Priority:** HIGH

#### Requirements:
- [ ] **ETL Scripts** - Extract from external sources
- [ ] **Webhook Handlers** - Receive external events
- [ ] **Batch Jobs** - Scheduled updates
- [ ] **Data Validation** - Ensure data quality
- [ ] **Error Logging** - Monitor failures

#### Integration Points:
- **Salesforce/CRM** → `residents` table
- **Stripe/Payments** → `transactions` table
- **Google Cloud** → `city_metrics` (system_voltage)
- **SendGrid** → Email events → `residents` updates

#### Files to Create:
- `lib/ingestion/crmSync.ts` - CRM data sync
- `lib/ingestion/paymentSync.ts` - Payment data sync
- `lib/ingestion/cloudHealthSync.ts` - Infrastructure monitoring
- `supabase/functions/webhook-handler/` - Edge functions

**Dependencies:**
- Supabase Edge Functions
- External API access (Salesforce, Stripe, etc.)

---

## 3. Asset Pipeline

### 3.1 AI Asset Generation System

**Status:** ⚠️ Important - Visual assets  
**Priority:** HIGH

#### Requirements:
- [ ] **Gemini API Integration** - Nano Banana for image generation
- [ ] **Prompt Templates** - Consistent building generation
- [ ] **Palette Quantization** - 256-color VGA palette
- [ ] **Isometric Projection** - 2:1 dimetric conversion
- [ ] **Asset Storage** - Supabase Storage or Cloud Storage

#### Building Prompts:
Each building needs a specific prompt template:
- Capitol (WasatchWise)
- Adult AI Academy (Community College)
- Ask Before You App (Government Office)
- Bank (Financial Services)
- NotebookLM (Library)
- The Rings (Rec Center)
- Rock Salt (Music Venue)
- SLCTrips (Amusement Park)
- Daite (City Park)

#### Files to Create:
- `lib/assets/geminiGenerator.ts` - AI image generation
- `lib/assets/paletteQuantizer.ts` - Color reduction
- `lib/assets/isometricConverter.ts` - Projection conversion
- `lib/assets/promptTemplates.ts` - Building prompts
- `app/api/assets/generate/route.ts` - API endpoint

**Dependencies:**
- Google Vertex AI API access
- Image processing libraries (Pillow/Python or Sharp/Node)

---

### 3.2 Asset Management System

**Status:** ⚠️ Important - Asset organization  
**Priority:** HIGH

#### Requirements:
- [ ] **Asset Registry** - Database of all assets
- [ ] **Texture Loading** - PixiJS texture management
- [ ] **Sprite Sheet Generation** - Optimize draw calls
- [ ] **Asset Versioning** - Track asset updates
- [ ] **Fallback Assets** - Open source tilesets

#### Files to Create:
- `lib/assets/AssetManager.ts` - Asset loading system
- `lib/assets/TextureCache.ts` - Texture caching
- `lib/assets/SpriteSheetBuilder.ts` - Sprite sheet generation
- `supabase/migrations/005_asset_registry.sql` - Asset database

**Dependencies:**
- `pixi.js@^8.0.0`
- Asset storage (Supabase Storage or Cloud Storage)

---

## 4. Building System

### 4.1 Base Building Class

**Status:** ⚠️ Critical - Foundation for all buildings  
**Priority:** HIGHEST

#### Requirements:
- [ ] **Building Entity** - Base class for all buildings
- [ ] **Health System** - Status visualization
- [ ] **Data Binding** - Connect to Supabase
- [ ] **Interaction** - Click handlers
- [ ] **Animation** - State-based visuals

#### Implementation:
```typescript
// lib/pixi/entities/BaseBuilding.ts
export abstract class BaseBuilding extends Container {
  protected health: BuildingHealth;
  protected gridX: number;
  protected gridY: number;
  
  constructor(config: BuildingConfig) {
    super();
    this.gridX = config.gridX;
    this.gridY = config.gridY;
    this.setupSprite();
    this.setupHealthIndicator();
  }
  
  abstract setupSprite(): void;
  abstract updateHealth(health: BuildingHealth): void;
}
```

#### Files to Create:
- `lib/pixi/entities/BaseBuilding.ts` - Abstract base class
- `lib/pixi/entities/types.ts` - TypeScript types
- `lib/pixi/entities/BuildingHealth.ts` - Health system

**Dependencies:**
- `pixi.js@^8.0.0`
- Isometric projection system

---

### 4.2 Specific Building Implementations

**Status:** ⚠️ Important - Individual buildings  
**Priority:** HIGH (after base class)

#### Buildings to Implement:
1. **Capitol** (`lib/pixi/entities/CapitolBuilding.ts`)
   - Represents: WasatchWise HQ
   - Data: Consolidated revenue, global metrics
   - Interaction: Opens "Mayor's Office" dashboard

2. **AdultAIAcademy** (`lib/pixi/entities/AcademyBuilding.ts`)
   - Represents: Adult AI Academy
   - Data: Course completion, enrollment
   - Interaction: Opens skill tree/LMS

3. **AskBeforeYouApp** (`lib/pixi/entities/GovernmentBuilding.ts`)
   - Represents: Compliance/Governance
   - Data: Compliance audits, risk assessments
   - Interaction: Opens compliance dashboard

4. **Bank** (`lib/pixi/entities/BankBuilding.ts`)
   - Represents: Financial Services
   - Data: Cash flow, affiliate revenue
   - Interaction: Opens budget window

5. **NotebookLM** (`lib/pixi/entities/LibraryBuilding.ts`)
   - Represents: Knowledge Management
   - Data: Documentation access, AI context
   - Interaction: Opens knowledge base

6. **TheRings** (`lib/pixi/entities/RecCenterBuilding.ts`)
   - Represents: Employee Wellness
   - Data: eNPS, retention rates
   - Interaction: Opens culture dashboard

7. **RockSalt** (`lib/pixi/entities/VenueBuilding.ts`)
   - Represents: Marketing/Events
   - Data: Ticket sales, social impressions
   - Interaction: Opens "Backstage Pass" interface

8. **SLCTrips** (`lib/pixi/entities/AmusementBuilding.ts`)
   - Represents: Customer Acquisition
   - Data: Trip sales, user sign-ups
   - Interaction: Opens tourism dashboard

9. **Daite** (`lib/pixi/entities/ParkBuilding.ts`)
   - Represents: Social Connectivity
   - Data: Community engagement
   - Interaction: Opens social dashboard

#### Files to Create:
- One file per building type (9 files total)
- Each extends `BaseBuilding`
- Each implements building-specific logic

**Dependencies:**
- Base building class
- Asset pipeline
- Data synchronization

---

## 5. Resident System

### 5.1 Resident Entity

**Status:** ⚠️ Important - Customer visualization  
**Priority:** HIGH

#### Requirements:
- [ ] **Resident Sprite** - Visual representation
- [ ] **LTV-Based Housing** - Visual tier system
- [ ] **Movement Logic** - Pathfinding between buildings
- [ ] **State Machine** - Working, Resting, Commuting, Protesting
- [ ] **Sentiment Visualization** - Decay shader for churn risk

#### Housing Tiers:
- **Tier 1 (LTV < $100):** Small tent/trailer (1x1)
- **Tier 2 ($100 - $1,000):** Single-family home (1x1)
- **Tier 3 ($1,000 - $10,000):** Luxury brownstone (2x2)
- **Tier 4 (> $10,000):** Enterprise arcology (2x2)

#### Files to Create:
- `lib/pixi/entities/Resident.ts` - Resident entity
- `lib/pixi/entities/ResidentHousing.ts` - Housing visualization
- `lib/pixi/entities/ResidentMovement.ts` - Pathfinding logic
- `lib/pixi/shaders/DecayShader.ts` - Churn visualization

**Dependencies:**
- Base building system
- Asset pipeline
- Pathfinding library (optional)

---

## 6. UI Overlay System

### 6.1 Windows 95 Interface

**Status:** ⚠️ Important - User interface  
**Priority:** HIGH

#### Requirements:
- [ ] **React95 Integration** - Windows 95 UI library
- [ ] **Start Menu** - Navigation
- [ ] **Ticker Tape** - Live alerts
- [ ] **Budget Window** - Financial controls
- [ ] **Building Inspector** - Entity details
- [ ] **Toolbox** - Interaction modes

#### Files to Create:
- `components/ui/StartMenu.tsx` - Navigation menu
- `components/ui/TickerTape.tsx` - Alert ticker
- `components/ui/BudgetWindow.tsx` - Financial controls
- `components/ui/BuildingInspector.tsx` - Entity details
- `components/ui/Toolbox.tsx` - Interaction tools

**Dependencies:**
- `react95` or custom Windows 95 components
- React state management

---

## 7. AI Executive System

### 7.1 LangChain Integration

**Status:** ⚠️ Future - AI-powered insights  
**Priority:** MEDIUM (can come later)

#### Requirements:
- [ ] **LangChain Setup** - Agent framework
- [ ] **RAG System** - Vector store (Supabase pgvector)
- [ ] **Text-to-SQL** - Query generation
- [ ] **Persona System** - Building-specific agents
- [ ] **Safety Layer** - Query validation

#### Files to Create:
- `lib/ai/LangChainAgent.ts` - Base agent class
- `lib/ai/BuildingAgents.ts` - Specific agent implementations
- `lib/ai/TextToSQL.ts` - SQL generation
- `lib/ai/RAGSystem.ts` - Retrieval system

**Dependencies:**
- `langchain`
- `@langchain/openai` or Vertex AI
- Supabase pgvector extension

---

## 8. Integration Points

### 8.1 SendGrid Integration

**Status:** ⚠️ Important - Email visualization  
**Priority:** HIGH

#### Requirements:
- [ ] **Post Office Building** - Visual email hub
- [ ] **Email Event Webhooks** - SendGrid → Supabase
- [ ] **Visual Feedback** - Mail trucks, letter icons
- [ ] **Deliverability Monitoring** - Gridlock visualization

#### Files to Create:
- `lib/integrations/SendGridWebhook.ts` - Webhook handler
- `lib/pixi/entities/PostOfficeBuilding.ts` - Post office entity
- `supabase/functions/sendgrid-webhook/` - Edge function

**Dependencies:**
- SendGrid API
- Supabase Edge Functions

---

### 8.2 Google Cloud Integration

**Status:** ⚠️ Important - Infrastructure health  
**Priority:** HIGH

#### Requirements:
- [ ] **System Voltage Metric** - API latency → voltage
- [ ] **Infrastructure Layer** - Underground utilities
- [ ] **Health Monitoring** - Visual status indicators
- [ ] **Alert System** - Brownout/outage visualization

#### Files to Create:
- `lib/integrations/GoogleCloudHealth.ts` - Health monitoring
- `lib/pixi/effects/BrownoutEffect.ts` - Visual effects

**Dependencies:**
- Google Cloud Monitoring API
- Vertex AI API

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4) ⚠️ CRITICAL
**Must complete before anything else**

- [ ] PixiJS v8 + Next.js 14 integration
- [ ] Isometric projection system
- [ ] Scene graph architecture
- [ ] Supabase schema setup
- [ ] Real-time data synchronization
- [ ] Base building class

**Deliverable:** Empty isometric grid with one test building

---

### Phase 2: Core Systems (Weeks 5-8)
**Build foundational systems**

- [ ] Asset pipeline (AI generation)
- [ ] All 9 building implementations
- [ ] Resident system (basic)
- [ ] UI overlay (Windows 95)
- [ ] Data ingestion pipeline

**Deliverable:** Functional city with buildings and basic residents

---

### Phase 3: Intelligence (Weeks 9-12)
**Add smart features**

- [ ] AI Executive system (LangChain)
- [ ] SendGrid integration
- [ ] Google Cloud health monitoring
- [ ] Advanced resident behaviors
- [ ] Building interactions

**Deliverable:** Fully interactive city with AI-powered insights

---

### Phase 4: Polish (Weeks 13-16)
**Optimize and refine**

- [ ] Performance optimization
- [ ] Visual effects (disasters, weather)
- [ ] Sound system
- [ ] Advanced animations
- [ ] Documentation

**Deliverable:** Production-ready Business REALMS platform

---

## 🔧 Development Environment Setup

### Prerequisites:
```bash
# Node.js 18+
node --version

# Package Manager
npm install -g pnpm  # or yarn, npm

# Supabase CLI
npm install -g supabase
```

### Initial Setup:
```bash
# Clone repository
git clone [repo-url]
cd wasatchwise

# Install dependencies
pnpm install

# Set up Supabase
supabase init
supabase start

# Environment variables
cp .env.example .env.local
# Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run development server
pnpm dev
```

---

## 📚 Key Documentation References

- **Game-to-Business Mapping:** See `REALMS_BUILD_SYSTEM.md` (if exists)
- **Building Registry:** See `BUILDING_REGISTRY.md` (if exists)
- **Technical Specs:** This document
- **Revenue Opportunities:** See `REVENUE_OPPORTUNITIES.md`

---

## 🚨 Critical Dependencies

**These must be completed in order:**

1. ✅ **PixiJS Integration** - Nothing renders without this
2. ✅ **Isometric Math** - No correct positioning without this
3. ✅ **Supabase Schema** - No data without this
4. ✅ **Real-time Sync** - No live updates without this
5. ✅ **Base Building Class** - No buildings without this

**Everything else builds on these foundations.**

---

**Status:** Ready for Phase 1 implementation  
**Next Steps:** Begin PixiJS v8 + Next.js 14 integration
