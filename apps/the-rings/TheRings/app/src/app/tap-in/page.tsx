'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

const zones: Record<string, { name: string; color: string; pillar: string }> = {
  wellness: { name: 'Wellness Zone', color: 'text-green-400', pillar: 'wellness' },
  technest: { name: 'TechNest', color: 'text-cyan-400', pillar: 'technest' },
  creative: { name: 'Creative Studio', color: 'text-purple-400', pillar: 'creative' },
  civic: { name: 'Civic Lab', color: 'text-orange-400', pillar: 'civic' },
  lobby: { name: 'The Lobby', color: 'text-white', pillar: '' },
}

function TapInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const zone = searchParams.get('zone') || 'lobby'
  const zoneInfo = zones[zone] || zones.lobby

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [supabase])

  const handleTapIn = async () => {
    if (!user) {
      router.push('/login?redirect=/tap-in?zone=' + zone)
      return
    }

    setStatus('loading')

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile) {
        throw new Error('Profile not found')
      }

      // Log the tap-in as an activity event
      const { error } = await supabase.from('activity_events').insert({
        user_id: profile.id,
        event_type: 'tap_in',
        event_data: {
          zone,
          zone_name: zoneInfo.name,
          pillar: zoneInfo.pillar,
          timestamp: new Date().toISOString(),
        },
      })

      if (error) throw error

      setStatus('success')
      setMessage(`Tapped in to ${zoneInfo.name}`)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setStatus('error')
      setMessage('Failed to tap in. Try again.')
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8 text-center border-2 border-primary/50 bg-card/80 backdrop-blur">
        {/* Zone indicator */}
        <div className="mb-8">
          <div className={`text-sm font-mono uppercase tracking-widest ${zoneInfo.color} mb-2`}>
            Entering
          </div>
          <h1 className={`text-3xl font-bold ${zoneInfo.color}`}>
            {zoneInfo.name}
          </h1>
        </div>

        {/* Status display */}
        {status === 'success' ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-mono">{message}</p>
            <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 font-mono">{message}</p>
            <Button onClick={handleTapIn} className="w-full">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tap button */}
            <button
              onClick={handleTapIn}
              disabled={status === 'loading'}
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-lg font-bold text-black">TAP IN</span>
              )}
            </button>

            <p className="text-muted-foreground text-sm">
              {user ? 'Tap to check in' : 'Sign in to tap in'}
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </Card>
    </main>
  )
}

export default function TapIn() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <TapInContent />
    </Suspense>
  )
}
