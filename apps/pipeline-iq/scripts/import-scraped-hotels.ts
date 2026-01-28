#!/usr/bin/env npx tsx

/**
 * Import Hotels from Instant Data Scraper CSV
 *
 * Imports hotel data scraped from Construction Wire using browser extensions.
 * Creates projects, companies, contacts, and stakeholder links.
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

interface HotelRow {
  hotel_name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone: string
  fax: string
  year_built: string
  room_count: string
  brand: string
  parent_company: string
  tier: string
  amenities: string
  restaurants: string
  contact_name: string
  owner_role: string
  owner_company: string
  gm_role: string
  recent_activity: string
  source_file: string
}

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNumber(val: string): number | null {
  const num = parseInt(val?.replace(/[^0-9]/g, '') || '', 10)
  return isNaN(num) ? null : num
}

function parseTier(tier: string): string {
  const t = tier?.toLowerCase() || ''
  if (t.includes('luxury')) return 'luxury'
  if (t.includes('upscale')) return 'upscale'
  if (t.includes('mid')) return 'midscale'
  if (t.includes('economy') || t.includes('budget')) return 'economy'
  return 'midscale'
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

function generateCwId(hotelName: string, city: string, state: string): string {
  // Generate a unique pseudo-ID for scraped hotels
  const base = `${hotelName}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30)
  const hash = base.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `SCRAPE-${hash}-${base.slice(0, 15).toUpperCase()}`
}

async function importHotels(csvPath: string, dryRun: boolean = false) {
  console.log('═'.repeat(60))
  console.log('  IMPORTING SCRAPED HOTELS FROM CSV')
  console.log('═'.repeat(60))
  console.log('')
  console.log('File:', csvPath)
  console.log('Mode:', dryRun ? 'DRY RUN' : 'LIVE')
  console.log('')

  if (!existsSync(csvPath)) {
    console.error('File not found:', csvPath)
    process.exit(1)
  }

  // Parse CSV
  const content = readFileSync(csvPath, 'utf-8')
  const rows: HotelRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  console.log('Hotels in CSV:', rows.length)

  // Filter out closed hotels
  const activeHotels = rows.filter(r => !r.hotel_name?.includes('CLOSED'))
  const closedCount = rows.length - activeHotels.length
  console.log('Active hotels:', activeHotels.length)
  console.log('Closed (skipped):', closedCount)
  console.log('')

  if (dryRun) {
    // Just show preview
    console.log('─'.repeat(60))
    console.log('PREVIEW (first 10):')
    console.log('─'.repeat(60))
    for (const hotel of activeHotels.slice(0, 10)) {
      console.log(`  ${hotel.hotel_name}`)
      console.log(`    ${hotel.city}, ${hotel.state} | ${hotel.room_count || '?'} rooms | ${hotel.brand}`)
      console.log(`    Owner: ${hotel.owner_company || 'N/A'}`)
      console.log(`    GM: ${hotel.contact_name || 'N/A'}`)
      console.log('')
    }
    console.log('DRY RUN - No changes made')
    return
  }

  // Get existing projects by normalized name for deduplication
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

  for (const hotel of activeHotels) {
    const normalizedName = normalizeKey(hotel.hotel_name)

    // Skip if already exists
    if (existingNames.has(normalizedName)) {
      projectsSkipped++
      continue
    }

    // Create project
    const cwId = generateCwId(hotel.hotel_name, hotel.city, hotel.state)
    const projectData = {
      cw_project_id: cwId,
      project_name: hotel.hotel_name,
      project_type: ['hotel'],
      project_stage: 'operating',
      units_count: parseNumber(hotel.room_count),
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      zip: hotel.zip_code,
      data_source: 'construction_wire_scrape',
      scraped_at: new Date().toISOString(),
      raw_data: {
        phone: hotel.phone,
        fax: hotel.fax,
        year_built: hotel.year_built,
        brand: hotel.brand,
        parent_company: hotel.parent_company,
        tier: hotel.tier,
        amenities: hotel.amenities,
        restaurants: hotel.restaurants,
        recent_activity: hotel.recent_activity
      }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select('id')
      .single()

    if (projectError) {
      console.error(`Error creating ${hotel.hotel_name}:`, projectError.message)
      continue
    }

    projectsCreated++
    existingNames.add(normalizedName) // Prevent duplicates within batch

    // Create owner company if present
    if (hotel.owner_company && hotel.owner_company.trim()) {
      const companyName = hotel.owner_company.trim()

      // Check if company exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('company_name', companyName)
        .single()

      let companyId: string

      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_name: companyName,
            company_type: hotel.owner_role?.toLowerCase().includes('manager') ? 'property_manager' : 'owner'
          })
          .select('id')
          .single()

        if (companyError) {
          console.error(`Error creating company ${companyName}:`, companyError.message)
        } else {
          companyId = newCompany.id
          companiesCreated++
        }
      }

      // Link company to project
      if (companyId!) {
        const { error: stakeholderError } = await supabase
          .from('project_stakeholders')
          .insert({
            project_id: project.id,
            company_id: companyId,
            role_in_project: hotel.owner_role?.toLowerCase().includes('manager') ? 'property_manager' : 'owner',
            is_primary: true
          })

        if (!stakeholderError) {
          stakeholdersCreated++
        }
      }
    }

    // Create GM contact if present
    if (hotel.contact_name && hotel.contact_name.trim()) {
      const { firstName, lastName } = splitName(hotel.contact_name)

      // Check if contact exists
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

        if (contactError) {
          console.error(`Error creating contact ${hotel.contact_name}:`, contactError.message)
        } else {
          contactId = newContact.id
          contactsCreated++
        }
      }

      // Link contact to project
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

    // Progress indicator
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
  console.log('  Contacts created:', contactsCreated)
  console.log('  Stakeholder links:', stakeholdersCreated)
  console.log('')

  // Report NEPQ-ready count
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

// Parse command line args
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const csvPath = args.find(a => !a.startsWith('--')) || '/Users/johnlyman/Downloads/hotels_cleaned.csv'

importHotels(csvPath, dryRun).catch(console.error)
