/**
 * HCI Test Definitions
 * Pre-defined test scenarios for measuring usability
 */

import { getHCITracker } from './metrics'

export interface HCITest {
  id: string
  name: string
  description: string
  category: 'email' | 'navigation' | 'search' | 'bulk_action' | 'call' | 'mobile'
  tasks: TestTask[]
  successCriteria: {
    maxDuration?: number // milliseconds
    maxSteps?: number
    maxErrors?: number
    minCompletionRate?: number // 0-1
  }
}

export interface TestTask {
  id: string
  name: string
  description: string
  action: () => Promise<void> | void
  expectedResult: string
}

export const HCI_TESTS: HCITest[] = [
  {
    id: 'test-001',
    name: 'Quick Email Generation',
    description: 'Generate and send a quick email from project detail page',
    category: 'email',
    tasks: [
      {
        id: 'task-001-1',
        name: 'Navigate to project',
        description: 'Open a project from the dashboard',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('navigate_to_project')
        },
        expectedResult: 'Project detail page loads',
      },
      {
        id: 'task-001-2',
        name: 'Generate email',
        description: 'Click Quick Email button',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('click_quick_email')
        },
        expectedResult: 'Gmail opens with pre-filled email',
      },
      {
        id: 'task-001-3',
        name: 'Mark as sent',
        description: 'Click "I Sent This Email" after sending',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mark_email_sent')
        },
        expectedResult: 'Email marked as sent, project status updated',
      },
    ],
    successCriteria: {
      maxDuration: 120000, // 2 minutes
      maxSteps: 5,
      maxErrors: 0,
      minCompletionRate: 0.9,
    },
  },
  {
    id: 'test-002',
    name: 'Bulk Email Generation',
    description: 'Select multiple projects and generate bulk emails',
    category: 'bulk_action',
    tasks: [
      {
        id: 'task-002-1',
        name: 'Select projects',
        description: 'Select 5 projects using checkboxes',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('select_projects', { count: 5 })
        },
        expectedResult: '5 projects selected',
      },
      {
        id: 'task-002-2',
        name: 'Generate bulk emails',
        description: 'Click Bulk Email button',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('click_bulk_email')
        },
        expectedResult: 'First email opens in Gmail',
      },
      {
        id: 'task-002-3',
        name: 'Process all emails',
        description: 'Send all emails using "Open Next Email"',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('process_bulk_emails')
        },
        expectedResult: 'All emails sent',
      },
    ],
    successCriteria: {
      maxDuration: 600000, // 10 minutes
      maxSteps: 15,
      maxErrors: 1,
      minCompletionRate: 0.8,
    },
  },
  {
    id: 'test-003',
    name: 'Activated Lead Follow-up',
    description: 'Respond to an activated lead (opened email)',
    category: 'call',
    tasks: [
      {
        id: 'task-003-1',
        name: 'View activated leads',
        description: 'Navigate to dashboard and find activated leads section',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('view_activated_leads')
        },
        expectedResult: 'Activated leads section visible',
      },
      {
        id: 'task-003-2',
        name: 'Make call',
        description: 'Click Call Now button',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('initiate_call')
        },
        expectedResult: 'Phone dialer opens',
      },
      {
        id: 'task-003-3',
        name: 'Record call',
        description: 'Fill out call form and save',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('record_call', { outcome: 'interested' })
        },
        expectedResult: 'Call recorded, project status updated',
      },
    ],
    successCriteria: {
      maxDuration: 180000, // 3 minutes
      maxSteps: 6,
      maxErrors: 0,
      minCompletionRate: 0.9,
    },
  },
  {
    id: 'test-004',
    name: 'Mobile Navigation',
    description: 'Navigate between pages on mobile device',
    category: 'mobile',
    tasks: [
      {
        id: 'task-004-1',
        name: 'Navigate to Contacts',
        description: 'Tap Contacts in navigation',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mobile_navigate', { page: 'contacts' })
        },
        expectedResult: 'Contacts page loads',
      },
      {
        id: 'task-004-2',
        name: 'Navigate to Campaigns',
        description: 'Tap Campaigns in navigation',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mobile_navigate', { page: 'campaigns' })
        },
        expectedResult: 'Campaigns page loads',
      },
      {
        id: 'task-004-3',
        name: 'Return to Dashboard',
        description: 'Tap Dashboard in navigation',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mobile_navigate', { page: 'dashboard' })
        },
        expectedResult: 'Dashboard loads',
      },
    ],
    successCriteria: {
      maxDuration: 30000, // 30 seconds
      maxSteps: 5,
      maxErrors: 0,
      minCompletionRate: 1.0,
    },
  },
  {
    id: 'test-005',
    name: 'Mobile Search',
    description: 'Search for projects on mobile device',
    category: 'search',
    tasks: [
      {
        id: 'task-005-1',
        name: 'Open search',
        description: 'Tap search bar',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('open_search')
        },
        expectedResult: 'Keyboard appears, search focused',
      },
      {
        id: 'task-005-2',
        name: 'Enter search query',
        description: 'Type project name',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('search_query', { query: 'hotel' })
        },
        expectedResult: 'Results appear as typing',
      },
      {
        id: 'task-005-3',
        name: 'Select result',
        description: 'Tap on a search result',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('select_search_result')
        },
        expectedResult: 'Project detail page opens',
      },
    ],
    successCriteria: {
      maxDuration: 60000, // 1 minute
      maxSteps: 5,
      maxErrors: 0,
      minCompletionRate: 0.9,
    },
  },
  {
    id: 'test-006',
    name: 'Mobile Bulk Status Update',
    description: 'Update status of multiple projects on mobile',
    category: 'mobile',
    tasks: [
      {
        id: 'task-006-1',
        name: 'Select projects',
        description: 'Select 3 projects using checkboxes',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mobile_select_projects', { count: 3 })
        },
        expectedResult: '3 projects selected',
      },
      {
        id: 'task-006-2',
        name: 'Update status',
        description: 'Tap status button (e.g., Mark as Contacted)',
        action: async () => {
          const tracker = getHCITracker()
          tracker.trackInteraction('mobile_bulk_update', { status: 'contacted' })
        },
        expectedResult: 'All selected projects status updated',
      },
    ],
    successCriteria: {
      maxDuration: 45000, // 45 seconds
      maxSteps: 4,
      maxErrors: 0,
      minCompletionRate: 0.95,
    },
  },
]

export async function runHCI_Test(testId: string): Promise<{
  success: boolean
  duration: number
  steps: number
  errors: number
  metrics: any[]
}> {
  const test = HCI_TESTS.find((t) => t.id === testId)
  if (!test) {
    throw new Error(`Test ${testId} not found`)
  }

  const tracker = getHCITracker()
  const taskId = `test_${testId}_${Date.now()}`
  
  tracker.startTask(taskId, test.name)

  const startTime = Date.now()
  let steps = 0
  let errors = 0

  try {
    for (const task of test.tasks) {
      steps++
      try {
        await task.action()
        tracker.updateTask(taskId, { steps })
      } catch (error) {
        errors++
        tracker.trackError(`task_${task.id}_failed`, { error: String(error) })
        tracker.updateTask(taskId, { errors })
      }
    }

    const duration = Date.now() - startTime
    const completed = tracker.completeTask(taskId, errors === 0)

    // Check success criteria
    const criteria = test.successCriteria
    const success =
      (!criteria.maxDuration || duration <= criteria.maxDuration) &&
      (!criteria.maxSteps || steps <= criteria.maxSteps) &&
      (!criteria.maxErrors || errors <= criteria.maxErrors) &&
      (!criteria.minCompletionRate || (errors / steps) <= 1 - criteria.minCompletionRate)

    return {
      success,
      duration,
      steps,
      errors,
      metrics: tracker.getMetrics(),
    }
  } catch (error) {
    tracker.completeTask(taskId, false)
    throw error
  }
}

export function getAllTests(): HCITest[] {
  return HCI_TESTS
}

export function getTestsByCategory(category: HCITest['category']): HCITest[] {
  return HCI_TESTS.filter((test) => test.category === category)
}

