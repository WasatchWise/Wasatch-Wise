# REALM_SPEC: WasatchVille

**Client:** John Lyman / Wasatch Wise LLC
**Realm Name:** WasatchVille
**Genre:** City Builder
**Style:** SimCity 2000 Pixel Art
**Created:** 2025-01-25
**Status:** In Development

---

## Executive Summary

WasatchVille is the flagship Business REALMS implementation, serving as both John's personal business operating system and the reference implementation for all future client realms.

**The Metaphor:** John is the Mayor of a small city where each building represents one of his business ventures. AI agents serve as department heads and building managers. Real data flows in to power the visualization.

---

## Business Context

### The Owner
- **Name:** John Lyman (Wasatch)
- **Entity:** Wasatch Wise LLC
- **Type:** Multi-tentacle solopreneur
- **Ventures:** 6+ active business units
- **Employees:** 0 (non-employer firm)
- **Complexity:** High (rivals 50-person company)

### The Challenge
John runs multiple ventures simultaneously without traditional employees. He needs to:
- See the health of all ventures at once
- Know where to focus attention
- Manage cross-venture priorities
- Track progress without dashboard fatigue

### The Solution
WasatchVille presents his business empire as a living city:
- Each venture is a building
- Health metrics show as visual indicators
- AI agents provide summaries and recommendations
- Game mechanics make management engaging

---

## Genre Configuration

### Visual Style
| Property | Value |
|----------|-------|
| Genre | City Builder |
| Reference | SimCity 2000 |
| Perspective | Isometric |
| Art Style | Pixel art, 32x32 base |
| Color Mood | Bright, optimistic, nostalgic |
| Time Period | 1990s retro-future |

### Core Mechanics
| Mechanic | Implementation |
|----------|----------------|
| Building Placement | Fixed layout (not player-placed) |
| Resource Management | Revenue as "treasury" |
| Citizen Happiness | Customer/audience satisfaction |
| City Growth | Revenue growth, new ventures |
| Disasters | Cash flow problems, missed deadlines |

### Views
1. **City View** - Overhead map of all buildings
2. **Building Interior** - Deep dive into one venture
3. **Residents View** - Customer/audience visualization
4. **Underground View** - Infrastructure & data flows

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sky Blue | #87CEEB | Background sky |
| Mountain Gray | #6B7280 | Wasatch mountains |
| Grass Green | #4ade80 | Healthy indicators, land |
| Warning Gold | #FFD700 | Needs attention |
| Alert Red | #EF4444 | Critical issues |
| Surface Dark | #1a1a2e | UI panels, modals |
| Text Light | #E5E7EB | Body text |
| Text Bright | #FFFFFF | Headers, emphasis |

---

## Building Registry

| Building | Venture | Type | Icon |
|----------|---------|------|------|
| Capitol Building | Wasatch Wise HQ | Government | 🏛️ |
| Amusement Park | SLC Trips | Entertainment | 🎢 |
| Concert Hall | Rock Salt | Culture | 🎸 |
| Community College | Adult AI Academy | Education | 🎓 |
| City Park | DAiTE | Recreation | 🌳 |
| Board of Education | Ask Before You App | Government | 📚 |
| Bank | Financial Ops | Finance | 🏦 |
| Library | NotebookLM Hub | Archives | 📖 |

*Full building details in BUILDING_REGISTRY.md*

---

## Agent Roster

| Agent | Role | Building | Voice |
|-------|------|----------|-------|
| Mayor | CEO Overview | Capitol | Strategic, wise |
| Park Director | Content Strategy | Amusement Park | Enthusiastic, creative |
| Concert Manager | Music Industry | Concert Hall | Hip, knowledgeable |
| Dean | Training Programs | College | Academic, patient |
| Park Ranger | Dating Platform | City Park | Warm, insightful |
| Superintendent | Privacy Consulting | Board of Ed | Precise, protective |
| Bank Manager | Cash Flow | Bank | Conservative, detailed |
| Librarian | Documentation | Library | Organized, helpful |

*Full agent details in AGENT_ROSTER.md*

---

## Data Integrations

| Source | Data Type | Refresh | Buildings |
|--------|-----------|---------|-----------|
| Stripe | Revenue, transactions | Real-time | All |
| Supabase | Destinations, users | Real-time | SLC Trips |
| TikTok API | Views, engagement | Hourly | SLC Trips |
| Spotify API | Streams, listeners | Daily | Rock Salt |
| ConvertKit | Subscribers, opens | Hourly | Adult AI Academy |
| Manual Entry | Milestones, notes | On-demand | All |

*Full integration details in INTEGRATION_LOG.md*

---

## Feature Flags

| Feature | Status | Notes |
|---------|--------|-------|
| City Map View | ✅ Enabled | Core feature |
| Building Interiors | 🔄 Phase 2 | After MVP |
| Residents View | 🔄 Phase 2 | Customer visualization |
| Underground View | 🔄 Phase 3 | Data flow visualization |
| AI Agents | 🔄 Phase 2 | After buildings work |
| Sound Effects | ❌ Disabled | Optional future |
| Day/Night Cycle | ❌ Disabled | Unnecessary |
| Weather Effects | ❌ Disabled | Unnecessary |
| Mobile Support | 🔄 Phase 3 | After desktop |

---

## Milestones

### MVP (Phase 1)
- [ ] City map with all buildings rendered
- [ ] Click building to see basic metrics
- [ ] Health indicators (color-coded)
- [ ] Static data (manually entered)

### Beta (Phase 2)
- [ ] Stripe integration for live revenue
- [ ] AI agent for Capitol Building
- [ ] Building interior view
- [ ] Residents visualization

### Launch (Phase 3)
- [ ] All buildings have agents
- [ ] All integrations live
- [ ] Underground infrastructure view
- [ ] Achievement system

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Use | 5 min/day | Analytics |
| Decision Speed | 2x faster | Self-reported |
| Venture Visibility | 100% | All buildings show data |
| Agent Usefulness | 4+/5 | User rating |

---

## Open Questions

1. Should buildings show employees/contractors, or just ventures?
2. How to represent potential future ventures? (Empty lots?)
3. Should there be an "advisor council" view with all agents?
4. How to handle the wrongful termination case as a "building"?

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-25 | Initial spec created | Claude + John |
