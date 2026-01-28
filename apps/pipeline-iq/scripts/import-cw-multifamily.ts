#!/usr/bin/env npx tsx

/**
 * Import Construction Wire Multifamily/New Construction Projects
 *
 * Handles the format from CW's multifamily search results.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function generateCwId(name: string, city: string, state: string): string {
  const base = `${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
  const hash = base.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `MF-${hash}-${base.slice(0, 15).toUpperCase()}`
}

function extractCwIdFromUrl(url: string): string | null {
  const match = url?.match(/Details\/(\d+)/)
  return match ? match[1] : null
}

function parseNumber(val: string): number | null {
  const num = parseInt(val?.replace(/[^0-9]/g, '') || '', 10)
  return isNaN(num) ? null : num
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

async function importMultifamily(csvPath: string, dryRun: boolean = false) {
  console.log('═'.repeat(60))
  console.log('  IMPORTING CW MULTIFAMILY PROJECTS')
  console.log('═'.repeat(60))
  console.log('')
  console.log('File:', csvPath)
  console.log('Mode:', dryRun ? 'DRY RUN' : 'LIVE')
  console.log('')

  if (!existsSync(csvPath)) {
    console.error('File not found:', csvPath)
    process.exit(1)
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true
  })

  // Merge every 4 rows into one project record
  // Row pattern: [title row] [units row] [city/state row] [details row]
  const projects: any[] = []
  for (let i = 0; i < rows.length; i += 4) {
    const titleRow = rows[i] || {}
    const unitsRow = rows[i + 1] || {}
    const locationRow = rows[i + 2] || {}
    const detailsRow = rows[i + 3] || {}

    const title = titleRow.title?.trim()
    if (!title) continue

    projects.push({
      title,
      units: unitsRow['field-value 2'] || '',
      city: locationRow.city || '',
      state: locationRow.state || '',
      company: detailsRow['contact-info 3'] || locationRow['contact-info 3'] || '',
      companyRole: detailsRow['contact-info 2'] || locationRow['contact-info 2'] || '',
      url: locationRow['field-value href'] || titleRow['view-project href'] || ''
    })
  }

  console.log('Total rows:', rows.length)
  console.log('Projects parsed:', projects.length)
  console.log('')

  if (dryRun) {
    console.log('─'.repeat(60))
    console.log('PREVIEW (first 10):')
    console.log('─'.repeat(60))
    for (const proj of projects.slice(0, 10)) {
      console.log(`  ${proj.title}`)
      console.log(`    ${proj.city}, ${proj.state} | ${proj.units || '?'} units`)
      console.log(`    Developer: ${proj.company || 'N/A'}`)
      console.log('')
    }
    console.log('DRY RUN - No changes made')
    return
  }

  // Get existing projects
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('id, project_name')

  const existingNames = new Set(
    (existingProjects || []).map(p => normalizeKey(p.project_name))
  )
  console.log('Existing projects in DB:', existingProjects?.length || 0)

  let projectsCreated = 0
  let projectsSkipped = 0
  let companiesCreated = 0
  let stakeholdersCreated = 0

  for (const proj of projects) {
    const projectName = proj.title?.trim()
    if (!projectName) continue

    const normalizedName = normalizeKey(projectName)
    if (existingNames.has(normalizedName)) {
      projectsSkipped++
      continue
    }

    // Extract CW ID from URL if available
    const urlCwId = extractCwIdFromUrl(proj.url || '')
    const cwId = urlCwId ? `CW-${urlCwId}` : generateCwId(projectName, proj.city || '', proj.state || '')

    // Parse units
    const units = parseNumber(proj.units || '')

    // Determine project type from title
    const titleLower = projectName.toLowerCase()
    let projectType = ['multifamily']
    if (titleLower.includes('senior') || titleLower.includes('assisted') || titleLower.includes('nursing')) {
      projectType = ['senior_living']
    } else if (titleLower.includes('student')) {
      projectType = ['student_housing']
    } else if (titleLower.includes('townhome') || titleLower.includes('duplex')) {
      projectType = ['townhomes']
    }

    const projectData = {
      cw_project_id: cwId,
      project_name: projectName,
      project_type: projectType,
      project_stage: 'planning',
      units_count: units,
      city: proj.city || '',
      state: proj.state || '',
      data_source: 'construction_wire_scrape',
      scraped_at: new Date().toISOString(),
      raw_data: {
        company: proj.company || '',
        company_role: proj.companyRole || ''
      }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select('id')
      .single()

    if (projectError) {
      console.error(`Error creating ${projectName}:`, projectError.message)
      continue
    }

    projectsCreated++
    existingNames.add(normalizedName)

    // Create company if present
    const companyName = (proj.company || '').trim()
    const companyRole = (proj.companyRole || '').toLowerCase()

    if (companyName && companyName.length > 2) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('company_name', companyName)
        .single()

      let companyId: string

      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        let companyType = 'developer'
        if (companyRole.includes('contractor')) companyType = 'contractor'
        else if (companyRole.includes('owner')) companyType = 'owner'
        else if (companyRole.includes('architect')) companyType = 'architect'

        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_name: companyName,
            company_type: companyType
          })
          .select('id')
          .single()

        if (!companyError && newCompany) {
          companyId = newCompany.id
          companiesCreated++
        }
      }

      if (companyId!) {
        const { error: stakeholderError } = await supabase
          .from('project_stakeholders')
          .insert({
            project_id: project.id,
            company_id: companyId,
            role_in_project: companyRole.includes('contractor') ? 'general_contractor' : 'developer',
            is_primary: true
          })

        if (!stakeholderError) {
          stakeholdersCreated++
        }
      }
    }

    if (projectsCreated % 25 === 0) {
      console.log(`Progress: ${projectsCreated} projects created...`)
    }
  }

  console.log('')
  console.log('═'.repeat(60))
  console.log('IMPORT RESULTS')
  console.log('═'.repeat(60))
  console.log('')
  console.log('  Projects created:', projectsCreated)
  console.log('  Projects skipped (existing):', projectsSkipped)
  console.log('  Companies created:', companiesCreated)
  console.log('  Stakeholder links:', stakeholdersCreated)
  console.log('')

  // Report totals
  const { data: nepqReady } = await supabase
    .from('project_stakeholders')
    .select('project_id')
    .not('contact_id', 'is', null)

  const uniqueNepqProjects = new Set(nepqReady?.map(p => p.project_id) || [])

  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  console.log('─'.repeat(60))
  console.log('TOTAL PROJECTS:', totalProjects)
  console.log('NEPQ-READY PROJECTS:', uniqueNepqProjects.size)
  console.log('─'.repeat(60))
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const csvPath = args.find(a => !a.startsWith('--'))

if (!csvPath) {
  console.error('Usage: npx tsx scripts/import-cw-multifamily.ts <csv-path> [--dry-run]')
  process.exit(1)
}

importMultifamily(csvPath, dryRun).catch(console.error)
