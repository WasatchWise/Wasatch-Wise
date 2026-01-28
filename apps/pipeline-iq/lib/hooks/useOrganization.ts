'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Organization {
  id: string
  name: string
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const didRunRef = useRef(false)

  useEffect(() => {
    if (didRunRef.current) return
    didRunRef.current = true

    async function fetchOrganization() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        // Soft-launch posture: if auth isn't set up, don't spam console with errors.
        // Treat unauthenticated as "no org context available" (middleware cookies may still provide branding elsewhere).
        if (userError || !user) {
          setOrganization(null)
          setError(null)
          return
        }

        // Get user's organization_id from users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (userDataError || !userData?.organization_id) {
          throw new Error('User organization not found')
        }

        // Get organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('id', userData.organization_id)
          .single()

        if (orgError || !orgData) {
          throw new Error('Organization not found')
        }

        setOrganization({
          id: orgData.id,
          name: orgData.name,
        })
      } catch (err) {
        console.error('Error fetching organization:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  return {
    organization,
    loading,
    error,
  }
}

