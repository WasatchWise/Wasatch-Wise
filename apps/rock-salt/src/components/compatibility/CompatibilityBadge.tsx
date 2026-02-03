'use client'

import type { CompatibilityStatus } from '@/lib/compatibility'

interface CompatibilityBadgeProps {
  score: number
  status: CompatibilityStatus
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<
  CompatibilityStatus,
  { colors: string; icon: string; label: string }
> = {
  excellent: {
    colors: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    icon: '✅',
    label: 'Excellent match',
  },
  good: {
    colors: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    icon: '👍',
    label: 'Good match',
  },
  partial: {
    colors: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    icon: '⚠️',
    label: 'Partial match',
  },
  incompatible: {
    colors: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
    icon: '❌',
    label: 'Not compatible',
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-sm px-2 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
}

export function CompatibilityBadge({
  score,
  status,
  size = 'md',
}: CompatibilityBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span
      className={`inline-flex items-center rounded border font-semibold ${config.colors} ${sizeClass}`}
      title={config.label}
    >
      <span>{config.icon}</span>
      <span>{score}%</span>
      <span className="capitalize opacity-90">{status}</span>
    </span>
  )
}
