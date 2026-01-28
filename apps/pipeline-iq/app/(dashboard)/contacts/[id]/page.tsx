'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  Building2,
  MapPin,
  User,
  Briefcase,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Contact {
  id: string
  first_name: string
  last_name: string
  title: string | null
  role_category: string | null
  decision_level: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  linkedin_url: string | null
  email_verified: boolean
  phone_verified: boolean
  last_contacted: string | null
  contact_count: number
  response_status: string
  created_at: string
}

interface Project {
  id: string
  project_name: string
  project_type?: string[] | null
  project_stage?: string | null
  city?: string | null
  state?: string | null
  total_score?: number | null
  outreach_status?: string | null
  project_value?: number | null
  units_count?: number | null
  role_in_project?: string | null
  is_primary?: boolean | null
}

export default function ContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const contactId = decodeURIComponent(params.id as string) // Decode email-based ID

  const [contact, setContact] = useState<Contact | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`/api/contacts/${contactId}`)
        if (!res.ok) throw new Error('Failed to fetch contact')
        const data = await res.json()
        setContact(data.contact)
      } catch (err) {
        console.error('Failed to fetch contact:', err)
        toast.error('Failed to load contact')
        router.push('/contacts')
      } finally {
        setLoading(false)
      }
    }

    const fetchProjects = async () => {
      setProjectsLoading(true)
      try {
        const res = await fetch(`/api/contacts/${contactId}/projects`)
        if (!res.ok) throw new Error('Failed to fetch projects')
        const data = await res.json()
        setProjects(data.projects || [])
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        toast.error('Failed to load projects')
      } finally {
        setProjectsLoading(false)
      }
    }

    if (contactId) {
      fetchContact()
      fetchProjects()
    }
  }, [contactId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contact) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/contacts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-muted-foreground">
              {contact.title || 'No title'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div className="font-medium">
                  {contact.first_name} {contact.last_name}
                </div>
              </div>
            </div>

            {contact.title && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-medium">{contact.title}</div>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.email}</span>
                    {contact.email_verified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.phone}</span>
                    {contact.phone_verified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {contact.linkedin_url && (
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">LinkedIn</div>
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Decision Level</div>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                contact.decision_level === 'executive'
                  ? 'bg-purple-100 text-purple-700'
                  : contact.decision_level === 'director'
                  ? 'bg-blue-100 text-blue-700'
                  : contact.decision_level === 'manager'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {contact.decision_level || 'unknown'}
              </span>
            </div>

            {contact.role_category && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Role Category</div>
                <div className="font-medium">{contact.role_category}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-1">Response Status</div>
              <div className="font-medium">{contact.response_status}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Contact Count</div>
              <div className="font-medium">{contact.contact_count} interactions</div>
            </div>

            {contact.last_contacted && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Last Contacted</div>
                <div className="font-medium">
                  {new Date(contact.last_contacted).toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Associated Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Associated Projects
          </CardTitle>
          <CardDescription>
            Projects where this contact is a stakeholder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects associated with this contact
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.project_name}
                    </TableCell>
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
                    <TableCell>
                      {project.city && project.state ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {project.city}, {project.state}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {project.role_in_project && (
                        <span className="text-sm">
                          {project.role_in_project}
                          {project.is_primary && (
                            <span className="ml-1 text-xs text-muted-foreground">(Primary)</span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{project.total_score ?? '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        project.outreach_status === 'new' && 'bg-gray-100 text-gray-700',
                        project.outreach_status === 'contacted' && 'bg-blue-100 text-blue-700',
                        project.outreach_status === 'qualified' && 'bg-green-100 text-green-700',
                        project.outreach_status === 'archived' && 'bg-red-100 text-red-700'
                      }`}>
                        {project.outreach_status || 'new'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

