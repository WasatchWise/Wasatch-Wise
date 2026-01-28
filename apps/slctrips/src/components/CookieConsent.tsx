'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(prev => ({ ...prev, ...saved }));
      } catch (e) {
        logger.error('Error loading cookie preferences', { error: e });
      }
    }

    // Listen for external requests to open preferences (e.g., from footer link)
    const handleOpenPreferences = () => {
      if (typeof window === 'undefined') return;

      // Load current preferences before showing
      const storedConsent = localStorage.getItem('cookieConsent');
      if (storedConsent) {
        try {
          const saved = JSON.parse(storedConsent);
          setPreferences(prev => ({ ...prev, ...saved }));
        } catch (e) {
          logger.error('Error loading cookie preferences', { error: e });
        }
      }
      setShowDetails(true); // Show detailed view
      setShowBanner(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferences);

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences);
    };
  }, []);

  const acceptAll = () => {
    const newPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(newPreferences);
  };

  const acceptEssential = () => {
    const newPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(newPreferences);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);

    // Dispatch custom event so GoogleAnalytics component can react
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated'));
    }

    // Update Google Consent Mode if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
        'ad_storage': prefs.marketing ? 'granted' : 'denied',
        'ad_user_data': prefs.marketing ? 'granted' : 'denied',
        'ad_personalization': prefs.marketing ? 'granted' : 'denied'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-blue-500">
          <div className="p-6">
            {!showDetails ? (
              // Simple view
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.
                    By clicking "Accept All", you consent to our use of cookies. See our{' '}
                    <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-700 underline">
                      Privacy Policy
                    </Link>{' '}
                    for more information.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={acceptEssential}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Detailed preferences view
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Close details"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Essential Cookies */}
                  <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Essential Cookies
                        </h4>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          Always Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Required for the website to function. These cannot be disabled.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Analytics Cookies
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Marketing Cookies
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Used to track visitors across websites for marketing purposes.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/legal/privacy"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                  <div className="flex gap-3">
                    <button
                      onClick={acceptEssential}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={saveCustomPreferences}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
