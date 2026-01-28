'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  fullName: string
  isGodMode: boolean
  role: string
}

interface GodModeContextType {
  user: User | null
  isGodMode: boolean
  loading: boolean
  checkFeature: (feature: string) => boolean
  premiumFeatures: string[]
}

const GodModeContext = createContext<GodModeContextType>({
  user: null,
  isGodMode: false,
  loading: true,
  checkFeature: () => false,
  premiumFeatures: []
})

// Premium features that require god mode
const PREMIUM_FEATURES = [
  'ai_video_generation',
  'ai_email_generation',
  'advanced_analytics',
  'bulk_export',
  'api_access',
  'unlimited_projects',
  'unlimited_contacts',
  'priority_support',
  'custom_integrations',
  'white_label'
]

export function GodModeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        
        // Get current session user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser?.email) {
          // Fetch user from users table
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, full_name, role, organization_id')
            .eq('email', authUser.email)
            .single()

          if (userData) {
            // Check if user has god mode (check organization plan or user role)
            const { data: orgData } = await supabase
              .from('organizations')
              .select('id')
              .eq('id', userData.organization_id || '')
              .single()

            // For now, check if user is owner/admin or if org has god_mode plan
            // This is a simplified check - you may want to add a proper plan/subscription check
            const isGodMode = userData.role === 'owner' || userData.role === 'admin'

            setUser({
              id: userData.id,
              email: userData.email,
              fullName: userData.full_name || userData.email,
              isGodMode,
              role: userData.role || 'user'
            })
          } else {
            // Fallback: if user exists in auth but not in users table, create basic user
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              fullName: authUser.user_metadata?.full_name || authUser.email || 'User',
              isGodMode: false,
              role: 'user'
            })
          }
        } else {
          // No authenticated user - set to null
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // On error, set user to null (not god mode)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const isGodMode = user?.isGodMode ?? false

  const checkFeature = (feature: string): boolean => {
    // God mode gets everything
    if (isGodMode) return true
    // Non-premium features are always available
    if (!PREMIUM_FEATURES.includes(feature)) return true
    // Premium features require god mode
    return false
  }

  return (
    <GodModeContext.Provider
      value={{
        user,
        isGodMode,
        loading,
        checkFeature,
        premiumFeatures: PREMIUM_FEATURES
      }}
    >
      {children}
    </GodModeContext.Provider>
  )
}

export function useGodMode() {
  const context = useContext(GodModeContext)
  if (!context) {
    throw new Error('useGodMode must be used within a GodModeProvider')
  }
  return context
}

// Feature gate component
export function FeatureGate({
  feature,
  children,
  fallback
}: {
  feature: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const { checkFeature, loading } = useGodMode()

  if (loading) return null

  if (checkFeature(feature)) {
    return <>{children}</>
  }

  return fallback ? <>{fallback}</> : null
}

// Premium badge component
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-xs font-medium text-white">
      Premium
    </span>
  )
}
