'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mail, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  title: string | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  message: string
}

interface SendEmailDialogProps {
  projectId?: string
  projectName?: string
  projectType?: string
  city?: string
  state?: string
  contacts?: Contact[]
  trigger?: React.ReactNode
}

export function SendEmailDialog({
  projectId,
  projectName = '',
  projectType = '',
  city = '',
  state = '',
  contacts = [],
  trigger,
}: SendEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      // Load email templates
      fetch('/api/send-email')
        .then(res => res.json())
        .then(data => {
          setTemplates(data.templates || [])
        })
        .catch(console.error)

      // Pre-select all contacts
      setSelectedContacts(contacts.map(c => c.id))
    }
  }, [open, contacts])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)

      // Replace placeholders with actual values
      let sub = template.subject
        .replace('{{project_name}}', projectName)
        .replace('{{city}}', city)
        .replace('{{state}}', state)
        .replace('{{project_type}}', projectType)

      let msg = template.message
        .replace('{{project_name}}', projectName)
        .replace('{{city}}', city)
        .replace('{{state}}', state)
        .replace('{{project_type}}', projectType)

      setSubject(sub)
      setMessage(msg)
    }
  }

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact')
      return
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter subject and message')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContacts,
          subject,
          message,
          projectId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Successfully sent ${result.sent} email(s)!`)
        if (result.failed > 0) {
          toast.warning(`${result.failed} email(s) failed to send`)
        }
        setOpen(false)

        // Reset form
        setSubject('')
        setMessage('')
        setSelectedTemplate('')
      } else {
        toast.error(result.error || 'Failed to send emails')
      }
    } catch (error: any) {
      toast.error('Error sending emails: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const validContacts = contacts.filter(c => c.email)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button disabled={validContacts.length === 0}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email Template</label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
            >
              <option value="">Select a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Recipients ({validContacts.length} contact{validContacts.length !== 1 ? 's' : ''})
            </label>
            <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
              {validContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts with email addresses</p>
              ) : (
                validContacts.map(contact => (
                  <label key={contact.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts([...selectedContacts, contact.id])
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {contact.first_name} {contact.last_name} ({contact.email})
                      {contact.title && <span className="text-muted-foreground ml-1">- {contact.title}</span>}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <input
              type="text"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <textarea
              className="w-full min-h-[300px] rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Email message... You can use {{first_name}}, {{last_name}}, {{full_name}}, {{title}}"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available placeholders: {'{{first_name}}'}, {'{{last_name}}'}, {'{{full_name}}'}, {'{{title}}'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || validContacts.length === 0}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
