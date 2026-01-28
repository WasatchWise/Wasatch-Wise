# HCI Scripts Documentation

## ✅ Readiness Check Results

**Status: READY** ✅

All HCI components are in place and ready to use.

---

## 📁 HCI Files Location

### Core Files
- `/lib/hci/metrics.ts` - Metrics tracking system
- `/lib/hci/tests.ts` - Test definitions (6 tests)
- `/app/(dashboard)/hci-tests/page.tsx` - UI dashboard
- `/app/api/analytics/hci-metric/route.ts` - Metrics API endpoint

### Scripts
- `/scripts/run-hci-tests.ts` - Run HCI tests from command line
- `/scripts/analyze-hci-metrics.ts` - Analyze collected metrics
- `/scripts/readiness-check.ts` - System readiness verification

---

## 🚀 Available HCI Scripts

### 1. **Readiness Check** ✅

Verifies all components are ready for production.

```bash
npx tsx scripts/readiness-check.ts
```

**Checks:**
- ✅ Database connection
- ✅ Environment variables
- ✅ HCI files presence
- ✅ HCI tests availability
- ✅ PWA files
- ✅ iOS optimization files
- ✅ Scripts availability

**Output:**
- Pass/Fail/Warning for each check
- Summary with counts
- Exit code (0 = ready, 1 = not ready)

---

### 2. **Run HCI Tests**

Run HCI tests programmatically from command line.

```bash
# Run all tests
npx tsx scripts/run-hci-tests.ts all

# Run specific test
npx tsx scripts/run-hci-tests.ts test-001

# Run tests by category
npx tsx scripts/run-hci-tests.ts category:mobile
```

**Available Tests:**
- `test-001` - Quick Email Generation
- `test-002` - Bulk Email Generation
- `test-003` - Activated Lead Follow-up
- `test-004` - Mobile Navigation
- `test-005` - Mobile Search
- `test-006` - Mobile Bulk Status Update

**Output:**
- Test execution results
- Duration, steps, errors for each test
- Pass/Fail status
- Summary statistics

**Example Output:**
```
🧪 Running: Quick Email Generation
   Description: Generate and send a quick email from project detail page
   Category: email
   Tasks: 3
   ✅ Duration: 45.2s
   ✅ Steps: 3
   ✅ Errors: 0
   ✅ PASSED
```

---

### 3. **Analyze HCI Metrics**

Analyze collected metrics from the database.

```bash
npx tsx scripts/analyze-hci-metrics.ts
```

**Analysis Includes:**
- Total metrics count
- Metrics by type (interaction, error, performance, etc.)
- Metrics by device (mobile, desktop, tablet)
- Metrics by category
- Error rate
- Top 10 actions
- Device breakdown
- Time range

**Note:** Requires `hci_metrics` table in database. If not present, script will show SQL to create it.

---

## 📊 HCI Tests Available

### Test Categories

1. **Email** (1 test)
   - Quick Email Generation

2. **Bulk Action** (1 test)
   - Bulk Email Generation

3. **Call** (1 test)
   - Activated Lead Follow-up

4. **Mobile** (2 tests)
   - Mobile Navigation
   - Mobile Bulk Status Update

5. **Search** (1 test)
   - Mobile Search

**Total: 6 tests across 5 categories**

---

## 🎯 Using HCI Tests

### Via UI Dashboard

1. Navigate to `/hci-tests` page
2. Select category filter (or "All")
3. Click "Run Test" on any test
4. Complete the tasks as prompted
5. View results (duration, steps, errors, pass/fail)

### Via Command Line

```bash
# Run all tests
npx tsx scripts/run-hci-tests.ts all

# Run specific test
npx tsx scripts/run-hci-tests.ts test-001

# Run mobile tests only
npx tsx scripts/run-hci-tests.ts category:mobile
```

### Programmatically

```typescript
import { runHCI_Test, getAllTests } from '@/lib/hci/tests'

// Get all tests
const tests = getAllTests()

// Run a test
const result = await runHCI_Test('test-001')
console.log(result)
// {
//   success: true,
//   duration: 45200,
//   steps: 3,
//   errors: 0,
//   metrics: [...]
// }
```

---

## 📈 Metrics Collection

### Automatic Tracking

Metrics are automatically tracked when:
- User interacts with UI (clicks, navigation, etc.)
- Errors occur (JS errors, API failures)
- Performance events (page loads, API calls)
- Tasks are started/completed

### Manual Tracking

```typescript
import { getHCITracker } from '@/lib/hci/metrics'

const tracker = getHCITracker()

// Track interaction
tracker.trackInteraction('button_click', { button: 'send_email' })

// Track error
tracker.trackError('api_failed', { endpoint: '/api/projects' })

// Track performance
tracker.trackPerformance('page_load', 250)

// Start/complete task
tracker.startTask('task-id', 'Task Name')
tracker.completeTask('task-id', true)
```

---

## 🗄️ Database Storage (Optional)

To store metrics in database, create the table:

```sql
CREATE TABLE hci_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  user_id TEXT,
  metric_type TEXT,
  category TEXT,
  action TEXT,
  metadata JSONB,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hci_metrics_session ON hci_metrics(session_id);
CREATE INDEX idx_hci_metrics_type ON hci_metrics(metric_type);
CREATE INDEX idx_hci_metrics_created ON hci_metrics(created_at);
```

Then metrics will be stored automatically via `/api/analytics/hci-metric` endpoint.

---

## ✅ Readiness Status

**All Systems Ready:**
- ✅ Database connection working
- ✅ All required environment variables set
- ✅ All HCI files present
- ✅ 6 HCI tests available
- ✅ PWA files present
- ✅ iOS optimization files present
- ✅ All scripts available

**System Status: READY FOR PRODUCTION** 🚀

---

## 📝 Quick Reference

```bash
# Check system readiness
npx tsx scripts/readiness-check.ts

# Run all HCI tests
npx tsx scripts/run-hci-tests.ts all

# Run specific test
npx tsx scripts/run-hci-tests.ts test-001

# Analyze metrics
npx tsx scripts/analyze-hci-metrics.ts

# View tests in UI
# Navigate to: /hci-tests
```

---

## 🎯 Next Steps

1. ✅ **System is ready** - All components in place
2. Run tests via UI or command line
3. Monitor metrics as Mike uses the app
4. Analyze results to identify improvements
5. Iterate based on findings

