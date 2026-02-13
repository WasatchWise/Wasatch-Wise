import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'Thank You',
  description: 'Your DAROS proposal has been sent.',
  noIndex: true,
});

export default function DarosThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4 sm:px-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Thank You</h1>
          <p className="text-gray-600 mb-6">
            Check your email for the DAROS Briefing Proposal. We will reach out within 1-2 business
            days to schedule your 60-minute briefing.
          </p>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
