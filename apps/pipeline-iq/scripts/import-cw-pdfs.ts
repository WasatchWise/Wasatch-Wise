#!/usr/bin/env npx tsx

/**
 * Import Construction Wire PDF Exports
 *
 * Reads PDF files from project_prints directory and imports:
 * - Hotels/Projects
 * - Companies (Owner, Property Manager)
 * - Contacts (General Manager)
 * - Stakeholder links
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// @ts-ignore - pdf-parse uses CommonJS
import pdfParse from 'pdf-parse'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface HotelData {
  cwId: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax: string
  opened: string
  rooms: number | null
  chain: string
  franchise: string
  scale: string
  amenities: string[]
  meetingRoomSqft: number | null
  restaurants: string
  parking: string
  other: string
  activities: string[]
  companies: CompanyData[]
  contacts: ContactData[]
}

interface CompanyData {
  role: string // 'owner' | 'property_manager'
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
}

interface ContactData {
  role: string // 'general_manager' etc
  name: string
}

function parseAddress(addressBlock: string): { address: string; city: string; state: string; zip: string } {
  const lines = addressBlock.split('\n').map(l => l.trim()).filter(Boolean)
  let address = ''
  let city = ''
  let state = ''
  let zip = ''

  if (lines.length >= 2) {
    address = lines[0]
    // Parse "City ST ZIP" or "City, ST ZIP"
    const cityLine = lines[1]
    const match = cityLine.match(/^(.+?),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
    if (match) {
      city = match[1].trim()
      state = match[2]
      zip = match[3]
    } else {
      city = cityLine
    }
  } else if (lines.length === 1) {
    address = lines[0]
  }

  return { address, city, state, zip }
}

function extractCompanyAddress(text: string): { address: string; city: string; state: string; zip: string } {
  // Pattern: "123 Street Name Suite 100\nCity, ST 12345"
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let address = ''
  let city = ''
  let state = ''
  let zip = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Check if this is a city/state/zip line
    const cityMatch = line.match(/^(.+?),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/)
    if (cityMatch) {
      city = cityMatch[1].trim()
      state = cityMatch[2]
      zip = cityMatch[3]
      // Everything before this is address
      address = lines.slice(0, i).join(', ')
      break
    }
  }

  return { address, city, state, zip }
}

async function parsePdf(filePath: string): Promise<HotelData | null> {
  try {
    const dataBuffer = readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    const text = data.text

    // Extract CW ID from URL pattern
    const cwIdMatch = text.match(/DetailsPrint\/(\d+)\?/)
    const cwId = cwIdMatch ? cwIdMatch[1] : ''

    if (!cwId) {
      console.log(`  No CW ID found in ${filePath}`)
      return null
    }

    // Extract hotel name - appears after "Location" heading
    const nameMatch = text.match(/Location\s+([A-Z][^\n]+(?:\n[A-Z][^\n]+)?)/m)
    let name = ''
    if (nameMatch) {
      // Take first line that looks like a hotel name
      const lines = nameMatch[1].split('\n').map(l => l.trim())
      name = lines[0] || ''
    }

    // Try alternate pattern - hotel name appears prominently
    if (!name) {
      const altNameMatch = text.match(/Print\s+Location\s+([^\n]+)/)
      if (altNameMatch) {
        name = altNameMatch[1].trim()
      }
    }

    // Extract address block
    const addressMatch = text.match(/(\d+\s+[^\n]+)\n([^\n]+\s+[A-Z]{2}\s+\d{5})/m)
    let address = ''
    let city = ''
    let state = ''
    let zip = ''

    if (addressMatch) {
      address = addressMatch[1].trim()
      const parsed = parseAddress(addressMatch[0])
      city = parsed.city
      state = parsed.state
      zip = parsed.zip
    }

    // Extract phone/fax
    const phoneMatch = text.match(/P:\s*([\d-]+)/)
    const faxMatch = text.match(/F:\s*([\d-]+)/)
    const phone = phoneMatch ? phoneMatch[1] : ''
    const fax = faxMatch ? faxMatch[1] : ''

    // Extract hotel info
    const openedMatch = text.match(/Opened:\s*(\d{4}|N\/A)/)
    const roomsMatch = text.match(/Rooms:\s*(\d+)/)
    const chainMatch = text.match(/Chain:\s*([^\n]+)/)
    const franchiseMatch = text.match(/Franchise:\s*([^\n]+)/)
    const scaleMatch = text.match(/Scale:\s*([^\n]+)/)

    const opened = openedMatch ? openedMatch[1] : ''
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : null
    const chain = chainMatch ? chainMatch[1].trim() : ''
    const franchise = franchiseMatch ? franchiseMatch[1].trim() : ''
    const scale = scaleMatch ? scaleMatch[1].trim() : ''

    // Extract amenities
    const amenities: string[] = []
    if (text.includes('Pool')) amenities.push('Pool')
    if (text.includes('Fitness Center')) amenities.push('Fitness Center')
    if (text.includes('Spa')) amenities.push('Spa')

    const meetingMatch = text.match(/Meeting Room:\s*([\d,]+)\s*sq-ft/)
    const meetingRoomSqft = meetingMatch ? parseInt(meetingMatch[1].replace(/,/g, '')) : null

    const restaurantsMatch = text.match(/Restaurants:\s*([^\n]+)/)
    const restaurants = restaurantsMatch ? restaurantsMatch[1].trim() : ''

    const parkingMatch = text.match(/Parking:\s*([^\n]+)/)
    const parking = parkingMatch ? parkingMatch[1].trim() : ''

    const otherMatch = text.match(/Other:\s*([^\n]+)/)
    const other = otherMatch ? otherMatch[1].trim() : ''

    // Extract activities (simplified - just capture dates and types)
    const activities: string[] = []
    const activityRegex = /(\w+\s+\d{1,2},\s+\d{4}):\s*([^\n]+)/g
    let actMatch
    while ((actMatch = activityRegex.exec(text)) !== null) {
      activities.push(`${actMatch[1]}: ${actMatch[2]}`)
    }

    // Extract companies from Contact Information section
    const companies: CompanyData[] = []

    // Owner pattern - company name ends before first digit (address starts)
    const ownerMatch = text.match(/Owner(?:,\s*Property\s*Manager)?\s+([A-Za-z][A-Za-z\s\/&'-]+?)(?:\s+)?(\d+[^\n]+(?:\n[^\n]+)?[A-Z]{2}\s+\d{5})/m)
    if (ownerMatch) {
      const companyName = ownerMatch[1].trim()
      const addrInfo = extractCompanyAddress(ownerMatch[2])
      const ownerPhoneMatch = text.match(/P:\s*([\d-]+)/)

      companies.push({
        role: 'owner',
        name: companyName,
        ...addrInfo,
        phone: ownerPhoneMatch ? ownerPhoneMatch[1] : ''
      })
    }

    // Property Manager pattern (if separate from owner)
    const pmMatch = text.match(/Property Manager\s+([A-Za-z][A-Za-z\s\/&'-]+?)(?:\s+)?(\d+[^\n]+(?:\n[^\n]+)?[A-Z]{2}\s+\d{5})/m)
    if (pmMatch && (!ownerMatch || pmMatch[1].trim() !== ownerMatch[1].trim())) {
      const companyName = pmMatch[1].trim()
      const addrInfo = extractCompanyAddress(pmMatch[2])
      const pmPhoneMatch = text.match(/P:\s*([\d-]+)/)

      companies.push({
        role: 'property_manager',
        name: companyName,
        ...addrInfo,
        phone: pmPhoneMatch ? pmPhoneMatch[1] : ''
      })
    }

    // Extract contacts from Building Contacts section
    const contacts: ContactData[] = []
    const gmMatch = text.match(/General Manager\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
    if (gmMatch) {
      contacts.push({
        role: 'general_manager',
        name: gmMatch[1].trim()
      })
    }

    return {
      cwId,
      name,
      address,
      city,
      state,
      zip,
      phone,
      fax,
      opened,
      rooms,
      chain,
      franchise,
      scale,
      amenities,
      meetingRoomSqft,
      restaurants,
      parking,
      other,
      activities,
      companies,
      contacts
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

async function importHotels(pdfDir: string, dryRun: boolean = false) {
  console.log('═'.repeat(60))
  console.log('  IMPORTING CONSTRUCTION WIRE PDF EXPORTS')
  console.log('═'.repeat(60))
  console.log('')
  console.log('Directory:', pdfDir)
  console.log('Mode:', dryRun ? 'DRY RUN' : 'LIVE')
  console.log('')

  // Find all PDFs
  const files = readdirSync(pdfDir).filter(f => f.endsWith('.pdf'))
  console.log('PDF files found:', files.length)
  console.log('')

  const hotels: HotelData[] = []

  // Parse all PDFs
  for (const file of files) {
    console.log(`Parsing: ${file}...`)
    const hotel = await parsePdf(join(pdfDir, file))
    if (hotel) {
      hotels.push(hotel)
      console.log(`  ✓ ${hotel.name} (CW #${hotel.cwId})`)
      console.log(`    ${hotel.city}, ${hotel.state} | ${hotel.rooms || '?'} rooms | ${hotel.chain}`)
      console.log(`    Companies: ${hotel.companies.map(c => c.name).join(', ') || 'None'}`)
      console.log(`    Contacts: ${hotel.contacts.map(c => c.name).join(', ') || 'None'}`)
    }
  }

  console.log('')
  console.log('─'.repeat(60))
  console.log('PARSED:', hotels.length, 'hotels')
  console.log('─'.repeat(60))
  console.log('')

  if (dryRun) {
    console.log('DRY RUN - No changes made to database')
    return
  }

  // Check for existing projects with same CW IDs
  const cwIds = hotels.map(h => h.cwId)
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('id, cw_project_id, project_name')
    .in('cw_project_id', cwIds)

  const existingCwIds = new Set(existingProjects?.map(p => p.cw_project_id) || [])

  let projectsCreated = 0
  let projectsSkipped = 0
  let companiesCreated = 0
  let contactsCreated = 0
  let stakeholdersCreated = 0

  for (const hotel of hotels) {
    // Skip if already exists
    if (existingCwIds.has(hotel.cwId)) {
      console.log(`Skipping ${hotel.name} - already exists (CW #${hotel.cwId})`)
      projectsSkipped++
      continue
    }

    // Create project
    const projectData = {
      cw_project_id: hotel.cwId,
      project_name: hotel.name,
      project_type: ['hotel'],
      project_stage: 'operating',
      units_count: hotel.rooms,
      project_size_sqft: hotel.meetingRoomSqft,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      zip: hotel.zip,
      data_source: 'construction_wire_pdf',
      scraped_at: new Date().toISOString(),
      raw_data: {
        phone: hotel.phone,
        fax: hotel.fax,
        opened: hotel.opened,
        chain: hotel.chain,
        franchise: hotel.franchise,
        scale: hotel.scale,
        amenities: hotel.amenities,
        restaurants: hotel.restaurants,
        parking: hotel.parking,
        other: hotel.other,
        activities: hotel.activities
      }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select('id')
      .single()

    if (projectError) {
      console.error(`Error creating project ${hotel.name}:`, projectError.message)
      continue
    }

    projectsCreated++
    console.log(`✓ Created project: ${hotel.name}`)

    // Create companies and link as stakeholders
    for (const company of hotel.companies) {
      // Check if company already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('company_name', company.name)
        .single()

      let companyId: string

      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_name: company.name,
            company_type: company.role === 'owner' ? 'owner' : 'property_manager',
            address: company.address,
            city: company.city,
            state: company.state,
            zip: company.zip,
            phone: company.phone
          })
          .select('id')
          .single()

        if (companyError) {
          console.error(`Error creating company ${company.name}:`, companyError.message)
          continue
        }

        companyId = newCompany.id
        companiesCreated++
        console.log(`  ✓ Created company: ${company.name}`)
      }

      // Link company to project as stakeholder
      const { error: stakeholderError } = await supabase
        .from('project_stakeholders')
        .insert({
          project_id: project.id,
          company_id: companyId,
          role_in_project: company.role,
          is_primary: company.role === 'owner'
        })

      if (!stakeholderError) {
        stakeholdersCreated++
      }
    }

    // Create contacts and link as stakeholders
    for (const contact of hotel.contacts) {
      // Split name into first/last
      const nameParts = contact.name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      // Check if contact already exists
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
            title: contact.role === 'general_manager' ? 'General Manager' : contact.role
          })
          .select('id')
          .single()

        if (contactError) {
          console.error(`Error creating contact ${contact.name}:`, contactError.message)
          continue
        }

        contactId = newContact.id
        contactsCreated++
        console.log(`  ✓ Created contact: ${contact.name}`)
      }

      // Link contact to project as stakeholder
      const { error: stakeholderError } = await supabase
        .from('project_stakeholders')
        .insert({
          project_id: project.id,
          contact_id: contactId,
          role_in_project: contact.role,
          is_primary: contact.role === 'general_manager'
        })

      if (!stakeholderError) {
        stakeholdersCreated++
      }
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

  console.log('─'.repeat(60))
  console.log('NEPQ-READY PROJECTS:', uniqueNepqProjects.size)
  console.log('─'.repeat(60))
}

// Parse command line args
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const pdfDir = args.find(a => !a.startsWith('--')) || '/Users/johnlyman/Desktop/groove/project_prints'

importHotels(pdfDir, dryRun).catch(console.error)
