/**
 * Comprehensive Metrics & Event Tracking Utility
 *
 * Centralizes all analytics tracking for HCI features, conversions, and user behavior.
 * Works with Google Analytics (via trackEvent) and provides structured event logging.
 *
 * Usage:
 *   import { metrics } from '@/lib/metrics';
 *   metrics.educator.emailGateViewed({ slug: 'tk-001', displayMode: 'immediate' });
 *   metrics.filter.applied({ filterType: 'region', value: 'southern-utah', resultsCount: 42 });
 */

import { trackEvent } from '@/components/GoogleAnalytics';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BaseEventData {
  timestamp?: string;
  sessionId?: string;
  userId?: string;
}

interface EducatorEmailGateEvent extends BaseEventData {
  slug: string;
  displayMode: 'immediate' | 'delayed' | 'scroll-triggered' | 'exit-intent';
  scrollDepth?: number;
}

interface FilterEvent extends BaseEventData {
  filterType: 'region' | 'category' | 'difficulty' | 'season' | 'guardian';
  value: string;
  resultsCount: number;
  previousFilters?: string[];
}

interface GuardianInteractionEvent extends BaseEventData {
  guardianSlug: string;
  guardianName: string;
  interactionType: 'badge-hover' | 'badge-click' | 'profile-view' | 'fact-expand';
  personality?: string;
}

interface KeyboardShortcutEvent extends BaseEventData {
  shortcut: string;
  action: string;
  context: 'global' | 'search' | 'navigation' | 'filter' | 'modal';
}

interface AchievementEvent extends BaseEventData {
  achievementId: string;
  achievementName: string;
  achievementType: 'exploration' | 'engagement' | 'completion' | 'social';
  isFirstTime: boolean;
}

interface ConversionEvent extends BaseEventData {
  conversionType: 'email-capture' | 'tripkit-purchase' | 'newsletter-signup';
  value?: number;
  productId?: string;
  source?: string;
}

interface PerformanceEvent extends BaseEventData {
  metricType: 'page-load' | 'time-to-interactive' | 'first-contentful-paint' | 'largest-contentful-paint';
  value: number;
  url: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

let sessionId: string | null = null;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-render';

  if (!sessionId) {
    const stored = sessionStorage.getItem('slctrips_session_id');
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('slctrips_session_id', sessionId);
    }
  }

  return sessionId;
}

function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // Check for authenticated user in localStorage
  const user = localStorage.getItem('slctrips_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || userData.email;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

// ============================================================================
// BASE TRACKING FUNCTION
// ============================================================================

function track(eventName: string, data: Record<string, any>) {
  const enrichedData = {
    ...data,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    userId: getUserId(),
  };

  // Send to Google Analytics
  trackEvent(eventName, enrichedData);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metrics] ${eventName}`, enrichedData);
  }

  // Store in local metrics log (for potential offline sync)
  if (typeof window !== 'undefined') {
    try {
      const log = JSON.parse(localStorage.getItem('slctrips_metrics_log') || '[]');
      log.push({ event: eventName, data: enrichedData });

      // Keep only last 100 events to avoid storage bloat
      if (log.length > 100) {
        log.shift();
      }

      localStorage.setItem('slctrips_metrics_log', JSON.stringify(log));
    } catch (error) {
      // Storage full or disabled - silent fail
    }
  }
}

// ============================================================================
// EDUCATOR EMAIL GATE TRACKING
// ============================================================================

export const educatorMetrics = {
  emailGateViewed: (data: EducatorEmailGateEvent) => {
    track('educator_email_gate_viewed', data);
  },

  emailGateDismissed: (data: EducatorEmailGateEvent & { dismissMethod: 'close' | 'escape' | 'backdrop' }) => {
    track('educator_email_gate_dismissed', data);
  },

  emailSubmitted: (data: EducatorEmailGateEvent & { email: string; schoolDistrict?: string }) => {
    track('educator_email_submitted', {
      ...data,
      email: undefined, // Don't track PII
      emailDomain: data.email.split('@')[1],
    });
  },

  emailSubmitSuccess: (data: EducatorEmailGateEvent) => {
    track('educator_email_submit_success', data);
  },

  emailSubmitError: (data: EducatorEmailGateEvent & { error: string }) => {
    track('educator_email_submit_error', data);
  },

  contentUnlocked: (data: EducatorEmailGateEvent & { contentType: 'tk000' | 'tripkit' | 'resources' }) => {
    track('educator_content_unlocked', data);
  },
};

// ============================================================================
// FILTER SYSTEM TRACKING
// ============================================================================

export const filterMetrics = {
  filterApplied: (data: FilterEvent) => {
    track('filter_applied', data);
  },

  filterCleared: (data: Omit<FilterEvent, 'value' | 'resultsCount'> & { clearedFilters: string[] }) => {
    track('filter_cleared', data);
  },

  filterSuggestionShown: (data: BaseEventData & { suggestion: string; context: string }) => {
    track('filter_suggestion_shown', data);
  },

  filterSuggestionAccepted: (data: BaseEventData & { suggestion: string; resultsCount: number }) => {
    track('filter_suggestion_accepted', data);
  },

  noResultsShown: (data: BaseEventData & { activeFilters: string[]; searchQuery?: string }) => {
    track('filter_no_results', data);
  },
};

// ============================================================================
// GUARDIAN INTERACTION TRACKING
// ============================================================================

export const guardianMetrics = {
  badgeHovered: (data: GuardianInteractionEvent) => {
    track('guardian_badge_hovered', data);
  },

  badgeClicked: (data: GuardianInteractionEvent) => {
    track('guardian_badge_clicked', data);
  },

  profileViewed: (data: GuardianInteractionEvent & { fromSource: 'badge' | 'directory' | 'destination' }) => {
    track('guardian_profile_viewed', data);
  },

  factExpanded: (data: GuardianInteractionEvent & { factTitle: string }) => {
    track('guardian_fact_expanded', data);
  },

  microInteractionTriggered: (data: GuardianInteractionEvent & { animationType: string }) => {
    track('guardian_micro_interaction', data);
  },
};

// ============================================================================
// KEYBOARD NAVIGATION TRACKING
// ============================================================================

export const keyboardMetrics = {
  shortcutUsed: (data: KeyboardShortcutEvent) => {
    track('keyboard_shortcut_used', data);
  },

  shortcutHelpOpened: (data: BaseEventData & { trigger: 'keyboard' | 'button' }) => {
    track('keyboard_shortcut_help_opened', data);
  },

  focusTrapped: (data: BaseEventData & { component: string; action: 'enter' | 'exit' }) => {
    track('keyboard_focus_trapped', data);
  },
};

// ============================================================================
// ACHIEVEMENT SYSTEM TRACKING
// ============================================================================

export const achievementMetrics = {
  achieved: (data: AchievementEvent) => {
    track('achievement_earned', data);
  },

  progressUpdated: (data: AchievementEvent & { progress: number; total: number }) => {
    track('achievement_progress', data);
  },

  achievementViewed: (data: AchievementEvent) => {
    track('achievement_viewed', data);
  },

  achievementShared: (data: AchievementEvent & { platform: 'twitter' | 'facebook' | 'linkedin' }) => {
    track('achievement_shared', data);
  },
};

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

export const conversionMetrics = {
  emailCaptured: (data: ConversionEvent & { context: string }) => {
    track('conversion_email_captured', data);
  },

  tripkitPurchased: (data: ConversionEvent & { productId: string; value: number }) => {
    track('conversion_tripkit_purchased', data);
  },

  newsletterSignup: (data: ConversionEvent) => {
    track('conversion_newsletter_signup', data);
  },

  checkoutStarted: (data: ConversionEvent & { productId: string; value: number }) => {
    track('conversion_checkout_started', data);
  },

  checkoutCompleted: (data: ConversionEvent & { productId: string; value: number; paymentMethod: string }) => {
    track('conversion_checkout_completed', data);
  },
};

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export const performanceMetrics = {
  pageLoad: (data: PerformanceEvent) => {
    track('performance_page_load', data);
  },

  timeToInteractive: (data: PerformanceEvent) => {
    track('performance_tti', data);
  },

  largestContentfulPaint: (data: PerformanceEvent) => {
    track('performance_lcp', data);
  },

  cumulativeLayoutShift: (data: PerformanceEvent) => {
    track('performance_cls', data);
  },
};

// ============================================================================
// UI INTERACTION TRACKING
// ============================================================================

export const uiMetrics = {
  skeletonShown: (data: BaseEventData & { component: string; duration?: number }) => {
    track('ui_skeleton_shown', data);
  },

  optimisticUpdateApplied: (data: BaseEventData & { action: string; success: boolean; rollback?: boolean }) => {
    track('ui_optimistic_update', data);
  },

  modalOpened: (data: BaseEventData & { modalType: string; trigger: string }) => {
    track('ui_modal_opened', data);
  },

  modalClosed: (data: BaseEventData & { modalType: string; method: 'button' | 'escape' | 'backdrop' }) => {
    track('ui_modal_closed', data);
  },

  tooltipShown: (data: BaseEventData & { tooltipId: string; context: string }) => {
    track('ui_tooltip_shown', data);
  },
};

// ============================================================================
// FUNNEL TRACKING
// ============================================================================

export const funnelMetrics = {
  step: (data: BaseEventData & { funnel: string; step: number; stepName: string }) => {
    track('funnel_step', data);
  },

  complete: (data: BaseEventData & { funnel: string; duration: number; steps: number }) => {
    track('funnel_complete', data);
  },

  abandon: (data: BaseEventData & { funnel: string; lastStep: number; reason?: string }) => {
    track('funnel_abandon', data);
  },
};

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const metrics = {
  educator: educatorMetrics,
  filter: filterMetrics,
  guardian: guardianMetrics,
  keyboard: keyboardMetrics,
  achievement: achievementMetrics,
  conversion: conversionMetrics,
  performance: performanceMetrics,
  ui: uiMetrics,
  funnel: funnelMetrics,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getMetricsLog(): Array<{ event: string; data: Record<string, any> }> {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem('slctrips_metrics_log') || '[]');
  } catch {
    return [];
  }
}

export function clearMetricsLog(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('slctrips_metrics_log');
  } catch {
    // Silent fail
  }
}

export function exportMetricsLog(): string {
  return JSON.stringify(getMetricsLog(), null, 2);
}
