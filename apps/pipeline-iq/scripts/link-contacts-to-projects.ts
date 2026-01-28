#!/usr/bin/env npx tsx

/**
 * Link Contacts to Projects
 *
 * Fixes missing stakeholder links by matching hotel names from CSV to database projects.
 * Uses hotels_core.csv to get CW ProjectId -> hotel name mapping,
 * then matches by normalized name to find project UUIDs.
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

// Fetch all rows with pagination (Supabase has 1000 row default limit)
async function fetchAllFromProjectsTable() {
  const allProjects: any[] = []
  let offset = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('projects')  // Use 'projects' table, not 'high_priority_projects'
      .select('id, project_name, city, state')
      .range(offset, offset + pageSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    allProjects.push(...data)
    if (data.length < pageSize) break
    offset += pageSize
  }

  return allProjects
}

async function fetchAllContacts() {
  const allContacts: any[] = []
  let offset = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, email')
      .not('email', 'is', null)
      .range(offset, offset + pageSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    allContacts.push(...data)
    if (data.length < pageSize) break
    offset += pageSize
  }

  return allContacts
}

async function linkContactsToProjects() {
  console.log('═'.repeat(60))
  console.log('       LINKING CONTACTS TO PROJECTS')
  console.log('═'.repeat(60))
  console.log('')

  const hotelsPath = '/Users/johnlyman/Downloads/hotels_core.csv'
  const contactsPath = '/Users/johnlyman/Downloads/hotel_contacts.csv'

  if (!existsSync(hotelsPath) || !existsSync(contactsPath)) {
    console.log('Required CSV files not found')
    return
  }

  // Build CW ProjectId -> normalized hotel name
  const hotelsContent = readFileSync(hotelsPath, 'utf-8')
  const hotelsCsv = parse(hotelsContent, { columns: true, skip_empty_lines: true, trim: true })

  const cwIdToName = new Map<string, string>()
  for (const h of hotelsCsv) {
    if (h.ProjectId && h.Title) {
      cwIdToName.set(h.ProjectId, normalizeKey(h.Title))
    }
  }
  console.log('Hotels in CSV:', cwIdToName.size)

  // Load hotel_contacts.csv
  const contactsContent = readFileSync(contactsPath, 'utf-8')
  const csvContacts = parse(contactsContent, { columns: true, skip_empty_lines: true, trim: true })
  console.log('CSV contacts loaded:', csvContacts.length)

  // Get ALL projects from the 'projects' table (FK references this, not high_priority_projects)
  console.log('Fetching all projects from database...')
  const projects = await fetchAllFromProjectsTable()
  console.log('Projects in DB:', projects.length)

  // Build normalized name -> project UUID map
  const nameToUuid = new Map<string, string>()
  for (const p of projects) {
    if (p.project_name) {
      const key = normalizeKey(p.project_name)
      nameToUuid.set(key, p.id)
    }
  }
  console.log('Unique project names:', nameToUuid.size)

  // Get all contacts with emails
  const contacts = await fetchAllContacts()
  const emailToContact = new Map<string, string>()
  for (const c of contacts) {
    if (c.email) {
      emailToContact.set(c.email.toLowerCase(), c.id)
    }
  }
  console.log('Contacts with email:', emailToContact.size)

  // Get existing stakeholder links
  const { data: existingLinks } = await supabase
    .from('project_stakeholders')
    .select('project_id, contact_id')

  const linkedPairs = new Set<string>()
  for (const link of existingLinks || []) {
    linkedPairs.add(`${link.project_id}|${link.contact_id}`)
  }
  console.log('Existing links:', linkedPairs.size)
  console.log('')

  // Link contacts to projects
  let linked = 0
  let alreadyLinked = 0
  let hotelNotFound = 0
  let projectNotFound = 0
  let contactNotFound = 0

  const linksToCreate: any[] = []

  for (const csvContact of csvContacts) {
    const cwProjectId = csvContact.ProjectId
    const email = csvContact.ContactEmail?.toLowerCase().trim()

    if (!cwProjectId || !email) continue

    // Step 1: CW ProjectId -> normalized hotel name
    const hotelName = cwIdToName.get(cwProjectId)
    if (!hotelName) {
      hotelNotFound++
      continue
    }

    // Step 2: hotel name -> project UUID
    const projectUuid = nameToUuid.get(hotelName)
    if (!projectUuid) {
      projectNotFound++
      continue
    }

    // Step 3: email -> contact UUID
    const contactUuid = emailToContact.get(email)
    if (!contactUuid) {
      contactNotFound++
      continue
    }

    const pairKey = `${projectUuid}|${contactUuid}`
    if (linkedPairs.has(pairKey)) {
      alreadyLinked++
      continue
    }

    linksToCreate.push({
      project_id: projectUuid,
      contact_id: contactUuid,
      role_in_project: 'general_manager',
      is_primary: true,
    })
    linkedPairs.add(pairKey)
  }

  // Batch insert
  if (linksToCreate.length > 0) {
    const { error } = await supabase
      .from('project_stakeholders')
      .insert(linksToCreate)

    if (error) {
      console.error('Error inserting links:', error.message)
    } else {
      linked = linksToCreate.length
    }
  }

  console.log('─'.repeat(60))
  console.log('RESULTS:')
  console.log('  Newly linked:       ', linked)
  console.log('  Already linked:     ', alreadyLinked)
  console.log('  Hotel not in CSV:   ', hotelNotFound)
  console.log('  Project not in DB:  ', projectNotFound)
  console.log('  Contact not in DB:  ', contactNotFound)
  console.log('─'.repeat(60))

  // Verify NEPQ readiness
  console.log('')
  console.log('Verifying NEPQ readiness...')

  const { count: totalStakeholders } = await supabase
    .from('project_stakeholders')
    .select('*', { count: 'exact', head: true })

  const { data: projectsWithContacts } = await supabase
    .from('project_stakeholders')
    .select('project_id')
    .not('contact_id', 'is', null)

  const uniqueProjects = new Set(projectsWithContacts?.map(p => p.project_id))

  console.log('')
  console.log('═'.repeat(60))
  console.log('NEPQ-READY PROJECTS:', uniqueProjects.size)
  console.log('Total stakeholder links:', totalStakeholders)
  console.log('═'.repeat(60))
}

linkContactsToProjects().catch(console.error)
