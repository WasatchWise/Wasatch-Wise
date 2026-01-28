#!/usr/bin/env npx tsx

/**
 * MASTER IMPORT SCRIPT - All Normalized Hotel & Project Data
 *
 * Imports:
 * - 555 hotels from hotels_core.csv
 * - 434 GM contacts from hotel_contacts.csv (with verified emails!)
 * - 631 projects from projects_core.csv
 * - All stakeholder relationships
 * - 3,974 SuperGroove cleaned records
 *
 * Features:
 * - Deduplication against existing DB records
 * - Proper foreign key relationships
 * - Scoring for all projects
 * - Progress tracking
 *
 * Usage:
 *   npx tsx scripts/import-all-normalized-data.ts
 *   npx tsx scripts/import-all-normalized-data.ts --dry-run
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

const ORGANIZATION_ID = '34249404-774f-4b80-b346-a2d9e6322584'
const DRY_RUN = process.argv.includes('--dry-run')

// File paths
const FILES = {
  hotels_core: '/Users/johnlyman/Downloads/hotels_core.csv',
  hotel_contacts: '/Users/johnlyman/Downloads/hotel_contacts.csv',
  hotel_owners: '/Users/johnlyman/Downloads/hotel_owners.csv',
  hotel_property_managers: '/Users/johnlyman/Downloads/hotel_property_managers.csv',
  projects_core: '/Users/johnlyman/Downloads/projects_core.csv',
  project_contractors: '/Users/johnlyman/Downloads/project_contractors.csv',
  project_developers: '/Users/johnlyman/Downloads/project_developers.csv',
  project_owners: '/Users/johnlyman/Downloads/project_owners.csv',
  supergroove_cleaned: '/Users/johnlyman/Downloads/supergroove_cleaned.csv',
}

// Stats tracking
const stats = {
  hotels: { total: 0, created: 0, skipped: 0, errors: 0 },
  projects: { total: 0, created: 0, skipped: 0, errors: 0 },
  supergroove: { total: 0, created: 0, skipped: 0, errors: 0 },
  contacts: { total: 0, created: 0, skipped: 0, errors: 0 },
  companies: { total: 0, created: 0, skipped: 0, errors: 0 },
  stakeholders: { total: 0, created: 0, skipped: 0, errors: 0 },
}

// Cache for deduplication
const existingProjects = new Map<string, string>() // name+city+state -> id
const existingContacts = new Map<string, string>() // email -> id
const existingCompanies = new Map<string, string>() // name -> id
const projectIdMap = new Map<string, string>() // CW ProjectId -> our UUID

// ============================================================================
// Utilities
// ============================================================================

function readCSV(filePath: string): any[] {
  if (!existsSync(filePath)) {
    console.log(`  File not found: ${filePath}`)
    return []
  }
  const content = readFileSync(filePath, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, trim: true })
}

function normalizeKey(name: string, city: string, state: string): string {
  return `${name?.toLowerCase().trim()}|${city?.toLowerCase().trim()}|${state?.toLowerCase().trim()}`
}

function calculateScore(record: any, isHotel: boolean): number {
  let score = 0

  // Type scoring
  if (isHotel) {
    score += 30 // Hotels are high value
  } else {
    const type = (record.ProjectType || '').toLowerCase()
    if (type.includes('hotel') || type.includes('senior') || type.includes('multifamily')) {
      score += 30
    } else if (type.includes('medical') || type.includes('student')) {
      score += 20
    } else {
      score += 10
    }
  }

  // Scale scoring (hotels)
  const scale = (record.Scale || '').toLowerCase()
  if (scale.includes('luxury')) score += 15
  else if (scale.includes('upscale')) score += 12
  else if (scale.includes('mid')) score += 8
  else if (scale.includes('budget') || scale.includes('economy')) score += 5

  // Size scoring
  const rooms = parseInt(record.RoomCount) || 0
  const units = parseInt(record.UnitsCount) || 0
  const size = rooms || units
  if (size >= 300) score += 15
  else if (size >= 200) score += 12
  else if (size >= 100) score += 8
  else if (size >= 50) score += 5

  // Value scoring
  const value = parseFloat(record.ProjectValue?.replace(/[^0-9.]/g, '')) || 0
  if (value >= 100) score += 15 // $100M+
  else if (value >= 50) score += 12
  else if (value >= 20) score += 8
  else if (value >= 10) score += 5

  // Stage scoring
  const stage = (record.Stage || '').toLowerCase()
  if (stage.includes('planning')) score += 10
  else if (stage.includes('design') || stage.includes('pre')) score += 8
  else if (stage.includes('construction') || stage.includes('groundbreak')) score += 5

  // Location bonus
  const state = record.State || ''
  if (['CA', 'FL', 'TX', 'AZ', 'NY', 'IL', 'CO', 'GA', 'NV', 'UT'].includes(state)) {
    score += 5
  }

  return Math.min(score, 100)
}

function getPriorityLevel(score: number): string {
  if (score >= 75) return 'hot'
  if (score >= 55) return 'warm'
  return 'cold'
}

function parseStage(stage: string): string {
  const s = (stage || '').toLowerCase()
  if (s.includes('planning') || s.includes('approval')) return 'planning'
  if (s.includes('design')) return 'design'
  if (s.includes('pre') || s.includes('groundbreak')) return 'pre_construction'
  if (s.includes('bid')) return 'bidding'
  if (s.includes('construction') || s.includes('start')) return 'construction'
  if (s.includes('complete')) return 'completed'
  return 'operating'
}

// ============================================================================
// Load Existing Data for Deduplication
// ============================================================================

async function loadExistingData() {
  console.log('\n📊 Loading existing data for deduplication...')

  // Load existing projects
  const { data: projects } = await supabase
    .from('high_priority_projects')
    .select('id, project_name, city, state, cw_project_id')
    .eq('organization_id', ORGANIZATION_ID)

  for (const p of projects || []) {
    const key = normalizeKey(p.project_name, p.city, p.state)
    existingProjects.set(key, p.id)
    if (p.cw_project_id) {
      projectIdMap.set(p.cw_project_id, p.id)
    }
  }
  console.log(`  Existing projects: ${existingProjects.size}`)

  // Load existing contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, email, first_name, last_name')
    .eq('organization_id', ORGANIZATION_ID)

  for (const c of contacts || []) {
    if (c.email) {
      existingContacts.set(c.email.toLowerCase(), c.id)
    }
  }
  console.log(`  Existing contacts: ${existingContacts.size}`)

  // Load existing companies
  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name')
    .eq('organization_id', ORGANIZATION_ID)

  for (const c of companies || []) {
    existingCompanies.set(c.company_name.toLowerCase(), c.id)
  }
  console.log(`  Existing companies: ${existingCompanies.size}`)
}

// ============================================================================
// Import Hotels
// ============================================================================

async function importHotels() {
  console.log('\n🏨 IMPORTING HOTELS...')

  const hotels = readCSV(FILES.hotels_core)
  const contacts = readCSV(FILES.hotel_contacts)
  const owners = readCSV(FILES.hotel_owners)
  const propertyManagers = readCSV(FILES.hotel_property_managers)

  // Build lookup maps
  const contactsByProjectId = new Map<string, any[]>()
  for (const c of contacts) {
    const list = contactsByProjectId.get(c.ProjectId) || []
    list.push(c)
    contactsByProjectId.set(c.ProjectId, list)
  }

  const ownersByProjectId = new Map<string, any[]>()
  for (const o of owners) {
    const list = ownersByProjectId.get(o.ProjectId) || []
    list.push(o)
    ownersByProjectId.set(o.ProjectId, list)
  }

  const pmsByProjectId = new Map<string, any[]>()
  for (const pm of propertyManagers) {
    const list = pmsByProjectId.get(pm.ProjectId) || []
    list.push(pm)
    pmsByProjectId.set(pm.ProjectId, list)
  }

  stats.hotels.total = hotels.length
  console.log(`  Found ${hotels.length} hotels to import`)

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i]
    const progress = `[${i + 1}/${hotels.length}]`

    // Check for duplicate
    const key = normalizeKey(hotel.Title, hotel.City, hotel.State)
    if (existingProjects.has(key)) {
      stats.hotels.skipped++
      continue
    }

    // Also check by CW ProjectId
    if (projectIdMap.has(hotel.ProjectId)) {
      stats.hotels.skipped++
      continue
    }

    const score = calculateScore(hotel, true)
    const priority = getPriorityLevel(score)

    if (DRY_RUN) {
      console.log(`${progress} [DRY RUN] Would create: ${hotel.Title} (${hotel.City}, ${hotel.State}) - Score: ${score}`)
      stats.hotels.created++
      continue
    }

    try {
      // Create hotel project
      const { data: project, error } = await supabase
        .from('high_priority_projects')
        .insert({
          organization_id: ORGANIZATION_ID,
          cw_project_id: `CW-${hotel.ProjectId}`,
          project_name: hotel.Title,
          project_type: ['hotel'],
          project_stage: 'operating',
          units_count: parseInt(hotel.RoomCount) || null,
          city: hotel.City,
          state: hotel.State,
          zip: hotel.PostalCode,
          county: hotel.County,
          address: hotel.LocationInfo,
          latitude: parseFloat(hotel.Latitude) || null,
          longitude: parseFloat(hotel.Longitude) || null,
          groove_fit_score: score,
          engagement_score: 0,
          timing_score: 50,
          total_score: Math.round(score * 0.7 + 50 * 0.3),
          priority_level: priority,
          outreach_status: 'new',
          data_source: 'construction_wire',
          notes: hotel.ProjectNotes,
          raw_data: {
            source: 'cw_normalized',
            cw_project_id: hotel.ProjectId,
            scale: hotel.Scale,
            chain: hotel.Chain,
            franchise: hotel.Franchise,
            phone: hotel.Phone,
            fax: hotel.Fax,
            url: hotel.Url,
            amenities: hotel.Amenity,
            meeting_room_sqft: hotel.MeetingRoom,
            restaurants: hotel.Restaurants,
            parking: hotel.Parking,
            opening_date: hotel.OpeningDate,
            imported_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (error) {
        console.error(`${progress} ERROR: ${hotel.Title} - ${error.message}`)
        stats.hotels.errors++
        continue
      }

      stats.hotels.created++
      existingProjects.set(key, project.id)
      projectIdMap.set(hotel.ProjectId, project.id)

      // Import contacts for this hotel
      const hotelContacts = contactsByProjectId.get(hotel.ProjectId) || []
      for (const contact of hotelContacts) {
        await importContact(contact, project.id, 'general_manager')
      }

      // Import owner companies
      const hotelOwners = ownersByProjectId.get(hotel.ProjectId) || []
      for (const owner of hotelOwners) {
        await importCompanyAndLink(owner, project.id, 'owner')
      }

      // Import PM companies
      const hotelPMs = pmsByProjectId.get(hotel.ProjectId) || []
      for (const pm of hotelPMs) {
        await importCompanyAndLink(pm, project.id, 'property_manager')
      }

      if ((i + 1) % 50 === 0) {
        console.log(`${progress} ${hotel.Title} - Score: ${score} (${priority})`)
      }

    } catch (err: any) {
      console.error(`${progress} ERROR: ${err.message}`)
      stats.hotels.errors++
    }
  }
}

// ============================================================================
// Import Projects
// ============================================================================

async function importProjects() {
  console.log('\n🏗️  IMPORTING PROJECTS...')

  const projects = readCSV(FILES.projects_core)
  const contractors = readCSV(FILES.project_contractors)
  const developers = readCSV(FILES.project_developers)
  const owners = readCSV(FILES.project_owners)

  // Build lookup maps
  const contractorsByProjectId = new Map<string, any[]>()
  for (const c of contractors) {
    const list = contractorsByProjectId.get(c.ProjectId) || []
    list.push(c)
    contractorsByProjectId.set(c.ProjectId, list)
  }

  const developersByProjectId = new Map<string, any[]>()
  for (const d of developers) {
    const list = developersByProjectId.get(d.ProjectId) || []
    list.push(d)
    developersByProjectId.set(d.ProjectId, list)
  }

  const ownersByProjectId = new Map<string, any[]>()
  for (const o of owners) {
    const list = ownersByProjectId.get(o.ProjectId) || []
    list.push(o)
    ownersByProjectId.set(o.ProjectId, list)
  }

  stats.projects.total = projects.length
  console.log(`  Found ${projects.length} projects to import`)

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    const progress = `[${i + 1}/${projects.length}]`

    // Check for duplicate
    const key = normalizeKey(project.Title, project.City, project.State)
    if (existingProjects.has(key)) {
      stats.projects.skipped++
      continue
    }

    if (projectIdMap.has(project.ProjectId)) {
      stats.projects.skipped++
      continue
    }

    // Determine project types
    const types: string[] = []
    const typeStr = (project.ProjectType || '').toLowerCase()
    const detailsStr = (project.ProjectDetails || '').toLowerCase()

    if (typeStr.includes('hotel') || detailsStr.includes('hotel')) types.push('hotel')
    if (typeStr.includes('multifamily') || typeStr.includes('apartment') || typeStr.includes('rent')) types.push('multifamily')
    if (typeStr.includes('senior') || detailsStr.includes('senior')) types.push('senior_living')
    if (typeStr.includes('student') || detailsStr.includes('student')) types.push('student_housing')
    if (types.length === 0) types.push('mixed_use')

    const score = calculateScore(project, types.includes('hotel'))
    const priority = getPriorityLevel(score)
    const stage = parseStage(project.Stage)

    if (DRY_RUN) {
      console.log(`${progress} [DRY RUN] Would create: ${project.Title} (${project.City}, ${project.State}) - Score: ${score}`)
      stats.projects.created++
      continue
    }

    try {
      const projectValue = parseFloat(project.ProjectValue?.replace(/[^0-9.]/g, '')) || null
      const units = parseInt(project.UnitsCount?.replace(/[^0-9]/g, '')) || null

      const { data: newProject, error } = await supabase
        .from('high_priority_projects')
        .insert({
          organization_id: ORGANIZATION_ID,
          cw_project_id: `CW-${project.ProjectId}`,
          project_name: project.Title,
          project_type: types,
          project_stage: stage,
          project_value: projectValue ? projectValue * 1000000 : null, // Convert from millions
          units_count: units,
          city: project.City,
          state: project.State,
          zip: project.PostalCode,
          county: project.County,
          address: project.LocationInfo,
          latitude: parseFloat(project.Latitude) || null,
          longitude: parseFloat(project.Longitude) || null,
          groove_fit_score: score,
          engagement_score: 0,
          timing_score: stage === 'planning' ? 80 : stage === 'construction' ? 40 : 50,
          total_score: Math.round(score * 0.7 + 50 * 0.3),
          priority_level: priority,
          outreach_status: 'new',
          data_source: 'construction_wire',
          notes: project.ProjectNotes,
          raw_data: {
            source: 'cw_normalized',
            cw_project_id: project.ProjectId,
            construction_type: project.ConstructionType,
            product_type: project.ProductType,
            building_type: project.BuildingType,
            sector: project.Sector,
            unit_mix: project.UnixMix,
            project_details: project.ProjectDetails,
            imported_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (error) {
        console.error(`${progress} ERROR: ${project.Title} - ${error.message}`)
        stats.projects.errors++
        continue
      }

      stats.projects.created++
      existingProjects.set(key, newProject.id)
      projectIdMap.set(project.ProjectId, newProject.id)

      // Import contractors
      const projectContractors = contractorsByProjectId.get(project.ProjectId) || []
      for (const contractor of projectContractors) {
        await importCompanyAndLink(contractor, newProject.id, 'contractor')
      }

      // Import developers
      const projectDevelopers = developersByProjectId.get(project.ProjectId) || []
      for (const developer of projectDevelopers) {
        await importCompanyAndLink(developer, newProject.id, 'developer')
      }

      // Import owners
      const projectOwners = ownersByProjectId.get(project.ProjectId) || []
      for (const owner of projectOwners) {
        await importCompanyAndLink(owner, newProject.id, 'owner')
      }

      if ((i + 1) % 50 === 0) {
        console.log(`${progress} ${project.Title} - Score: ${score} (${priority})`)
      }

    } catch (err: any) {
      console.error(`${progress} ERROR: ${err.message}`)
      stats.projects.errors++
    }
  }
}

// ============================================================================
// Import SuperGroove Cleaned
// ============================================================================

async function importSuperGroove() {
  console.log('\n🎸 IMPORTING SUPERGROOVE CLEANED...')

  const records = readCSV(FILES.supergroove_cleaned)
  stats.supergroove.total = records.length
  console.log(`  Found ${records.length} SuperGroove records to import`)

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const progress = `[${i + 1}/${records.length}]`

    const hotelName = record.hotel_name || record.Title || record.name
    const city = record.city || record.City
    const state = record.state || record.State

    if (!hotelName || !city || !state) {
      stats.supergroove.skipped++
      continue
    }

    // Check for duplicate
    const key = normalizeKey(hotelName, city, state)
    if (existingProjects.has(key)) {
      stats.supergroove.skipped++
      continue
    }

    const rooms = parseInt(record.num_rooms || record.RoomCount) || 0
    const score = calculateScore({ ...record, RoomCount: rooms, Scale: record.scale }, true)
    const priority = getPriorityLevel(score)

    if (DRY_RUN) {
      stats.supergroove.created++
      continue
    }

    try {
      const { data: project, error } = await supabase
        .from('high_priority_projects')
        .insert({
          organization_id: ORGANIZATION_ID,
          cw_project_id: `SG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          project_name: hotelName,
          project_type: ['hotel'],
          project_stage: 'operating',
          units_count: rooms || null,
          city: city,
          state: state,
          zip: record.zip || record.PostalCode,
          address: record.street_address || record.address,
          groove_fit_score: score,
          engagement_score: 0,
          timing_score: 50,
          total_score: Math.round(score * 0.7 + 50 * 0.3),
          priority_level: priority,
          outreach_status: 'new',
          data_source: 'supergroove',
          raw_data: {
            source: 'supergroove_cleaned',
            chain: record.chain || record.Chain,
            scale: record.scale || record.Scale,
            owner: record.owner,
            property_manager: record.property_manager,
            rate_min: record.rate_min,
            rate_max: record.rate_max,
            notes: record.notes,
            imported_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (error) {
        stats.supergroove.errors++
        continue
      }

      stats.supergroove.created++
      existingProjects.set(key, project.id)

      if ((i + 1) % 200 === 0) {
        console.log(`${progress} Imported ${stats.supergroove.created} SuperGroove records...`)
      }

    } catch (err: any) {
      stats.supergroove.errors++
    }
  }
}

// ============================================================================
// Import Contact
// ============================================================================

async function importContact(contact: any, projectId: string, role: string): Promise<string | null> {
  const email = contact.ContactEmail?.toLowerCase().trim()
  const name = contact.ContactName?.trim()

  if (!name || name === ' ') return null

  // Check if contact exists by email
  if (email && existingContacts.has(email)) {
    const contactId = existingContacts.get(email)!
    await linkStakeholder(projectId, contactId, null, role)
    return contactId
  }

  // Parse name
  const nameParts = name.split(' ')
  const firstName = nameParts[0] || 'Unknown'
  const lastName = nameParts.slice(1).join(' ') || firstName

  stats.contacts.total++

  if (DRY_RUN) {
    stats.contacts.created++
    return null
  }

  try {
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        organization_id: ORGANIZATION_ID,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        email_verified: !!email,
        phone: contact.ContactPhone || contact.LocationPhone || null,
        title: contact.ContactTitle || 'General Manager',
        role_category: 'decision_maker',
        decision_level: 'director',
        response_status: 'not_contacted',
      })
      .select()
      .single()

    if (error) {
      stats.contacts.errors++
      return null
    }

    stats.contacts.created++
    if (email) {
      existingContacts.set(email, newContact.id)
    }

    // Link to project
    await linkStakeholder(projectId, newContact.id, null, role)

    return newContact.id
  } catch (err) {
    stats.contacts.errors++
    return null
  }
}

// ============================================================================
// Import Company and Link
// ============================================================================

async function importCompanyAndLink(entity: any, projectId: string, role: string): Promise<string | null> {
  const companyName = entity.CompanyName?.trim()
  if (!companyName || companyName === ' ') return null

  const companyKey = companyName.toLowerCase()

  // Check if company exists
  let companyId = existingCompanies.get(companyKey)

  if (!companyId && !DRY_RUN) {
    stats.companies.total++

    try {
      const { data: newCompany, error } = await supabase
        .from('companies')
        .insert({
          organization_id: ORGANIZATION_ID,
          company_name: companyName,
          company_type: role,
          website: entity.CompanyUrl || null,
          phone: entity.LocationPhone || null,
          address: entity.LocationAddress1 || null,
          city: entity.LocationCity || null,
          state: entity.LocationState || null,
          relationship_status: 'prospect',
        })
        .select()
        .single()

      if (error) {
        stats.companies.errors++
      } else {
        stats.companies.created++
        companyId = newCompany.id
        existingCompanies.set(companyKey, companyId)
      }
    } catch (err) {
      stats.companies.errors++
    }
  }

  // Import contact if present
  if (entity.ContactName && entity.ContactName !== ' ') {
    await importContact(entity, projectId, role)
  }

  // Link company to project
  if (companyId) {
    await linkStakeholder(projectId, null, companyId, role)
  }

  return companyId || null
}

// ============================================================================
// Link Stakeholder
// ============================================================================

async function linkStakeholder(projectId: string, contactId: string | null, companyId: string | null, role: string) {
  if (DRY_RUN) {
    stats.stakeholders.created++
    return
  }

  if (!contactId && !companyId) return

  stats.stakeholders.total++

  try {
    const { error } = await supabase
      .from('project_stakeholders')
      .insert({
        project_id: projectId,
        contact_id: contactId,
        company_id: companyId,
        role_in_project: role,
        is_primary: role === 'general_manager' || role === 'owner',
      })

    if (error && !error.message.includes('duplicate')) {
      stats.stakeholders.errors++
    } else {
      stats.stakeholders.created++
    }
  } catch (err) {
    stats.stakeholders.errors++
  }
}

// ============================================================================
// Print Summary
// ============================================================================

function printSummary() {
  console.log('\n')
  console.log('═'.repeat(70))
  console.log('                    IMPORT COMPLETE')
  console.log('═'.repeat(70))
  console.log('')
  console.log('📊 RESULTS:')
  console.log('─'.repeat(70))
  console.log(`  Hotels:      ${stats.hotels.created} created, ${stats.hotels.skipped} skipped, ${stats.hotels.errors} errors`)
  console.log(`  Projects:    ${stats.projects.created} created, ${stats.projects.skipped} skipped, ${stats.projects.errors} errors`)
  console.log(`  SuperGroove: ${stats.supergroove.created} created, ${stats.supergroove.skipped} skipped, ${stats.supergroove.errors} errors`)
  console.log(`  Contacts:    ${stats.contacts.created} created, ${stats.contacts.errors} errors`)
  console.log(`  Companies:   ${stats.companies.created} created, ${stats.companies.errors} errors`)
  console.log(`  Stakeholders: ${stats.stakeholders.created} linked`)
  console.log('')
  console.log('─'.repeat(70))
  const totalCreated = stats.hotels.created + stats.projects.created + stats.supergroove.created
  const totalSkipped = stats.hotels.skipped + stats.projects.skipped + stats.supergroove.skipped
  console.log(`  TOTAL PROJECTS: ${totalCreated} created, ${totalSkipped} duplicates skipped`)
  console.log(`  TOTAL CONTACTS: ${stats.contacts.created} with verified emails`)
  console.log('═'.repeat(70))
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('═'.repeat(70))
  console.log('        MASTER IMPORT - ALL NORMALIZED DATA')
  console.log('═'.repeat(70))
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log('')

  // Check files exist
  console.log('📁 Checking files...')
  for (const [name, path] of Object.entries(FILES)) {
    const exists = existsSync(path)
    console.log(`  ${exists ? '✓' : '✗'} ${name}: ${exists ? 'Found' : 'NOT FOUND'}`)
  }

  await loadExistingData()
  await importHotels()
  await importProjects()
  await importSuperGroove()

  printSummary()
}

main().catch(console.error)
