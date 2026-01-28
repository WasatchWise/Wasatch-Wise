# HCI Testing Guide for GrooveLeads

## Overview

This document describes the Human-Computer Interaction (HCI) testing framework built for GrooveLeads. The system tracks user interactions, performance metrics, and task completion to measure usability and identify areas for improvement.

---

## 📱 Mobile PWA Setup

### Installation on iPhone

1. **Open Safari** (Chrome doesn't support PWA installation on iOS)
2. **Navigate to** your GrooveLeads URL
3. **Tap Share button** (square with arrow)
4. **Select "Add to Home Screen"**
5. **Customize name** (defaults to "GrooveLeads")
6. **Tap "Add"**

The app will now appear on your home screen and launch in standalone mode (no browser UI).

### Features

- ✅ **Offline Support** - Service worker caches pages for offline access
- ✅ **App-like Experience** - Full-screen, no browser chrome
- ✅ **Fast Loading** - Cached resources load instantly
- ✅ **Home Screen Icon** - Custom icon on iPhone home screen
- ✅ **Splash Screen** - Custom splash screen on launch

---

## 🧪 HCI Test Framework

### Available Tests

#### 1. **Quick Email Generation** (`test-001`)
- **Category:** Email
- **Duration:** Max 2 minutes
- **Tasks:**
  - Navigate to project
  - Generate email
  - Mark as sent
- **Success Criteria:**
  - Max duration: 120 seconds
  - Max steps: 5
  - Max errors: 0
  - Min completion rate: 90%

#### 2. **Bulk Email Generation** (`test-002`)
- **Category:** Bulk Action
- **Duration:** Max 10 minutes
- **Tasks:**
  - Select 5 projects
  - Generate bulk emails
  - Process all emails
- **Success Criteria:**
  - Max duration: 600 seconds
  - Max steps: 15
  - Max errors: 1
  - Min completion rate: 80%

#### 3. **Activated Lead Follow-up** (`test-003`)
- **Category:** Call
- **Duration:** Max 3 minutes
- **Tasks:**
  - View activated leads
  - Make call
  - Record call
- **Success Criteria:**
  - Max duration: 180 seconds
  - Max steps: 6
  - Max errors: 0
  - Min completion rate: 90%

#### 4. **Mobile Navigation** (`test-004`)
- **Category:** Mobile
- **Duration:** Max 30 seconds
- **Tasks:**
  - Navigate to Contacts
  - Navigate to Campaigns
  - Return to Dashboard
- **Success Criteria:**
  - Max duration: 30 seconds
  - Max steps: 5
  - Max errors: 0
  - Min completion rate: 100%

#### 5. **Mobile Search** (`test-005`)
- **Category:** Search
- **Duration:** Max 1 minute
- **Tasks:**
  - Open search
  - Enter search query
  - Select result
- **Success Criteria:**
  - Max duration: 60 seconds
  - Max steps: 5
  - Max errors: 0
  - Min completion rate: 90%

#### 6. **Mobile Bulk Status Update** (`test-006`)
- **Category:** Mobile
- **Duration:** Max 45 seconds
- **Tasks:**
  - Select 3 projects
  - Update status
- **Success Criteria:**
  - Max duration: 45 seconds
  - Max steps: 4
  - Max errors: 0
  - Min completion rate: 95%

---

## 📊 Metrics Tracked

### Interaction Metrics
- Button clicks
- Navigation events
- Form interactions
- Search queries
- Touch gestures (mobile)

### Performance Metrics
- Page load times
- API response times
- Task completion duration
- Time to first interaction

### Error Metrics
- JavaScript errors
- Failed API calls
- User errors (validation, etc.)
- Unhandled promise rejections

### Task Metrics
- Task start/end times
- Number of steps
- Number of errors
- Completion rate
- Interaction count

### Device Information
- Device type (mobile/desktop/tablet)
- Operating system
- Browser
- Screen size

---

## 🎯 Running Tests

### Via UI

1. Navigate to `/hci-tests` page
2. Select a test category (or "All")
3. Click "Run Test" on any test
4. Complete the tasks as prompted
5. View results (duration, steps, errors, pass/fail)

### Programmatically

```typescript
import { runHCI_Test } from '@/lib/hci/tests'

const result = await runHCI_Test('test-001')
console.log(result)
// {
//   success: true,
//   duration: 45000,
//   steps: 3,
//   errors: 0,
//   metrics: [...]
// }
```

---

## 📈 Analyzing Results

### Key Metrics to Watch

1. **Task Completion Rate**
   - Percentage of users who complete tasks
   - Target: >90% for critical tasks

2. **Average Task Duration**
   - Time to complete each task
   - Compare against success criteria

3. **Error Rate**
   - Number of errors per task
   - Target: 0 for critical tasks

4. **Interaction Count**
   - Number of clicks/taps needed
   - Lower is better (indicates efficiency)

5. **Mobile vs Desktop**
   - Compare metrics across devices
   - Identify mobile-specific issues

### Example Analysis

```typescript
// Get all metrics
const tracker = getHCITracker()
const metrics = tracker.getMetrics()

// Filter by type
const interactions = metrics.filter(m => m.type === 'interaction')
const errors = metrics.filter(m => m.type === 'error')

// Filter by device
const mobileMetrics = metrics.filter(m => m.device?.type === 'mobile')
const desktopMetrics = metrics.filter(m => m.device?.type === 'desktop')

// Calculate averages
const avgTaskDuration = tasks.reduce((sum, t) => sum + t.duration, 0) / tasks.length
```

---

## 🔧 Customization

### Adding New Tests

```typescript
export const HCI_TESTS: HCITest[] = [
  // ... existing tests
  {
    id: 'test-007',
    name: 'Your Test Name',
    description: 'Test description',
    category: 'email',
    tasks: [
      {
        id: 'task-007-1',
        name: 'Task name',
        description: 'What user should do',
        action: async () => {
          // Track interaction
          getHCITracker().trackInteraction('your_action')
        },
        expectedResult: 'What should happen',
      },
    ],
    successCriteria: {
      maxDuration: 60000,
      maxSteps: 5,
      maxErrors: 0,
      minCompletionRate: 0.9,
    },
  },
]
```

### Tracking Custom Metrics

```typescript
import { getHCITracker } from '@/lib/hci/metrics'

const tracker = getHCITracker()

// Track interaction
tracker.trackInteraction('custom_action', { metadata: 'value' })

// Track performance
tracker.trackPerformance('api_call', 250, { endpoint: '/api/projects' })

// Track error
tracker.trackError('validation_failed', { field: 'email' })

// Start/complete task
tracker.startTask('task-id', 'Task Name')
tracker.completeTask('task-id', true)
```

---

## 📱 Mobile Optimizations

### Responsive Design

- **Header:** Collapsible navigation on mobile
- **Search:** Expands on focus
- **Tables:** Scrollable on mobile
- **Buttons:** Touch-friendly sizes (min 44x44px)
- **Spacing:** Reduced padding on mobile

### Touch Interactions

- Large tap targets
- Swipe gestures (future)
- Pull-to-refresh (future)
- Haptic feedback (iOS)

### Performance

- Optimized images
- Lazy loading
- Service worker caching
- Reduced animations on mobile

---

## 🚀 Next Steps

1. **Create Database Table** for storing metrics long-term
2. **Build Analytics Dashboard** for visualizing results
3. **Set Up Automated Testing** for regression testing
4. **Add More Tests** based on user feedback
5. **Implement A/B Testing** for UI variations

---

## 📝 Notes

- Metrics are sent to `/api/analytics/hci-metric` endpoint
- Currently logs to console in development
- Can be extended to store in Supabase
- All tracking is opt-in and privacy-conscious
- Session IDs are generated per browser session

