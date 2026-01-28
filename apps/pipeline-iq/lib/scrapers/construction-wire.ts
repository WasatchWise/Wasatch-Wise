import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { calculateGrooveScore } from '@/lib/utils/scoring'

interface ScrapedProject {
  project_name: string
  project_type: string[]
  project_stage: string
  project_value?: number
  units_count?: number
  square_footage?: number
  city: string
  state: string
  address?: string
  latitude?: number
  longitude?: number
  estimated_start_date?: string
  estimated_completion_date?: string
  developer_name?: string
  architect_name?: string
  general_contractor?: string
  raw_data: any
}

export class ConstructionWireScraper {
  private baseUrl = 'https://www.constructionwire.com'
  private username: string
  private password: string
  private sessionCookie?: string
  private lastLoginError?: string

  constructor() {
    this.username = process.env.CONSTRUCTION_WIRE_USERNAME!
    this.password = process.env.CONSTRUCTION_WIRE_PASSWORD!
  }

  /**
   * Login to Construction Wire and get session cookie
   */
  async login(): Promise<boolean> {
    try {
      console.log('🔐 Logging into Construction Wire...')
      this.lastLoginError = undefined

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Many sites block non-browser requests; user-agent helps us distinguish WAF/anti-bot behavior.
          'User-Agent': 'Mozilla/5.0 (compatible; GrooveScraper/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body: new URLSearchParams({
          username: this.username,
          password: this.password,
        }),
        redirect: 'manual',
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || null
        const location = response.headers.get('location') || null
        const setCookieHeader = response.headers.get('set-cookie') || ''
        const setCookiePresent = !!setCookieHeader
        const setCookieLen = setCookieHeader.length
        const bodyText = await response.text().catch(() => '')
        const bodyHint = bodyText
          .replace(/\s+/g, ' ')
          .slice(0, 200)
        const isCloudflareBlock =
          response.status === 403 &&
          (bodyText.includes('Just a moment') ||
            bodyText.includes('/cdn-cgi/') ||
            bodyText.toLowerCase().includes('cloudflare'))
        if (isCloudflareBlock) {
          throw new Error(
            'Construction Wire blocked automated login (Cloudflare/anti-bot). Use the Puppeteer scraper or manual export/import.'
          )
        }
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }

      // Extract session cookie
      const cookies = response.headers.get('set-cookie')
      if (cookies) {
        this.sessionCookie = cookies.split(';')[0]
        console.log('✅ Login successful')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Login error:', error)
      this.lastLoginError = error instanceof Error ? error.message : String(error)
      return false
    }
  }

  /**
   * Scrape projects from Construction Wire
   */
  async scrapeProjects(options: {
    projectTypes?: string[]
    states?: string[]
    minValue?: number
    maxResults?: number
  } = {}): Promise<ScrapedProject[]> {
    const {
      projectTypes = ['hotel', 'multifamily', 'senior_living', 'student_housing', 'mixed_use'],
      states = ['TX', 'CA', 'FL', 'GA', 'AZ', 'NC', 'CO', 'TN', 'WA', 'NV', 'VA', 'NY', 'IL', 'PA', 'OH'],
      minValue = 2000000,
      maxResults = 500,
    } = options

    console.log('🔍 Scraping Construction Wire projects...')
    console.log('Filters:', { projectTypes, states, minValue, maxResults })

    // Ensure we're logged in
    if (!this.sessionCookie) {
      const loggedIn = await this.login()
      if (!loggedIn) {
        throw new Error(this.lastLoginError || 'Failed to login to Construction Wire')
      }
    }

    const projects: ScrapedProject[] = []

    try {
      // Build search URL with filters
      const searchParams = new URLSearchParams({
        project_types: projectTypes.join(','),
        states: states.join(','),
        min_value: minValue.toString(),
        limit: maxResults.toString(),
      })

      const response = await fetch(
        `${this.baseUrl}/api/projects/search?${searchParams}`,
        {
          headers: {
            Cookie: this.sessionCookie!,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Scrape failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Parse and normalize project data
      for (const rawProject of data.projects || []) {
        const project = this.normalizeProject(rawProject)
        if (project) {
          projects.push(project)
        }
      }

      console.log(`✅ Scraped ${projects.length} projects`)
      return projects
    } catch (error) {
      console.error('❌ Scrape error:', error)
      throw error
    }
  }

  /**
   * Normalize raw project data into our schema
   */
  private normalizeProject(raw: any): ScrapedProject | null {
    try {
      return {
        project_name: raw.name || raw.project_name,
        project_type: this.normalizeProjectTypes(raw.type || raw.project_type),
        project_stage: this.normalizeStage(raw.stage || raw.status),
        project_value: this.parseValue(raw.value || raw.estimated_value),
        units_count: raw.units || raw.unit_count,
        square_footage: raw.square_feet || raw.sqft,
        city: raw.city,
        state: raw.state,
        address: raw.address,
        latitude: raw.latitude || raw.lat,
        longitude: raw.longitude || raw.lng,
        estimated_start_date: raw.start_date,
        estimated_completion_date: raw.completion_date || raw.end_date,
        developer_name: raw.developer,
        architect_name: raw.architect,
        general_contractor: raw.general_contractor || raw.gc,
        raw_data: raw,
      }
    } catch (error) {
      console.error('Error normalizing project:', error)
      return null
    }
  }

  /**
   * Normalize project types to our standard values
   */
  private normalizeProjectTypes(types: any): string[] {
    if (Array.isArray(types)) return types
    if (typeof types === 'string') return [types]
    return ['other']
  }

  /**
   * Normalize project stage
   */
  private normalizeStage(stage: string): string {
    const stageMap: Record<string, string> = {
      planning: 'planning',
      'pre-construction': 'pre-construction',
      design: 'design',
      bidding: 'bidding',
      'under construction': 'construction',
      construction: 'construction',
    }

    return stageMap[stage?.toLowerCase()] || 'planning'
  }

  /**
   * Parse project value from various formats
   */
  private parseValue(value: any): number | undefined {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      // Remove $ and commas, parse as number
      const cleaned = value.replace(/[$,]/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? undefined : parsed
    }
    return undefined
  }

  /**
   * Save scraped projects to database
   */
  async saveProjects(projects: ScrapedProject[]): Promise<{
    inserted: number
    updated: number
    errors: number
  }> {
    console.log(`💾 Saving ${projects.length} projects to database...`)

    const supabase = createServiceSupabaseClient()
    let inserted = 0
    let updated = 0
    let errors = 0

    for (const project of projects) {
      try {
        // Calculate Groove fit score
        const grooveScore = calculateGrooveScore(project as any)

        // Check if project already exists (by name + city + state)
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('project_name', project.project_name)
          .eq('city', project.city)
          .eq('state', project.state)
          .single()

        if (existing && 'id' in existing) {
          // Update existing project
          const { error } = await (supabase
            .from('projects') as any)
            .update({
              ...project,
              groove_fit_score: grooveScore,
              updated_at: new Date().toISOString(),
            })
            .eq('id', (existing as { id: string }).id)

          if (error) throw error
          updated++
        } else {
          // Insert new project
          const { error } = await (supabase
            .from('projects') as any)
            .insert({
              ...project,
              groove_fit_score: grooveScore,
              organization_id: process.env.ORGANIZATION_ID,
              outreach_status: 'new',
              priority_level: grooveScore >= 80 ? 'hot' : grooveScore >= 60 ? 'warm' : 'cold',
            })

          if (error) throw error
          inserted++
        }
      } catch (error) {
        console.error(`Error saving project ${project.project_name}:`, error)
        errors++
      }
    }

    console.log(`✅ Saved projects: ${inserted} inserted, ${updated} updated, ${errors} errors`)

    // Log scrape activity (table may not exist yet)
    await (supabase as any).from('scrape_logs').insert({
      source: 'construction_wire',
      projects_found: projects.length,
      projects_inserted: inserted,
      projects_updated: updated,
      status: errors > 0 ? 'partial_success' : 'success',
      organization_id: process.env.ORGANIZATION_ID,
    })

    return { inserted, updated, errors }
  }

  /**
   * Full scrape and save pipeline
   */
  async scrapeAndSave(options?: Parameters<typeof this.scrapeProjects>[0]): Promise<ScrapeResult> {
    console.log('🚀 Starting Construction Wire scrape...')

    const startTime = Date.now()

    try {
      const projects = await this.scrapeProjects(options)
      const results = await this.saveProjects(projects)

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      console.log(`✅ Scrape complete in ${duration}s`)
      console.log(results)

      return {
        success: true,
        duration,
        inserted: results.inserted,
        updated: results.updated,
        errors: results.errors,
      }
    } catch (error: any) {
      console.error('❌ Scrape failed:', error)

      // Log failed scrape (table may not exist yet)
      const supabase = createServiceSupabaseClient()
      await (supabase as any).from('scrape_logs').insert({
        source: 'construction_wire',
        projects_found: 0,
        projects_inserted: 0,
        projects_updated: 0,
        status: 'failed',
        error_message: error.message,
        organization_id: process.env.ORGANIZATION_ID,
      })

      return {
        success: false,
        error: error.message,
        inserted: 0,
        updated: 0,
        errors: 0,
        duration: '0',
      }
    }
  }
}

// Export result type for type narrowing
export interface ScrapeResult {
  success: boolean
  error?: string
  inserted: number
  updated: number
  errors: number
  duration: string
}
