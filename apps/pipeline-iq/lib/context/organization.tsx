'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// ============================================
// Client-safe Organization Config
// (Subset of full config safe to expose to client)
// ============================================

export interface ClientOrganizationConfig {
  id: string
  name: string
  subdomain?: string

  branding: {
    companyName: string
    tagline?: string
    primaryColor?: string
    logoUrl?: string
  }
}

interface OrganizationContextValue {
  org: ClientOrganizationConfig | null
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextValue>({
  org: null,
  isLoading: true,
})

// ============================================
// Provider Component
// ============================================

interface OrganizationProviderProps {
  children: ReactNode
  initialOrg?: ClientOrganizationConfig
}

export function OrganizationProvider({ children, initialOrg }: OrganizationProviderProps) {
  const [org, setOrg] = useState<ClientOrganizationConfig | null>(initialOrg || null)
  const [isLoading, setIsLoading] = useState(!initialOrg)

  useEffect(() => {
    // If we have initial org from server, use it
    if (initialOrg) {
      setOrg(initialOrg)
      setIsLoading(false)
      return
    }

    // Otherwise, read from cookie (set by middleware)
    const subdomain = getCookie('org-subdomain')
    if (subdomain) {
      // Could fetch full config from API, but for now use subdomain
      // to indicate we're in a tenant context
      setOrg({
        id: getCookie('org-id') || 'groove',
        name: subdomain === 'groovetech' ? 'Groove Technologies' : subdomain,
        subdomain,
        branding: {
          companyName: subdomain === 'groovetech' ? 'Groove Technologies' : subdomain,
          primaryColor: '#6366f1',
        },
      })
    }
    setIsLoading(false)
  }, [initialOrg])

  return (
    <OrganizationContext.Provider value={{ org, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}

// ============================================
// Helper
// ============================================

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}
