# Genre Template: [GENRE NAME]

> Copy this template to create documentation for a new genre.
> File naming: `[genre-slug].md` (e.g., `city-builder.md`)

---

# [Genre Name] Realm Configuration

**Genre Slug:** `[genre-slug]`
**Reference Games:** [Game 1], [Game 2], [Game 3]
**Business Metaphor:** [One sentence describing the mental model]

## Overview

### Who This Is For

| Industry | Why It Fits |
|----------|-------------|
| [Industry 1] | [Reason] |
| [Industry 2] | [Reason] |
| [Industry 3] | [Reason] |

### The Core Metaphor

**The Owner Is:** [Mayor / General / Dungeon Master / CEO / etc.]
**Employees Are:** [Citizens / Units / Heroes / Colonists / etc.]
**Customers Are:** [Residents / Resources / Guests / Party Members / etc.]
**Competitors Are:** [Neighboring cities / Enemy factions / Rival parks / etc.]
**Revenue Is:** [Tax income / Resources gathered / Ticket sales / etc.]
**Growth Is:** [City expansion / Territory control / Level ups / etc.]

### Emotional Tone

- **Pace:** [Relaxed / Moderate / Intense / Frantic]
- **Feel:** [Cozy / Strategic / Epic / Playful / Serious]
- **Stakes:** [Low / Medium / High / Critical]
- **Time Horizon:** [Daily / Weekly / Quarterly / Multi-year]

---

## Visual Configuration

### Map View

**Layout Style:** [Isometric / Top-down / Side-scroll / 3D]
**Zoom Levels:** [List available zoom levels and what's visible at each]
**Grid System:** [Yes/No, grid size if applicable]

### Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | [Name] | #XXXXXX | [Where used] |
| Secondary | [Name] | #XXXXXX | [Where used] |
| Accent | [Name] | #XXXXXX | [Where used] |
| Background | [Name] | #XXXXXX | [Where used] |
| Danger/Alert | [Name] | #XXXXXX | [Where used] |
| Success | [Name] | #XXXXXX | [Where used] |

### Typography

| Element | Font Family | Size | Weight |
|---------|-------------|------|--------|
| Headers | [Font] | [Size] | [Weight] |
| Body | [Font] | [Size] | [Weight] |
| Data/Numbers | [Font] | [Size] | [Weight] |
| UI Elements | [Font] | [Size] | [Weight] |

### Asset Requirements

| Asset Type | Quantity Needed | Style Notes |
|------------|-----------------|-------------|
| Building sprites | [X] per building type | [Style description] |
| Character sprites | [X] per agent type | [Style description] |
| Background elements | [X] | [Style description] |
| UI elements | [X] | [Style description] |
| Icons | [X] | [Style description] |
| Animations | [X] | [Style description] |

---

## Building Types

### Standard Buildings for This Genre

| Building | Business Function | Visual Style | Default Metrics |
|----------|-------------------|--------------|-----------------|
| [Building 1] | [Function] | [Description] | [Metrics shown] |
| [Building 2] | [Function] | [Description] | [Metrics shown] |
| [Building 3] | [Function] | [Description] | [Metrics shown] |

### Building Interaction Pattern

**Click Behavior:** [What happens when you click a building]
**Hover Behavior:** [What shows on hover]
**Selection Indicator:** [How selected buildings are highlighted]
**Alert States:** [How buildings show problems]

---

## Agent Configuration

### Default Agent Roles for This Genre

| Role | Genre Name | Function | Personality Traits |
|------|------------|----------|-------------------|
| CEO/Owner | [Genre term] | Strategic oversight | [Traits] |
| Finance | [Genre term] | Budget & cash flow | [Traits] |
| Operations | [Genre term] | Day-to-day metrics | [Traits] |
| Marketing | [Genre term] | Growth & outreach | [Traits] |
| HR/People | [Genre term] | Team management | [Traits] |

### Agent Dialogue Style

**Tone:** [Formal / Casual / Playful / Urgent]
**Length:** [Brief / Moderate / Detailed]
**Personality:** [How agents "speak" in this genre]

**Example Agent Greeting:**
> [Example of how an agent would greet the user in this genre]

**Example Status Report:**
> [Example of how an agent would report metrics]

**Example Alert:**
> [Example of how an agent would warn about a problem]

---

## Metrics & Data Display

### Primary Dashboard Metrics

| Metric | Genre Label | Icon | Display Format |
|--------|-------------|------|----------------|
| Revenue | [Genre term] | [Icon] | [Format] |
| Customers | [Genre term] | [Icon] | [Format] |
| Growth | [Genre term] | [Icon] | [Format] |
| Health/Status | [Genre term] | [Icon] | [Format] |

### How Numbers Are Framed

- Revenue: "[Genre-specific framing, e.g., 'Treasury: 47,000 gold']"
- Customers: "[Genre-specific framing, e.g., 'Citizens: 2,847']"
- Growth: "[Genre-specific framing, e.g., 'City expanding at +23%']"
- Problems: "[Genre-specific framing, e.g., 'Fire in District 4!']"

---

## Notifications & Events

### Event Types

| Event | Genre Presentation | Sound | Animation |
|-------|-------------------|-------|-----------|
| New customer | [Description] | [Sound] | [Animation] |
| Revenue milestone | [Description] | [Sound] | [Animation] |
| Problem/Alert | [Description] | [Sound] | [Animation] |
| Achievement | [Description] | [Sound] | [Animation] |

### Notification Style

**Position:** [Where notifications appear]
**Duration:** [How long they stay]
**Interaction:** [Click to dismiss, auto-fade, etc.]

---

## Gamification Elements

### Progression System

| Level | Name | Requirements | Unlocks |
|-------|------|--------------|---------|
| 1 | [Name] | [Requirements] | [What unlocks] |
| 2 | [Name] | [Requirements] | [What unlocks] |
| 3 | [Name] | [Requirements] | [What unlocks] |

### Achievements

| Achievement | Criteria | Badge/Icon | Points |
|-------------|----------|------------|--------|
| [Name] | [Criteria] | [Icon] | [Points] |
| [Name] | [Criteria] | [Icon] | [Points] |

---

## Technical Implementation

### Required Components

```
/components/genres/[genre-slug]/
├── GenreProvider.jsx       # Context for genre-specific config
├── MapView.jsx             # Main map component
├── BuildingRenderer.jsx    # How buildings are drawn
├── AgentDialogue.jsx       # Agent conversation UI
├── MetricDisplay.jsx       # How metrics are shown
├── NotificationSystem.jsx  # Event notifications
└── theme.css               # Genre-specific styles
```

### Configuration Object

```javascript
const genreConfig = {
  slug: '[genre-slug]',
  name: '[Genre Name]',
  
  metaphor: {
    owner: '[term]',
    employees: '[term]',
    customers: '[term]',
    competitors: '[term]',
    revenue: '[term]',
    growth: '[term]',
  },
  
  visuals: {
    layout: '[isometric|topdown|etc]',
    palette: { /* colors */ },
    fonts: { /* typography */ },
  },
  
  agents: {
    defaultRoles: [ /* roles */ ],
    dialogueStyle: { /* config */ },
  },
  
  metrics: {
    primary: [ /* metric configs */ ],
    formatting: { /* how to display */ },
  },
  
  gamification: {
    levels: [ /* progression */ ],
    achievements: [ /* achievements */ ],
  },
};

export default genreConfig;
```

---

## Client Customization Points

| Option | Type | Default | Client Can Change? |
|--------|------|---------|-------------------|
| Color palette | Object | [Default] | ✅ Yes |
| Building names | Strings | [Defaults] | ✅ Yes |
| Agent personalities | Strings | [Defaults] | ✅ Yes |
| Metric labels | Strings | [Defaults] | ✅ Yes |
| Progression levels | Array | [Defaults] | ✅ Yes |
| Sound effects | Boolean | On | ✅ Yes |
| Animation speed | Number | 1.0 | ✅ Yes |

---

## Example Client Implementations

### [Client 1 Name]
- **Industry:** [Industry]
- **Customizations:** [What they changed]
- **Screenshot:** [Link or embed]

### [Client 2 Name]
- **Industry:** [Industry]
- **Customizations:** [What they changed]
- **Screenshot:** [Link or embed]

---

## Changelog

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial creation | First implementation for [client] |
| | | |

---

## Related Documentation

- [Link to building templates used]
- [Link to agent configurations]
- [Link to theme assets]
