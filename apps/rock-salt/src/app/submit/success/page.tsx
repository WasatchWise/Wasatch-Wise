'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [bandName, setBandName] = useState('');
  const [email, setEmail] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    // Get params from URL (passed from submission redirect)
    setBandName(searchParams.get('band') || '');
    setEmail(searchParams.get('email') || '');
    setSubmissionId(searchParams.get('id') || '');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-semibold text-zinc-100">
            The Rock Salt
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Status */}
        <div className="text-center mb-8">
          <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Intake status</div>
          <h1 className="text-4xl font-semibold mb-2">Submission received</h1>
          {bandName && (
            <p className="text-lg text-zinc-400">
              Submitted: <strong className="text-zinc-200">{bandName}</strong>
            </p>
          )}
        </div>

        {/* What Happens Next */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What happens next</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 border border-zinc-800 text-zinc-200 rounded-md font-semibold">
                1
              </span>
              <div>
                <strong className="block">Review</strong>
                <span className="text-zinc-400">
                  We review audio, bio, and links within <strong className="text-zinc-200">5–7 business days</strong>.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 border border-zinc-800 text-zinc-200 rounded-md font-semibold">
                2
              </span>
              <div>
                <strong className="block">Response</strong>
                <span className="text-zinc-400">
                  We email{' '}
                  <strong className="text-zinc-200">{email || 'your contact email'}</strong> with
                  status and next steps.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 border border-zinc-800 text-zinc-200 rounded-md font-semibold">
                3
              </span>
              <div>
                <strong className="block">Publish</strong>
                <span className="text-zinc-400">
                  If accepted, we publish your band profile and archive entry.
                </span>
              </div>
            </li>
          </ol>
        </div>

        {/* Submission Details */}
        {submissionId && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 mb-8 text-center">
            <p className="text-sm text-zinc-500 mb-1">Confirmation number</p>
            <p className="text-2xl font-mono font-semibold text-zinc-100">#{submissionId.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Keep this for reference.
            </p>
          </div>
        )}

        {/* Tips While You Wait */}
        <div className="border border-zinc-800 rounded-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">While you wait</h3>
          <ul className="space-y-3 text-zinc-400">
            <li>Check spam filters for our email.</li>
            <li>Use the coordination channel for updates.</li>
            <li>Browse the band index for comparables.</li>
          </ul>
        </div>

        {/* Questions Section */}
        <div className="border-t border-zinc-800 pt-8">
          <h3 className="text-xl font-semibold mb-4">Questions</h3>
          <p className="text-zinc-400 mb-4">
            Contact us to update submission details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:submit@therocksalt.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 font-semibold"
            >
              Email
            </a>
            <Link
              href="https://discord.gg/hW4dmajPkS"
              className="inline-flex items-center justify-center px-6 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 font-semibold"
            >
              Coordination channel
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-zinc-100 font-semibold"
          >
            Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SubmissionSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
