'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { metrics } from '@/lib/metrics';

interface ProgressiveEmailGateProps {
  slug: string;
  title: string;
  code: string;
  contentType: 'tk000' | 'tripkit' | 'resources';

  // Progressive Disclosure Options
  displayMode?: 'immediate' | 'delayed' | 'scroll-triggered' | 'exit-intent';
  delaySeconds?: number; // For delayed mode (default: 3)
  scrollDepthPercent?: number; // For scroll-triggered (default: 50)

  // Customization
  headline?: string;
  subheadline?: string;
  benefits?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  socialProof?: {
    count: number;
    label: string;
  };

  // Callbacks
  onSuccess?: (email: string, accessCode: string) => void;
  onDismiss?: () => void;
}

export default function ProgressiveEmailGate({
  slug,
  title,
  code,
  contentType,
  displayMode = 'delayed',
  delaySeconds = 3,
  scrollDepthPercent = 50,
  headline = 'Free Lifetime Access • No Account Needed',
  subheadline = 'Perfect for teachers, families, and explorers. Get permanent access to this comprehensive TripKit and watch it grow over time.',
  benefits = [
    { icon: '🎯', title: 'Forever Free', description: 'No expiration, no renewal' },
    { icon: '📚', title: 'Living Document', description: 'Grows with new content' },
    { icon: '🔒', title: 'Privacy First', description: 'We respect your data' },
    { icon: '👥', title: 'Multi-Audience', description: 'For teachers, families, explorers' },
  ],
  socialProof,
  onSuccess,
  onDismiss,
}: ProgressiveEmailGateProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(displayMode === 'immediate');
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [schoolDistrict, setSchoolDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrollDepth, setScrollDepth] = useState(0);
  const hasTrackedView = useRef(false);
  const hasShownModal = useRef(false);

  const trackView = useCallback(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      metrics.educator.emailGateViewed({
        slug,
        displayMode,
        scrollDepth,
      });
    }
  }, [slug, displayMode, scrollDepth]);

  // Progressive Disclosure Logic
  useEffect(() => {
    if (displayMode === 'immediate') {
      setIsOpen(true);
      trackView();
      return;
    }

    if (displayMode === 'delayed') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsOpen(true);
        trackView();
      }, delaySeconds * 1000);

      return () => clearTimeout(timer);
    }

    if (displayMode === 'scroll-triggered') {
      const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

        setScrollDepth(scrollPercentage);

        if (scrollPercentage >= scrollDepthPercent && !hasShownModal.current) {
          hasShownModal.current = true;
          setIsVisible(true);
          setIsOpen(true);
          trackView();
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (displayMode === 'exit-intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !hasShownModal.current) {
          hasShownModal.current = true;
          setIsVisible(true);
          setIsOpen(true);
          trackView();
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [displayMode, delaySeconds, scrollDepthPercent, trackView]);

  const handleDismiss = (method: 'close' | 'escape' | 'backdrop') => {
    metrics.educator.emailGateDismissed({
      slug,
      displayMode,
      scrollDepth,
      dismissMethod: method,
    });

    setIsOpen(false);
    onDismiss?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    metrics.educator.emailSubmitted({
      slug,
      displayMode,
      email,
      schoolDistrict,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/tripkits/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          schoolDistrict: schoolDistrict.trim() || undefined,
          tripkitSlug: slug,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        metrics.educator.emailSubmitError({
          slug,
          displayMode,
          error: data.error || 'Unknown error',
        });

        setError(data.error || 'Failed to request access');
        setIsLoading(false);
        return;
      }

      // Success tracking
      metrics.educator.emailSubmitSuccess({
        slug,
        displayMode,
      });

      metrics.educator.contentUnlocked({
        slug,
        displayMode,
        contentType,
      });

      metrics.conversion.emailCaptured({
        conversionType: 'email-capture',
        context: `${contentType}_email_gate`,
        source: displayMode,
      });

      // Store access code in localStorage
      localStorage.setItem(`tripkit_access_${slug}`, data.accessCode);
      localStorage.setItem(`tripkit_access_id_${slug}`, data.accessCodeId);
      localStorage.setItem(`tripkit_email_${slug}`, email.trim());

      onSuccess?.(email.trim(), data.accessCode);

      // Force full page reload
      window.location.replace(`/tripkits/${slug}/view?access=${data.accessCode}`);
    } catch (err) {
      console.error('Error requesting access:', err);
      const errorMessage =
        err instanceof Error && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'Network error. Please try again.';

      metrics.educator.emailSubmitError({
        slug,
        displayMode,
        error: errorMessage,
      });

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss('escape');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isVisible || !isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={() => handleDismiss('backdrop')}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slideUpFadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-gate-title"
        >
          {/* Close Button */}
          <button
            onClick={() => handleDismiss('close')}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-mono opacity-90">{code}</div>
                <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  $50 VALUE • FREE
                </div>
              </div>
              <h1 id="email-gate-title" className="text-3xl md:text-4xl font-bold mb-3 text-white">
                {title}
              </h1>
              <p className="text-lg opacity-95">{subheadline}</p>

              {/* Social Proof */}
              {socialProof && (
                <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-white/20 border-2 border-white"
                      />
                    ))}
                  </div>
                  <span>
                    {socialProof.count.toLocaleString()} {socialProof.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{headline}</h2>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl">{benefit.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-800">{benefit.title}</div>
                      <div className="text-sm text-gray-600">{benefit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="educator@school.edu"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* For Educators */}
              <div>
                <label
                  htmlFor="schoolDistrict"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  School/District (Optional)
                </label>
                <input
                  type="text"
                  id="schoolDistrict"
                  value={schoolDistrict}
                  onChange={(e) => setSchoolDistrict(e.target.value)}
                  placeholder="e.g., Granite School District"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Getting your access...
                  </span>
                ) : (
                  <>🚀 Get Lifetime Access</>
                )}
              </button>
            </form>

            {/* Privacy Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-gray-700">
                  <strong className="text-blue-900">Privacy-First Promise:</strong> Your email only
                  provides access to this TripKit. No account creation, no password, no tracking
                  cookies.
                  <a href="/privacy" className="text-blue-600 hover:underline ml-1">
                    Learn more
                  </a>
                </div>
              </div>
            </div>

            {/* Teacher Note */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                <strong>Teachers:</strong> Share your access link with students •{' '}
                <strong>Families:</strong> Use for field trip planning •{' '}
                <strong>Explorers:</strong> Challenge yourself to visit all 29 counties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUpFadeIn {
          animation: slideUpFadeIn 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}
