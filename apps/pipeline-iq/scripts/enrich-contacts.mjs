#!/usr/bin/env node
/**
 * Email Enrichment Script
 *
 * Finds email addresses for contacts that only have phone numbers
 * Uses Hunter.io if HUNTER_API_KEY is set, otherwise generates pattern-based guesses
 *
 * Run: node scripts/enrich-contacts.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HUNTER_API_KEY = process.env.HUNTER_API_KEY

// Common email patterns
const EMAIL_PATTERNS = [
  '{first}.{last}',
  '{first}{last}',
  '{f}{last}',
  '{first}_{last}',
  '{first}',
  '{f}.{last}',
]

function generateEmailCandidates(firstName, lastName, domain) {
  if (!firstName || !domain) return []

  const first = firstName.toLowerCase().replace(/[^a-z]/g, '')
  const last = lastName?.toLowerCase().replace(/[^a-z]/g, '') || ''
  const f = first.charAt(0)

  const emails = []

  for (const pattern of EMAIL_PATTERNS) {
    let email = pattern
      .replace('{first}', first)
      .replace('{last}', last)
      .replace('{f}', f)

    if (!email.includes('{') && email.length > 2) {
      emails.push(email + '@' + domain)
    }
  }

  return emails
}

function extractDomain(companyName, website) {
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : 'https://' + website)
      return url.hostname.replace('www.', '')
    } catch {}
  }

  if (companyName) {
    const cleaned = companyName
      .toLowerCase()
      .replace(/\b(llc|inc|corp|ltd|group|hotels?|properties|hospitality|capital|investments|partners|associates|company|co\.?|the)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()

    if (cleaned.length > 2) {
      return cleaned + '.com'
    }
  }

  return null
}

async function hunterEmailFinder(firstName, lastName, domain) {
  if (!HUNTER_API_KEY) return null

  try {
    const url = new URL('https://api.hunter.io/v2/email-finder')
    url.searchParams.set('domain', domain)
    url.searchParams.set('first_name', firstName)
    url.searchParams.set('last_name', lastName)
    url.searchParams.set('api_key', HUNTER_API_KEY)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.data?.email) {
      return {
        email: data.data.email,
        confidence: data.data.score || 50,
        verified: true
      }
    }
  } catch (error) {
    console.error('Hunter.io error:', error.message)
  }

  return null
}

async function enrichContacts() {
  console.log('═'.repeat(60))
  console.log('EMAIL ENRICHMENT')
  console.log('═'.repeat(60))
  console.log('Hunter.io API:', HUNTER_API_KEY ? 'Configured' : 'Not configured (using pattern matching)')
  console.log('')

  // Get contacts without emails (excluding "Unknown" placeholder contacts)
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, phone')
    .is('email', null)
    .neq('first_name', 'Unknown')

  if (error) {
    console.error('Failed to fetch contacts:', error.message)
    return
  }

  // Also get contacts that are "Unknown" but have project links (we might be able to enrich from project data)
  const { data: unknownContacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, phone')
    .is('email', null)
    .eq('first_name', 'Unknown')

  const allContacts = [...(contacts || []), ...(unknownContacts || [])]

  console.log('Contacts to enrich:', allContacts.length)
  console.log('')

  let enriched = 0
  let skipped = 0

  for (const contact of allContacts) {
    // Get linked project to find company info
    const { data: links } = await supabase
      .from('project_stakeholders')
      .select('project_id')
      .eq('contact_id', contact.id)
      .limit(1)

    let companyName = ''
    let projectName = ''

    if (links?.[0]) {
      const { data: project } = await supabase
        .from('projects')
        .select('project_name, raw_data')
        .eq('id', links[0].project_id)
        .single()

      if (project) {
        projectName = project.project_name
        // Extract company from raw_data
        const companies = project.raw_data?.companies || []
        if (companies.length > 0) {
          companyName = companies[0]
        }
      }
    }

    // Try to find a domain
    const domain = extractDomain(companyName) || extractDomain(projectName)

    if (!domain) {
      console.log('Skip:', contact.first_name, contact.last_name, '- no domain found')
      skipped++
      continue
    }

    console.log('\nProcessing:', contact.first_name, contact.last_name)
    console.log('  Domain:', domain)

    let emailResult = null

    // Try Hunter.io first
    if (HUNTER_API_KEY && contact.first_name !== 'Unknown') {
      emailResult = await hunterEmailFinder(contact.first_name, contact.last_name, domain)
      if (emailResult) {
        console.log('  Hunter.io:', emailResult.email, '(' + emailResult.confidence + '% confidence)')
      }
    }

    // Fall back to pattern generation
    if (!emailResult && contact.first_name !== 'Unknown') {
      const candidates = generateEmailCandidates(contact.first_name, contact.last_name, domain)
      if (candidates.length > 0) {
        emailResult = {
          email: candidates[0],
          confidence: 30,
          verified: false
        }
        console.log('  Pattern:', emailResult.email, '(30% confidence, unverified)')
      }
    }

    if (emailResult) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          email: emailResult.email,
          email_verified: emailResult.verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)

      if (updateError) {
        console.log('  ERROR:', updateError.message)
      } else {
        enriched++
        console.log('  SAVED')
      }
    } else {
      skipped++
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('ENRICHMENT COMPLETE')
  console.log('═'.repeat(60))
  console.log('Contacts enriched:', enriched)
  console.log('Contacts skipped:', skipped)
  console.log('═'.repeat(60))

  // Final stats
  const { count: totalContacts } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
  const { count: withEmail } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).not('email', 'is', null)

  console.log('\nFINAL STATS:')
  console.log('Total contacts:', totalContacts)
  console.log('With email:', withEmail)
  console.log('Without email:', totalContacts - withEmail)
}

enrichContacts().catch(console.error)
