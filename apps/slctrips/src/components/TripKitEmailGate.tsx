'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TripKitEmailGateProps {
  tripkitSlug: string;
  tripkitName: string;
  tripkitCode: string;
}

export default function TripKitEmailGate({
  tripkitSlug,
  tripkitName,
  tripkitCode
}: TripKitEmailGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Add 30 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/tripkits/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          tripkitSlug
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to request access');
        setIsLoading(false);
        return;
      }

      // Store access code in localStorage
      localStorage.setItem(`tripkit_access_${tripkitSlug}`, data.accessCode);
      localStorage.setItem(`tripkit_access_id_${tripkitSlug}`, data.accessCodeId);
      localStorage.setItem(`tripkit_email_${tripkitSlug}`, email.trim());

      // Force full page reload to ensure SSR validation runs
      // Using replace() instead of href to force complete navigation
      window.location.replace(`/tripkits/${tripkitSlug}/view?access=${data.accessCode}`);

    } catch (err) {
      console.error('Error requesting access:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. The server may be experiencing issues. Please try again.');
      } else {
        setError('Network error. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-mono opacity-90">{tripkitCode}</div>
            <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
              $50 VALUE • FREE
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">{tripkitName}</h1>
          <p className="text-lg opacity-95">
            Meet Utah's 29 county guardians • Perfect for teachers, families, and explorers
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Free Lifetime Access • No Account Needed
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Perfect for teachers, families, and explorers. Get permanent access to this
              comprehensive TripKit and watch it grow over time. Just email—no password, no login, no hassle.
              We'll send your access link to your email so you can bookmark it!
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800">Forever Free</div>
                  <div className="text-sm text-gray-600">No expiration, no renewal</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800">Living Document</div>
                  <div className="text-sm text-gray-600">Grows with new content</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800">Privacy First</div>
                  <div className="text-sm text-gray-600">We respect your data</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800">Multi-Audience</div>
                  <div className="text-sm text-gray-600">For teachers, families, and explorers</div>
                </div>
              </div>
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Getting your access...
                </span>
              ) : (
                '🚀 Get Lifetime Access'
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-700">
                <strong className="text-blue-900">Privacy-First Promise:</strong> Your email only provides access to this TripKit.
                No account creation, no password, no tracking cookies. We never sell or share your information.
                <a href="/privacy" className="text-blue-600 hover:underline ml-1">Learn more</a>
              </div>
            </div>
          </div>

          {/* Optional Account Creation Benefit */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-700">
                <strong className="text-amber-900">💡 Optional: Create an Account</strong>
                <p className="mt-1.5 text-gray-600">
                  If you create a free account later using the same email, this TripKit (and any future purchases) will be saved
                  in your TripKit library. That way, you can access everything in one place—no need to search through emails
                  if you misplace your access link!
                </p>
                <p className="mt-2">
                  <a href="/auth/signup" className="text-amber-700 hover:text-amber-900 font-medium underline">
                    Create account →
                  </a>
                  {' '}
                  <span className="text-gray-500">or continue without one. Your choice!</span>
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Audience Note */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              <strong>Teachers:</strong> Share your access link freely with students (no separate emails needed) •
              <strong> Families:</strong> Use for homeschool or field trip planning •
              <strong> Explorers:</strong> Challenge yourself to visit all 29 counties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
