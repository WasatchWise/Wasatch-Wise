# HCI (Human-Computer Interaction) Testing System

This module provides tools for testing and optimizing content patterns against user archetypes for the Adult AI Academy.

## Overview

The HCI system includes:
- **7 User Archetypes** - Based on research of 35-55 professional demographic
- **Compatibility Scoring** - Evaluates how well interaction patterns match archetype needs
- **Pattern Templates** - Pre-configured content patterns optimized for each adoption mindset
- **Test Runner** - Automated testing of multiple patterns against all archetypes

## User Archetypes

The 7 archetypes represent the Adult AI Academy's target demographic:

1. **The Tech-Forward Executive** (Optimist, 38) - Wants innovation and competitive edge
2. **The Cautious Manager** (Maybe, 45) - Needs practical, step-by-step guidance
3. **The Security-Conscious Attorney** (Maybe, 42) - Focused on compliance and data security
4. **The Reluctant Late Adopter** (Unaware, 52) - Needs simple, visual, supportive content
5. **The Data-Driven Financial Analyst** (Optimist, 40) - Wants data-backed, accurate solutions
6. **The Overwhelmed Executive** (Maybe, 48) - Needs time-saving, quick wins
7. **The Skeptical Solo Professional** (Maybe, 44) - Concerned about brand and expertise

## Usage

### Testing Patterns

```typescript
import { ARCHETYPES, InteractionPattern, calculateHCICompatibility } from './archetypes';

const pattern: InteractionPattern = {
    contentLength: 'short',
    format: 'video',
    cognitiveComplexity: 'medium',
    estimatedDuration: 8,
    addressesBarriers: ['time', 'complexity'],
    supportsGoals: ['save time', 'learn tools']
};

const archetype = ARCHETYPES.find(a => a.id === 'cautious-manager');
const metrics = calculateHCICompatibility(archetype!, pattern);
console.log(`Compatibility: ${metrics.overallScore * 100}%`);
```

### Using Pattern Templates

```typescript
import { PATTERN_TEMPLATES, generateSynthesisPrompt } from './pattern-templates';

// Get templates for "Maybe" mindset
const maybeTemplates = PATTERN_TEMPLATES.filter(t => t.targetMindset === 'Maybe');

// Generate synthesis prompt
const template = maybeTemplates[0];
const prompt = generateSynthesisPrompt(template, 'AI Email Automation');
```

### Running Tests

```bash
# Run all pattern tests
npx tsx src/lib/hci/run-tests.ts

# Or use the web interface
# Navigate to http://localhost:3000/hci-test
```

## Pattern Templates

Templates are organized by adoption mindset:

### Optimist Templates
- **Interactive Deep-Dive** - For tech-forward professionals who want data-driven content

### Maybe Templates (4 variants)
- **Practical Step-by-Step** - General practical guidance
- **Security & Compliance Focus** - For legal/financial professionals
- **Time Reclamation Focus** - For overwhelmed executives
- **Personal Brand & Expertise** - For solo professionals

### Unaware Templates
- **Simple Visual Guide** - For late adopters needing very simple content

## Integration with Synthesis

Pattern templates can be integrated into the content synthesis pipeline:

```typescript
import { getTemplatesByMindset, generateSynthesisPrompt } from '@/lib/hci/pattern-templates';

// In synthesis function
const mindset = detectMindsetFromInput(rawText); // 'Optimist' | 'Maybe' | 'Unaware'
const templates = getTemplatesByMindset(mindset);
const selectedTemplate = selectBestTemplate(templates, duration);
const guidance = generateSynthesisPrompt(selectedTemplate, topic);
```

## Key Metrics

The compatibility scoring evaluates:

1. **Content Length Match** - Does length match archetype preference?
2. **Format Match** - Does format match archetype preference?
3. **Cognitive Load Match** - Is complexity appropriate?
4. **Attention Span Match** - Does duration match attention span?
5. **Barrier Addressment** - Does it address archetype barriers?
6. **Goal Alignment** - Does it support archetype goals?

## Best Practices

1. **Test before creating** - Run patterns through the HCI test before finalizing content
2. **Target by mindset** - Use mindset-specific templates for better compatibility
3. **Explicit barrier/goal matching** - Include specific barrier and goal keywords in patterns
4. **Segment content** - Don't try to serve all archetypes with one pattern
5. **Iterate based on scores** - Use low scores to identify improvement opportunities

## Test Results Summary

Recent test results show:
- **Adult AI Academy Default (30s video)**: 69.6% average - Best for "Maybe" mindset
- **Step-by-Step Tutorial**: 63.1% average - Essential for Late Adopters
- **Interactive Workshop**: 61.5% average - Best for Optimists
- **Simple Visual Guide**: Best for Unaware (85% for Late Adopter)

Key insight: Barrier addressment and goal alignment dramatically impact scores when explicitly included.

