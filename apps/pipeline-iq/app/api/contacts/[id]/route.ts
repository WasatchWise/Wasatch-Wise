import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const contactEmail = decodeURIComponent(params.id) // ID is email-based

    // Fetch all projects and extract this contact
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_name, created_at, raw_data')
      .not('raw_data', 'is', null)
      .order('created_at', { ascending: false })

    if (projectsError) {
      logger.error('Failed to fetch projects', { error: projectsError.message })
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    // Find contact in projects
    let contact: any = null
    const projectIds: string[] = []
    const projectNames: string[] = []

    for (const project of projects || []) {
      const rawData = project.raw_data as any
      const rawContacts = rawData?.original?.contacts || []
      const foundContact = rawContacts.find((c: any) => 
        c.email?.toLowerCase().trim() === contactEmail.toLowerCase()
      )

      if (foundContact) {
        if (!contact) {
          const nameParts = (foundContact.name || `${foundContact.first_name || ''} ${foundContact.last_name || ''}`).trim().split(' ')
          contact = {
            id: contactEmail,
            first_name: foundContact.first_name || nameParts[0] || '',
            last_name: foundContact.last_name || nameParts.slice(1).join(' ') || '',
            email: contactEmail,
            phone: foundContact.phone || null,
            title: foundContact.title || null,
          }
        }
        projectIds.push(project.id)
        projectNames.push(project.project_name)
      }
    }

    // Also check saved contacts table
    if (!contact) {
      const { data: savedContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', contactEmail)
        .single()

      if (savedContact) {
        contact = {
          id: contactEmail,
          first_name: savedContact.first_name || '',
          last_name: savedContact.last_name || '',
          email: savedContact.email,
          phone: savedContact.phone || savedContact.mobile || null,
          title: savedContact.title || null,
        }
      }
    }

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      contact: {
        ...contact,
        project_ids: projectIds,
        project_names: projectNames,
        project_count: projectIds.length,
      }
    })
  } catch (error) {
    logger.error('Contact API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

