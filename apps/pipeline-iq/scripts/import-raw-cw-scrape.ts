#!/usr/bin/env npx tsx

/**
 * Import Raw Construction Wire Scrape CSVs
 *
 * Handles the raw format from Instant Data Scraper with messy columns.
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

function generateCwId(hotelName: string, city: string, state: string): string {
  const base = `${hotelName}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
  const hash = base.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `SCRAPE-${hash}-${base.slice(0, 15).toUpperCase()}`
}

function parseFieldValue(blob: string): { zip: string; phone: string; fax: string } {
  const lines = blob?.split('\n').map(l => l.trim()).filter(Boolean) || []
  let zip = ''
  let phone = ''
  let fax = ''

  for (const line of lines) {
    if (/^\d{5}/.test(line)) {
      zip = line.match(/^\d{5}(-\d{4})?/)?.[0] || ''
    }
    if (line.includes('P:')) {
      phone = line.match(/P:\s*([\d-]+)/)?.[1] || ''
    }
    if (line.includes('F:')) {
      fax = line.match(/F:\s*([\d-]+)/)?.[1] || ''
    }
  }

  return { zip, phone, fax }
}

function parseFieldValue2(blob: string): { year: string; rooms: number | null; brand: string; franchise: string; tier: string } {
  const lines = blob?.split('\n').map(l => l.trim()).filter(Boolean) || []
  let year = ''
  let rooms: number | null = null
  let brand = ''
  let franchise = ''
  let tier = ''

  for (const line of lines) {
    // Year - 4 digit number starting with 19 or 20
    if (/^(19|20)\d{2}$/.test(line)) {
      year = line
    }
    // Room count - just a number
    else if (/^\d+$/.test(line) && parseInt(line) > 50 && parseInt(line) < 5000) {
      rooms = parseInt(line)
    }
    // Tier keywords
    else if (/luxury|upscale|mid-range|economy|budget|resort/i.test(line)) {
      tier = line
    }
    // Brand/Franchise - strings without numbers
    else if (line.length > 2 && !/^\d+$/.test(line)) {
      if (!brand) {
        brand = line
      } else if (!franchise) {
        franchise = line
      }
    }
  }

  return { year, rooms, brand, franchise, tier }
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

async function importRawCsv(csvPath: string, dryRun: boolean = false) {
  console.log('═'.repeat(60))
  console.log('  IMPORTING RAW CW SCRAPE')
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

  // Filter to rows with hotel names
  const hotels = rows.filter((r: any) => r.title?.trim())
  console.log('Total rows:', rows.length)
  console.log('Hotels with names:', hotels.length)
  console.log('')

  if (dryRun) {
    console.log('─'.repeat(60))
    console.log('PREVIEW (first 10):')
    console.log('─'.repeat(60))
    for (const hotel of hotels.slice(0, 10)) {
      const fv = parseFieldValue(hotel['field-value'])
      const fv2 = parseFieldValue2(hotel['field-value 2'])
      console.log(`  ${hotel.title}`)
      console.log(`    ${hotel.city}, ${hotel.state} ${fv.zip} | ${fv2.rooms || '?'} rooms | ${fv2.brand}`)
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
  let contactsCreated = 0
  let stakeholdersCreated = 0

  for (const hotel of hotels) {
    const hotelName = hotel.title?.trim()
    if (!hotelName) continue

    const normalizedName = normalizeKey(hotelName)
    if (existingNames.has(normalizedName)) {
      projectsSkipped++
      continue
    }

    const fv = parseFieldValue(hotel['field-value'])
    const fv2 = parseFieldValue2(hotel['field-value 2'])

    const cwId = generateCwId(hotelName, hotel.city || '', hotel.state || '')

    const projectData = {
      cw_project_id: cwId,
      project_name: hotelName,
      project_type: ['hotel'],
      project_stage: 'operating',
      units_count: fv2.rooms,
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      zip: fv.zip,
      data_source: 'construction_wire_scrape',
      scraped_at: new Date().toISOString(),
      raw_data: {
        phone: fv.phone,
        fax: fv.fax,
        year_built: fv2.year,
        brand: fv2.brand,
        franchise: fv2.franchise,
        tier: fv2.tier
      }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select('id')
      .single()

    if (projectError) {
      console.error(`Error creating ${hotelName}:`, projectError.message)
      continue
    }

    projectsCreated++
    existingNames.add(normalizedName)

    // Check for contact info in contact-info columns
    const contactName = hotel['contact-info 2']?.trim() || hotel['contact-info 3']?.trim()
    if (contactName && contactName.length > 2 && /^[A-Z]/.test(contactName)) {
      const { firstName, lastName } = splitName(contactName)

      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .single()

      let contactId: string

      if (existingContact) {
        contactId = existingContact.id
      } else {
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            first_name: firstName,
            last_name: lastName,
            title: 'General Manager'
          })
          .select('id')
          .single()

        if (!contactError && newContact) {
          contactId = newContact.id
          contactsCreated++
        }
      }

      if (contactId!) {
        const { error: stakeholderError } = await supabase
          .from('project_stakeholders')
          .insert({
            project_id: project.id,
            contact_id: contactId,
            role_in_project: 'general_manager',
            is_primary: true
          })

        if (!stakeholderError) {
          stakeholdersCreated++
        }
      }
    }

    if (projectsCreated % 50 === 0) {
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
  console.log('  Contacts created:', contactsCreated)
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
  console.error('Usage: npx tsx scripts/import-raw-cw-scrape.ts <csv-path> [--dry-run]')
  process.exit(1)
}

importRawCsv(csvPath, dryRun).catch(console.error)
