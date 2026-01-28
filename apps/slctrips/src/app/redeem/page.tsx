'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { redeemAccessCode } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function RedeemCodePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to redeem a code');
      setLoading(false);
      return;
    }

    try {
      await redeemAccessCode(user.id, code);
      setSuccess(true);
      setTimeout(() => {
        router.push('/account/my-tripkits');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Code Redeemed!</h1>
              <p className="text-gray-600 mb-6">
                Your TripKit has been added to your collection. Redirecting you to My TripKits...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Access Code</h1>
              <p className="text-gray-600">Enter your code to unlock a TripKit</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Redeem Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-lg text-center tracking-wider"
                  placeholder="ENTER-CODE-HERE"
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Codes are not case-sensitive
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redeeming...' : 'Redeem Code'}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Where can I find access codes?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Promotional emails from SLCTrips</li>
                <li>• Special events and giveaways</li>
                <li>• Educational institution partnerships</li>
                <li>• Gift cards from friends</li>
              </ul>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <Link
                href="/account/my-tripkits"
                className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
              >
                ← Back to My TripKits
              </Link>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">Don't have a code?</p>
            <Link
              href="/tripkits"
              className="inline-block bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Browse TripKits to Purchase
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
