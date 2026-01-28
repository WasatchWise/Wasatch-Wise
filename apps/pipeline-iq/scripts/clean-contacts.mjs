#!/usr/bin/env node
/**
 * Clean up messy contact data in the database
 * - Fixes malformed names (addresses, HTML junk)
 * - Derives names from emails where possible
 * - Removes duplicate contacts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Check if text looks like a company name
function looksLikeCompany(name) {
  const companyIndicators = /\b(LLC|Inc|Corp|Ltd|Group|Hotels|Properties|Hospitality|Capital|Investments|Partners|Associates|Company|Co\.|Management)\b/i
  return companyIndicators.test(name)
}

// Check if text looks like an address
function looksLikeAddress(text) {
  return /\d{5}|\bSt\b|\bAve\b|\bBlvd\b|\bRd\b|\bSuite\b|\bFloor\b|\bFlr\b|\bPkwy\b|\bDr\b/i.test(text)
}

// Derive name from email address
function nameFromEmail(email) {
  if (!email) return null
  const localPart = email.split('@')[0]

  // Try first.last pattern
  if (localPart.includes('.')) {
    const parts = localPart.split('.')
    if (parts.length === 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: capitalize(parts[0]),
        lastName: capitalize(parts[1])
      }
    }
  }

  // Try first_last pattern
  if (localPart.includes('_')) {
    const parts = localPart.split('_')
    if (parts.length === 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: capitalize(parts[0]),
        lastName: capitalize(parts[1])
      }
    }
  }

  // Try first initial + last name (e.g., jsmith -> J Smith)
  const initialPattern = /^([a-z])([a-z]{3,})$/i
  const match = localPart.match(initialPattern)
  if (match) {
    return {
      firstName: match[1].toUpperCase(),
      lastName: capitalize(match[2])
    }
  }

  return null
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Clean a name string
function cleanName(name) {
  if (!name) return ''

  return name
    // Remove common junk
    .replace(/^(O|PM|A|GC|Owner|Property Manager|Architect|Developer)[,:\s]*/i, '')
    .replace(/Website.*$/i, '')
    .replace(/Company Report.*$/i, '')
    .replace(/View Hotels.*$/i, '')
    .replace(/P:.*$/i, '')
    .replace(/F:.*$/i, '')
    .replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, '')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    // Remove addresses
    .replace(/\d+\s+[A-Za-z]+\s+(St|Ave|Blvd|Rd|Dr|Pkwy|Way|Ln|Ct|Pl)\.?\b.*/gi, '')
    .replace(/\b[A-Z]{2}\s+\d{5}\b.*/g, '')
    // Clean whitespace
    .replace(/[\t\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function cleanContacts() {
  console.log('═'.repeat(60))
  console.log('CONTACT DATA CLEANUP')
  console.log('═'.repeat(60))

  // Get all contacts
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')

  if (error) {
    console.error('Failed to fetch contacts:', error.message)
    return
  }

  console.log('Found ' + contacts.length + ' contacts to process\n')

  let cleaned = 0
  let deleted = 0
  let skipped = 0

  for (const contact of contacts) {
    const fullName = (contact.first_name + ' ' + contact.last_name).trim()

    // Check if name is problematic
    const isMessy = looksLikeAddress(fullName) ||
                    fullName.length > 100 ||
                    fullName.includes('\n') ||
                    fullName.includes('\t') ||
                    /P:\s*\d{3}/.test(fullName) ||
                    fullName.includes('Website') ||
                    fullName.includes('Company Report')

    if (!isMessy) {
      skipped++
      continue
    }

    console.log('\n--- Processing messy contact ---')
    console.log('ID:', contact.id)
    console.log('Current name:', fullName.substring(0, 80) + (fullName.length > 80 ? '...' : ''))
    console.log('Email:', contact.email || 'none')
    console.log('Phone:', contact.phone || 'none')

    // Try to derive name from email
    let newFirstName = null
    let newLastName = null

    if (contact.email) {
      const derived = nameFromEmail(contact.email)
      if (derived) {
        newFirstName = derived.firstName
        newLastName = derived.lastName
        console.log('Derived from email:', newFirstName, newLastName)
      }
    }

    // If no email-derived name, try cleaning the existing name
    if (!newFirstName) {
      const cleanedName = cleanName(fullName)
      if (cleanedName && cleanedName.length > 2 && cleanedName.length < 50 && !looksLikeAddress(cleanedName)) {
        const parts = cleanedName.split(/\s+/)
        newFirstName = parts[0]
        newLastName = parts.slice(1).join(' ') || ''
        console.log('Cleaned name:', newFirstName, newLastName)
      }
    }

    // If still no good name and no email, consider deleting
    if (!newFirstName && !contact.email) {
      // Only keep if phone is present
      if (contact.phone) {
        newFirstName = 'Unknown'
        newLastName = 'Contact'
        console.log('Keeping with placeholder name (has phone)')
      } else {
        // Delete contacts with no email, no phone, and bad name
        console.log('DELETING - no email, no phone, bad name')
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .eq('id', contact.id)

        if (deleteError) {
          console.log('Delete failed:', deleteError.message)
        } else {
          deleted++
        }
        continue
      }
    }

    // Update the contact
    if (newFirstName) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          first_name: newFirstName,
          last_name: newLastName || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)

      if (updateError) {
        console.log('Update failed:', updateError.message)
      } else {
        cleaned++
        console.log('Updated to:', newFirstName, newLastName)
      }
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('CLEANUP COMPLETE')
  console.log('═'.repeat(60))
  console.log('Contacts cleaned:', cleaned)
  console.log('Contacts deleted:', deleted)
  console.log('Contacts skipped (already clean):', skipped)
  console.log('═'.repeat(60))
}

cleanContacts().catch(console.error)
