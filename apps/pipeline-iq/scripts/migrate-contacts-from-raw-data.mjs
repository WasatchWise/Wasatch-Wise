#!/usr/bin/env node
/**
 * Migration Script: Extract contacts from raw_data and normalize to contacts table
 *
 * This script:
 * 1. Reads all projects with raw_data.original.contacts
 * 2. Extracts contact information
 * 3. Saves to contacts table (deduped by email/phone)
 * 4. Links via project_stakeholders
 *
 * Run: node scripts/migrate-contacts-from-raw-data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ORGANIZATION_ID = process.env.ORGANIZATION_ID

async function migrateContacts() {
  console.log('═'.repeat(60))
  console.log('CONTACT MIGRATION: raw_data -> contacts table')
  console.log('═'.repeat(60))

  // Get all projects with raw_data
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_name, raw_data')

  if (error) {
    console.error('Failed to fetch projects:', error.message)
    return
  }

  console.log('Found ' + projects.length + ' projects to scan\n')

  let contactsFound = 0
  let contactsCreated = 0
  let linksCreated = 0
  let errors = 0

  for (const project of projects) {
    // Extract contacts from various locations in raw_data
    const contacts = []

    // Check raw_data.original.contacts
    if (project.raw_data?.original?.contacts) {
      contacts.push(...project.raw_data.original.contacts)
    }

    // Check raw_data.contacts directly
    if (project.raw_data?.contacts) {
      contacts.push(...project.raw_data.contacts)
    }

    // Skip if no contacts
    if (contacts.length === 0) continue

    console.log('\n' + project.project_name + ': ' + contacts.length + ' contacts')
    contactsFound += contacts.length

    for (const contact of contacts) {
      // Skip contacts without email or phone
      const email = contact.email || ''
      const phone = contact.phone || ''

      if (!email && !phone) {
        console.log('  - Skipped (no email/phone): ' + (contact.first_name || contact.name || 'Unknown'))
        continue
      }

      try {
        // Parse name if it's a single field
        let firstName = contact.first_name || ''
        let lastName = contact.last_name || ''

        if (!firstName && contact.name) {
          const parts = contact.name.split(' ')
          firstName = parts[0] || 'Unknown'
          lastName = parts.slice(1).join(' ') || 'Contact'
        }

        // Check if contact already exists
        let existingContact = null

        if (email) {
          const { data } = await supabase
            .from('contacts')
            .select('id')
            .eq('email', email)
            .single()
          existingContact = data
        }

        if (!existingContact && phone) {
          const { data } = await supabase
            .from('contacts')
            .select('id')
            .eq('phone', phone)
            .single()
          existingContact = data
        }

        let contactId

        if (existingContact) {
          contactId = existingContact.id
          console.log('  - Exists: ' + firstName + ' ' + lastName + ' (' + (email || phone) + ')')
        } else {
          // Create new contact
          const { data: newContact, error: insertError } = await supabase
            .from('contacts')
            .insert({
              organization_id: ORGANIZATION_ID,
              cw_contact_id: 'CWC-MIGRATE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              first_name: firstName || 'Unknown',
              last_name: lastName || 'Contact',
              title: contact.title || null,
              email: email || null,
              phone: phone || null,
              response_status: 'not_contacted',
            })
            .select('id')
            .single()

          if (insertError) {
            console.log('  - ERROR creating contact: ' + insertError.message)
            errors++
            continue
          }

          contactId = newContact.id
          contactsCreated++
          console.log('  + Created: ' + firstName + ' ' + lastName + ' (' + (email || phone) + ')')
        }

        // Link to project via project_stakeholders
        const { error: linkError } = await supabase
          .from('project_stakeholders')
          .upsert({
            project_id: project.id,
            contact_id: contactId,
            role_in_project: contact.title?.toLowerCase().includes('architect') ? 'architect' :
                            contact.title?.toLowerCase().includes('owner') ? 'owner' :
                            contact.title?.toLowerCase().includes('developer') ? 'developer' :
                            'owner',
            is_primary: true,
          }, {
            onConflict: 'project_id,contact_id'
          })

        if (linkError) {
          console.log('  - Link error: ' + linkError.message)
        } else {
          linksCreated++
        }

      } catch (err) {
        console.log('  - Error: ' + err.message)
        errors++
      }
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('MIGRATION COMPLETE')
  console.log('═'.repeat(60))
  console.log('  Contacts found in raw_data: ' + contactsFound)
  console.log('  New contacts created:       ' + contactsCreated)
  console.log('  Project links created:      ' + linksCreated)
  console.log('  Errors:                     ' + errors)
  console.log('═'.repeat(60))
}

migrateContacts().catch(console.error)
