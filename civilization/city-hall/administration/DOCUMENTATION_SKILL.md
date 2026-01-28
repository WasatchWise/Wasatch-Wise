# Business REALMS Development Documentation Skill

## Purpose

This skill ensures that every decision, pattern, component, and learning during the development of Business REALMS is captured in a structured way that enables rapid client deployment. When building WasatchVille (the flagship realm), we are simultaneously building the template system for all future realms.

## Core Principle

**Every line of code, every design decision, every integration is written TWICE:**
1. Once for WasatchVille (the specific implementation)
2. Once for the template system (the reusable pattern)

## Documentation Triggers

The IDE/AI assistant should automatically create or update documentation when:

- [ ] A new component is created
- [ ] A genre-specific variation is implemented
- [ ] A data integration is built
- [ ] An AI agent is configured
- [ ] A visual asset is added
- [ ] A business logic pattern emerges
- [ ] A client-configurable setting is identified
- [ ] A bug is fixed (capture the learning)
- [ ] A performance optimization is made

## Folder Structure

```
/business-realms/
├── /src/                          # The actual application code
├── /docs/                         # All documentation lives here
│   ├── SKILL.md                   # This file
│   ├── /architecture/             # System design decisions
│   │   ├── DECISIONS.md           # Architecture Decision Records
│   │   ├── DATA_MODEL.md          # Database schema documentation
│   │   └── INTEGRATIONS.md        # Third-party integration patterns
│   │
│   ├── /genres/                   # Genre-specific configurations
│   │   ├── _GENRE_TEMPLATE.md     # Template for documenting new genres
│   │   ├── city-builder.md        # SimCity-style configuration
│   │   ├── rts.md                 # StarCraft-style configuration
│   │   ├── tycoon.md              # RollerCoaster Tycoon-style
│   │   ├── rpg.md                 # Final Fantasy-style
│   │   ├── factory.md             # Factorio-style
│   │   ├── colony-sim.md          # RimWorld-style
│   │   ├── tower-defense.md       # Tower defense-style
│   │   ├── 4x-strategy.md         # Civilization-style
│   │   ├── god-game.md            # Populous-style
│   │   ├── moba.md                # League of Legends-style
│   │   └── survival.md            # Minecraft-style
│   │
│   ├── /buildings/                # Reusable building templates
│   │   ├── _BUILDING_TEMPLATE.md  # Template for new buildings
│   │   └── /library/              # Documented building types
│   │
│   ├── /agents/                   # AI agent configurations
│   │   ├── _AGENT_TEMPLATE.md     # Template for new agents
│   │   ├── AGENT_ROLES.md         # Standard roles across realms
│   │   └── /library/              # Documented agent types
│   │
│   ├── /integrations/             # Data source integrations
│   │   ├── _INTEGRATION_TEMPLATE.md
│   │   └── /connectors/           # Specific connector docs
│   │
│   ├── /themes/                   # Visual theming system
│   │   ├── _THEME_TEMPLATE.md     # Template for new themes
│   │   ├── ASSET_REQUIREMENTS.md  # What assets each genre needs
│   │   └── /palettes/             # Color and style definitions
│   │
│   ├── /client-onboarding/        # Client deployment playbooks
│   │   ├── INTAKE_QUESTIONNAIRE.md
│   │   ├── DISCOVERY_CHECKLIST.md
│   │   ├── DEPLOYMENT_PLAYBOOK.md
│   │   └── HANDOFF_CHECKLIST.md
│   │
│   └── /learnings/                # Lessons learned log
│       ├── CHANGELOG.md           # What changed and why
│       └── GOTCHAS.md             # Things that tripped us up
│
├── /templates/                    # Actual reusable code templates
│   ├── /realm-starter/            # Base realm scaffold
│   ├── /building-components/      # React components for buildings
│   ├── /agent-configs/            # Agent configuration JSONs
│   └── /theme-packs/              # CSS/asset bundles per genre
│
└── /clients/                      # Client-specific overrides (gitignored)
    └── /wasatchville/             # Your realm (the first client)
```

## Documentation Standards

### When Creating a New Component

1. **Code the component** in `/src/`
2. **Immediately document** in the appropriate `/docs/` location
3. **Extract the template** to `/templates/`
4. **Log the decision** in `DECISIONS.md` if it's architectural

### Documentation Format

Every documentation file should include:

```markdown
# [Component/Feature Name]

## What This Is
One sentence description.

## Why It Exists
The business problem it solves.

## How It Works
Technical explanation.

## Client-Configurable Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| ... | ... | ... | ... |

## Genre Variations
How this changes per genre (if applicable).

## Dependencies
What this requires to function.

## Example Usage
Code snippet or configuration example.

## Gotchas
Things to watch out for.

## Related Components
Links to related documentation.

## Changelog
| Date | Change | Reason |
|------|--------|--------|
| ... | ... | ... |
```

## Real-Time Documentation Commands

When working with an AI assistant in the IDE, use these commands:

### `@doc:decision [description]`
Logs an architecture decision to DECISIONS.md

### `@doc:component [name]`
Creates documentation stub for a new component

### `@doc:genre [genre] [feature]`
Documents a genre-specific implementation

### `@doc:integration [service]`
Documents a new data integration

### `@doc:gotcha [description]`
Logs a lesson learned to GOTCHAS.md

### `@doc:template [component]`
Extracts current component to reusable template

### `@doc:client-config [option]`
Marks something as client-configurable

## The Golden Rule

**If you build it, document it. If you can't document it simply, simplify the build.**

Every hour spent documenting saves ten hours on the next client deployment.

## Version Control Notes

- Documentation changes should be committed WITH code changes
- Use conventional commits: `docs: added building template for HQ`
- Never commit client-specific data to main repo
- Templates should be tested with at least 2 genre variations before considered "done"

## Quality Checklist

Before marking any component "complete":

- [ ] Code works in WasatchVille
- [ ] Documentation exists in `/docs/`
- [ ] Template extracted to `/templates/`
- [ ] At least one genre variation documented
- [ ] Client-configurable options identified
- [ ] Gotchas captured
- [ ] Changelog updated
