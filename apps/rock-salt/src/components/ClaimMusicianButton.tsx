'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { claimMusician } from '@/app/actions/claimMusician'

interface ClaimMusicianButtonProps {
  musicianId: string
  musicianName: string
  isClaimed: boolean
}

export default function ClaimMusicianButton({
  musicianId,
  musicianName,
  isClaimed,
}: ClaimMusicianButtonProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (isClaimed || authLoading) {
    return null
  }

  const handleClaim = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    setError(null)

    const result = await claimMusician(musicianId)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1200)
    } else {
      setError(result.error || 'Failed to claim profile')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="border border-emerald-700 bg-emerald-950/30 text-emerald-200 rounded-md p-4">
        Profile claimed. You can update it below.
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 rounded-md p-5 bg-zinc-950">
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">
        Claim this profile
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Sign in to manage instruments, roles, and availability for {musicianName}.
      </p>
      {error && (
        <div className="border border-red-800 bg-red-950/40 text-red-200 rounded-md p-3 mb-3 text-sm">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading}
        className="px-4 py-2 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors disabled:opacity-60"
      >
        {loading ? 'Claiming...' : user ? 'Claim profile' : 'Sign in to claim'}
      </button>
    </div>
  )
}
