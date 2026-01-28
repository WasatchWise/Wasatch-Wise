#!/usr/bin/env npx tsx

/**
 * Enrich SuperGroove contacts with Hunter.io
 *
 * Usage: npx tsx scripts/enrich-supergroove-contacts.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HUNTER_API_KEY = process.env.HUNTER_API_KEY!

function extractDomain(companyName: string): string | null {
  if (!companyName) return null
  const cleaned = companyName
    .toLowerCase()
    .replace(/\b(llc|inc|corp|ltd|group|hotels?|properties|hospitality|capital|investments|partners|associates|company|co\.?|the|international|corporation|resorts?|management)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
  return cleaned.length > 2 ? `${cleaned}.com` : null
}

async function hunterLookup(firstName: string, lastName: string, domain: string): Promise<string | null> {
  const url = new URL('https://api.hunter.io/v2/email-finder')
  url.searchParams.set('domain', domain)
  url.searchParams.set('first_name', firstName)
  url.searchParams.set('last_name', lastName)
  url.searchParams.set('api_key', HUNTER_API_KEY)

  const resp = await fetch(url.toString())
  const data = await resp.json()

  if (data.errors) {
    console.error('  Hunter error:', data.errors[0]?.details || data.errors)
    return null
  }

  return data.data?.email || null
}

async function run() {
  console.log('═'.repeat(60))
  console.log('HUNTER.IO CONTACT ENRICHMENT')
  console.log('═'.repeat(60))

  // Get contacts without emails that are linked to projects
  const { data: stakeholders, error: stakeholderError } = await supabase
    .from('project_stakeholders')
    .select(`
      contact_id,
      project_id,
      contacts (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .is('contacts.email', null)

  if (stakeholderError) {
    console.error('Error fetching stakeholders:', stakeholderError.message)
    return
  }

  // Filter to only contacts without emails
  const contactsToEnrich = stakeholders?.filter(s => s.contacts && !(s.contacts as any).email) || []
  console.log(`Found ${contactsToEnrich.length} linked contacts without emails\n`)

  let enriched = 0
  let notFound = 0
  let errors = 0

  for (let i = 0; i < contactsToEnrich.length; i++) {
    const stakeholder = contactsToEnrich[i]
    const contact = stakeholder.contacts as any

    if (!contact) continue

    // Get the project to find company name
    const { data: project } = await supabase
      .from('high_priority_projects')
      .select('raw_data, project_name')
      .eq('id', stakeholder.project_id)
      .single()

    if (!project?.raw_data) continue

    const rawData = project.raw_data as any
    const companyName = rawData.property_manager || rawData.owner
    if (!companyName) continue

    const domain = extractDomain(companyName)
    if (!domain) continue

    console.log(`[${i + 1}/${contactsToEnrich.length}] ${contact.first_name} ${contact.last_name} @ ${domain}`)

    try {
      const email = await hunterLookup(contact.first_name, contact.last_name, domain)

      if (email) {
        await supabase
          .from('contacts')
          .update({
            email,
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', contact.id)

        console.log(`  ✓ Found: ${email}`)
        enriched++
      } else {
        console.log('  ✗ Not found')
        notFound++
      }
    } catch (e: any) {
      console.error('  Error:', e.message)
      errors++
    }

    // Rate limit - 200ms between requests
    await new Promise(r => setTimeout(r, 200))
  }

  console.log('\n' + '═'.repeat(60))
  console.log('ENRICHMENT COMPLETE')
  console.log('═'.repeat(60))
  console.log(`Emails found:     ${enriched}`)
  console.log(`Not found:        ${notFound}`)
  console.log(`Errors:           ${errors}`)

  // Show final stats
  const { count: totalContacts } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
  const { count: withEmail } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).not('email', 'is', null)

  console.log('\nFinal Stats:')
  console.log(`Total contacts:   ${totalContacts}`)
  console.log(`With email:       ${withEmail}`)
  console.log(`Without email:    ${(totalContacts || 0) - (withEmail || 0)}`)
}

run().catch(console.error)
