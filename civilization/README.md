## Purpose

This repo is organized like a **civilization** so we can:

- **Govern consistently**: shared policies, standards, and “laws” that apply across every business (realm/district).
- **Retain records safely**: an archives system with clear retention rules.
- **Build with privacy by design**: privacy/security requirements are baked into decisions and implementations.
- **Duplicate cleanly**: everything is structured to be templated and reused for future client realms.

## Map of the Civilization

### The Capitol (top-layer governance)

The Capitol is where “constitutional” and cross-cutting governance lives: policy, architecture, and dispute/audit outcomes.

```
/civilization/capitol/
  executive/     # strategy, charters, roadmaps, executive orders
  legislative/   # ordinances (policies/standards), schemas, templates
  judicial/      # audits, incidents, rulings, postmortems
```

### City Hall (administration for all businesses)

City Hall contains the operating playbooks and admin decisions that coordinate the whole city.

```
/civilization/city-hall/
  administration/  # playbooks, checklists, onboarding, operations
  ordinances/      # numbered ordinances (policy-as-docs)
```

### Realms & Districts (each business / client deployment)

Each realm is a “city” that can contain many buildings (ventures). WasatchVille is the flagship realm.

```
/civilization/realms/
  wasatchville/
    docs/         # REALM_SPEC, BUILDING_REGISTRY, AGENT_ROSTER, etc.
    config/       # realm/building/agent config (when implemented)
    src/          # realm-specific code (when implemented)
```

### Archives (records + retention)

Archives hold records (decisions, minutes, audits, exports) **without committing sensitive raw data**.

```
/civilization/archives/
  README.md
  public/          # safe-to-commit records
  private/         # never commit (gitignored)
  exports/         # never commit (gitignored)
```

## How to Use This Structure

- **New policy/standard**: add a numbered ordinance in `civilization/city-hall/ordinances/` (e.g., `ORD-0001-...md`).
- **New architectural decision**: capture it as an ordinance (if it’s a standard) or as an executive directive (if it’s strategy).
- **New incident/audit**: document in `civilization/capitol/judicial/`.
- **New business/venture**: add it under the appropriate realm’s docs and (later) config.

## Naming Conventions

- **Ordinances**: `ORD-####-kebab-case-title.md`
- **Executive orders**: `EO-####-kebab-case-title.md` (optional)
- **Judicial records**: `CASE-####-kebab-case-title.md` (optional)

