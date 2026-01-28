'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    const delays = [1000, 2000, 3000, 4000, 5000]; // Increasing delays

    async function pollForAccess() {
      if (!sessionId || cancelled) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/purchases/by-session?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.access_code) {
            if (!cancelled) {
              setAccessCode(data.access_code);
              setAccessUrl(`${window.location.origin}/tk/${data.access_code}`);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Non-fatal; continue polling
      }

      attempts++;
      if (attempts < maxAttempts && !cancelled) {
        // Use delay from array, or last delay for remaining attempts
        const delay = delays[Math.min(attempts - 1, delays.length - 1)];
        setTimeout(pollForAccess, delay);
      } else if (!cancelled) {
        // Max attempts reached - stop loading, user can use email
        setLoading(false);
      }
    }

    // Start polling after initial 1 second delay
    const initialTimer = setTimeout(pollForAccess, 1000);

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
    };
  }, [sessionId]);

  const handleAddToCalendar = () => {
    const title = 'Your TripKit is ready';
    const description = accessUrl ? `Access your TripKit: ${accessUrl}` : 'Access your TripKit from your email or account.';
    // Create an all-day event for today
    const start = new Date();
    const y = start.getUTCFullYear();
    const m = String(start.getUTCMonth() + 1).padStart(2, '0');
    const d = String(start.getUTCDate()).padStart(2, '0');
    const dt = `${y}${m}${d}`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SLCTrips//PostPurchase//EN',
      'BEGIN:VEVENT',
      `DTSTAMP:${dt}T000000Z`,
      `DTSTART;VALUE=DATE:${dt}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      accessUrl ? `URL:${accessUrl}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tripkit.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    if (!accessUrl) return;
    try {
      await navigator.clipboard.writeText(accessUrl);
      // no toast system here; simple fallback UX
      alert('Access link copied to clipboard.');
    } catch {
      alert('Could not copy link. Please long-press or right-click to copy.');
    }
  };

  const handleResend = async () => {
    if (!sessionId) return;
    setResendStatus('sending');
    setResendError(null);
    try {
      const res = await fetch('/api/purchases/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setResendStatus('error');
        setResendError(data?.error || 'Unable to resend email. Please try again later.');
        return;
      }
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
      setResendError('Network error. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-6"></div>
              <h1 className="text-3xl font-bold mb-4 text-white">Processing your purchase...</h1>
              <p className="text-gray-400">Please wait while we confirm your payment.</p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  🎉 Purchase Successful!
                </h1>
                <p className="text-xl text-gray-300 mb-2">
                  Thank you for your purchase! Your TripKit is ready to explore.
                </p>
                {accessCode && (
                  <p className="text-sm text-gray-400">
                    Access Code: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{accessCode}</span>
                  </p>
                )}
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-white">What&apos;s Next?</h2>
                <div className="text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <h3 className="font-semibold text-white">Your Purchase is Confirmed</h3>
                      <p className="text-gray-400">
                        Payment processed successfully. Your TripKit purchase has been recorded.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <h3 className="font-semibold text-white">Access Your TripKit</h3>
                      <p className="text-gray-400">
                        {accessUrl ? (
                          <>Use your access link below to jump right in, and keep your access code handy for future reference.</>
                        ) : (
                          <>We’re finalizing your access now. You’ll receive an email confirmation shortly. You can also find your purchases in your account.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <h3 className="font-semibold text-white">Need Help or Found an Issue?</h3>
                      <p className="text-gray-400 mb-3">
                        Questions about your purchase? Something not working? We're here to help!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href="mailto:Dan@slctrips.com?subject=Purchase%20Support&body=Order%20ID:%20${sessionId || 'N/A'}%0A%0AIssue%20or%20Question:"
                          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-center"
                        >
                          📧 Email Support
                        </a>
                        <Link
                          href="/legal/contact"
                          className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-center"
                        >
                          📋 Support Center
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tripkits"
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Browse More TripKits
                </Link>
                <Link
                  href="/destinations"
                  className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 px-8 py-4 rounded-lg font-semibold hover:border-blue-500 transition-all"
                >
                  Explore Destinations
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  onClick={handleAddToCalendar}
                  className="inline-block bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Add to Calendar
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                  className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-60"
                >
                  {resendStatus === 'sent' ? 'Email Resent' : resendStatus === 'sending' ? 'Resending…' : 'Resend Email'}
                </button>
                <button
                  onClick={handleCopyLink}
                  disabled={!accessUrl}
                  className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 px-8 py-4 rounded-lg font-semibold hover:border-blue-500 transition-all disabled:opacity-60"
                >
                  {accessUrl ? 'Copy Access Link' : 'Access Link Pending'}
                </button>
              </div>
              {resendStatus === 'error' && resendError && (
                <p className="text-sm text-red-400 mt-2">{resendError}</p>
              )}
              {accessUrl && (
                <p className="text-sm text-gray-400 mt-4 break-all">
                  Access Link: <a className="text-blue-400 hover:text-blue-300 underline" href={accessUrl}>{accessUrl}</a>
                </p>
              )}

              {sessionId && (
                <p className="text-xs text-gray-500 mt-8">
                  Order ID: {sessionId.slice(0, 20)}...
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-6"></div>
            <h1 className="text-3xl font-bold mb-4 text-white">Loading...</h1>
          </div>
        </main>
        <Footer />
      </>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
