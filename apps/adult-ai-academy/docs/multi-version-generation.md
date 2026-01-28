# Multi-Version Content Generation

## Overview

Generate the same content for all 3 adoption mindsets (Optimist, Maybe, Unaware) simultaneously. This enables A/B testing and maximizes reach across different user segments.

## Features

- **Parallel Generation**: All 3 versions generated simultaneously for speed
- **Smart Template Selection**: Uses best-performing template for each mindset (optional)
- **Side-by-Side Comparison**: Easy comparison of hooks, triggers, and content approach
- **A/B Testing Ready**: Perfect for testing which approach resonates best

## Usage

### Via UI

1. Check "Generate Multi-Version (All 3 Mindsets)" checkbox
2. Enter your raw text
3. Select duration
4. Click "Generate Multi-Version"
5. View all 3 versions side-by-side

### Via API

```typescript
import { generateMultiVersion } from '@/lib/research/multi-version';

const result = await generateMultiVersion(rawText, '30s', {
    usePerformanceData: true,  // Use analytics to select best templates
    preferredFormat: 'video'   // Optional: filter by format
});

// Result contains:
// {
//   originalText: "...",
//   duration: "30s",
//   versions: [
//     { mindset: "Optimist", templateId: "...", templateName: "...", result: {...} },
//     { mindset: "Maybe", templateId: "...", templateName: "...", result: {...} },
//     { mindset: "Unaware", templateId: "...", templateName: "...", result: {...} }
//   ],
//   generatedAt: "2024-..."
// }
```

### Via API Endpoint

```bash
POST /api/research/multi-version
Content-Type: application/json

{
  "rawText": "Your content here...",
  "duration": "30s",
  "usePerformanceData": false,
  "preferredFormat": "video"  // optional
}
```

## Template Selection

Each mindset gets its best template:

- **Optimist**: `optimist-interactive` - Data-driven, interactive deep-dive
- **Maybe**: Best performing template (or default: `maybe-practical`)
- **Unaware**: `unaware-visual` - Simple visual guide

If `usePerformanceData: true`, the system uses analytics to select the best-performing template for each mindset.

## Comparison Function

```typescript
import { compareVersions } from '@/lib/research/multi-version';

const comparison = compareVersions(multiVersionResult);

// Returns:
// {
//   commonPillar: "AI Anxiety" | null,  // If all share same pillar
//   uniqueHooks: [
//     { mindset: "Optimist", hook: "..." },
//     { mindset: "Maybe", hook: "..." },
//     { mindset: "Unaware", hook: "..." }
//   ],
//   hookSimilarity: 0.35,  // 0-1 similarity score
//   templateVariety: ["optimist-interactive", "maybe-practical", "unaware-visual"]
// }
```

## Use Cases

### 1. A/B Testing
Generate all 3 versions, publish them on different channels or at different times, and compare engagement metrics.

### 2. Segment Targeting
Use different versions for different audience segments:
- Optimist version for tech-forward professionals
- Maybe version for cautious adopters
- Unaware version for late adopters

### 3. Content Strategy
Understand how the same message resonates differently across mindsets to refine your overall strategy.

### 4. Template Performance
Test which templates work best for different mindsets in real-world scenarios.

## Full Production Pipeline

For generating full production batches (with assets, HeyGen videos, etc.):

```typescript
import { generateMultiVersionWithProduction } from '@/lib/research/multi-version';

const result = await generateMultiVersionWithProduction(rawText, '30s', {
    usePerformanceData: true
});

// Returns synthesis + full production for all 3 versions
```

**Note**: This runs the full production pipeline for each version, which is more resource-intensive but produces complete assets.

## Performance Considerations

- **Parallel Generation**: All 3 versions generate simultaneously (~3x faster than sequential)
- **API Costs**: 3x LLM calls (one per mindset)
- **Storage**: 3x content stored (useful for comparison)

## Best Practices

1. **Use for Testing**: Start with multi-version for new content to see what resonates
2. **Analytics Integration**: Enable `usePerformanceData` once you have historical data
3. **Compare Hooks**: Use `compareVersions()` to understand differences
4. **Pillar Consistency**: Check if all versions share the same pillar (good for brand consistency)
5. **Template Variety**: Understand which templates are being used across mindsets

## Example Output

```
Multi-Version Results:

Optimist Mindset (optimist-interactive)
  Pillar: Work Automation
  Hook: "You've been taught to manage people, but the future is managing the agents who manage the tasks."
  Scenes: 5

Maybe Mindset (maybe-practical)
  Pillar: Work Automation
  Hook: "Busy executives: Stop losing 4+ hours per week on routine tasks. Here's how."
  Scenes: 5

Unaware Mindset (unaware-visual)
  Pillar: Work Automation
  Hook: "New to AI? Don't worry. Here's a simple 2-minute guide that will save you hours every week."
  Scenes: 5
```

Notice how the same topic (Work Automation) is approached differently for each mindset.

