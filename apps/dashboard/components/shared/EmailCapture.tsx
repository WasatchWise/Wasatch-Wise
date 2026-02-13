'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/utils/analytics';

interface EmailCaptureProps {
  /** Where this component is placed (for analytics) */
  source: string;
  /** Override heading */
  heading?: string;
  /** Override description */
  description?: string;
  /** Override button text */
  buttonText?: string;
  /** What the user gets (shown below input) */
  incentive?: string;
  /** Use inline layout (single row) */
  inline?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Reusable email capture component for newsletter signups and lead magnets.
 *
 * Stores captured emails in Supabase email_captures table
 * and triggers the N8N lead router webhook.
 */
export function EmailCapture({
  source,
  heading = 'Get Weekly AI Governance Insights',
  description = 'Join school leaders getting practical AI guidance every week. No spam, unsubscribe anytime.',
  buttonText = 'Subscribe',
  incentive,
  inline = false,
  className = '',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setSuccess(true);
        trackEvent.emailCaptured(source);
        trackEvent.newsletterSignup();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <p className="text-green-800 font-semibold text-lg mb-1">
          You're in!
        </p>
        <p className="text-green-700">
          Check your inbox for a welcome email with your first resource.
        </p>
      </div>
    );
  }

  if (inline) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          required
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '...' : buttonText}
        </button>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </form>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-8 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{heading}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          required
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Subscribing...' : buttonText}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {incentive && (
        <p className="text-gray-500 text-sm mt-3">
          {incentive}
        </p>
      )}
      <p className="text-gray-400 text-xs mt-2">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
