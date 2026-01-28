# Templates

Reusable templates for building new realms, genres, buildings, agents, and integrations.

## Structure

```
templates/
  genres/        # Genre-specific templates (city-builder, rts, rpg, etc.)
  buildings/     # Building component templates (when implemented)
  agents/        # Agent configuration templates (when implemented)
  integrations/  # Integration connector templates (when implemented)
```

## Usage

When building a new realm:

1. Copy the appropriate genre template from `genres/`
2. Customize for the client's business
3. Extract reusable patterns back to templates for future clients
