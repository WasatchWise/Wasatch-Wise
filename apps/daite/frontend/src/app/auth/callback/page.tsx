'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        console.error('Supabase not configured')
        router.push('/?error=auth_not_configured')
        return
      }

      try {
        // Handle both hash fragments (#) and query parameters (?)
        // Supabase can use either format depending on the flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search.substring(1))
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
        const type = hashParams.get('type') || queryParams.get('type') // 'signup' or 'recovery'
        const error = hashParams.get('error') || queryParams.get('error')
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')

        console.log('Auth callback - URL params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type,
          error 
        })

        // Handle errors from URL
        if (error) {
          console.error('Auth callback error from URL:', error, errorDescription)
          router.push(`/?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // If we have tokens in the URL, set the session
        if (accessToken && refreshToken) {
          console.log('Setting session from tokens...')
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            router.push(`/?error=${encodeURIComponent(sessionError.message)}`)
            return
          }

          if (data.session) {
            console.log('Session created successfully, redirecting to dashboard')
            // Successful authentication - wait a moment for session to persist
            setTimeout(() => {
              router.push('/dashboard')
            }, 500)
            return
          }
        }

        // Check if this is a confirmation link (email verification)
        // Supabase sometimes sends confirmation links that need to be handled differently
        if (type === 'signup' || window.location.search.includes('token=') || window.location.hash.includes('token=')) {
          // Let Supabase handle the verification automatically
          const { data: { session }, error: verifyError } = await supabase.auth.getSession()
          
          if (verifyError) {
            console.error('Error verifying email:', verifyError)
            router.push(`/?error=${encodeURIComponent(verifyError.message || 'Email verification failed')}`)
            return
          }

          if (session) {
            console.log('Email verified, session active')
            router.push('/dashboard')
            return
          }
        }

        // Try to get existing session (user might already be logged in)
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Error getting session:', sessionError)
          // Don't redirect on error - might just be no session yet
        }

        if (data?.session) {
          // Already has session - redirect to dashboard
          console.log('Existing session found')
          router.push('/dashboard')
        } else {
          // No session - redirect to home with helpful message
          console.log('No session found')
          router.push('/?message=Email confirmed! Please sign in.')
        }
      } catch (err: any) {
        console.error('Unexpected auth callback error:', err)
        router.push(`/?error=${encodeURIComponent(err.message || 'Authentication failed')}`)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
        <p className="text-stone-400">Completing authentication...</p>
      </div>
    </div>
  )
}

