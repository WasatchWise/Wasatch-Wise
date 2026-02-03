'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SpiderRiderPublishedSuccessProps {
  bandName: string
  riderCode: string
  riderVersion: string
  publishedAt: string
  riderId: string
  publicUrl: string
  hasPdf: boolean
  acceptanceCount: number
  pendingBookingCount: number
  bandId: string
}

export default function SpiderRiderPublishedSuccess({
  bandName,
  riderCode,
  riderVersion,
  publishedAt,
  riderId,
  publicUrl,
  hasPdf,
  acceptanceCount,
  pendingBookingCount,
  bandId,
}: SpiderRiderPublishedSuccessProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPdf = () => {
    window.open(`/api/spider-rider/${riderId}/download`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          Spider Rider Published
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your touring terms are now live in the Spider Network
        </p>
      </div>

      {/* Rider card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {riderCode}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {riderVersion}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{bandName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Published {new Date(publishedAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {hasPdf && (
          <button
            type="button"
            onClick={downloadPdf}
            className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        )}
        <button
          type="button"
          onClick={copyLink}
          className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </>
          )}
        </button>
        <Link
          href={`/book/spider-riders/${riderId}`}
          className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          View Public Page
        </Link>
      </div>

      {/* What Happens Next */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
          <span className="text-xl">🕷️</span>
          What Happens Next
        </h3>
        <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200 mb-6">
          <li>• Venues browsing the network can see your rider</li>
          <li>• When a venue accepts, they become an Authorized Venue</li>
          <li>• Authorized Venues get your 48-hour Spider Hold priority</li>
          <li>• You&apos;ll be notified when venues accept or request dates</li>
        </ul>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-semibold text-indigo-900 dark:text-indigo-100">
              {acceptanceCount}
            </span>
            <span className="text-indigo-700 dark:text-indigo-300 ml-1">
              Authorized Venues
            </span>
          </div>
          <div>
            <span className="font-semibold text-indigo-900 dark:text-indigo-100">
              {pendingBookingCount}
            </span>
            <span className="text-indigo-700 dark:text-indigo-300 ml-1">
              Pending Requests
            </span>
          </div>
        </div>
      </div>

      {/* Back to dashboard */}
      <div className="text-center">
        <Link
          href={`/dashboard/bands/${bandId}?tab=spider-rider`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          ← Back to Band Dashboard
        </Link>
      </div>
    </div>
  )
}
