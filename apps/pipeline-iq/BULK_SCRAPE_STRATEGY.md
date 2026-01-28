# Bulk Scrape Strategy for Construction Wire

## Goal
Capture ALL historical projects from Construction Wire, then maintain with incremental daily updates.

## Current State
- **Daily scrape**: 100 projects (~20 minutes)
- **Deduplication**: Uses name + city + state (not ideal)
- **Tracking**: `cw_project_id` exists in schema but may not be used consistently

## Construction Wire Database Size Estimate
Based on typical construction databases:
- **Total projects**: Likely 10,000 - 50,000+ projects across all categories
- **Hotels only**: Probably 5,000 - 15,000 projects
- **Active projects**: ~1,000 - 3,000 at any given time
- **Historical projects**: Remain in database for years

## Strategy: Phased Bulk Scrape

### Phase 1: Initial Bulk Scrape (One-Time)
**Goal**: Capture all historical projects

#### Approach A: Full Sequential Scrape
- **Method**: Scrape all pages sequentially
- **Time estimate**: 
  - 1,000 projects = ~3.5 hours
  - 5,000 projects = ~17 hours
  - 10,000 projects = ~33 hours
- **Pros**: Simple, guaranteed complete
- **Cons**: Very slow, high risk of rate limiting

#### Approach B: Parallel Batch Scraping (Recommended)
- **Method**: Run multiple scrapers in parallel with different filters
- **Time estimate**: 
  - 5 parallel workers = ~3-4 hours for 5,000 projects
  - 10 parallel workers = ~2 hours for 5,000 projects
- **Pros**: Much faster, can resume if interrupted
- **Cons**: More complex, need to coordinate

#### Approach C: Smart Incremental (Best Balance)
- **Method**: 
  1. Scrape all pages without detail fetching (fast - ~2 min per 100)
  2. Identify which projects need detail pages
  3. Batch fetch details for high-priority projects first
  4. Gradually backfill details for all projects
- **Time estimate**:
  - List scrape: ~1 hour for 5,000 projects
  - Detail scrape: ~17 hours for 5,000 projects (can be spread over days)
- **Pros**: Fast initial capture, can prioritize, resume-friendly
- **Cons**: Two-phase process

### Phase 2: Incremental Daily Updates
**Goal**: Only capture new/updated projects

#### Strategy
1. **Track last scrape timestamp** in `scrape_logs`
2. **Use Construction Wire filters** (if available):
   - "Added in last 30 days"
   - "Updated in last 7 days"
3. **Deduplication by `cw_project_id`**:
   - If `cw_project_id` exists → Update
   - If `cw_project_id` doesn't exist → Insert
4. **Full re-scrape periodically**:
   - Weekly: Check all projects for updates
   - Monthly: Full database refresh

## Implementation Plan

### Step 1: Fix Deduplication
**Current**: Uses name + city + state (unreliable)
**Fix**: Use `cw_project_id` as primary deduplication key

```typescript
// Extract CW project ID from URL: /Client/Report/Details/3855831
const cwProjectId = href.match(/\/Details\/(\d+)/)?.[1]

// Check for existing project
const { data: existing } = await supabase
  .from('high_priority_projects')
  .select('id')
  .eq('cw_project_id', cwProjectId)
  .single()
```

### Step 2: Add Scrape Tracking
```sql
-- Add to scrape_logs
ALTER TABLE scrape_logs ADD COLUMN IF NOT EXISTS last_project_id TEXT;
ALTER TABLE scrape_logs ADD COLUMN IF NOT EXISTS pages_scraped INTEGER;
ALTER TABLE scrape_logs ADD COLUMN IF NOT EXISTS resume_from_page INTEGER;
```

### Step 3: Create Bulk Scrape Script
**New script**: `scripts/bulk-scrape-construction-wire.ts`

Features:
- Resume capability (track last page scraped)
- Progress reporting
- Error recovery
- Optional: Parallel workers
- Optional: Skip detail pages for speed

### Step 4: Optimize for Bulk Scrape
**Fast mode** (list only):
- Skip detail page visits
- Extract basic info from list
- ~2 minutes per 100 projects
- **5,000 projects = ~1.5 hours**

**Full mode** (with details):
- Visit all detail pages
- Extract comprehensive data
- ~20 minutes per 100 projects
- **5,000 projects = ~17 hours**

### Step 5: Incremental Update Logic
```typescript
// Check if project needs update
const needsUpdate = 
  !existing || 
  existing.updated_at < project.scraped_at ||
  existing.raw_data?.last_scraped < project.scraped_at

if (needsUpdate) {
  // Update project
}
```

## Recommended Approach

### Week 1: Fast Bulk Capture
1. **Run fast mode scrape** (no details):
   - Scrape all pages
   - Extract: name, location, basic info
   - Time: ~1-2 hours for full database
   - Result: Complete project list in database

2. **Score and prioritize**:
   - Calculate Groove Fit Scores
   - Identify hot leads (80+)
   - Mark projects needing detail pages

### Week 2-3: Detail Backfill
1. **Priority 1**: Hot leads (80+ score)
   - Fetch detail pages immediately
   - Time: ~3-4 hours for 500 hot leads

2. **Priority 2**: Warm leads (60-79 score)
   - Fetch details over next few days
   - Time: ~10 hours for 2,000 warm leads

3. **Priority 3**: Cold leads (<60 score)
   - Fetch details gradually
   - Can be done over weeks

### Ongoing: Daily Incremental
1. **Daily scrape**: 100-200 new projects
2. **Weekly check**: Re-scrape top 500 projects for updates
3. **Monthly refresh**: Full database re-scrape

## Efficiency Optimizations

### 1. Parallel Processing
- Run 3-5 scrapers in parallel
- Each handles different page ranges
- **Speedup**: 3-5x faster

### 2. Smart Caching
- Skip detail pages for projects scraped in last 30 days
- Only re-fetch if project updated

### 3. Batch Database Writes
- Collect 50-100 projects
- Insert in single transaction
- **Speedup**: 2-3x faster saves

### 4. Selective Detail Fetching
- Only fetch details for projects with score > 50
- Skip details for clearly irrelevant projects
- **Time savings**: 50-70%

## Risk Mitigation

### Rate Limiting
- Current: 2-5 second delays (safe)
- Bulk scrape: May need longer delays
- Monitor for blocks, adjust dynamically

### Account Limits
- Construction Wire may have daily limits
- Solution: Spread bulk scrape over multiple days
- Use multiple accounts if available

### Data Quality
- Some projects may be incomplete
- Solution: Flag incomplete projects
- Re-scrape flagged projects later

## Success Metrics

### Phase 1 (Bulk Scrape)
- ✅ All projects captured (list view)
- ✅ Hot leads fully detailed
- ✅ Database size matches Construction Wire

### Phase 2 (Incremental)
- ✅ Daily new projects captured
- ✅ Updates detected and applied
- ✅ No duplicates
- ✅ <30 minutes per daily scrape

## Next Steps

1. **Immediate**: Fix deduplication to use `cw_project_id`
2. **This week**: Create bulk scrape script with resume capability
3. **Next week**: Run fast bulk scrape (list only)
4. **Following weeks**: Backfill details by priority

