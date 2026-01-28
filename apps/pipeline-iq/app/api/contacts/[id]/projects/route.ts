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

    // Fetch projects that contain this contact in raw_data
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_name, project_type, project_stage, city, state, total_score, outreach_status, project_value, units_count, created_at, raw_data')
      .not('raw_data', 'is', null)
      .order('created_at', { ascending: false })

    if (projectsError) {
      logger.error('Failed to fetch projects', { error: projectsError.message })
      return NextResponse.json({ error: projectsError.message }, { status: 500 })
    }

    // Filter projects that contain this contact
    const matchingProjects = (projects || []).filter((project: any) => {
      const rawContacts = project.raw_data?.original?.contacts || []
      return rawContacts.some((c: any) => 
        c.email?.toLowerCase().trim() === contactEmail.toLowerCase()
      )
    })

    // Return matching projects (remove raw_data from response)
    const allProjects = matchingProjects.map((project: any) => {
      const { raw_data, ...projectData } = project
      return projectData
    })

    return NextResponse.json({ 
      projects: allProjects,
      count: allProjects.length 
    })
  } catch (error) {
    logger.error('Contact projects API error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
