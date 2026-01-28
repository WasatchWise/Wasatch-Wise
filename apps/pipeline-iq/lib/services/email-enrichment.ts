/**
 * Email Enrichment Service
 *
 * Finds email addresses for contacts using:
 * 1. Hunter.io API (if configured)
 * 2. Email pattern generation from company domain
 * 3. Common email patterns
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EnrichmentResult {
  contactId: string
  email: string | null
  source: 'hunter' | 'pattern' | 'manual' | null
  confidence: number
  verified: boolean
}

// Common email patterns
const EMAIL_PATTERNS = [
  '{first}.{last}',      // john.smith
  '{first}{last}',       // johnsmith
  '{f}{last}',           // jsmith
  '{first}_{last}',      // john_smith
  '{first}',             // john
  '{last}',              // smith
  '{f}.{last}',          // j.smith
  '{first}.{l}',         // john.s
]

/**
 * Generate possible email addresses based on name and domain
 */
export function generateEmailCandidates(
  firstName: string,
  lastName: string,
  domain: string
): string[] {
  if (!firstName || !domain) return []

  const first = firstName.toLowerCase().replace(/[^a-z]/g, '')
  const last = lastName?.toLowerCase().replace(/[^a-z]/g, '') || ''
  const f = first.charAt(0)
  const l = last.charAt(0)

  const emails: string[] = []

  for (const pattern of EMAIL_PATTERNS) {
    const email = pattern
      .replace('{first}', first)
      .replace('{last}', last)
      .replace('{f}', f)
      .replace('{l}', l)

    // Skip patterns that didn't have all variables
    if (!email.includes('{') && email.length > 2) {
      emails.push(`${email}@${domain}`)
    }
  }

  return emails
}

/**
 * Extract company domain from company name or website
 */
export function extractDomain(companyName: string, website?: string): string | null {
  // Try website first
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      return url.hostname.replace('www.', '')
    } catch {
      // Invalid URL
    }
  }

  // Try to guess domain from company name
  if (companyName) {
    const cleaned = companyName
      .toLowerCase()
      .replace(/\b(llc|inc|corp|ltd|group|hotels?|properties|hospitality|capital|investments|partners|associates|company|co\.?|the)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()

    if (cleaned.length > 2) {
      return `${cleaned}.com`
    }
  }

  return null
}

/**
 * Use Hunter.io to find email (requires HUNTER_API_KEY env var)
 */
export async function hunterEmailFinder(
  firstName: string,
  lastName: string,
  domain: string
): Promise<{ email: string | null; confidence: number }> {
  const apiKey = process.env.HUNTER_API_KEY

  if (!apiKey) {
    return { email: null, confidence: 0 }
  }

  try {
    const url = new URL('https://api.hunter.io/v2/email-finder')
    url.searchParams.set('domain', domain)
    url.searchParams.set('first_name', firstName)
    url.searchParams.set('last_name', lastName)
    url.searchParams.set('api_key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.data?.email) {
      return {
        email: data.data.email,
        confidence: data.data.score || 50
      }
    }
  } catch (error) {
    console.error('Hunter.io API error:', error)
  }

  return { email: null, confidence: 0 }
}

/**
 * Verify email exists using simple validation
 * (Full verification would require SMTP check)
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Enrich a contact with email
 */
export async function enrichContact(
  contactId: string,
  firstName: string,
  lastName: string,
  companyName?: string,
  companyWebsite?: string
): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    contactId,
    email: null,
    source: null,
    confidence: 0,
    verified: false
  }

  // Try to get domain
  const domain = extractDomain(companyName || '', companyWebsite)

  if (!domain) {
    return result
  }

  // Try Hunter.io first (most reliable)
  if (process.env.HUNTER_API_KEY) {
    const hunterResult = await hunterEmailFinder(firstName, lastName, domain)
    if (hunterResult.email) {
      result.email = hunterResult.email
      result.source = 'hunter'
      result.confidence = hunterResult.confidence
      result.verified = true
      return result
    }
  }

  // Fall back to pattern generation
  const candidates = generateEmailCandidates(firstName, lastName, domain)

  if (candidates.length > 0) {
    // Use the most common pattern as best guess
    result.email = candidates[0]
    result.source = 'pattern'
    result.confidence = 30
    result.verified = false
  }

  return result
}

/**
 * Enrich all contacts without emails
 */
export async function enrichAllContacts(): Promise<{
  processed: number
  enriched: number
  errors: number
}> {
  const stats = { processed: 0, enriched: 0, errors: 0 }

  // Get contacts without emails
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone
    `)
    .is('email', null)
    .not('first_name', 'eq', 'Unknown')

  if (error) {
    console.error('Failed to fetch contacts:', error)
    return stats
  }

  console.log(`Found ${contacts?.length || 0} contacts without emails`)

  for (const contact of contacts || []) {
    stats.processed++

    try {
      // Get linked projects to find company info
      const { data: links } = await supabase
        .from('project_stakeholders')
        .select(`
          projects (
            project_name,
            raw_data
          )
        `)
        .eq('contact_id', contact.id)
        .limit(1)

      // Extract company info from project data
      let companyName = ''
      let companyWebsite = ''

      if (links?.[0]?.projects) {
        const project = links[0].projects as any
        // Try to find company in raw_data
        const companies = project.raw_data?.companies || []
        if (companies.length > 0) {
          companyName = companies[0]
        }
      }

      // Enrich
      const result = await enrichContact(
        contact.id,
        contact.first_name,
        contact.last_name,
        companyName,
        companyWebsite
      )

      if (result.email) {
        // Update contact with enriched email
        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            email: result.email,
            email_verified: result.verified,
            updated_at: new Date().toISOString()
          })
          .eq('id', contact.id)

        if (updateError) {
          console.error(`Failed to update contact ${contact.id}:`, updateError)
          stats.errors++
        } else {
          console.log(`Enriched: ${contact.first_name} ${contact.last_name} -> ${result.email} (${result.source}, ${result.confidence}% confidence)`)
          stats.enriched++
        }
      }
    } catch (error) {
      console.error(`Error enriching contact ${contact.id}:`, error)
      stats.errors++
    }
  }

  return stats
}
