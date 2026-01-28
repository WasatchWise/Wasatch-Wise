'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const client = useSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (!client) {
      router.push('/?error=supabase_not_configured')
      return
    }

    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await client.auth.getUser()
        
        if (error || !user) {
          router.push('/?error=not_authenticated')
          return
        }

        setAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/?error=auth_check_failed')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/?error=session_expired')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [client, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}

