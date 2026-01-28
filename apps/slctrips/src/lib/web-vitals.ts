/**
 * Core Web Vitals Monitoring
 * 
 * Tracks and reports Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * 
 * Sends metrics to analytics for monitoring site performance.
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Thresholds for Core Web Vitals
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 }, // First Input Delay (ms)
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift (score)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: WebVitalMetric) {
  // Send to Vercel Analytics if available
  if (typeof window !== 'undefined') {
    const va = (window as { va?: (action: string, name: string, data: Record<string, unknown>) => void }).va;
    if (va) {
      va('track', metric.name, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to custom analytics endpoint if needed
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'web-vital',
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    });
  }
}

export function reportWebVital(metric: Omit<WebVitalMetric, 'rating'>) {
  const rating = getRating(metric.name, metric.value);
  const ratedMetric: WebVitalMetric = {
    ...metric,
    rating,
  };

  sendToAnalytics(ratedMetric);

  // Warn in console if metric is poor
  if (rating === 'poor') {
    console.warn(`⚠️ Poor ${metric.name} performance: ${metric.value}ms`);
  }
}

/**
 * Initialize Core Web Vitals tracking
 * Call this in your root layout or _app
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        
        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        reportWebVital({
          name: 'LCP',
          value: Math.round(value),
          id: lastEntry.name || 'unknown',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // PerformanceObserver not supported
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          const value = entry.processingStart
            ? entry.processingStart - entry.startTime
            : 0;
          reportWebVital({
            name: 'FID',
            value: Math.round(value),
            id: entry.name || 'unknown',
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // PerformanceObserver not supported
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value;
            reportWebVital({
              name: 'CLS',
              value: Math.round(clsValue * 1000) / 1000, // Round to 3 decimals
              id: entry.name || 'unknown',
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // PerformanceObserver not supported
    }

    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          reportWebVital({
            name: 'FCP',
            value: Math.round(entry.startTime),
            id: entry.name || 'unknown',
          });
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch {
      // PerformanceObserver not supported
    }
  }
}

