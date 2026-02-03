'use client'

import type { CompatibilityResult, CompatibilityCheck } from '@/lib/compatibility'
import { CompatibilityBadge } from './CompatibilityBadge'

const CHECK_STATUS_CONFIG: Record<
  CompatibilityCheck['status'],
  { colors: string; icon: string }
> = {
  pass: {
    colors: 'text-green-600 dark:text-green-400',
    icon: '✅',
  },
  partial: {
    colors: 'text-yellow-600 dark:text-yellow-400',
    icon: '⚠️',
  },
  fail: {
    colors: 'text-red-600 dark:text-red-400',
    icon: '❌',
  },
  unknown: {
    colors: 'text-gray-600 dark:text-gray-400',
    icon: '❓',
  },
}

function CompatibilityCheckRow({ check }: { check: CompatibilityCheck }) {
  const config = CHECK_STATUS_CONFIG[check.status]

  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <span className="text-xl" title={check.status}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h5 className="font-medium text-gray-900 dark:text-white">
            {check.factor}
          </h5>
          <span className={`text-sm font-semibold ${config.colors}`}>
            {check.score}%
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {check.message}
        </p>
      </div>
    </div>
  )
}

interface CompatibilityBreakdownProps {
  result: CompatibilityResult
  title?: string
}

export function CompatibilityBreakdown({
  result,
  title = 'Compatibility Breakdown',
}: CompatibilityBreakdownProps) {
  const statusLabels: Record<CompatibilityResult['status'], string> = {
    excellent: 'Excellent match — all requirements met',
    good: 'Good match with minor gaps',
    partial: 'Partial match — negotiation may be needed',
    incompatible: 'Not compatible — deal-breakers present',
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}

      {/* Overall Score */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Overall Compatibility
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {statusLabels[result.status]}
          </p>
        </div>
        <CompatibilityBadge
          score={result.overallScore}
          status={result.status}
          size="lg"
        />
      </div>

      {/* Deal-Breakers */}
      {result.dealBreakers.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            ⚠️ Deal-Breakers
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {result.dealBreakers.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Factor Breakdown */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          By Factor
        </h4>
        <div className="space-y-2">
          {result.checks.map((check, i) => (
            <CompatibilityCheckRow key={i} check={check} />
          ))}
        </div>
      </div>
    </div>
  )
}
