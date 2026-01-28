#!/usr/bin/env npx tsx

/**
 * SuperGroove Hotel Importer
 *
 * Imports hotel profiles from supergroove.json into the GrooveLeads database.
 * - Creates projects for each hotel (as operating/retrofit properties)
 * - Extracts GM names from notes
 * - Creates owner/property manager companies
 * - Links contacts to projects via stakeholders
 * - Detects signals (reflagging, ownership change, etc.)
 * - Runs Hunter.io enrichment on contacts
 *
 * Usage:
 *   npx tsx scripts/import-supergroove-hotels.ts
 *   npx tsx scripts/import-supergroove-hotels.ts --dry-run
 *   npx tsx scripts/import-supergroove-hotels.ts --limit 50
 *   npx tsx scripts/import-supergroove-hotels.ts --enrich-only
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ORGANIZATION_ID = '34249404-774f-4b80-b346-a2d9e6322584'
const HUNTER_API_KEY = process.env.HUNTER_API_KEY

// ============================================================================
// Types
// ============================================================================

interface HotelRecord {
  hotel_name: string
  street_address: string
  city: string
  state: string
  zip: string
  num_rooms: string
  rate_min: string
  rate_max: string
  opened_closed: string
  chain: string
  scale: string
  owner: string
  property_manager: string
  created_date: string
  updated_date: string
  notes: string
}

interface ParsedSignals {
  hasReflagging: boolean
  hasOwnershipChange: boolean
  hasManagementChange: boolean
  hasPersonnelChange: boolean
  hasPIP: boolean
  gmName: string | null
  gmNames: string[]
  recentActivity: boolean
}

interface ImportStats {
  total: number
  projectsCreated: number
  projectsSkipped: number
  companiesCreated: number
  contactsCreated: number
  stakeholdersCreated: number
  emailsEnriched: number
  errors: number
}

// ============================================================================
// Signal Parsing
// ============================================================================

function parseSignals(notes: string): ParsedSignals {
  const signals: ParsedSignals = {
    hasReflagging: false,
    hasOwnershipChange: false,
    hasManagementChange: false,
    hasPersonnelChange: false,
    hasPIP: false,
    gmName: null,
    gmNames: [],
    recentActivity: false,
  }

  if (!notes) return signals

  const notesLower = notes.toLowerCase()

  // Check for key signals
  signals.hasReflagging = notesLower.includes('reflagging')
  signals.hasOwnershipChange = notesLower.includes('ownership change')
  signals.hasManagementChange = notesLower.includes('management change')
  signals.hasPersonnelChange = notesLower.includes('personnel change')
  signals.hasPIP = notesLower.includes('property improvement plan') || notesLower.includes(' pip ')

  // Check for recent activity (within last 6 months)
  const recentPatterns = [
    /december 2025/i,
    /november 2025/i,
    /october 2025/i,
    /september 2025/i,
    /august 2025/i,
    /july 2025/i,
    /12\/15\/25/,
    /2025/,
  ]
  signals.recentActivity = recentPatterns.some(p => p.test(notes))

  // Extract GM names from notes
  // Pattern: "X is the general manager" or "X has been confirmed as the general manager"
  const gmPatterns = [
    /(\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is|has been confirmed as)\s+the general manager/gi,
    /general manager[^.]*?(?:is|:)\s*(\b[A-Z][a-z]+ [A-Z][a-z]+)/gi,
    /stated that\s+([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+is the general manager/gi,
  ]

  const foundGMs = new Set<string>()

  for (const pattern of gmPatterns) {
    let match
    while ((match = pattern.exec(notes)) !== null) {
      let name = match[1]?.trim()
      // Clean up common prefixes that might get captured
      if (name) {
        name = name.replace(/^that\s+/i, '').trim()
      }
      if (name && name.length > 3 && !name.includes('Hotel') && !name.includes('Inn')) {
        foundGMs.add(name)
      }
    }
  }

  signals.gmNames = Array.from(foundGMs)
  signals.gmName = signals.gmNames[0] || null

  return signals
}

// ============================================================================
// Scoring for Operating Hotels
// ============================================================================

function calculateHotelScore(hotel: HotelRecord, signals: ParsedSignals): number {
  let score = 0

  // Base score for hotel type (30 points)
  score += 30

  // Scale scoring (10 points)
  const scaleScores: Record<string, number> = {
    'Luxury': 10,
    'Upscale': 8,
    'Mid-Range': 6,
    'Budget': 4,
    'Economy': 3,
  }
  score += scaleScores[hotel.scale] || 5

  // Room count scoring (15 points)
  const rooms = parseInt(hotel.num_rooms) || 0
  if (rooms >= 300) score += 15
  else if (rooms >= 200) score += 12
  else if (rooms >= 150) score += 10
  else if (rooms >= 100) score += 8
  else if (rooms >= 50) score += 5
  else score += 2

  // Signal-based scoring (25 points)
  if (signals.hasReflagging) score += 10  // Reflagging = new tech requirements
  if (signals.hasOwnershipChange) score += 8  // New owner = capital expenditure
  if (signals.hasManagementChange) score += 5  // New management = new vendor openness
  if (signals.hasPersonnelChange) score += 3  // New GM = new relationships
  if (signals.hasPIP) score += 10  // PIP = definite upgrade budget
  if (signals.recentActivity) score += 3  // Recent data = active property

  // Location scoring (10 points)
  const priorityStates = ['CA', 'FL', 'TX', 'AZ', 'NY', 'IL', 'CO', 'GA', 'NV', 'UT']
  if (priorityStates.includes(hotel.state)) score += 5

  // Chain scoring (5 points) - Independents may be more accessible
  if (hotel.chain.toLowerCase().includes('independent')) score += 5
  else if (hotel.chain) score += 2

  // Cap at 100
  return Math.min(score, 100)
}

function getPriorityLevel(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) return 'hot'
  if (score >= 55) return 'warm'
  return 'cold'
}

// ============================================================================
// Company Creation
// ============================================================================

async function getOrCreateCompany(
  companyName: string,
  companyType: 'owner' | 'property_manager',
  dryRun: boolean
): Promise<string | null> {
  if (!companyName || companyName.trim() === '') return null

  const normalizedName = companyName.trim()

  // Check if company exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('company_name', normalizedName)
    .eq('organization_id', ORGANIZATION_ID)
    .single()

  if (existing) return existing.id

  if (dryRun) {
    console.log(`  [DRY RUN] Would create company: ${normalizedName} (${companyType})`)
    return null
  }

  // Create new company
  const { data: newCompany, error } = await supabase
    .from('companies')
    .insert({
      organization_id: ORGANIZATION_ID,
      company_name: normalizedName,
      company_type: companyType,
      relationship_status: 'prospect',
    })
    .select('id')
    .single()

  if (error) {
    console.error(`  Error creating company ${normalizedName}:`, error.message)
    return null
  }

  return newCompany.id
}

// ============================================================================
// Contact Creation
// ============================================================================

async function getOrCreateContact(
  fullName: string,
  title: string,
  companyId: string | null,
  dryRun: boolean
): Promise<string | null> {
  if (!fullName || fullName.trim() === '') return null

  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  // Check if contact exists
  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('first_name', firstName)
    .eq('last_name', lastName)
    .eq('organization_id', ORGANIZATION_ID)
    .single()

  if (existing) return existing.id

  if (dryRun) {
    console.log(`  [DRY RUN] Would create contact: ${fullName} (${title})`)
    return null
  }

  // Create new contact
  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert({
      organization_id: ORGANIZATION_ID,
      first_name: firstName,
      last_name: lastName,
      title: title,
      role_category: 'decision_maker',
      decision_level: title.toLowerCase().includes('general manager') ? 'director' : 'manager',
      response_status: 'not_contacted',
    })
    .select('id')
    .single()

  if (error) {
    console.error(`  Error creating contact ${fullName}:`, error.message)
    return null
  }

  return newContact.id
}

// ============================================================================
// Hunter.io Enrichment
// ============================================================================

async function enrichContactWithHunter(
  contactId: string,
  firstName: string,
  lastName: string,
  companyName: string
): Promise<string | null> {
  if (!HUNTER_API_KEY) return null

  // Extract domain from company name
  const domain = extractDomain(companyName)
  if (!domain) return null

  try {
    const url = new URL('https://api.hunter.io/v2/email-finder')
    url.searchParams.set('domain', domain)
    url.searchParams.set('first_name', firstName)
    url.searchParams.set('last_name', lastName)
    url.searchParams.set('api_key', HUNTER_API_KEY)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.data?.email) {
      // Update contact with found email
      await supabase
        .from('contacts')
        .update({
          email: data.data.email,
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId)

      return data.data.email
    }
  } catch (error: any) {
    console.error(`  Hunter.io error for ${firstName} ${lastName}:`, error.message)
  }

  return null
}

function extractDomain(companyName: string): string | null {
  if (!companyName) return null

  const cleaned = companyName
    .toLowerCase()
    .replace(/\b(llc|inc|corp|ltd|group|hotels?|properties|hospitality|capital|investments|partners|associates|company|co\.?|the|international|corporation)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()

  if (cleaned.length > 2) {
    return `${cleaned}.com`
  }

  return null
}

// ============================================================================
// Main Import Function
// ============================================================================

async function importHotels(options: {
  dryRun: boolean
  limit?: number
  enrichOnly: boolean
}) {
  console.log('═'.repeat(70))
  console.log('SUPERGROOVE HOTEL IMPORTER')
  console.log('═'.repeat(70))
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Hunter.io: ${HUNTER_API_KEY ? 'Configured' : 'Not configured'}`)
  if (options.limit) console.log(`Limit: ${options.limit} hotels`)
  console.log('')

  const stats: ImportStats = {
    total: 0,
    projectsCreated: 0,
    projectsSkipped: 0,
    companiesCreated: 0,
    contactsCreated: 0,
    stakeholdersCreated: 0,
    emailsEnriched: 0,
    errors: 0,
  }

  // Read hotel data
  const jsonPath = './supergroove.json'
  let hotels: HotelRecord[]

  try {
    const content = readFileSync(jsonPath, 'utf-8')
    hotels = JSON.parse(content)
    console.log(`Loaded ${hotels.length} hotels from ${jsonPath}`)
  } catch (error: any) {
    console.error(`Failed to read ${jsonPath}:`, error.message)
    return
  }

  // Apply limit if specified
  if (options.limit) {
    hotels = hotels.slice(0, options.limit)
  }

  stats.total = hotels.length

  // If enrich-only, just run enrichment on existing contacts
  if (options.enrichOnly) {
    await runEnrichmentOnly(stats)
    return
  }

  console.log('')
  console.log('─'.repeat(70))
  console.log('IMPORTING HOTELS')
  console.log('─'.repeat(70))

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i]
    const progress = `[${i + 1}/${hotels.length}]`

    console.log(`\n${progress} ${hotel.hotel_name}`)
    console.log(`    ${hotel.city}, ${hotel.state} | ${hotel.num_rooms} rooms | ${hotel.scale}`)

    // Parse signals from notes
    const signals = parseSignals(hotel.notes)

    if (signals.hasReflagging) console.log('    Signal: REFLAGGING')
    if (signals.hasOwnershipChange) console.log('    Signal: OWNERSHIP CHANGE')
    if (signals.hasPIP) console.log('    Signal: PIP')
    if (signals.gmName) console.log(`    GM: ${signals.gmName}`)

    // Calculate score
    const grooveScore = calculateHotelScore(hotel, signals)
    const priorityLevel = getPriorityLevel(grooveScore)
    console.log(`    Score: ${grooveScore} (${priorityLevel})`)

    // Generate unique ID
    const hotelId = `SG-${hotel.state}-${hotel.city.replace(/\s+/g, '')}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

    // Check if hotel already exists
    const { data: existing } = await supabase
      .from('high_priority_projects')
      .select('id')
      .eq('project_name', hotel.hotel_name)
      .eq('city', hotel.city)
      .eq('state', hotel.state)
      .eq('organization_id', ORGANIZATION_ID)
      .single()

    if (existing) {
      console.log('    SKIPPED (already exists)')
      stats.projectsSkipped++
      continue
    }

    if (options.dryRun) {
      console.log('    [DRY RUN] Would create project')
      continue
    }

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('high_priority_projects')
        .insert({
          organization_id: ORGANIZATION_ID,
          cw_project_id: hotelId,
          project_name: hotel.hotel_name,
          project_type: ['hotel'],
          project_stage: signals.hasReflagging || signals.hasPIP ? 'renovation' : 'operating',
          units_count: parseInt(hotel.num_rooms) || null,
          city: hotel.city,
          state: hotel.state,
          zip: hotel.zip,
          address: hotel.street_address,
          groove_fit_score: grooveScore,
          engagement_score: 0,
          timing_score: signals.recentActivity ? 60 : 30,
          total_score: Math.round(grooveScore * 0.7 + (signals.recentActivity ? 60 : 30) * 0.3),
          priority_level: priorityLevel,
          outreach_status: 'new',
          data_source: 'supergroove',
          raw_data: {
            source: 'supergroove',
            chain: hotel.chain,
            scale: hotel.scale,
            rate_min: hotel.rate_min,
            rate_max: hotel.rate_max,
            opened_closed: hotel.opened_closed,
            owner: hotel.owner,
            property_manager: hotel.property_manager,
            signals: {
              reflagging: signals.hasReflagging,
              ownership_change: signals.hasOwnershipChange,
              management_change: signals.hasManagementChange,
              personnel_change: signals.hasPersonnelChange,
              pip: signals.hasPIP,
            },
            gm_names: signals.gmNames,
            notes: hotel.notes,
            imported_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (projectError) {
        console.error(`    ERROR creating project:`, projectError.message)
        stats.errors++
        continue
      }

      stats.projectsCreated++
      console.log(`    Created project: ${project.id}`)

      // Create owner company
      let ownerCompanyId: string | null = null
      if (hotel.owner) {
        ownerCompanyId = await getOrCreateCompany(hotel.owner, 'owner', options.dryRun)
        if (ownerCompanyId) stats.companiesCreated++
      }

      // Create property manager company (if different from owner)
      let pmCompanyId: string | null = null
      if (hotel.property_manager && hotel.property_manager !== hotel.owner) {
        pmCompanyId = await getOrCreateCompany(hotel.property_manager, 'property_manager', options.dryRun)
        if (pmCompanyId) stats.companiesCreated++
      }

      // Create GM contacts and link to project
      for (const gmName of signals.gmNames) {
        const contactId = await getOrCreateContact(
          gmName,
          'General Manager',
          pmCompanyId || ownerCompanyId,
          options.dryRun
        )

        if (contactId) {
          stats.contactsCreated++

          // Create stakeholder link
          const { error: stakeholderError } = await supabase
            .from('project_stakeholders')
            .insert({
              project_id: project.id,
              contact_id: contactId,
              company_id: pmCompanyId || ownerCompanyId,
              role_in_project: 'general_manager',
              is_primary: true,
            })

          if (!stakeholderError) {
            stats.stakeholdersCreated++
            console.log(`    Linked GM: ${gmName}`)
          }

          // Try Hunter.io enrichment
          if (HUNTER_API_KEY) {
            const nameParts = gmName.split(' ')
            const firstName = nameParts[0]
            const lastName = nameParts.slice(1).join(' ') || firstName
            const companyForEnrich = hotel.property_manager || hotel.owner

            const email = await enrichContactWithHunter(
              contactId,
              firstName,
              lastName,
              companyForEnrich
            )

            if (email) {
              stats.emailsEnriched++
              console.log(`    Enriched email: ${email}`)
            }
          }
        }
      }

    } catch (error: any) {
      console.error(`    ERROR:`, error.message)
      stats.errors++
    }
  }

  // Print summary
  printSummary(stats)
}

async function runEnrichmentOnly(stats: ImportStats) {
  console.log('─'.repeat(70))
  console.log('RUNNING ENRICHMENT ONLY')
  console.log('─'.repeat(70))

  if (!HUNTER_API_KEY) {
    console.log('ERROR: HUNTER_API_KEY not configured')
    return
  }

  // Get contacts without emails from SuperGroove imports
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      title,
      project_stakeholders (
        projects:high_priority_projects (
          raw_data
        )
      )
    `)
    .eq('organization_id', ORGANIZATION_ID)
    .is('email', null)

  if (error) {
    console.error('Error fetching contacts:', error.message)
    return
  }

  console.log(`Found ${contacts?.length || 0} contacts without emails`)

  for (const contact of contacts || []) {
    // Get company name from linked project
    let companyName = ''
    const stakeholders = contact.project_stakeholders as any[]
    if (stakeholders?.[0]?.projects?.raw_data) {
      companyName = stakeholders[0].projects.raw_data.property_manager ||
                    stakeholders[0].projects.raw_data.owner || ''
    }

    if (!companyName) continue

    const email = await enrichContactWithHunter(
      contact.id,
      contact.first_name,
      contact.last_name,
      companyName
    )

    if (email) {
      stats.emailsEnriched++
      console.log(`Enriched: ${contact.first_name} ${contact.last_name} -> ${email}`)
    }
  }

  console.log('')
  console.log('═'.repeat(70))
  console.log('ENRICHMENT COMPLETE')
  console.log('═'.repeat(70))
  console.log(`Emails enriched: ${stats.emailsEnriched}`)
}

function printSummary(stats: ImportStats) {
  console.log('')
  console.log('═'.repeat(70))
  console.log('IMPORT SUMMARY')
  console.log('═'.repeat(70))
  console.log(`Total hotels processed: ${stats.total}`)
  console.log(`Projects created:       ${stats.projectsCreated}`)
  console.log(`Projects skipped:       ${stats.projectsSkipped}`)
  console.log(`Companies created:      ${stats.companiesCreated}`)
  console.log(`Contacts created:       ${stats.contactsCreated}`)
  console.log(`Stakeholders linked:    ${stats.stakeholdersCreated}`)
  console.log(`Emails enriched:        ${stats.emailsEnriched}`)
  console.log(`Errors:                 ${stats.errors}`)
  console.log('═'.repeat(70))
}

// ============================================================================
// CLI Entry Point
// ============================================================================

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const enrichOnly = args.includes('--enrich-only')
const limitArg = args.find(a => a.startsWith('--limit'))
const limit = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf('--limit') + 1]) : undefined

importHotels({ dryRun, limit, enrichOnly }).catch(console.error)
