/**
 * GA4 Custom Event Tracking
 *
 * Centralizes all analytics events for WasatchWise.
 * Usage: import { trackEvent } from '@/lib/utils/analytics';
 *        trackEvent.quizStarted();
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export const trackEvent = {
  // Quiz events
  quizStarted: () => sendEvent('quiz_started'),
  quizStepCompleted: (step: number) =>
    sendEvent('quiz_step_completed', { step }),
  quizCompleted: (score: number, tier: string) =>
    sendEvent('quiz_completed', { score, tier }),
  quizEmailCaptured: () => sendEvent('quiz_email_captured'),

  // Contact & booking events
  contactFormViewed: () => sendEvent('contact_form_viewed'),
  contactFormSubmitted: (service?: string) =>
    sendEvent('contact_form_submitted', { service }),
  bookingClicked: (source: string) =>
    sendEvent('booking_clicked', { source }),

  // Pricing events
  pricingViewed: () => sendEvent('pricing_viewed'),
  pricingTierClicked: (tier: string) =>
    sendEvent('pricing_tier_clicked', { tier }),

  // WiseBot events
  wisebotStarted: () => sendEvent('wisebot_started'),
  wisebotMessageSent: (messageCount: number) =>
    sendEvent('wisebot_message_sent', { message_count: messageCount }),

  // Blog events
  blogPostViewed: (slug: string) =>
    sendEvent('blog_post_viewed', { slug }),
  blogScrollDepth: (slug: string, depth: number) =>
    sendEvent('blog_scroll_depth', { slug, depth }),

  // CTA events
  ctaClicked: (ctaName: string, location: string) =>
    sendEvent('cta_clicked', { cta_name: ctaName, location }),

  // Email capture events
  emailCaptured: (source: string) =>
    sendEvent('email_captured', { source }),
  newsletterSignup: () => sendEvent('newsletter_signup'),

  // Product events
  starterKitViewed: () => sendEvent('starter_kit_viewed'),
  starterKitPurchased: () => sendEvent('starter_kit_purchased'),
  appReviewPurchased: (tier: string) =>
    sendEvent('app_review_purchased', { tier }),
};
