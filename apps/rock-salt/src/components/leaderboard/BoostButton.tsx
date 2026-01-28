'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BoostButtonProps {
  bandId: string
  bandName: string
  currentBoostScore: number
  isOwner?: boolean
  isLoggedIn?: boolean
}

export default function BoostButton({
  bandId,
  bandName,
  currentBoostScore,
  isOwner = false,
  isLoggedIn = false,
}: BoostButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [boostScore, setBoostScore] = useState(currentBoostScore)

  const handleBoost = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/signin?redirect=/leaderboard`)
      return
    }

    if (isOwner) {
      setError('You cannot boost your own band')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/leaderboard/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bandId, amount: 1 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to boost')
      }

      setSuccess(data.message)
      setBoostScore(data.boostScore)
      router.refresh()
    } catch (err) {
      console.error('Boost error:', err)
      setError(err instanceof Error ? err.message : 'Failed to boost')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleBoost}
        disabled={loading || isOwner}
        className={`
          px-3 py-1.5 rounded-full font-semibold text-sm transition-all
          ${isOwner
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            : loading
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 cursor-wait'
            : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105'
          }
        `}
        title={isOwner ? 'Cannot boost your own band' : `Boost ${bandName}`}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>🚀</span>
            <span>{boostScore}</span>
          </span>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 max-w-[120px] text-center">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-500 max-w-[120px] text-center">{success}</p>
      )}
    </div>
  )
}
