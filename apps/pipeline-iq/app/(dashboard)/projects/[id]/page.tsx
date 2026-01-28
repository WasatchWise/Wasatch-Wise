'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Users,
  Play,
  Brain,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { NEPQCoach } from '@/components/nepq/NEPQCoach'
import { LogCallModal } from '@/components/dashboard/LogCallModal'
import { PsychologyScoreCard } from '@/components/psychology/PsychologyScoreCard'

interface Project {
  id: string
  project_name: string
  project_type: string[]
  project_stage: string
  project_value: number
  city: string
  state: string
  address?: string
  units_count?: number
  project_size_sqft?: number
  estimated_start_date?: string
  groove_fit_score: number
  engagement_score?: number
  timing_score?: number
  total_score?: number
  priority_level: string
  outreach_status: string
  raw_data?: any
  services_needed?: string[]
  notes?: string
  created_at: string
  updated_at: string
  scraped_at?: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [enriching, setEnriching] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [proposals, setProposals] = useState<any[]>([])
  const [showCallModal, setShowCallModal] = useState(false)
  const [calling, setCalling] = useState(false)

  const projectId = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects?id=${projectId}`)
      const data = await response.json()
      
      if (data.projects && data.projects.length > 0) {
        setProject(data.projects[0])
      }

      // Fetch meetings
      const meetingsResponse = await fetch(`/api/projects/${projectId}/meetings`)
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setMeetings(meetingsData.meetings || [])
      }

      // Fetch proposals
      const proposalsResponse = await fetch(`/api/projects/${projectId}/proposals`)
      if (proposalsResponse.ok) {
        const proposalsData = await proposalsResponse.json()
        setProposals(proposalsData.proposals || [])
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    fetchProject()
  }, [projectId, fetchProject])

  const handleEnrich = async () => {
    try {
      setEnriching(true)
      toast.info('Enriching project with AI...')
      
      const response = await fetch(`/api/projects/${projectId}/enrich`, {
        method: 'POST',
        headers: {
          'x-organization-id': process.env.NEXT_PUBLIC_ORGANIZATION_ID || '',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Enrichment failed')
      }

      const data = await response.json()
      setProject(data.project)
      toast.success('Project enriched successfully!')
    } catch (error: any) {
      console.error('Enrichment error:', error)
      toast.error(error.message || 'Failed to enrich project')
    } finally {
      setEnriching(false)
    }
  }

  const [emailLoading, setEmailLoading] = useState(false)
  const [quickEmail, setQuickEmail] = useState<any>(null)

  const handleSendEmail = async () => {
    setEmailLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/quick-email`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate email')
      }
      
      const emailData = await response.json()
      setQuickEmail(emailData)
      
      // Open Gmail compose in new tab
      window.open(emailData.gmailUrl, '_blank')
      
      toast.success('Email opened in Gmail! Review and send when ready.')
    } catch (error: any) {
      console.error('Error generating email:', error)
      toast.error(error.message || 'Failed to generate email')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleMarkEmailSent = async () => {
    if (!quickEmail?.trackingId) return
    
    try {
      // Update outreach activity status to 'sent'
      const response = await fetch(`/api/outreach-activities/${quickEmail.trackingId}/mark-sent`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Email marked as sent! We\'ll track opens and clicks.')
        setQuickEmail(null)
        fetchProject() // Refresh project data
      }
    } catch (error) {
      console.error('Error marking email as sent:', error)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Project not found</p>
          <Button onClick={() => router.push('/projects')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const enrichment = project.raw_data?.enrichment
  const isEnriched = !!enrichment

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <p className="text-muted-foreground mt-1">
              {project.city}, {project.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEnrich}
            disabled={enriching}
            variant="outline"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {enriching ? 'Enriching...' : isEnriched ? 'Re-Enrich' : 'Enrich with AI'}
          </Button>
          <Button 
            onClick={handleSendEmail}
            disabled={emailLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            {emailLoading ? 'Generating Email...' : 'Quick Email (Gmail)'}
          </Button>
          {quickEmail && (
            <Button 
              onClick={handleMarkEmailSent}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              I Sent This Email
            </Button>
          )}
        </div>
      </div>


      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Groove Fit Score</p>
              <p className="text-3xl font-bold mt-1">{project.groove_fit_score}</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${
              project.groove_fit_score >= 80 ? 'text-green-500' :
              project.groove_fit_score >= 60 ? 'text-yellow-500' :
              'text-gray-400'
            }`} />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  project.groove_fit_score >= 80 ? 'bg-green-500' :
                  project.groove_fit_score >= 60 ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${project.groove_fit_score}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Project Value</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(project.project_value)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {project.units_count && `${project.units_count} units`}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stage</p>
              <p className="text-xl font-semibold mt-1 capitalize">
                {project.project_stage.replace(/_/g, ' ')}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {project.estimated_start_date
              ? `Starts ${formatDate(project.estimated_start_date)}`
              : 'Timeline TBD'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <p className="text-xl font-semibold mt-1 capitalize">
                {project.priority_level}
              </p>
            </div>
            <Building2 className={`h-8 w-8 ${
              project.priority_level === 'hot' ? 'text-red-500' :
              project.priority_level === 'warm' ? 'text-orange-500' :
              'text-blue-500'
            }`} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Status: {project.outreach_status}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <div className="flex gap-2 mt-1">
                    {project.project_type.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.address || `${project.city}, ${project.state}`}
                  </p>
                </div>
              </div>

              {project.project_size_sqft && (
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium mt-1">
                    {project.project_size_sqft.toLocaleString()} sq ft
                  </p>
                </div>
              )}

              {project.services_needed && project.services_needed.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Services Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {project.services_needed.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {service.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{project.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Proposals */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Proposals
            </h2>
            {proposals.length > 0 ? (
              <div className="space-y-3">
                {proposals.map((proposal: any) => (
                  <div key={proposal.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {formatDate(proposal.activity_date)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Value: {formatCurrency(proposal.metadata?.proposal_value || 0)}
                        </p>
                        {proposal.metadata?.services && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proposal.metadata.services.slice(0, 3).map((service: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                              >
                                {service}
                              </span>
                            ))}
                            {proposal.metadata.services.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{proposal.metadata.services.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No proposals yet. Create one after a meeting.
              </p>
            )}
          </Card>

          {/* AI Enrichment */}
          {isEnriched && (
            <>
              {enrichment.ai_insights && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                    AI Insights
                  </h2>
                  <div className="space-y-4">
                    {enrichment.ai_insights.strategic_fit && (
                      <div>
                        <p className="font-medium text-sm">Strategic Fit</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrichment.ai_insights.strategic_fit}
                        </p>
                      </div>
                    )}
                    {enrichment.ai_insights.recommended_approach && (
                      <div>
                        <p className="font-medium text-sm">Recommended Approach</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrichment.ai_insights.recommended_approach}
                        </p>
                      </div>
                    )}
                    {enrichment.ai_insights.close_probability && (
                      <div>
                        <p className="font-medium text-sm">Close Probability</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrichment.ai_insights.close_probability}%
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {enrichment.location_data && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                    Location Intelligence
                  </h2>
                  <div className="space-y-2 text-sm">
                    {enrichment.location_data.formatted_address && (
                      <p>{enrichment.location_data.formatted_address}</p>
                    )}
                    {enrichment.location_data.rating && (
                      <p>Rating: {enrichment.location_data.rating} ⭐</p>
                    )}
                  </div>
                </Card>
              )}

              {enrichment.developer_videos?.videos?.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Play className="mr-2 h-5 w-5 text-red-500" />
                    Related Videos
                  </h2>
                  <div className="space-y-3">
                    {enrichment.developer_videos.videos.slice(0, 3).map((video: any, i: number) => (
                      <a
                        key={i}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors"
                      >
                        <Play className="h-4 w-4 mt-1 text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{video.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {video.channelTitle}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {!isEnriched && (
            <Card className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unlock AI Insights</h3>
              <p className="text-muted-foreground mb-4">
                Enrich this project with AI to get strategic insights, location intelligence,
                competitive analysis, and more.
              </p>
              <Button onClick={handleEnrich} disabled={enriching}>
                <Sparkles className="mr-2 h-4 w-4" />
                {enriching ? 'Enriching...' : 'Enrich with AI'}
              </Button>
            </Card>
          )}

          {/* Psychology Score - Behavioral Science Analysis */}
          <PsychologyScoreCard projectId={project.id} />

          {/* NEPQ Sales Coach */}
          <NEPQCoach
            projectName={project.project_name}
            projectType={project.project_type}
            projectStage={project.project_stage}
            servicesNeeded={project.services_needed}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contacts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Contacts
            </h2>
            {project.raw_data?.original?.contacts?.length > 0 ? (
              <div className="space-y-3">
                {project.raw_data.original.contacts.map((contact: any, i: number) => {
                  const contactName = contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  const contactPhone = contact.phone
                  
                  return (
                    <div key={i} className="p-3 bg-gray-50 rounded">
                      <p className="font-medium text-sm">{contactName}</p>
                      {contact.title && (
                        <p className="text-xs text-muted-foreground">{contact.title}</p>
                      )}
                      {contact.email && (
                        <p className="text-xs text-muted-foreground mt-1">{contact.email}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {contactPhone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowCallModal(true)
                            }}
                            className="flex-1"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        )}
                        {contact.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `mailto:${contact.email}`}
                            className="flex-1"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contacts available</p>
            )}
          </Card>

          {/* Call Modal */}
          {showCallModal && (
            <LogCallModal
              open={showCallModal}
              onOpenChange={setShowCallModal}
              projectId={project.id}
              projectTitle={project.project_name}
              onSuccess={fetchProject}
              {...({ contactId: project.raw_data?.original?.contacts?.[0]?.id } as any)}
            />
          )}

          {/* Meetings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Meetings
            </h2>
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meeting: any) => {
                  const meetingDate = new Date(meeting.activity_date)
                  const meetingPassed = meetingDate < new Date()
                  const outcome = meeting.metadata?.outcome

                  return (
                    <div key={meeting.id} className="space-y-2">
                      <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">
                            {meeting.metadata?.meeting_type || 'Meeting'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(meeting.activity_date)}
                          </p>
                          {meeting.metadata?.attendees?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Attendees: {meeting.metadata.attendees.join(', ')}
                            </p>
                          )}
                          {outcome && (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                              outcome === 'interested' || outcome === 'proposal_sent'
                                ? 'bg-green-100 text-green-700'
                                : outcome === 'not_interested'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {outcome.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No meetings scheduled</p>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-3 text-sm">
              {project.scraped_at && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <div>
                    <p className="font-medium">Project Scraped</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.scraped_at)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                <div>
                  <p className="font-medium">Project Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.created_at)}
                  </p>
                </div>
              </div>
              {project.updated_at !== project.created_at && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">
                  {project.raw_data?.original ? 'Construction Wire' : 'Manual Entry'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engagement Score</span>
                <span className="font-medium">{project.engagement_score || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timing Score</span>
                <span className="font-medium">{project.timing_score || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Score</span>
                <span className="font-medium font-bold">{project.total_score || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

