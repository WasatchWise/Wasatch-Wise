'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
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
  RefreshCw,
  Download,
  Mail,
  Phone,
  UserPlus,
  Building2,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  id: string
  first_name: string
  last_name: string
  title: string | null
  email: string | null
  phone: string | null
  project_ids: string[]
  project_names: string[]
  project_count: number
  last_seen: string
  response_status?: string | null
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contacts')
      const data = await res.json()
      setContacts(data.contacts || [])
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = useMemo(() => {
    if (!filter) return contacts
    const searchLower = filter.toLowerCase()
    return contacts.filter(c =>
      c.first_name?.toLowerCase().includes(searchLower) ||
      c.last_name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.title?.toLowerCase().includes(searchLower)
    )
  }, [contacts, filter])

  const stats = useMemo(() => {
    const withProjects = contacts.filter(c => c.project_count > 0).length
    const withEmail = contacts.filter(c => c.email).length
    const withPhone = contacts.filter(c => c.phone).length
    const withTitle = contacts.filter(c => c.title).length

    return { 
      total: contacts.length, 
      withProjects, 
      withEmail, 
      withPhone, 
      withTitle 
    }
  }, [contacts])


  const handleExport = () => {
    const csv = [
      ['First Name', 'Last Name', 'Title', 'Email', 'Phone', 'Projects'].join(','),
      ...contacts.map(c => [
        c.first_name,
        c.last_name,
        c.title || '',
        c.email || '',
        c.phone || '',
        c.project_count || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    a.click()
    toast.success('Contacts exported!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Contacts extracted from your projects
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchContacts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Contacts</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">With Projects</div>
          <div className="text-2xl font-bold">{stats.withProjects}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">With Email</div>
          <div className="text-2xl font-bold">{stats.withEmail}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">With Phone</div>
          <div className="text-2xl font-bold">{stats.withPhone}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">With Title</div>
          <div className="text-2xl font-bold">{stats.withTitle}</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <input
          type="text"
          placeholder="Search contacts by name, email, or title..."
          className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Card>

      {/* Contacts Table */}
      <Card>
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading contacts...
                </TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contacts found. Add contacts to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => {
                const displayName = `${contact.first_name} ${contact.last_name}`.trim() || contact.email || 'Unknown'
                return (
                  <TableRow 
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/contacts/${encodeURIComponent(contact.id)}`)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {displayName}
                        </div>
                        {contact.email && (
                          <div className="text-xs text-muted-foreground">
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {contact.title || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {contact.project_count > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/contacts/${encodeURIComponent(contact.id)}`)
                          }}
                        >
                          <Building2 className="h-4 w-4" />
                          <span>{contact.project_count}</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">No projects</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.last_seen).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {contact.email && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `mailto:${contact.email}`
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.phone && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `tel:${contact.phone}`
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
