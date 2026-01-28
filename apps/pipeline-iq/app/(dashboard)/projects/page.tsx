'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectsByTier, useProjects, Project } from '@/lib/hooks/useProjects'
import { useRealtime } from '@/lib/hooks/useRealtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RefreshCw,
  Download,
  Mail,
  MapPin,
  Building2,
  TrendingUp,
  Plus,
  Archive,
  Phone,
  CheckCircle2,
  Keyboard,
  X,
  ChevronDown,
  ChevronRight,
  Star,
  Flame,
  Sun,
  Snowflake,
  Loader2,
  Target,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { AddProjectModal } from '@/components/projects/AddProjectModal'
import { GoalCard, Goal } from '@/components/goals/GoalCard'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TierSectionProps {
  title: string
  icon: React.ReactNode
  projects: Project[]
  total: number
  color: string
  bgColor: string
  expanded: boolean
  onToggle: () => void
  selectedIds: Set<string>
  onToggleSelection: (id: string) => void
  focusedId: string | null
  onRowClick: (project: Project) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
}

function TierSection({
  title,
  icon,
  projects,
  total,
  color,
  bgColor,
  expanded,
  onToggle,
  selectedIds,
  onToggleSelection,
  focusedId,
  onRowClick,
  onLoadMore,
  hasMore,
  loadingMore,
}: TierSectionProps) {
  const displayedCount = projects.length

  return (
    <Card className={cn('overflow-hidden', bgColor)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={cn('p-2 rounded-lg', color)}>
            {icon}
          </span>
          <div className="text-left">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {total} project{total !== 1 ? 's' : ''} total
              {displayedCount < total && ` (showing ${displayedCount})`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && projects.length > 0 && (
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    focusedId === project.id && 'bg-primary/10 ring-1 ring-primary',
                    selectedIds.has(project.id) && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick(project)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(project.id)}
                      onCheckedChange={() => onToggleSelection(project.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{project.project_name}</div>
                    {project.raw_data?.brand && (
                      <div className="text-xs text-muted-foreground">{project.raw_data.brand}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.project_type?.slice(0, 2).map((type, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{project.city}, {project.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.units_count ? (
                      <span className="font-medium">{project.units_count}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary w-8">
                        {project.total_score ?? '-'}
                      </span>
                      {project.total_score !== null && (
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              project.total_score >= 90 ? 'bg-green-500' :
                              project.total_score >= 80 ? 'bg-orange-500' :
                              project.total_score >= 60 ? 'bg-yellow-500' :
                              'bg-gray-400'
                            )}
                            style={{ width: `${Math.min(100, project.total_score)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        project.outreach_status === 'new' && 'bg-gray-100 text-gray-700',
                        project.outreach_status === 'contacted' && 'bg-blue-100 text-blue-700',
                        project.outreach_status === 'qualified' && 'bg-green-100 text-green-700',
                        project.outreach_status === 'archived' && 'bg-red-100 text-red-700'
                      )}
                      title={
                        project.outreach_status === 'new' ? 'New - Not contacted yet' :
                        project.outreach_status === 'contacted' ? 'Contacted - You\'ve reached out' :
                        project.outreach_status === 'qualified' ? 'Qualified - They\'ve shown interest' :
                        project.outreach_status === 'archived' ? 'Archived - Not pursuing' :
                        'Status unknown'
                      }
                    >
                      {project.outreach_status === 'new' ? 'New' :
                       project.outreach_status === 'contacted' ? 'Contacted' :
                       project.outreach_status === 'qualified' ? 'Qualified' :
                       project.outreach_status === 'archived' ? 'Archived' :
                       project.outreach_status || 'New'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {hasMore && onLoadMore && (
            <div className="p-4 border-t flex justify-center">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onLoadMore()
                }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${total - displayedCount} remaining)`
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {expanded && projects.length === 0 && (
        <div className="p-8 text-center text-muted-foreground border-t">
          No projects in this tier
        </div>
      )}
    </Card>
  )
}

interface HotLead {
  id: string
  opened_at: string
  subject?: string | null
  project: {
    id: string
    project_name: string
    city: string | null
    state: string | null
  } | null
  contact: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    title: string | null
  } | null
  metadata: {
    callScript?: string
    painPoint?: string
  } | null
}

export default function ProjectsPage() {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hotLeads, setHotLeads] = useState<HotLead[]>([])
  const [activatedLeads, setActivatedLeads] = useState<any[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  // Tier expansion state - sure bets and hot expanded by default
  const [expandedTiers, setExpandedTiers] = useState({
    sureBets: true,
    hotLeads: true,
    warmLeads: false,
    coldLeads: false,
  })

  // Fetch projects by tier
  const { tiers, totals, loading, refetch } = useProjectsByTier()

  // Search results (when searching)
  const { projects: searchResults, loading: searchLoading, total: searchTotal, hasMore: searchHasMore, loadMore: searchLoadMore } = useProjects({
    filters: searchQuery ? { search: searchQuery } : undefined,
    autoFetch: !!searchQuery,
  })

  const isSearching = searchQuery.length > 0

  // Fetch dashboard data (hot leads, goals)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch hot leads for calls
        const followUpResponse = await fetch('/api/follow-up?limit=5')
        if (followUpResponse.ok) {
          const followUpJson = await followUpResponse.json()
          const followUpsSource = (followUpJson.followUps || followUpJson.queue || []) as any[]
          const leads = followUpsSource.map((fu: any) => ({
            id: fu.id,
            opened_at: fu.opened_at || fu.created_at || null,
            subject: fu.subject || fu.metadata?.subject || null,
            metadata: fu.metadata || null,
            project: fu.project ? {
              id: fu.project.id,
              project_name: fu.project.project_name,
              city: fu.project.city,
              state: fu.project.state,
            } : null,
            contact: fu.contact ? {
              id: fu.contact.id,
              first_name: fu.contact.first_name,
              last_name: fu.contact.last_name,
              email: fu.contact.email,
              title: fu.contact.title,
            } : null,
          }))
          setHotLeads(leads as HotLead[])
        }

        // Fetch activated leads (emails that were opened)
        const activatedResponse = await fetch('/api/activated-leads?limit=10')
        if (activatedResponse.ok) {
          const activatedJson = await activatedResponse.json()
          setActivatedLeads(activatedJson.leads || [])
        }

        // Fetch goals
        const goalsResponse = await fetch('/api/goals?status=active')
        if (goalsResponse.ok) {
          const goalsJson = await goalsResponse.json()
          setGoals(goalsJson.goals || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [])

  // Real-time updates
  useRealtime('projects', (payload) => {
    if (payload.eventType === 'INSERT') {
      toast.success('New project added!')
      refetch()
    } else if (payload.eventType === 'UPDATE') {
      refetch()
    }
  })

  // Bulk action handlers
  const updateProjectStatus = useCallback(async (projectIds: string[], status: string) => {
    setBulkActionLoading(true)
    try {
      for (const id of projectIds) {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outreach_status: status }),
        })
        if (!response.ok) throw new Error('Failed to update')
      }

      toast.success(`Updated ${projectIds.length} project(s) to "${status}"`)
      setSelectedIds(new Set())
      refetch()
    } catch (error) {
      toast.error('Failed to update projects')
    } finally {
      setBulkActionLoading(false)
    }
  }, [refetch])

  const updateSingleProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')
      toast.success('Status updated')
      refetch()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleBulkEmail = useCallback(async (projectIds: string[]) => {
    setBulkEmailLoading(true)
    try {
      // Generate emails for all selected projects
      const emailPromises = projectIds.map(async (projectId) => {
        const response = await fetch(`/api/projects/${projectId}/quick-email`)
        if (response.ok) {
          return await response.json()
        }
        return null
      })

      const emails = (await Promise.all(emailPromises)).filter(Boolean)

      if (emails.length === 0) {
        toast.error('No emails could be generated for selected projects')
        return
      }

      // Open each email in Gmail (one at a time, user can close and open next)
      toast.info(`Opening ${emails.length} emails in Gmail. Close each one to open the next.`)
      
      // Open first email
      window.open(emails[0].gmailUrl, '_blank')
      
      // Store remaining emails for user to open manually
      if (emails.length > 1) {
        const remainingEmails = emails.slice(1)
        // Store in sessionStorage so user can access them
        sessionStorage.setItem('pendingBulkEmails', JSON.stringify(remainingEmails))
        toast.success(`${emails.length - 1} more emails ready. Click "Open Next Email" button to continue.`)
      }

      setSelectedIds(new Set())
    } catch (error) {
      console.error('Bulk email error:', error)
      toast.error('Failed to generate bulk emails')
    } finally {
      setBulkEmailLoading(false)
    }
  }, [])

  const handleOpenNextEmail = useCallback(() => {
    const pendingEmails = sessionStorage.getItem('pendingBulkEmails')
    if (!pendingEmails) {
      toast.info('No more emails to open')
      return
    }

    const emails = JSON.parse(pendingEmails)
    if (emails.length === 0) {
      sessionStorage.removeItem('pendingBulkEmails')
      toast.success('All emails opened!')
      return
    }

    const nextEmail = emails.shift()
    window.open(nextEmail.gmailUrl, '_blank')
    
    if (emails.length > 0) {
      sessionStorage.setItem('pendingBulkEmails', JSON.stringify(emails))
      toast.info(`${emails.length} more emails remaining`)
    } else {
      sessionStorage.removeItem('pendingBulkEmails')
      toast.success('All emails opened!')
    }
  }, [])

  const archiveProjects = useCallback(async (projectIds: string[]) => {
    setBulkActionLoading(true)
    try {
      for (const id of projectIds) {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outreach_status: 'archived' }),
        })
        if (!response.ok) throw new Error('Failed to archive')
      }

      toast.success(`Archived ${projectIds.length} project(s)`)
      setSelectedIds(new Set())
      refetch()
    } catch (error) {
      toast.error('Failed to archive projects')
    } finally {
      setBulkActionLoading(false)
    }
  }, [refetch])

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleRowClick = (project: Project) => {
    router.push(`/projects/${project.id}`)
  }

  const handleExport = () => {
    const allProjects = isSearching
      ? searchResults
      : [...tiers.sureBets, ...tiers.hotLeads, ...tiers.warmLeads, ...tiers.coldLeads]

    const headers = ['Project Name', 'Type', 'City', 'State', 'Units', 'Score', 'Status']
    const rows = allProjects.map(p => [
      p.project_name,
      p.project_type?.join(', ') || '',
      p.city,
      p.state,
      (p.units_count || '').toString(),
      (p.total_score || '').toString(),
      p.outreach_status || 'new'
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success(`Exported ${allProjects.length} projects`)
  }

  const toggleTier = (tier: keyof typeof expandedTiers) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {totals.all.toLocaleString()} total projects across all tiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button onClick={() => router.push('/campaigns')}>
            <Mail className="mr-2 h-4 w-4" />
            Start Campaign
          </Button>

          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Projects</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{totals.all.toLocaleString()}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          setExpandedTiers(prev => ({ ...prev, sureBets: true }))
          setTimeout(() => {
            document.getElementById('sure-bets-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }}>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Sure Bets (90+)</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">{totals.sureBets}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          setExpandedTiers(prev => ({ ...prev, hotLeads: true }))
          setTimeout(() => {
            document.getElementById('hot-leads-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }}>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-muted-foreground">Hot Leads (80-89)</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-600">{totals.hotLeads}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          setExpandedTiers(prev => ({ ...prev, warmLeads: true }))
          setTimeout(() => {
            document.getElementById('warm-leads-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }}>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-muted-foreground">Warm Leads (60-79)</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">{totals.warmLeads}</div>
        </Card>
      </div>

      {/* Goals Section */}
      {goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Goals
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Activated Leads - Emails Opened */}
      {activatedLeads.length > 0 && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Mail className="h-5 w-5" />
              Activated Leads - Emails Opened
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              These prospects opened your email! Call them while you&apos;re top of mind.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activatedLeads.map((lead) => {
                const contactName = lead.contact
                  ? `${lead.contact.first_name || ''} ${lead.contact.last_name || ''}`.trim() || lead.contact.email
                  : 'Unknown'
                const projectName = lead.project?.project_name || 'Unknown Project'
                const openedTime = lead.opened_at ? formatRelativeTime(lead.opened_at) : 'Recently'

                return (
                  <div key={lead.id} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{contactName}</span>
                          <span className="text-muted-foreground">at</span>
                          <Link 
                            href={`/projects/${lead.project?.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {projectName}
                          </Link>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Opened {openedTime}
                          {lead.clicked_at && (
                            <span className="ml-2 text-green-600">• Clicked link</span>
                          )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border-l-4 border-green-500 text-sm">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">Call Script:</div>
                          {lead.callScript || `Hey ${contactName}, it's Mike with Wasatch Wise. I sent you a quick note earlier about ${projectName} and saw you had a chance to glance at it. I'm not sure if we're relevant yet, but wanted to ask...`}
                        </div>
                      </div>
                      {lead.project && (
                        <div className="flex flex-col gap-2">
                          {lead.contact?.phone && (
                            <Button
                              size="sm"
                              onClick={() => window.location.href = `tel:${lead.contact.phone}`}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              Call Now
                            </Button>
                          )}
                          <Link href={`/projects/${lead.project.id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              View Project
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hot Leads - Calls to Make */}
      {hotLeads.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-600" />
              Calls to Make
            </CardTitle>
            <CardDescription>
              Prospects who opened your email - call them while Groove is top of mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotLeads.map((lead) => {
                const contactName = lead.contact
                  ? `${lead.contact.first_name || ''} ${lead.contact.last_name || ''}`.trim() || lead.contact.email
                  : 'Unknown'
                const projectName = lead.project?.project_name || 'Unknown Project'
                const callScript = lead.metadata?.callScript ||
                  `Hey ${contactName}, it's Mike with Groove. I sent you a quick note earlier about ${projectName} and saw you had a chance to glance at it. I'm not sure if we're relevant yet, but wanted to ask...`

                return (
                  <div key={lead.id} className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold">{contactName}</span>
                          <span className="text-muted-foreground">at</span>
                          <span className="text-sm">{projectName}</span>
                        </div>
                        {lead.opened_at && (
                          <div className="text-xs text-muted-foreground mb-2">
                            Opened {formatRelativeTime(lead.opened_at)}
                          </div>
                        )}
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border-l-4 border-orange-500 text-sm">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">Call Script:</div>
                          {callScript}
                        </div>
                      </div>
                      {lead.project && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateSingleProjectStatus(lead.project!.id, 'contacted')}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Called
                          </Button>
                          <Link href={`/projects/${lead.project.id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              View
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <Card className="fixed bottom-4 right-4 z-50 w-80 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <span className="font-semibold">Keyboard Shortcuts</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mark Contacted</span>
              <span className="font-mono">C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mark Qualified</span>
              <span className="font-mono">Q</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Archive</span>
              <span className="font-mono">A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clear Selection</span>
              <span className="font-mono">Esc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toggle Help</span>
              <span className="font-mono">?</span>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {selectedIds.size} project{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="text-blue-700 dark:text-blue-300"
              >
                <X className="mr-2 h-3 w-3" />
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleBulkEmail(Array.from(selectedIds))}
                disabled={bulkEmailLoading || bulkActionLoading}
                title="Generate NEPQ emails and open in Gmail for all selected projects"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="mr-2 h-3 w-3" />
                {bulkEmailLoading ? 'Generating...' : 'Bulk Email (Gmail)'}
              </Button>
              {sessionStorage.getItem('pendingBulkEmails') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenNextEmail}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Mail className="mr-2 h-3 w-3" />
                  Open Next Email
                </Button>
              )}
              <Button
                size="sm"
                variant="default"
                onClick={() => updateProjectStatus(Array.from(selectedIds), 'contacted')}
                disabled={bulkActionLoading || bulkEmailLoading}
                title="Mark as 'Contacted' - You've reached out (email, call, etc.)"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Phone className="mr-2 h-3 w-3" />
                Mark as Contacted
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => updateProjectStatus(Array.from(selectedIds), 'qualified')}
                disabled={bulkActionLoading || bulkEmailLoading}
                title="Mark as 'Qualified' - They've shown interest, it's a real opportunity"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-3 w-3" />
                Mark as Qualified
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => archiveProjects(Array.from(selectedIds))}
                disabled={bulkEmailLoading || bulkActionLoading}
                title="Archive - Not relevant, dead end, or not pursuing"
                className="border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Archive className="mr-2 h-3 w-3" />
                Archive
              </Button>
            </div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            💡 These actions update the project status to track your sales pipeline. Use bulk actions to quickly organize multiple projects at once.
          </p>
        </Card>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search projects by name or city..."
            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts((prev) => !prev)}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Shortcuts
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Search Results */}
      {isSearching && !loading && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              Search Results ({searchTotal} found)
            </h3>
          </div>
          {searchLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No projects found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((project) => (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(project)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(project.id)}
                          onCheckedChange={() => toggleSelection(project.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{project.project_name}</TableCell>
                      <TableCell>
                        {project.project_type?.slice(0, 2).map((type, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 mr-1"
                          >
                            {type}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>{project.city}, {project.state}</TableCell>
                      <TableCell>{project.units_count || '-'}</TableCell>
                      <TableCell>
                        <span className="font-bold">{project.total_score ?? '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            project.outreach_status === 'new' && 'bg-gray-100 text-gray-700',
                            project.outreach_status === 'contacted' && 'bg-blue-100 text-blue-700',
                            project.outreach_status === 'qualified' && 'bg-green-100 text-green-700',
                            project.outreach_status === 'archived' && 'bg-red-100 text-red-700'
                          )}
                          title={
                            project.outreach_status === 'new' ? 'New - Not contacted yet' :
                            project.outreach_status === 'contacted' ? 'Contacted - You\'ve reached out' :
                            project.outreach_status === 'qualified' ? 'Qualified - They\'ve shown interest' :
                            project.outreach_status === 'archived' ? 'Archived - Not pursuing' :
                            'Status unknown'
                          }
                        >
                          {project.outreach_status === 'new' ? 'New' :
                           project.outreach_status === 'contacted' ? 'Contacted' :
                           project.outreach_status === 'qualified' ? 'Qualified' :
                           project.outreach_status === 'archived' ? 'Archived' :
                           project.outreach_status || 'New'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {searchHasMore && (
                <div className="p-4 border-t flex justify-center">
                  <Button variant="outline" onClick={searchLoadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Tiered Project Sections */}
      {!isSearching && !loading && (
        <div className="space-y-4">
          <div id="sure-bets-section">
            <TierSection
              title="Sure Bets"
              icon={<Star className="h-5 w-5 text-green-600" />}
              projects={tiers.sureBets}
              total={totals.sureBets}
              color="bg-green-100"
              bgColor="border-l-4 border-l-green-500"
              expanded={expandedTiers.sureBets}
              onToggle={() => toggleTier('sureBets')}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              focusedId={focusedId}
              onRowClick={handleRowClick}
            />
          </div>

          <div id="hot-leads-section">
            <TierSection
              title="Hot Leads"
              icon={<Flame className="h-5 w-5 text-orange-600" />}
              projects={tiers.hotLeads}
              total={totals.hotLeads}
              color="bg-orange-100"
              bgColor="border-l-4 border-l-orange-500"
              expanded={expandedTiers.hotLeads}
              onToggle={() => toggleTier('hotLeads')}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              focusedId={focusedId}
              onRowClick={handleRowClick}
            />
          </div>

          <div id="warm-leads-section">
            <TierSection
              title="Warm Leads"
              icon={<Sun className="h-5 w-5 text-yellow-600" />}
              projects={tiers.warmLeads}
              total={totals.warmLeads}
              color="bg-yellow-100"
              bgColor="border-l-4 border-l-yellow-500"
              expanded={expandedTiers.warmLeads}
              onToggle={() => toggleTier('warmLeads')}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              focusedId={focusedId}
              onRowClick={handleRowClick}
            />
          </div>

          <TierSection
            title="Cold / Unscored"
            icon={<Snowflake className="h-5 w-5 text-gray-500" />}
            projects={tiers.coldLeads}
            total={totals.coldLeads}
            color="bg-gray-100"
            bgColor="border-l-4 border-l-gray-400"
            expanded={expandedTiers.coldLeads}
            onToggle={() => toggleTier('coldLeads')}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            focusedId={focusedId}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
