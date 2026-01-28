# Analytics Feedback Loop

## Overview

The analytics feedback loop connects HCI template usage to engagement metrics, enabling data-driven template selection and continuous improvement of content performance.

## Architecture

```
Content Generation → Template Used → Video Published → Analytics Collected
                                                           ↓
Template Selection ← Performance Data ← Template Stats ← Ingest Analytics
```

## Components

### 1. Template Performance Tracking

**Location:** `src/lib/research/learning-lab.ts`

**Key Functions:**
- `ingestAnalytics()` - Enhanced to track template performance
- `calculatePerformanceScore()` - Weighted scoring algorithm
- `storeTemplatePerformance()` - Stores performance data (in-memory, ready for DB)
- `getTemplatePerformanceStats()` - Retrieves aggregated statistics

**Performance Metrics Tracked:**
- Overall Score (weighted composite)
- Retention Rate (30% weight)
- Hook Rate (25% weight)
- Retention Curve AUC (20% weight)
- Re-watch Rate (15% weight)
- Share Count (5% weight)
- Comment Sentiment (5% weight)

### 2. Template Recommendation

**Location:** `src/lib/hci/pattern-templates.ts`

**Key Functions:**
- `selectTemplate()` - Now async, supports `usePerformanceData` option
- `getRecommendedTemplate()` - Returns best-performing template for mindset

**Flow:**
1. Auto-detect or override mindset
2. Query performance stats for that mindset
3. Return top-performing template (if data exists)
4. Fallback to default template selection

### 3. Integration Points

#### Synthesis Pipeline
- `tailorContentLive()` calls `selectTemplate()` with optional performance data
- Template ID and mindset stored in `ResearchResult`
- Passed through to production batch

#### Production Pipeline
- `runUnifiedProduction()` saves template metadata with batch
- Template ID and mindset stored in Supabase `production_batches` table

#### Analytics Ingestion
- `ingestAnalytics()` accepts `templateId`, `templateName`, and `mindset`
- Calculates performance score and stores template performance data
- Links video analytics to template used

## Database Schema Updates

Added to `production_batches` table:
```sql
template_id TEXT,
detected_mindset TEXT CHECK (detected_mindset IN ('Optimist', 'Maybe', 'Unaware'))
```

**Future Enhancement:** Create `template_performance` table for persistent storage:
```sql
CREATE TABLE template_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id TEXT NOT NULL,
    template_name TEXT NOT NULL,
    mindset TEXT NOT NULL,
    video_id TEXT NOT NULL,
    view_count INTEGER,
    retention_rate FLOAT,
    hook_rate FLOAT,
    re_watch_rate FLOAT,
    retention_curve_auc FLOAT,
    share_count INTEGER,
    comment_sentiment FLOAT,
    overall_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage

### Manual Template Selection (Current)
```typescript
const result = await tailorContentLive(rawText, '30s', {
    mindsetOverride: 'Maybe',
    templateId: 'maybe-security-focused'
});
```

### Performance-Driven Selection (Future)
```typescript
const result = await tailorContentLive(rawText, '30s', {
    mindsetOverride: 'Maybe',
    usePerformanceData: true  // Uses analytics to select best template
});
```

### Ingest Analytics with Template Tracking
```typescript
await ingestAnalytics(videoAnalytics, leadEmail, {
    templateId: 'maybe-security-focused',
    templateName: 'Maybe: Security & Compliance Focus',
    mindset: 'Maybe'
});
```

### Query Template Performance
```typescript
const stats = await getTemplatePerformanceStats(
    'maybe-security-focused',  // Optional: specific template
    'Maybe',                    // Optional: specific mindset
    30                         // Days back
);

// Returns:
// [
//   {
//     templateId: 'maybe-security-focused',
//     templateName: 'Maybe: Security & Compliance Focus',
//     mindset: 'Maybe',
//     avgScore: 0.82,
//     sampleSize: 15,
//     avgRetention: 0.75,
//     avgHookRate: 0.68,
//     avgReWatchRate: 0.42
//   }
// ]
```

## Performance Scoring Algorithm

The overall performance score is calculated using weighted metrics:

```typescript
score = (
    retentionRate * 0.30 +
    hookRate * 0.25 +
    retentionCurveAUC * 0.20 +
    reWatchRate * 0.15 +
    normalizedShares * 0.05 +
    normalizedSentiment * 0.05
)
```

**Rationale:**
- **Retention Rate (30%)** - Most important: did viewers watch?
- **Hook Rate (25%)** - Critical for B2B: early engagement
- **AUC (20%)** - Quality metric: attention holding
- **Re-watch (15%)** - High-intent signal: value indicator
- **Shares (5%)** - Virality: lower weight for B2B
- **Sentiment (5%)** - Engagement quality: positive feedback

## Data Flow Example

1. **Content Generation:**
   ```
   User inputs: "Lawyers need security..."
   → Auto-detects: "Maybe" mindset
   → Selects: "maybe-security-focused" template
   → Generates content with template guidance
   ```

2. **Production:**
   ```
   → Saves batch with template_id: "maybe-security-focused"
   → Saves detected_mindset: "Maybe"
   → Publishes video
   ```

3. **Analytics Collection:**
   ```
   Video ID: "xyz123"
   → Collects: views, retention, hook rate, etc.
   → Links to template: "maybe-security-focused"
   ```

4. **Performance Tracking:**
   ```
   → Calculates overall score: 0.82
   → Stores template performance data
   → Updates template statistics
   ```

5. **Future Recommendations:**
   ```
   Next similar content request
   → Queries performance stats for "Maybe" mindset
   → Finds "maybe-security-focused" has best score
   → Recommends that template
   ```

## Benefits

1. **Data-Driven Decisions** - Templates selected based on actual performance
2. **Continuous Improvement** - System learns which templates work best
3. **A/B Testing Support** - Can compare template performance
4. **Mindset Optimization** - Tailors templates to specific adoption mindsets
5. **Performance Visibility** - Clear metrics on what's working

## Future Enhancements

1. **Persistent Storage** - Move from in-memory to Supabase table
2. **Machine Learning** - Use ML to predict template performance
3. **Multi-variate Testing** - Test multiple templates simultaneously
4. **Segment Analysis** - Performance by audience segment, not just mindset
5. **Time-based Trends** - Track performance changes over time
6. **Automatic Optimization** - Auto-switch to better-performing templates

## Integration Checklist

- [x] Enhanced `ingestAnalytics()` with template tracking
- [x] Created `getTemplatePerformanceStats()` function
- [x] Created `getRecommendedTemplate()` function
- [x] Made `selectTemplate()` async with performance data support
- [x] Updated synthesis pipeline to use async template selection
- [x] Updated production batch saving to include template metadata
- [x] Updated database schema (SQL migration ready)
- [ ] Create `template_performance` table in Supabase (future)
- [ ] Connect to real analytics API (when available)
- [ ] Build UI dashboard for template performance (future)

