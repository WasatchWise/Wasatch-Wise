/**
 * HCI Metrics Tracking System
 * Tracks user interactions, performance, and usability metrics
 */

export interface HCIMetric {
  id: string
  timestamp: number
  type: 'interaction' | 'performance' | 'error' | 'navigation' | 'task_completion'
  category: string
  action: string
  metadata?: Record<string, any>
  device?: {
    type: 'mobile' | 'desktop' | 'tablet'
    os?: string
    browser?: string
    screenSize?: { width: number; height: number }
  }
  sessionId: string
  userId?: string
}

export interface TaskMetrics {
  taskId: string
  taskName: string
  startTime: number
  endTime?: number
  duration?: number
  steps: number
  completed: boolean
  errors: number
  interactions: number
}

export class HCITracker {
  private sessionId: string
  private metrics: HCIMetric[] = []
  private taskMetrics: Map<string, TaskMetrics> = new Map()
  private isEnabled: boolean = true

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      this.track('interaction', 'page_visibility', {
        hidden: document.hidden,
      })
    })

    // Track errors
    window.addEventListener('error', (event) => {
      this.track('error', 'javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('error', 'unhandled_rejection', {
        reason: event.reason?.toString(),
      })
    })
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') return undefined

    const ua = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
    const isTablet = /iPad|Android/i.test(ua) && !isMobile

    return {
      type: (isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop') as 'mobile' | 'desktop' | 'tablet',
      os: this.detectOS(ua),
      browser: this.detectBrowser(ua),
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
      },
    }
  }

  private detectOS(ua: string): string {
    if (/iPhone/i.test(ua)) return 'iOS'
    if (/iPad/i.test(ua)) return 'iOS'
    if (/Android/i.test(ua)) return 'Android'
    if (/Mac/i.test(ua)) return 'macOS'
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Linux/i.test(ua)) return 'Linux'
    return 'Unknown'
  }

  private detectBrowser(ua: string): string {
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'
    if (/Chrome/i.test(ua)) return 'Chrome'
    if (/Firefox/i.test(ua)) return 'Firefox'
    if (/Edge/i.test(ua)) return 'Edge'
    return 'Unknown'
  }

  track(
    type: HCIMetric['type'],
    action: string,
    metadata?: Record<string, any>,
    category: string = 'general'
  ) {
    if (!this.isEnabled) return

    const metric: HCIMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      type,
      category,
      action,
      metadata,
      device: this.getDeviceInfo(),
      sessionId: this.sessionId,
    }

    this.metrics.push(metric)

    // Send to analytics endpoint (if configured)
    this.sendMetric(metric)
  }

  private async sendMetric(metric: HCIMetric) {
    try {
      // Send to your analytics endpoint
      await fetch('/api/analytics/hci-metric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      // Silently fail - metrics are non-critical
      console.debug('Failed to send metric:', error)
    }
  }

  startTask(taskId: string, taskName: string) {
    this.taskMetrics.set(taskId, {
      taskId,
      taskName,
      startTime: Date.now(),
      steps: 0,
      completed: false,
      errors: 0,
      interactions: 0,
    })

    this.track('task_completion', 'task_started', { taskId, taskName }, 'task')
  }

  updateTask(taskId: string, updates: Partial<TaskMetrics>) {
    const task = this.taskMetrics.get(taskId)
    if (!task) return

    const updated = { ...task, ...updates }
    this.taskMetrics.set(taskId, updated)
  }

  completeTask(taskId: string, success: boolean = true) {
    const task = this.taskMetrics.get(taskId)
    if (!task) return

    const duration = Date.now() - task.startTime
    const completed = {
      ...task,
      endTime: Date.now(),
      duration,
      completed: success,
    }

    this.taskMetrics.set(taskId, completed)

    this.track(
      'task_completion',
      success ? 'task_completed' : 'task_failed',
      {
        taskId: task.taskId,
        taskName: task.taskName,
        duration,
        steps: task.steps,
        errors: task.errors,
        interactions: task.interactions,
      },
      'task'
    )

    return completed
  }

  trackInteraction(action: string, metadata?: Record<string, any>) {
    const task = Array.from(this.taskMetrics.values()).find((t) => !t.completed)
    if (task) {
      this.updateTask(task.taskId, {
        interactions: task.interactions + 1,
      })
    }

    this.track('interaction', action, metadata)
  }

  trackError(error: string, metadata?: Record<string, any>) {
    const task = Array.from(this.taskMetrics.values()).find((t) => !t.completed)
    if (task) {
      this.updateTask(task.taskId, {
        errors: task.errors + 1,
      })
    }

    this.track('error', error, metadata)
  }

  trackPerformance(metric: string, value: number, metadata?: Record<string, any>) {
    this.track('performance', metric, { value, ...metadata }, 'performance')
  }

  getMetrics() {
    return this.metrics
  }

  getTaskMetrics() {
    return Array.from(this.taskMetrics.values())
  }

  clearMetrics() {
    this.metrics = []
    this.taskMetrics.clear()
  }

  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }
}

// Singleton instance
let trackerInstance: HCITracker | null = null

export function getHCITracker(): HCITracker {
  if (typeof window === 'undefined') {
    // Server-side: return a no-op tracker
    return {
      track: () => {},
      startTask: () => {},
      updateTask: () => {},
      completeTask: () => ({ taskId: '', taskName: '', startTime: 0, steps: 0, completed: false, errors: 0, interactions: 0 }),
      trackInteraction: () => {},
      trackError: () => {},
      trackPerformance: () => {},
      getMetrics: () => [],
      getTaskMetrics: () => [],
      clearMetrics: () => {},
      enable: () => {},
      disable: () => {},
    } as unknown as HCITracker
  }

  if (!trackerInstance) {
    trackerInstance = new HCITracker()
  }
  return trackerInstance
}

