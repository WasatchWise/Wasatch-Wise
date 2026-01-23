import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

export default async function ReviewsDashboardPage() {
  // Use admin client (service role key bypasses RLS)
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Configuration Error</h1>
            <p className="text-red-700">
              Missing Supabase admin credentials. Please ensure <code className="bg-red-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is set in Vercel environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get all reviews (service role for admin access)
  const { data: reviews, error } = await supabase
    .from('app_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching reviews:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-yellow-900 mb-2">Database Error</h1>
            <p className="text-yellow-700 mb-2">Failed to fetch reviews from database.</p>
            <p className="text-sm text-yellow-600">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const tierLabels: Record<string, string> = {
    basic: 'Basic ($49)',
    standard: 'Standard ($149)',
    premium: 'Premium ($299)',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">App Reviews</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Manage all app review requests and track progress
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No reviews yet. Reviews will appear here once customers submit requests.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      App
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{review.customer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{review.customer_email}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{review.app_name}</div>
                        {review.app_url && (
                          <a
                            href={review.app_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 hover:text-orange-600"
                          >
                            View App
                          </a>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {tierLabels[review.review_tier] || review.review_tier}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[review.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {review.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(review.submitted_at || review.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/reviews/${review.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
