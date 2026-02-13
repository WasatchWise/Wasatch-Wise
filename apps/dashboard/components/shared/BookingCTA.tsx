'use client';

import { trackEvent } from '@/lib/utils/analytics';

interface BookingCTAProps {
  /** Where this CTA is placed (for analytics) */
  source: string;
  /** Override the default heading */
  heading?: string;
  /** Override the default description */
  description?: string;
  /** Override button text */
  buttonText?: string;
  /** Use compact layout */
  compact?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Reusable booking CTA component.
 *
 * Configure NEXT_PUBLIC_BOOKING_URL in your environment to point to
 * your Cal.com or Calendly link. Falls back to the /contact page.
 */
export function BookingCTA({
  source,
  heading = 'Book a Free AI Governance Consultation',
  description = "30 minutes. No pitch. We'll assess your district's AI readiness and give you 3 concrete next steps.",
  buttonText = 'Book Free Consultation',
  compact = false,
  className = '',
}: BookingCTAProps) {
  const bookingUrl =
    process.env.NEXT_PUBLIC_BOOKING_URL || '/contact';

  const handleClick = () => {
    trackEvent.bookingClicked(source);
  };

  if (compact) {
    return (
      <a
        href={bookingUrl}
        target={bookingUrl.startsWith('http') ? '_blank' : undefined}
        rel={bookingUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors ${className}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {buttonText}
      </a>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white text-center ${className}`}
    >
      <h3 className="text-2xl font-bold mb-3">{heading}</h3>
      <p className="text-orange-100 mb-6 max-w-lg mx-auto">{description}</p>
      <a
        href={bookingUrl}
        target={bookingUrl.startsWith('http') ? '_blank' : undefined}
        rel={bookingUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors text-lg"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {buttonText}
      </a>
      <p className="text-orange-200 text-sm mt-4">
        No sales pitch. Just a real conversation about your district.
      </p>
    </div>
  );
}
