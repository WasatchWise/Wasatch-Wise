'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface Project {
  id: string
  project_name: string
  project_type: string[]
  project_stage: string
  project_value: number
  city: string
  state: string
  total_score: number | null
  groove_fit_score: number | null
  priority_level: string
  outreach_status: string
  units_count?: number
  raw_data?: any
  [key: string]: any
}

interface UseProjectsFilters {
  stage?: string
  type?: string
  state?: string
  minScore?: number
  maxScore?: number
  search?: string
}

interface UseProjectsOptions {
  filters?: UseProjectsFilters
  limit?: number
  autoFetch?: boolean
}

interface PaginationState {
  offset: number
  total: number
  hasMore: boolean
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    offset: 0,
    total: 0,
    hasMore: false,
  })

  // Track if initial fetch has happened
  const hasFetched = useRef(false)
  const limit = options.limit ?? 50

  const fetchProjects = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true)
        setProjects([])
        setPagination({ offset: 0, total: 0, hasMore: false })
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const currentOffset = reset ? 0 : pagination.offset

      // Build query params
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('offset', currentOffset.toString())

      if (options.filters?.stage) {
        params.append('stage', options.filters.stage)
      }
      if (options.filters?.type) {
        params.append('type', options.filters.type)
      }
      if (options.filters?.state) {
        params.append('state', options.filters.state)
      }
      if (options.filters?.minScore !== undefined) {
        params.append('minScore', options.filters.minScore.toString())
      }
      if (options.filters?.maxScore !== undefined) {
        params.append('maxScore', options.filters.maxScore.toString())
      }
      if (options.filters?.search) {
        params.append('search', options.filters.search)
      }

      const response = await fetch(`/api/projects?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()

      if (reset) {
        setProjects(data.projects || [])
      } else {
        setProjects(prev => [...prev, ...(data.projects || [])])
      }

      setPagination({
        offset: currentOffset + (data.projects?.length || 0),
        total: data.total || 0,
        hasMore: data.hasMore || false,
      })
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [options.filters, limit, pagination.offset])

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchProjects(false)
    }
  }, [fetchProjects, loadingMore, pagination.hasMore])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (options.autoFetch !== false) {
      hasFetched.current = true
      fetchProjects(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.filters?.stage, options.filters?.type, options.filters?.state,
      options.filters?.minScore, options.filters?.maxScore, options.filters?.search, options.autoFetch])

  return {
    projects,
    loading,
    loadingMore,
    error,
    total: pagination.total,
    hasMore: pagination.hasMore,
    loadMore,
    refetch: () => fetchProjects(true),
  }
}

// Hook for fetching projects by score tier
export function useProjectsByTier() {
  const [tiers, setTiers] = useState<{
    sureBets: Project[]
    hotLeads: Project[]
    warmLeads: Project[]
    coldLeads: Project[]
  }>({
    sureBets: [],
    hotLeads: [],
    warmLeads: [],
    coldLeads: [],
  })
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ sureBets: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0, all: 0 })

  const fetchAllTiers = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all tiers in parallel
      const [sureBetsRes, hotRes, warmRes, coldRes] = await Promise.all([
        fetch('/api/projects?minScore=90&limit=50'),
        fetch('/api/projects?minScore=80&maxScore=89&limit=50'),
        fetch('/api/projects?minScore=60&maxScore=79&limit=50'),
        fetch('/api/projects?maxScore=59&limit=50'),
      ])

      const [sureBets, hot, warm, cold] = await Promise.all([
        sureBetsRes.json(),
        hotRes.json(),
        warmRes.json(),
        coldRes.json(),
      ])

      setTiers({
        sureBets: sureBets.projects || [],
        hotLeads: hot.projects || [],
        warmLeads: warm.projects || [],
        coldLeads: cold.projects || [],
      })

      setTotals({
        sureBets: sureBets.total || 0,
        hotLeads: hot.total || 0,
        warmLeads: warm.total || 0,
        coldLeads: cold.total || 0,
        all: (sureBets.total || 0) + (hot.total || 0) + (warm.total || 0) + (cold.total || 0),
      })
    } catch (err) {
      console.error('Error fetching project tiers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllTiers()
  }, [fetchAllTiers])

  return { tiers, totals, loading, refetch: fetchAllTiers }
}
