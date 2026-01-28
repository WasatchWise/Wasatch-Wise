# Business REALMS: Build Documentation System

## Purpose

This documentation system captures every decision, pattern, and component as we build Business REALMS. The goal is to create a **repeatable factory** for spinning up new client realms rapidly.

**First Realm:** WasatchVille (John Lyman / Wasatch Wise LLC)
**Genre:** City Builder (SimCity 2000 style)

---

## Documentation Structure

Every realm build must maintain the following documentation files:

```
/realms
  /[client-slug]                    # e.g., /wasatchville
    /docs
      REALM_SPEC.md                 # Client-specific configuration
      GENRE_MAPPING.md              # How their business maps to game elements
      BUILDING_REGISTRY.md          # All buildings and their data sources
      AGENT_ROSTER.md               # AI agents and their roles
      INTEGRATION_LOG.md            # Data connections and APIs
      DESIGN_DECISIONS.md           # Why we made specific choices
      CHANGELOG.md                  # Version history
    /assets
      /sprites                      # Building images, icons
      /ui                           # Interface elements
      /audio                        # Sound effects (optional)
    /src
      /components                   # React components
      /agents                       # AI agent configurations
      /data                         # Data layer and connections
      /hooks                        # Custom React hooks
    /templates                      # Anything reusable for other clients

/templates                          # Master template library
  /genres
    /city-builder
    /rts
    /tycoon
    /rpg
    /factory
    /colony-sim
    /tower-defense
    /god-game
    /moba
    /4x-strategy
    /survival
  /components
    /buildings
    /agents
    /dashboards
    /residents
    /infrastructure
  /integrations
    /stripe
    /quickbooks
    /google-analytics
    /supabase
    /notion
```

---

## Build Note Protocol

### When Starting ANY New Feature

Before writing code, create a note in the relevant documentation file:

```markdown
## [Feature Name]
**Date:** YYYY-MM-DD
**Status:** Planning | In Progress | Complete | Deprecated

### Intent
What are we trying to accomplish?

### Business Logic
How does this map to the client's actual business?

### Game Logic  
How does this manifest in the game metaphor?

### Technical Approach
How are we building it?

### Reusability Notes
What parts of this can be templated for other clients?

### Dependencies
What does this rely on?

### Open Questions
What's still unclear?
```

### When Completing ANY Feature

Update the note with:

```markdown
### Implementation Notes
What did we actually build? Any deviations from plan?

### Template Extraction
- [ ] Component extracted to /templates? 
- [ ] Configuration externalized?
- [ ] Genre-specific vs universal?

### Lessons Learned
What would we do differently?
```

---

## The Five Layers of a Realm

Every realm has five layers that must be documented separately:

### Layer 1: Genre Shell
The visual metaphor and UI paradigm.

**Document in:** `GENRE_MAPPING.md`

Questions to answer:
- What game genre fits this business?
- What's the primary view? (Top-down map, isometric, first-person, etc.)
- What's the visual style? (Pixel art, modern, fantasy, sci-fi, etc.)
- What are the core game mechanics? (Building placement, resource management, combat, etc.)

### Layer 2: Entity Mapping
How business concepts become game objects.

**Document in:** `BUILDING_REGISTRY.md` and `REALM_SPEC.md`

Questions to answer:
- What real-world things become "buildings"?
- What real-world things become "residents" or "units"?
- What real-world things become "resources"?
- What real-world things become "infrastructure"?

### Layer 3: Data Connections
Where real numbers come from.

**Document in:** `INTEGRATION_LOG.md`

Questions to answer:
- What systems hold the source of truth?
- What's the refresh frequency?
- What transformations are needed?
- What's the fallback if data is unavailable?

### Layer 4: Agent Configuration
AI staff that run each building.

**Document in:** `AGENT_ROSTER.md`

Questions to answer:
- What role does each agent play?
- What data does each agent have access to?
- What actions can each agent take?
- What's the agent's personality/voice?

### Layer 5: Interaction Design
How the user plays the game.

**Document in:** `DESIGN_DECISIONS.md`

Questions to answer:
- What can the user click on?
- What information appears on hover?
- What happens when they "enter" a building?
- What notifications/alerts exist?

---

## Template Extraction Rules

### ALWAYS Template:
- UI components (buttons, cards, modals, tooltips)
- Data fetching hooks
- Agent base configurations
- Integration connectors
- Animation patterns

### SOMETIMES Template (Genre-Specific):
- Building sprites and styles
- Map layouts
- Game mechanics (resource flow, combat, etc.)
- Metaphor-specific language

### NEVER Template (Client-Specific):
- Actual business data
- Brand colors and logos
- Specific building names
- Custom agent personalities

---

## Naming Conventions

### Files
- Components: `PascalCase.jsx` (e.g., `BuildingCard.jsx`)
- Hooks: `useCamelCase.js` (e.g., `useBuildingData.js`)
- Utils: `camelCase.js` (e.g., `calculateMetrics.js`)
- Docs: `SCREAMING_SNAKE.md` (e.g., `BUILDING_REGISTRY.md`)

### Variables
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE`
- CSS classes: `kebab-case`

### Client/Realm Identifiers
- Slug: `kebab-case` (e.g., `wasatchville`, `acme-corp`)
- Display: Title Case (e.g., "WasatchVille", "Acme Corp Citadel")

---

## Git Commit Convention

```
[REALM] [LAYER] [ACTION]: Description

Examples:
[wasatchville] [genre] [add]: City builder base layout
[wasatchville] [entity] [map]: SLC Trips as amusement park building
[wasatchville] [data] [connect]: Stripe integration for revenue
[wasatchville] [agent] [create]: Rock Salt venue manager agent
[templates] [component] [extract]: Generic building card component
```

---

## Code Comment Standards

### Component Header
```javascript
/**
 * @component BuildingCard
 * @realm wasatchville (or "template" if generic)
 * @genre city-builder (or "universal" if genre-agnostic)
 * @layer entity
 * 
 * @description
 * Displays a single building with its metrics and status.
 * 
 * @businessMapping
 * Each building represents one business unit or venture.
 * Clicking opens the building interior with agent interaction.
 * 
 * @templateNotes
 * - Sprite/icon is genre-specific, passed as prop
 * - Metrics display is universal
 * - Click behavior is universal
 * 
 * @dependencies
 * - useBuildingData hook
 * - MetricsDisplay component
 * - AgentChat component
 */
```

### Function Header
```javascript
/**
 * @function calculateBuildingHealth
 * @realm template
 * 
 * @description
 * Determines the "health" score of a building based on its metrics.
 * Health affects visual indicators (color, animations, alerts).
 * 
 * @businessLogic
 * Health = weighted average of key metrics vs targets.
 * Low health = needs attention. High health = thriving.
 * 
 * @gameLogic
 * Health displays as: color (red/yellow/green), 
 * building condition (crumbling/normal/gleaming),
 * and mood indicators (smoke, sparkles, etc.)
 * 
 * @param {Object} building - Building data object
 * @param {Object} targets - Target metrics for comparison
 * @returns {number} Health score 0-100
 */
```

---

## Configuration Externalization

All client-specific values must be externalized to configuration files:

### realm.config.js
```javascript
export default {
  // Identity
  id: 'wasatchville',
  name: 'WasatchVille',
  tagline: 'Rule Your Realm',
  owner: 'John Lyman',
  company: 'Wasatch Wise LLC',
  
  // Genre
  genre: 'city-builder',
  style: 'pixel-art-retro',
  era: '1990s-simcity',
  
  // Theme
  colors: {
    primary: '#8B4513',
    secondary: '#FFD700',
    accent: '#4ade80',
    background: '#87CEEB',
    surface: '#1a1a2e',
  },
  
  // Layout
  mapType: 'isometric',
  gridSize: { x: 20, y: 20 },
  
  // Features
  features: {
    residents: true,
    infrastructure: true,
    weather: false,
    dayNightCycle: false,
    sound: false,
  },
  
  // Integrations
  integrations: {
    stripe: { enabled: true, accountId: '...' },
    supabase: { enabled: true, projectId: '...' },
    googleAnalytics: { enabled: false },
  },
}
```

### buildings.config.js
```javascript
export default [
  {
    id: 'wasatch-wise-hq',
    name: 'Wasatch Wise HQ',
    type: 'capitol',
    businessEntity: 'Wasatch Wise LLC',
    description: 'Corporate Headquarters',
    icon: '🏛️',
    sprite: '/assets/sprites/capitol.png',
    position: { x: 45, y: 35 },
    size: 'large',
    metrics: [
      { key: 'totalRevenue', label: 'Total Revenue', source: 'stripe', format: 'currency' },
      { key: 'activeVentures', label: 'Active Ventures', source: 'manual', format: 'number' },
    ],
    agents: ['mayor', 'cfo'],
    dataSources: {
      stripe: { type: 'aggregate', accounts: ['all'] },
    },
  },
  // ... more buildings
]
```

### agents.config.js
```javascript
export default [
  {
    id: 'mayor',
    name: 'Mayor',
    role: 'CEO & Founder',
    buildingId: 'wasatch-wise-hq',
    personality: 'Strategic, big-picture, optimistic but realistic',
    voice: 'Professional but approachable, occasional humor',
    responsibilities: [
      'Overall business health',
      'Cross-venture coordination',
      'Strategic decisions',
    ],
    dataAccess: ['all'],
    canTakeActions: false, // Advisory only
    avatar: '/assets/agents/mayor.png',
    promptContext: `
      You are the Mayor of WasatchVille, advising John Lyman on his 
      portfolio of businesses. You have visibility into all ventures
      and help prioritize where attention is needed.
    `,
  },
  // ... more agents
]
```

---

## Testing Protocol

### For Every New Component:
1. Does it render with mock data?
2. Does it handle missing/null data gracefully?
3. Does it work with the template system (accepts config props)?
4. Is it visually consistent with the genre style?

### For Every New Integration:
1. Does it handle API failures?
2. Does it cache appropriately?
3. Does it respect rate limits?
4. Is the connection config externalized?

### For Every New Agent:
1. Does it stay in character?
2. Does it have appropriate data access?
3. Does it refuse out-of-scope requests?
4. Is the prompt externalized?

---

## Rapid Deployment Checklist

When onboarding a new client, follow this checklist:

### Discovery (Day 1)
- [ ] Complete genre questionnaire
- [ ] Identify all "buildings" (business units/ventures)
- [ ] Map data sources
- [ ] Define agent roles
- [ ] Collect brand assets

### Configuration (Day 2-3)
- [ ] Create realm.config.js
- [ ] Create buildings.config.js
- [ ] Create agents.config.js
- [ ] Set up integrations
- [ ] Generate/source sprites

### Build (Day 4-7)
- [ ] Clone genre template
- [ ] Apply client configuration
- [ ] Connect data sources
- [ ] Test all buildings render
- [ ] Test all agents respond
- [ ] Client review

### Launch (Day 8-10)
- [ ] Deploy to client subdomain
- [ ] Onboarding call
- [ ] Documentation handoff
- [ ] Feedback loop established

---

## Version Control

### Realm Versions
Each realm gets semantic versioning:
- Major: Genre or fundamental structure change
- Minor: New buildings, agents, or features
- Patch: Bug fixes, metric adjustments

### Template Versions
Templates are versioned independently:
- Breaking changes require realm migration plan
- Non-breaking changes auto-apply on rebuild

---

## AI Assistant Instructions

When working on Business REALMS, the AI assistant should:

1. **Always ask** which realm we're working on before making changes
2. **Always update** the relevant documentation file when completing work
3. **Always check** if a component can be templated before building client-specific
4. **Always externalize** configuration values
5. **Always comment** with the standard headers
6. **Always commit** with the standard convention
7. **Flag** any patterns that appear 3+ times for template extraction
8. **Suggest** documentation updates when designs change

---

## Quick Reference Commands

```bash
# Create new realm from genre template
npm run realm:create -- --genre=city-builder --client=acme-corp

# Generate building config from questionnaire
npm run realm:building -- --realm=wasatchville --name="New Venture"

# Add agent to realm
npm run realm:agent -- --realm=wasatchville --role=marketing-manager

# Extract component to template
npm run template:extract -- --component=BuildingCard --from=wasatchville

# Deploy realm
npm run realm:deploy -- --realm=wasatchville --env=production

# Generate documentation
npm run docs:generate -- --realm=wasatchville
```

---

## Next: Start Building

With this system in place, proceed to create:

1. `wasatchville/docs/REALM_SPEC.md` - The master spec for WasatchVille
2. `wasatchville/docs/BUILDING_REGISTRY.md` - All of John's ventures mapped
3. `wasatchville/docs/AGENT_ROSTER.md` - AI staff for each building
4. `templates/genres/city-builder/` - The reusable city builder template

**Every line of code we write should be documented and extractable.**
