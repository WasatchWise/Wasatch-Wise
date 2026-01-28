# Adult AI Academy

A Next.js application for automated content creation, research synthesis, and multi-agent orchestration. This platform automates the production of educational content for the Adult AI Academy, targeting professionals aged 35-55.

## Architecture Overview

The application uses a multi-agent orchestration pattern to transform raw content into polished, brand-consistent assets:

1. **Research & Synthesis** (`src/lib/research/`) - Analyzes raw content and generates structured content plans
2. **Production Orchestrator** (`src/lib/production/orchestrator.ts`) - Coordinates multi-scene storyboard generation
3. **Asset Generation** (`src/lib/assets/`) - Creates images and videos via OpenAI, Gemini, and HeyGen
4. **Auditor Agent** (`src/lib/production/auditor.ts`) - Validates content quality and brand consistency
5. **Knowledge Graph** (`src/lib/production/knowledge-graph.ts`) - Persists production state to Neo4j with graceful degradation
6. **CRM Integration** (`src/lib/research/learning-lab.ts`) - Tracks lead propensity based on engagement analytics

## Tech Stack

- **Framework:** Next.js 16.1.0 (App Router)
- **Language:** TypeScript
- **AI Providers:** OpenAI (GPT-4o), Google Gemini, HeyGen
- **Database:** Supabase (PostgreSQL)
- **Styling:** CSS Modules

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun
- Supabase account and project
- API keys for OpenAI, Gemini (optional: HeyGen, Slack)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd adult-ai-academy
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) section below).

3. **Set up database:**
   Run the SQL schema from `database/schema.sql` in your Supabase SQL Editor.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# AI Providers
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL_NAME=gpt-5.2  # Optional, defaults to gpt-5.2
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-3  # Optional, defaults to gemini-3

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Video Generation & Notifications
HEYGEN_API_KEY=your_heygen_api_key
SLACK_AUDIT_WEBHOOK_URL=your_slack_webhook_url

# Optional: Google APIs
GOOGLE_PLACES_API_KEY=your_places_key
YOUTUBE_API_KEY=your_youtube_key

# Optional: Neo4j Knowledge Graph
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

**Note:** If using Neo4j, you'll also need to install the driver:
```bash
npm install neo4j-driver
```

The application gracefully degrades if Neo4j is not configured (uses logging mode).

See `database/README.md` for database setup instructions.

## Project Structure

```
adult-ai-academy/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/               # API endpoints
│   │   │   ├── health/        # Health check endpoint
│   │   │   ├── research/      # Content synthesis endpoint
│   │   │   ├── production/    # Production orchestration endpoint
│   │   │   └── assets/        # Asset generation endpoints
│   │   ├── synthesis/         # Synthesis Lab UI
│   │   ├── hci-test/          # HCI compatibility test UI
│   │   ├── pilot/             # Pilot review interface
│   │   └── library/           # Content library
│   ├── components/            # React components
│   └── lib/                   # Core business logic
│       ├── config/            # Centralized Zod-validated configuration
│       ├── hci/               # HCI system (archetypes, templates, tests)
│       ├── research/          # Content research, synthesis, multi-version
│       ├── production/        # Multi-agent orchestration
│       ├── assets/            # Asset generation (images, videos)
│       ├── supabase/          # Database client
│       └── utils/             # Utilities (retry logic, etc.)
├── database/                  # Database schema and migrations
├── docs/                      # Additional documentation
└── scripts/                   # Utility scripts (E2E tests, etc.)
```

## API Endpoints

### GET `/api/health`
Returns system health status and service connectivity.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "services": {
    "openai": { "configured": true, "status": "ok", "message": "Model: gpt-5.2" },
    "gemini": { "configured": true, "status": "ok", "message": "Model: gemini-3" },
    "heygen": { "configured": false, "status": "unavailable", "message": "Using simulation mode" },
    "supabase": { "configured": true, "status": "ok", "message": "Database connected" },
    "slack": { "configured": false, "status": "unavailable", "message": "Using console logging" },
    "neo4j": { "configured": false, "status": "unavailable", "message": "Using simulated persistence" }
  },
  "hci": { "archetypes": 7, "templates": 6 }
}
```

**Status codes:** 200 (healthy/degraded), 503 (unhealthy)

---

### POST `/api/research`
Synthesizes raw content into structured content plans.

**Request:**
```json
{
  "rawText": "Your raw content here...",
  "duration": "30s",
  "url": "optional-url-to-scrape",
  "options": {
    "mindsetOverride": "Maybe",
    "templateId": "maybe-security-focused",
    "preferredFormat": "video"
  }
}
```

**Duration options:** `"15s"` | `"30s"` | `"45s"` | `"60s"` | `"3m"`

**Synthesis options (all optional):**
- `mindsetOverride`: Force specific mindset (`"Optimist"` | `"Maybe"` | `"Unaware"`)
- `templateId`: Use specific template (e.g., `"maybe-practical"`)
- `preferredFormat`: Filter templates by format (`"text"` | `"video"` | `"interactive"` | `"visual"`)

**Response:** ResearchResult with storyboard, hooks, NEPQ framework content, template used, and detected mindset

---

### POST `/api/production/run`
Runs the full production pipeline (synthesis → assets → audit).

**Request:**
```json
{
  "rawText": "Your raw content here...",
  "duration": "30s"
}
```

**Response:** ProductionBatch with synthesis, storyboard results, audit report, and status

---

### POST `/api/assets/generate`
Generates images or videos from prompts.

**Request:**
```json
{
  "prompt": "Your image/video prompt",
  "type": "image"  // or "video"
}
```

**Response:** `{ "url": "generated-asset-url" }`

---

### POST `/api/assets/save`
Saves produced assets to the library.

**Request:** Asset data object matching the `produced_assets` schema

**Response:** Success confirmation

## Key Features

### HCI System (Human-Computer Interaction)

The platform includes a sophisticated HCI system for optimizing content delivery based on user adoption mindsets.

**7 User Archetypes** (`src/lib/hci/archetypes.ts`):
- The Tech-Forward Executive (Optimist)
- The Cautious Manager (Maybe)
- The Security-Conscious Attorney (Maybe)
- The Reluctant Late Adopter (Unaware)
- The Data-Driven Financial Analyst (Optimist)
- The Overwhelmed Executive (Maybe)
- The Skeptical Solo Professional (Maybe)

**6 Content Templates** (`src/lib/hci/pattern-templates.ts`):
- Optimist: Interactive Deep-Dive
- Maybe: Practical Step-by-Step
- Maybe: Security & Compliance Focus
- Maybe: Time Reclamation Focus
- Maybe: Personal Brand & Expertise
- Unaware: Simple Visual Guide

**Mindset Detection**: Automatically detects user mindset from content context, with manual override support.

### Multi-Version Generation

Generate the same content optimized for all 3 mindsets simultaneously:

```typescript
import { generateMultiVersion } from '@/lib/research/multi-version';

const result = await generateMultiVersion(rawText, '30s', {
    usePerformanceData: true  // Uses analytics to pick best templates
});
// Returns: Optimist, Maybe, and Unaware versions
```

### Content Synthesis
- Multi-scene storyboard generation
- Brand-consistent voice and tone
- NEPQ framework integration
- Demographic targeting (35-55 professionals)
- **Template-guided synthesis** with mindset-specific messaging

### Production Pipeline
- Concurrent asset generation
- Multi-agent orchestration with context blackboard
- Quality auditing and scoring
- Human-in-the-loop (HITL) approval gates
- **Template metadata tracking** for analytics

### Analytics & Learning
- Performance pattern extraction
- Lead propensity scoring
- Engagement analytics integration
- **Template performance tracking** with weighted scoring
- **Automatic template recommendations** based on performance data

### Analytics Feedback Loop

The system includes a closed-loop analytics system:

```
Generate → Track Template → Collect Analytics → Score Performance → Recommend
    ↑                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

Performance metrics tracked:
- Retention rate (30% weight)
- Hook rate (25% weight)
- Retention curve AUC (20% weight)
- Re-watch rate (15% weight)
- Share count (5% weight)
- Comment sentiment (5% weight)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run end-to-end tests (requires `tsx`: `npm install -D tsx`)
- `npm run test:hci` - Run HCI pattern tests

### Code Organization

- **Research Layer** (`src/lib/research/`): Content analysis, synthesis, and style guide
- **Production Layer** (`src/lib/production/`): Orchestration, auditing, notifications
- **Asset Layer** (`src/lib/assets/`): Image and video generation
- **Data Layer** (`src/lib/supabase/`): Database operations and CRM integration

## Database Schema

See `database/README.md` for detailed schema documentation. Main tables:

- `production_batches` - Stores orchestration batches and audit reports
- `produced_assets` - Final content assets ready for distribution
- `leads` - CRM lead tracking with propensity scores

## Deployment

This project can be deployed to Vercel, Netlify, or any platform supporting Next.js.

**Recommended:** Deploy to Vercel for optimal Next.js integration:

```bash
npm install -g vercel
vercel
```

Make sure to configure all environment variables in your deployment platform's dashboard.

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Private - All Rights Reserved
