import Link from 'next/link';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { Download } from 'lucide-react';

export const metadata = genMeta({
  title: 'Thank You – Your Starter Kit is Ready',
  description: 'Download your AI Governance Starter Kit documents.',
  noIndex: true,
});

const PDF_FILES = [
  { key: 'policy', name: 'AI Policy Template', path: 'AI_Policy_Template_School_Districts.pdf' },
  { key: 'vendor', name: 'Vendor Vetting Checklist', path: 'Vendor_Vetting_Checklist.pdf' },
  { key: 'board', name: 'Board Presentation Template', path: 'Board_Presentation_Template.pdf' },
];

async function getDownloadLinks(sessionId: string) {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const links: Record<string, string> = {};
    const expiresIn = 60 * 60 * 24; // 24 hours

    for (const file of PDF_FILES) {
      const { data } = await supabase.storage
        .from('starter-kit-files')
        .createSignedUrl(file.path, expiresIn);
      if (data?.signedUrl) {
        links[file.key] = data.signedUrl;
      }
    }

    return Object.keys(links).length > 0 ? links : null;
  } catch {
    return null;
  }
}

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function StarterKitSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const links = session_id ? await getDownloadLinks(session_id) : null;

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Thank You for Your Purchase
          </h1>
          <p className="text-gray-600 mb-8">
            Your AI Governance Starter Kit is ready. Download your documents below.
          </p>

          {links ? (
            <div className="space-y-3 mb-8">
              {PDF_FILES.map((file) =>
                links[file.key] ? (
                  <a
                    key={file.key}
                    href={links[file.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    {file.name}
                  </a>
                ) : null
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-amber-800 font-medium mb-1">Check your email</p>
              <p className="text-amber-700 text-sm">
                We have sent download links to your email. The links are valid for 24 hours.
                Save the files to your computer for long-term access.
              </p>
            </div>
          )}

          <Link
            href="/"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
