import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

interface ExtractedContact {
  id: string // email-based ID for deduplication
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  title: string | null
  project_ids: string[]
  project_names: string[]
  project_count: number
  last_seen: string // most recent project created_at
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch all projects with raw_data
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_name, created_at, raw_data')
      .not('raw_data', 'is', null)
      .order('created_at', { ascending: false })

    if (projectsError) {
      logger.error('Failed to fetch projects', { error: projectsError.message })
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    // Extract contacts from project raw_data
    const contactMap = new Map<string, ExtractedContact>()

    for (const project of projects || []) {
      const rawData = project.raw_data as any
      const rawContacts = rawData?.original?.contacts || []
      
      for (const rawContact of rawContacts) {
        const email = rawContact.email?.toLowerCase().trim()
        if (!email) continue // Skip contacts without email

        // Use email as unique identifier
        const contactId = email

        if (contactMap.has(contactId)) {
          // Update existing contact
          const existing = contactMap.get(contactId)!
          if (!existing.project_ids.includes(project.id)) {
            existing.project_ids.push(project.id)
            existing.project_names.push(project.project_name)
            existing.project_count++
            // Update last_seen if this project is newer
            if (project.created_at && existing.last_seen) {
              if (new Date(project.created_at) > new Date(existing.last_seen)) {
                existing.last_seen = project.created_at
              }
            } else if (project.created_at) {
              existing.last_seen = project.created_at
            }
          }
        } else {
          // Create new contact
          const nameParts = (rawContact.name || `${rawContact.first_name || ''} ${rawContact.last_name || ''}`).trim().split(' ')
          contactMap.set(contactId, {
            id: contactId,
            first_name: rawContact.first_name || nameParts[0] || '',
            last_name: rawContact.last_name || nameParts.slice(1).join(' ') || '',
            email: email,
            phone: rawContact.phone || null,
            title: rawContact.title || null,
            project_ids: [project.id],
            project_names: [project.project_name],
            project_count: 1,
            last_seen: project.created_at || new Date().toISOString(),
          })
        }
      }
    }

    // Also fetch saved contacts from contacts table
    const { data: savedContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!contactsError && savedContacts) {
      for (const savedContact of savedContacts) {
        const email = savedContact.email?.toLowerCase().trim()
        if (!email) continue

        if (contactMap.has(email)) {
          // Merge saved contact data (prefer saved data for name/title)
          const existing = contactMap.get(email)!
          if (existing) {
            existing.first_name = savedContact.first_name || existing.first_name
            existing.last_name = savedContact.last_name || existing.last_name
            existing.title = savedContact.title || existing.title
            existing.phone = savedContact.phone || savedContact.mobile || existing.phone
          }
        } else {
          // Add saved contact that's not in projects
          contactMap.set(email, {
            id: email,
            first_name: savedContact.first_name || '',
            last_name: savedContact.last_name || '',
            email: email,
            phone: savedContact.phone || savedContact.mobile || null,
            title: savedContact.title || null,
            project_ids: [],
            project_names: [],
            project_count: 0,
            last_seen: (savedContact.created_at as string) || new Date().toISOString(),
          })
        }
      }
    }

    // Convert to array and sort by project_count (most projects first)
    const contacts = Array.from(contactMap.values())
      .sort((a, b) => {
        // Sort by project count (desc), then by last_seen (desc)
        if (b.project_count !== a.project_count) {
          return b.project_count - a.project_count
        }
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
      })

    return NextResponse.json({ 
      contacts, 
      count: contacts.length,
      totalProjects: projects?.length || 0
    })
  } catch (error) {
    logger.error('Contacts API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...body,
        organization_id: process.env.ORGANIZATION_ID,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create contact', { error: error.message })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contact: data }, { status: 201 })
  } catch (error) {
    logger.error('Contacts API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
