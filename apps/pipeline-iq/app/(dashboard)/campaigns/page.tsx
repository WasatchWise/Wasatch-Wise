'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  Eye,
  MousePointerClick,
  RefreshCw,
  Flame,
  Send,
  CheckCircle2,
  X,
  Edit3,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Save,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type WorkflowStep = 'select' | 'generate' | 'review' | 'send'

interface GeneratedEmail {
  project_id: string
  contact_id: string
  contact_email: string
  contact_name: string
  subject: string
  body: string
  status: 'pending' | 'approved' | 'skipped' | 'edited'
  originalSubject?: string
  originalBody?: string
  vertical_intelligence?: {
    vertical: string
    role: string | null
    psychology?: {
      targetFear: string
      wedgeQuestion: string | null
    }
    cheatCode: string
  }
  project?: {
    project_name: string
    city: string
    state: string
  }
}

interface ProjectForSelection {
  id: string
  project_name: string
  city: string
  state: string
  total_score: number | null
  project_type: string[]
  has_contacts: boolean
}

function CampaignsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Workflow state
  const [step, setStep] = useState<WorkflowStep>('select')
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([])
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  // Data
  const [projects, setProjects] = useState<ProjectForSelection[]>([])
  const [sentEmailsStats, setSentEmailsStats] = useState({ total: 0, opened: 0, clicked: 0 })

  // Fetch projects with contacts
  const fetchProjectsWithContacts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get projects
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, project_name, city, state, total_score, project_type, raw_data')
        .order('total_score', { ascending: false, nullsFirst: false })
        .limit(200)

      if (projectError) throw projectError

      // Get all project IDs that have contacts linked via project_stakeholders
      const { data: stakeholdersData } = await supabase
        .from('project_stakeholders')
        .select('project_id, contact_id')
        .not('contact_id', 'is', null)
        .not('project_id', 'is', null)

      // Build a set of project IDs that have linked contacts
      const projectsWithLinkedContacts = new Set(
        (stakeholdersData || []).map(s => s.project_id).filter(Boolean)
      )

      // Filter to projects that have contacts (either in raw_data OR in contacts table)
      const projectsWithContacts = (projectData || []).map(p => {
        const rawData = p.raw_data as Record<string, any> | null
        const rawContacts = rawData?.original?.contacts || []
        const hasEmbeddedContacts = rawContacts.length > 0
        const hasLinkedContacts = projectsWithLinkedContacts.has(p.id)

        return {
          id: p.id,
          project_name: p.project_name,
          city: p.city || '',
          state: p.state || '',
          total_score: p.total_score,
          project_type: p.project_type || [],
          has_contacts: hasEmbeddedContacts || hasLinkedContacts
        }
      }).filter(p => p.has_contacts)

      setProjects(projectsWithContacts)

      // Fetch sent emails stats
      const orgId = process.env.NEXT_PUBLIC_ORGANIZATION_ID || '34249404-774f-4b80-b346-a2d9e6322584'
      const { data: emailStats } = await supabase
        .from('outreach_activities')
        .select('status')
        .eq('organization_id', orgId)
        .eq('activity_type', 'email')
        .in('status', ['sent', 'delivered', 'opened', 'clicked'])

      if (emailStats) {
        setSentEmailsStats({
          total: emailStats.length,
          opened: emailStats.filter(e => e.status === 'opened' || e.status === 'clicked').length,
          clicked: emailStats.filter(e => e.status === 'clicked').length,
        })
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjectsWithContacts()
  }, [fetchProjectsWithContacts])

  // Check for pre-selected projects from URL
  useEffect(() => {
    const projectIdsParam = searchParams.get('projectIds')
    if (projectIdsParam) {
      const ids = projectIdsParam.split(',')
      setSelectedProjectIds(new Set(ids))
    }
  }, [searchParams])

  // Generate emails for selected projects
  const handleGenerate = async () => {
    if (selectedProjectIds.size === 0) {
      toast.error('Please select at least one project')
      return
    }

    setGenerating(true)
    setStep('generate')

    try {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: Array.from(selectedProjectIds),
          useAI: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate emails')
      }

      // Map generated messages to our format
      const emails: GeneratedEmail[] = data.messages.map((msg: any) => ({
        project_id: msg.project_id,
        contact_id: msg.contact_id,
        contact_email: msg.contact_email,
        contact_name: msg.contact_name,
        subject: msg.subject,
        body: msg.body,
        status: 'pending',
        originalSubject: msg.subject,
        originalBody: msg.body,
        vertical_intelligence: msg.vertical_intelligence,
        project: projects.find(p => p.id === msg.project_id),
      }))

      setGeneratedEmails(emails)
      setCurrentEmailIndex(0)
      setStep('review')

      toast.success(`Generated ${emails.length} email(s)`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate emails')
      setStep('select')
    } finally {
      setGenerating(false)
    }
  }

  // Email review actions
  const currentEmail = generatedEmails[currentEmailIndex]

  const handleApprove = () => {
    setGeneratedEmails(prev => prev.map((email, idx) =>
      idx === currentEmailIndex ? { ...email, status: 'approved' } : email
    ))
    goToNext()
  }

  const handleSkip = () => {
    setGeneratedEmails(prev => prev.map((email, idx) =>
      idx === currentEmailIndex ? { ...email, status: 'skipped' } : email
    ))
    goToNext()
  }

  const handleStartEdit = () => {
    setEditedSubject(currentEmail.subject)
    setEditedBody(currentEmail.body)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setGeneratedEmails(prev => prev.map((email, idx) =>
      idx === currentEmailIndex
        ? { ...email, subject: editedSubject, body: editedBody, status: 'edited' }
        : email
    ))
    setIsEditing(false)
    goToNext()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const goToNext = () => {
    if (currentEmailIndex < generatedEmails.length - 1) {
      setCurrentEmailIndex(prev => prev + 1)
    } else {
      setStep('send')
    }
  }

  const goToPrevious = () => {
    if (currentEmailIndex > 0) {
      setCurrentEmailIndex(prev => prev - 1)
    }
  }

  // Send approved emails
  const handleSendApproved = async () => {
    const approvedEmails = generatedEmails.filter(e => e.status === 'approved' || e.status === 'edited')

    if (approvedEmails.length === 0) {
      toast.error('No approved emails to send')
      return
    }

    setSending(true)
    let sent = 0
    let failed = 0

    for (const email of approvedEmails) {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactIds: [email.contact_id],
            subject: email.subject,
            message: email.body,
            projectId: email.project_id,
          }),
        })

        if (response.ok) {
          sent++
        } else {
          failed++
        }
      } catch (error) {
        failed++
      }
    }

    setSending(false)

    if (sent > 0) {
      toast.success(`Sent ${sent} email(s)${failed > 0 ? `, ${failed} failed` : ''}`)
    } else {
      toast.error('Failed to send emails')
    }

    // Reset workflow
    setStep('select')
    setSelectedProjectIds(new Set())
    setGeneratedEmails([])
    setCurrentEmailIndex(0)
    fetchProjectsWithContacts()
  }

  // Toggle project selection
  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Stats for send step
  const approvedCount = generatedEmails.filter(e => e.status === 'approved' || e.status === 'edited').length
  const skippedCount = generatedEmails.filter(e => e.status === 'skipped').length
  const pendingCount = generatedEmails.filter(e => e.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Generate and send personalized NEPQ emails with human review
          </p>
        </div>

        {step !== 'select' && (
          <Button
            variant="outline"
            onClick={() => {
              setStep('select')
              setGeneratedEmails([])
              setCurrentEmailIndex(0)
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Workflow Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              step === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
              Select Projects
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              step === 'generate' ? 'bg-primary text-primary-foreground' :
                step === 'review' || step === 'send' ? 'bg-green-100 text-green-700' :
                  'bg-muted text-muted-foreground'
            )}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
              Generate
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              step === 'review' ? 'bg-primary text-primary-foreground' :
                step === 'send' ? 'bg-green-100 text-green-700' :
                  'bg-muted text-muted-foreground'
            )}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
              Review & Edit
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              step === 'send' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">4</span>
              Send
            </div>
          </div>
        </div>
      </Card>

      {/* Email Stats (always visible) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Sent</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{sentEmailsStats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Opened</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{sentEmailsStats.opened}</div>
          <div className="text-xs text-muted-foreground">
            {sentEmailsStats.total > 0 ? Math.round((sentEmailsStats.opened / sentEmailsStats.total) * 100) : 0}% rate
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Clicked</span>
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">{sentEmailsStats.clicked}</div>
          <div className="text-xs text-muted-foreground">
            {sentEmailsStats.total > 0 ? Math.round((sentEmailsStats.clicked / sentEmailsStats.total) * 100) : 0}% rate
          </div>
        </Card>
      </div>

      {/* Step 1: Select Projects */}
      {step === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Projects for Outreach</CardTitle>
            <CardDescription>
              Choose projects with contacts to generate personalized NEPQ emails.
              {selectedProjectIds.size > 0 && (
                <span className="ml-2 font-medium text-primary">
                  {selectedProjectIds.size} selected
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects with contacts available</p>
                <p className="text-sm mt-2">Import projects with contacts to start outreach</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedProjectIds.has(project.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => toggleProject(project.id)}
                    >
                      <Checkbox
                        checked={selectedProjectIds.has(project.id)}
                        onCheckedChange={() => toggleProject(project.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{project.project_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.city}, {project.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.project_type.slice(0, 1).map((type, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs"
                          >
                            {type}
                          </span>
                        ))}
                        {project.total_score !== null && (
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            project.total_score >= 90 ? 'bg-green-100 text-green-700' :
                              project.total_score >= 80 ? 'bg-orange-100 text-orange-700' :
                                project.total_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                          )}>
                            {project.total_score}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleGenerate}
                    disabled={selectedProjectIds.size === 0}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate {selectedProjectIds.size > 0 ? `${selectedProjectIds.size} Email(s)` : 'Emails'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generating */}
      {step === 'generate' && generating && (
        <Card className="p-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Generating NEPQ Emails</h3>
            <p className="text-muted-foreground">
              Using AI to craft personalized psychology-driven emails...
            </p>
          </div>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 'review' && currentEmail && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Email Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Review Email {currentEmailIndex + 1} of {generatedEmails.length}</CardTitle>
                    <CardDescription>
                      To: {currentEmail.contact_name} ({currentEmail.contact_email})
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevious}
                      disabled={currentEmailIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentEmailIndex + 1} / {generatedEmails.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNext}
                      disabled={currentEmailIndex === generatedEmails.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subject</label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Message</label>
                      <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit}>
                        <Save className="mr-2 h-4 w-4" />
                        Save & Approve
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Subject:</div>
                      <div className="font-medium">{currentEmail.subject}</div>
                    </div>
                    {currentEmail.body.includes('<!DOCTYPE html>') ? (
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <iframe
                          srcDoc={currentEmail.body}
                          className="w-full h-[800px] border-0 bg-white"
                          title="Email Preview"
                        />
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-white">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {currentEmail.body}
                        </pre>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button variant="outline" onClick={handleSkip}>
                        <X className="mr-2 h-4 w-4" />
                        Skip
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleStartEdit}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button onClick={handleApprove}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {currentEmail.project && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Project</div>
                    <div className="font-medium">{currentEmail.project.project_name}</div>
                    <div className="text-muted-foreground">
                      {currentEmail.project.city}, {currentEmail.project.state}
                    </div>
                  </div>
                )}

                {currentEmail.vertical_intelligence && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Vertical</div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                        {currentEmail.vertical_intelligence.vertical}
                      </span>
                    </div>

                    {currentEmail.vertical_intelligence.role && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Target Role</div>
                        <div className="font-medium capitalize">
                          {currentEmail.vertical_intelligence.role.replace('_', ' ')}
                        </div>
                      </div>
                    )}

                    {currentEmail.vertical_intelligence.psychology?.targetFear && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Target Fear</div>
                        <div className="text-orange-700 bg-orange-50 p-2 rounded text-xs">
                          {currentEmail.vertical_intelligence.psychology.targetFear}
                        </div>
                      </div>
                    )}

                    {currentEmail.vertical_intelligence.psychology?.wedgeQuestion && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Wedge Question</div>
                        <div className="text-blue-700 bg-blue-50 p-2 rounded text-xs italic">
                          &ldquo;{currentEmail.vertical_intelligence.psychology.wedgeQuestion}&rdquo;
                        </div>
                      </div>
                    )}

                    {currentEmail.vertical_intelligence.cheatCode && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">NEPQ Cheat Code</div>
                        <div className="text-green-700 bg-green-50 p-2 rounded text-xs">
                          {currentEmail.vertical_intelligence.cheatCode}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Review Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Approved
                  </span>
                  <span className="font-medium">{approvedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Skipped
                  </span>
                  <span className="font-medium">{skippedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 flex items-center gap-1">
                    <Edit3 className="h-3 w-3" />
                    Pending
                  </span>
                  <span className="font-medium">{pendingCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 4: Send */}
      {step === 'send' && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Send</CardTitle>
            <CardDescription>
              Review your approved emails before sending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="p-4 border-green-200 bg-green-50">
                <div className="text-sm text-green-700 mb-1">Approved</div>
                <div className="text-3xl font-bold text-green-700">{approvedCount}</div>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="text-sm text-muted-foreground mb-1">Skipped</div>
                <div className="text-3xl font-bold text-muted-foreground">{skippedCount}</div>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="text-sm text-muted-foreground mb-1">Total Generated</div>
                <div className="text-3xl font-bold">{generatedEmails.length}</div>
              </Card>
            </div>

            {approvedCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>No emails approved for sending</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setStep('review')
                    setCurrentEmailIndex(0)
                  }}
                >
                  Go Back to Review
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                  {generatedEmails
                    .filter(e => e.status === 'approved' || e.status === 'edited')
                    .map((email, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{email.contact_name}</div>
                          <div className="text-sm text-muted-foreground truncate">{email.subject}</div>
                        </div>
                        {email.status === 'edited' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                            Edited
                          </span>
                        )}
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('review')
                      setCurrentEmailIndex(0)
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Review
                  </Button>
                  <Button
                    onClick={handleSendApproved}
                    disabled={sending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send {approvedCount} Email{approvedCount !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <CampaignsPageContent />
    </Suspense>
  )
}
