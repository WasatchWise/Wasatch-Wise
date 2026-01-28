'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { showSuccess } from '@/lib/toast';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  const [isLoading, setIsLoading] = useState(true);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [tripkitName, setTripkitName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    // Fetch access code from database using session ID
    const fetchAccessCode = async () => {
      try {
        // Query the tripkit_access_codes table for this session
        const { data, error: queryError } = await supabase
          .from('tripkit_access_codes')
          .select('access_code, customer_email, tripkit_id, tripkits(name)')
          .eq('stripe_session_id', sessionId)
          .single();

        if (queryError || !data) {
          console.error('Error fetching access code:', queryError);
          setError('Unable to retrieve your access code. Please check your email or contact support.');
          setIsLoading(false);
          return;
        }

        setAccessCode(data.access_code);
        setCustomerEmail(data.customer_email);
        setTripkitName((data as any).tripkits?.name || 'Your TripKit');
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred. Please check your email for your access code.');
        setIsLoading(false);
      }
    };

    fetchAccessCode();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Retrieving your access code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-2 text-gray-900">What to do:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Check your email for your access code (it may take a few minutes)</li>
            <li>Contact us at support@slctrips.com with your order details</li>
            <li>Visit your <Link href="/account" className="text-blue-600 underline">account page</Link> to view your purchases</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/tripkits"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Browse More TripKits
          </Link>
        </div>
      </div>
    );
  }

  if (!accessCode) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Processing Your Purchase
        </h1>
        <p className="text-gray-600 mb-6">
          Your access code will be ready in a moment. Please refresh this page or check your email.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Page
        </button>
      </div>
    );
  }

  const accessUrl = `${window.location.origin}/tk/${accessCode}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-extrabold mb-2 text-white">
          Purchase Complete!
        </h1>
        <p className="text-xl opacity-90">
          Welcome to the {tripkitName} adventure
        </p>
      </div>

      {/* Access Code Section */}
      <div className="p-8">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            🔑 Your Access Code
          </h2>
          <div className="bg-white rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-600 mb-2 tracking-wider">
                {accessCode}
              </div>
              <p className="text-sm text-gray-500">
                Save this code - you&apos;ll need it to access your TripKit
              </p>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(accessCode);
              showSuccess('Access code copied to clipboard!');
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
          >
            📋 Copy Access Code
          </button>

          {/* Direct Access Button */}
          <Link
            href={`/tk/${accessCode}`}
            className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
          >
            🚀 Access Your TripKit Now →
          </Link>
        </div>

        {/* Important Information */}
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-500">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-900">
              <span>💡</span> Important: Save Your Access Code
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Bookmark the access URL for instant access anytime</li>
              <li>Your code has also been sent to: <strong>{customerEmail}</strong></li>
              <li>Access works on any device - no account needed</li>
              <li>Works offline once you&apos;ve loaded it</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-900">
              <span>✅</span> What&apos;s Included in Your TripKit
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Curated destinations with Dan&apos;s personal insights</li>
              <li>Guardian voice introduction</li>
              <li>Interactive maps and GPS navigation</li>
              <li>Personal notes and progress tracking</li>
              <li>Printable PDF version</li>
              <li>Lifetime access (no expiration)</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-900">
              <span>🎙️</span> Pro Tips
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Click the play button to hear Dan&apos;s voice introduction</li>
              <li>Mark destinations as &quot;visited&quot; as you explore</li>
              <li>Add personal notes to remember your experiences</li>
              <li>Use the &quot;Wishlist&quot; feature to plan future trips</li>
              <li>Install as a PWA for offline access on the go</li>
            </ul>
          </div>

          {/* Access URL for Manual Copy */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3 text-gray-900">📎 Direct Access Link:</h3>
            <div className="bg-white rounded p-3 mb-3">
              <code className="text-sm text-gray-700 break-all">{accessUrl}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(accessUrl);
                showSuccess('Link copied to clipboard!');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/tk/${accessCode}`}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Start Exploring →
          </Link>
          <Link
            href="/tripkits"
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
          >
            Browse More TripKits
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions? Email us at <a href="mailto:support@slctrips.com" className="text-blue-600 underline">support@slctrips.com</a></p>
          <p className="mt-2">Session ID: <span className="font-mono text-xs">{sessionId}</span></p>
        </div>
      </div>
    </div>
  );
}
