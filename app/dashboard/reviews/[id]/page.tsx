import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';
import { ReviewWorkflowForm } from '@/components/dashboard/ReviewWorkflowForm';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Use service role key for admin dashboard (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get review details
  const { data: review, error } = await supabase
    .from('app_reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !review) {
    notFound();
  }

  // Get findings for this review
  const { data: findings } = await supabase
    .from('review_findings')
    .select('*')
    .eq('review_id', id)
    .order('created_at', { ascending: false });

  // Get report if exists
  const { data: report } = await supabase
    .from('review_reports')
    .select('*')
    .eq('review_id', id)
    .single();

  const tierLabels: Record<string, string> = {
    basic: 'Basic Review',
    standard: 'Standard Review',
    premium: 'Premium Review',
  };

  const statusColors: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link href="/dashboard/reviews" className="text-orange-500 hover:text-orange-600 text-sm mb-4 inline-block">
            ← Back to Reviews
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Review: {review.app_name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              statusColors[review.status] || 'bg-gray-100 text-gray-800'
            }`}>
              {review.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-600">
              {tierLabels[review.review_tier] || review.review_tier}
            </span>
            <span className="text-sm text-gray-600">
              ${(review.price_paid_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Review Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>{' '}
                  <span className="text-gray-900">{review.customer_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  <span className="text-gray-900">{review.customer_email}</span>
                </div>
                {review.customer_role && (
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>{' '}
                    <span className="text-gray-900">{review.customer_role}</span>
                  </div>
                )}
              </div>
            </div>

            {/* App Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">App Name:</span>{' '}
                  <span className="text-gray-900">{review.app_name}</span>
                </div>
                {review.app_url && (
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>{' '}
                    <a
                      href={review.app_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      {review.app_url}
                    </a>
                  </div>
                )}
                {review.app_category && (
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>{' '}
                    <span className="text-gray-900">{review.app_category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Findings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Findings</h2>
              {findings && findings.length > 0 ? (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <div key={finding.id} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {finding.severity || 'info'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                      {finding.recommendation && (
                        <p className="text-sm text-gray-600 italic">
                          <strong>Recommendation:</strong> {finding.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No findings added yet.</p>
              )}
            </div>

            {/* Report */}
            {report && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Report</h2>
                {report.report_url ? (
                  <a
                    href={report.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    View Report PDF
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Report URL not available</p>
                )}
              </div>
            )}
          </div>

          {/* Workflow Sidebar */}
          <div className="lg:col-span-1">
            <ReviewWorkflowForm reviewId={id} currentStatus={review.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
