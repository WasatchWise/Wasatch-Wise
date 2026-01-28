/**
 * HCI Metrics Collection and Analysis Utilities
 *
 * Measures cognitive load, task efficiency, and usability
 * signals during test execution.
 */

import { Page } from '@playwright/test';
import { CognitiveProfile } from '../fixtures/test-data';

// ============================================
// TIMING METRICS
// ============================================

export interface TimingMetrics {
  timeToFirstInteraction: number;   // ms until first meaningful click
  timeToTaskCompletion: number;     // ms total task time
  timeToFirstError: number | null;  // ms until first error (null if none)
  idleTime: number;                 // ms user paused (confusion indicator)
  streamingLatency: number | null;  // ms until first stream token (for AI)
}

export async function measureTiming(
  page: Page,
  taskFn: () => Promise<void>
): Promise<TimingMetrics> {
  const startTime = Date.now();
  let firstInteractionTime: number | null = null;
  let firstErrorTime: number | null = null;
  let lastActivityTime = startTime;
  let totalIdleTime = 0;
  let streamingLatency: number | null = null;

  // Track first interaction
  const interactionHandler = () => {
    if (!firstInteractionTime) {
      firstInteractionTime = Date.now() - startTime;
    }
    // Track idle time (gaps > 2 seconds)
    const now = Date.now();
    if (now - lastActivityTime > 2000) {
      totalIdleTime += now - lastActivityTime - 2000;
    }
    lastActivityTime = now;
  };

  // Track first error
  const errorHandler = () => {
    if (!firstErrorTime) {
      firstErrorTime = Date.now() - startTime;
    }
  };

  // Track streaming latency
  const streamHandler = () => {
    if (!streamingLatency) {
      streamingLatency = Date.now() - startTime;
    }
  };

  await page.exposeFunction('__hciInteraction', interactionHandler);
  await page.exposeFunction('__hciError', errorHandler);
  await page.exposeFunction('__hciStreamStart', streamHandler);

  // Inject tracking
  await page.addInitScript(() => {
    document.addEventListener('click', () => (window as any).__hciInteraction?.());
    document.addEventListener('keydown', () => (window as any).__hciInteraction?.());

    // Watch for error elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('error') ||
                node.getAttribute('role') === 'alert') {
              (window as any).__hciError?.();
            }
            if (node.hasAttribute('data-streaming')) {
              (window as any).__hciStreamStart?.();
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  await taskFn();

  const endTime = Date.now();

  return {
    timeToFirstInteraction: firstInteractionTime ?? 0,
    timeToTaskCompletion: endTime - startTime,
    timeToFirstError: firstErrorTime,
    idleTime: totalIdleTime,
    streamingLatency
  };
}

// ============================================
// INTERACTION METRICS
// ============================================

export interface InteractionMetrics {
  totalClicks: number;
  totalKeystrokes: number;
  formFieldsCompleted: number;
  navigationEvents: number;     // Page changes
  scrollDepth: number;          // 0-100%
  hoverEvents: number;          // Confusion indicator
  backtrackEvents: number;      // Clicked back/undo
}

export async function measureInteractions(
  page: Page,
  taskFn: () => Promise<void>
): Promise<InteractionMetrics> {
  let clicks = 0;
  let keystrokes = 0;
  let navigationEvents = 0;
  let hoverEvents = 0;
  let backtrackEvents = 0;
  let maxScrollDepth = 0;

  await page.evaluate(() => {
    (window as any).__hciMetrics = {
      clicks: 0,
      keystrokes: 0,
      hovers: 0,
      backtracks: 0,
      scrollDepth: 0
    };

    document.addEventListener('click', (e) => {
      (window as any).__hciMetrics.clicks++;
      // Track backtracking
      if ((e.target as HTMLElement).closest('[data-back], [aria-label*="back"]')) {
        (window as any).__hciMetrics.backtracks++;
      }
    });

    document.addEventListener('keydown', () => {
      (window as any).__hciMetrics.keystrokes++;
    });

    document.addEventListener('mouseover', () => {
      (window as any).__hciMetrics.hovers++;
    });

    document.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const depth = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
      if (depth > (window as any).__hciMetrics.scrollDepth) {
        (window as any).__hciMetrics.scrollDepth = depth;
      }
    });
  });

  page.on('framenavigated', () => navigationEvents++);

  await taskFn();

  const metrics = await page.evaluate(() => (window as any).__hciMetrics);
  const formFields = await page.locator('input:not([type="hidden"]), textarea, select')
    .filter({ has: page.locator(':scope:not(:placeholder-shown)') })
    .count();

  return {
    totalClicks: metrics.clicks,
    totalKeystrokes: metrics.keystrokes,
    formFieldsCompleted: formFields,
    navigationEvents,
    scrollDepth: metrics.scrollDepth,
    hoverEvents: metrics.hovers,
    backtrackEvents: metrics.backtracks
  };
}

// ============================================
// COGNITIVE LOAD INDICATORS
// ============================================

export interface CognitiveLoadMetrics {
  visibleElements: number;        // Elements in viewport
  interactiveElements: number;    // Clickable elements visible
  textDensity: number;            // Words per screen
  colorVariety: number;           // Distinct colors used
  hierarchyDepth: number;         // Nesting levels
  estimatedLoadScore: number;     // 1-10 composite score
}

export async function measureCognitiveLoad(page: Page): Promise<CognitiveLoadMetrics> {
  return await page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Count visible elements
    const allElements = document.querySelectorAll('*');
    let visibleCount = 0;
    let interactiveCount = 0;

    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewport.height && rect.bottom > 0 &&
          rect.left < viewport.width && rect.right > 0) {
        visibleCount++;
        if (el.matches('button, a, input, select, textarea, [role="button"], [tabindex]')) {
          interactiveCount++;
        }
      }
    });

    // Text density
    const bodyText = document.body.innerText || '';
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    const textDensity = wordCount;

    // Color variety (simplified)
    const colors = new Set<string>();
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      colors.add(style.backgroundColor);
      colors.add(style.color);
    });

    // Hierarchy depth
    let maxDepth = 0;
    function getDepth(el: Element, depth: number) {
      if (depth > maxDepth) maxDepth = depth;
      for (const child of el.children) {
        getDepth(child, depth + 1);
      }
    }
    getDepth(document.body, 0);

    // Composite load score (heuristic)
    const loadScore = Math.min(10, Math.round(
      (visibleCount / 50) * 2 +
      (interactiveCount / 20) * 2 +
      (textDensity / 200) * 2 +
      (colors.size / 10) * 2 +
      (maxDepth / 10) * 2
    ));

    return {
      visibleElements: visibleCount,
      interactiveElements: interactiveCount,
      textDensity,
      colorVariety: colors.size,
      hierarchyDepth: maxDepth,
      estimatedLoadScore: loadScore
    };
  });
}

// ============================================
// ARCHETYPE-SPECIFIC THRESHOLDS
// ============================================

export interface ArchetypeThresholds {
  maxTaskTime: number;        // ms
  maxClicks: number;
  maxErrors: number;
  maxCognitiveLoad: number;   // 1-10
  maxIdleTime: number;        // ms (confusion threshold)
  requiredStreamingLatency: number | null;  // ms for AI responses
}

export function getThresholdsForProfile(profile: CognitiveProfile): ArchetypeThresholds {
  const baseTime = 60000; // 1 minute base
  const baseClicks = 10;

  return {
    maxTaskTime: baseTime * (11 - profile.loadCapacity),
    maxClicks: Math.round(baseClicks * (11 - profile.loadCapacity) / 5),
    maxErrors: profile.frictionTolerance === 'none' ? 0 :
               profile.frictionTolerance === 'minimal' ? 1 :
               profile.frictionTolerance === 'moderate' ? 2 : 5,
    maxCognitiveLoad: profile.loadCapacity,
    maxIdleTime: profile.frictionTolerance === 'none' ? 3000 : 10000,
    requiredStreamingLatency: profile.outputMode === 'streaming-text' ? 500 : null
  };
}

// ============================================
// CONFUSION DETECTION
// ============================================

export interface ConfusionSignals {
  excessiveHovering: boolean;    // > 50 hovers without click
  rageclickDetected: boolean;    // > 3 clicks on same element in 1s
  backtracking: boolean;         // Multiple back navigations
  longIdlePeriods: boolean;      // > 5s idle multiple times
  scrollThrashing: boolean;      // Rapid up/down scrolling
  confusionScore: number;        // 0-100 composite
}

export async function detectConfusion(
  page: Page,
  interactions: InteractionMetrics,
  timing: TimingMetrics
): Promise<ConfusionSignals> {
  const excessiveHovering = interactions.hoverEvents > 50 &&
                            interactions.totalClicks < 10;

  const backtracking = interactions.backtrackEvents > 2;

  const longIdlePeriods = timing.idleTime > 15000;

  // Check for scroll thrashing
  const scrollThrashing = await page.evaluate(() => {
    // Would need scroll direction tracking in real impl
    return false;
  });

  // Rage click detection would need click timing data
  const rageclickDetected = false;

  // Composite score
  const confusionScore =
    (excessiveHovering ? 25 : 0) +
    (rageclickDetected ? 30 : 0) +
    (backtracking ? 20 : 0) +
    (longIdlePeriods ? 15 : 0) +
    (scrollThrashing ? 10 : 0);

  return {
    excessiveHovering,
    rageclickDetected,
    backtracking,
    longIdlePeriods,
    scrollThrashing,
    confusionScore
  };
}

// ============================================
// REPORT GENERATION
// ============================================

export interface HCITestReport {
  archetype: string;
  scenario: string;
  passed: boolean;
  timing: TimingMetrics;
  interactions: InteractionMetrics;
  cognitiveLoad: CognitiveLoadMetrics;
  confusion: ConfusionSignals;
  thresholdViolations: string[];
  recommendations: string[];
}

export function generateReport(
  archetype: string,
  scenario: string,
  timing: TimingMetrics,
  interactions: InteractionMetrics,
  cognitiveLoad: CognitiveLoadMetrics,
  confusion: ConfusionSignals,
  thresholds: ArchetypeThresholds
): HCITestReport {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Check threshold violations
  if (timing.timeToTaskCompletion > thresholds.maxTaskTime) {
    violations.push(`Task time ${timing.timeToTaskCompletion}ms exceeds max ${thresholds.maxTaskTime}ms`);
    recommendations.push('Reduce steps or simplify workflow');
  }

  if (interactions.totalClicks > thresholds.maxClicks) {
    violations.push(`Click count ${interactions.totalClicks} exceeds max ${thresholds.maxClicks}`);
    recommendations.push('Add shortcuts or reduce navigation depth');
  }

  if (cognitiveLoad.estimatedLoadScore > thresholds.maxCognitiveLoad) {
    violations.push(`Cognitive load ${cognitiveLoad.estimatedLoadScore} exceeds max ${thresholds.maxCognitiveLoad}`);
    recommendations.push('Simplify visual design or progressive disclosure');
  }

  if (confusion.confusionScore > 30) {
    violations.push(`Confusion score ${confusion.confusionScore} indicates usability issues`);
    recommendations.push('Review navigation patterns and add wayfinding cues');
  }

  if (thresholds.requiredStreamingLatency &&
      timing.streamingLatency &&
      timing.streamingLatency > thresholds.requiredStreamingLatency) {
    violations.push(`Streaming latency ${timing.streamingLatency}ms exceeds max ${thresholds.requiredStreamingLatency}ms`);
    recommendations.push('Optimize AI response pipeline');
  }

  return {
    archetype,
    scenario,
    passed: violations.length === 0,
    timing,
    interactions,
    cognitiveLoad,
    confusion,
    thresholdViolations: violations,
    recommendations
  };
}
