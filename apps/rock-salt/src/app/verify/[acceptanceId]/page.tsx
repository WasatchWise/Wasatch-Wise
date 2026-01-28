import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ acceptanceId: string }>
}) {
  return {
    title: 'Verify Contract | The Rock Salt',
    description: 'Verify the authenticity of a Spider Rider contract',
  }
}

export default async function VerifyContractPage({
  params,
}: {
  params: Promise<{ acceptanceId: string }>
}) {
  const { acceptanceId } = await params
  const supabase = await createClient()

  // Fetch contract
  const { data: contract } = await supabase
    .from('generated_contracts')
    .select(`
      id,
      contract_hash,
      generated_at,
      acceptance:spider_rider_acceptances(
        id,
        created_at,
        venue:venues(name, city, state),
        spider_rider:spider_riders(
          version,
          band:bands(name, slug)
        )
      )
    `)
    .eq('acceptance_id', acceptanceId)
    .single()

  if (!contract) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
            Contract Not Found
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-6">
            We could not find a contract with this ID in our records.
            This may mean the contract was never generated or the ID is incorrect.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const acceptance = contract.acceptance
  const rider = acceptance?.spider_rider
  const band = rider?.band
  const venue = acceptance?.venue

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
          <div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Contract Verified
            </h1>
            <p className="text-green-600 dark:text-green-400 text-sm">
              This is an authentic Spider Rider contract
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
            <span className="text-green-700 dark:text-green-300">Band</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {band?.name || 'Unknown'}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
            <span className="text-green-700 dark:text-green-300">Venue</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {venue?.name || 'Unknown'}
            </span>
          </div>

          {venue?.city && venue?.state && (
            <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
              <span className="text-green-700 dark:text-green-300">Location</span>
              <span className="font-bold text-green-900 dark:text-green-100">
                {venue.city}, {venue.state}
              </span>
            </div>
          )}

          <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
            <span className="text-green-700 dark:text-green-300">Rider Version</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {rider?.version || 'v1.0'}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
            <span className="text-green-700 dark:text-green-300">Acceptance Date</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {acceptance?.created_at
                ? new Date(acceptance.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-green-200 dark:border-green-700">
            <span className="text-green-700 dark:text-green-300">Generated</span>
            <span className="font-bold text-green-900 dark:text-green-100">
              {contract.generated_at
                ? new Date(contract.generated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Unknown'}
            </span>
          </div>
        </div>

        <div className="bg-green-100 dark:bg-green-800/50 rounded-lg p-4 mb-6">
          <p className="text-xs text-green-700 dark:text-green-300 font-mono break-all">
            <span className="font-bold">Contract Hash:</span>{' '}
            {contract.contract_hash}
          </p>
        </div>

        <div className="flex gap-4">
          {band?.slug && (
            <Link
              href={`/bands/${band.slug}`}
              className="flex-1 text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              View Band
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 text-center px-4 py-3 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
