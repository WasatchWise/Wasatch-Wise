#!/usr/bin/env tsx

/**
 * Simple CSV Project Importer
 *
 * Usage:
 *   npm run import-projects -- path/to/projects.csv
 *
 * CSV Format:
 *   project_name,project_type,stage,value,city,state,units,sqft,address,contact_name,contact_email,contact_title
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ORGANIZATION_ID = process.env.ORGANIZATION_ID!

interface CSVRow {
  project_name: string
  project_type: string
  stage: string
  value: string
  city: string
  state: string
  units?: string
  sqft?: string
  address?: string
  contact_name?: string
  contact_email?: string
  contact_title?: string
  phone?: string
}

async function importProjects(csvPath: string) {
  console.log('🚀 Starting project import from:', csvPath)

  // Read and parse CSV
  const csvContent = readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[]

  console.log(`📊 Found ${records.length} projects to import`)

  let imported = 0
  let skipped = 0
  let contacts = 0

  for (const row of records) {
    try {
      // Generate unique ID for the project
      const cwProjectId = `IMPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Calculate basic score
      const projectValue = parseInt(row.value?.replace(/[^0-9]/g, '') || '0')
      const projectTypes = row.project_type.split(',').map(t => t.trim().toLowerCase())

      let grooveScore = 50 // Base score

      // Type bonus
      if (projectTypes.includes('hotel')) grooveScore += 20
      if (projectTypes.includes('multifamily')) grooveScore += 15
      if (projectTypes.includes('senior_living')) grooveScore += 20

      // Value bonus
      if (projectValue > 10000000) grooveScore += 20
      else if (projectValue > 5000000) grooveScore += 10

      // Stage bonus
      if (row.stage === 'planning' || row.stage === 'pre-construction') grooveScore += 15

      grooveScore = Math.min(100, grooveScore) // Cap at 100

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('high_priority_projects')
        .insert({
          organization_id: ORGANIZATION_ID,
          cw_project_id: cwProjectId,
          project_name: row.project_name,
          project_type: projectTypes,
          project_stage: row.stage.toLowerCase(),
          project_value: projectValue,
          units_count: row.units ? parseInt(row.units) : null,
          project_size_sqft: row.sqft ? parseInt(row.sqft) : null,
          city: row.city,
          state: row.state,
          address: row.address || null,
          groove_fit_score: grooveScore,
          engagement_score: Math.floor(Math.random() * 30) + 60,
          timing_score: Math.floor(Math.random() * 30) + 60,
          total_score: grooveScore + Math.floor(Math.random() * 30) + 60,
          priority_level: grooveScore >= 80 ? 'hot' : grooveScore >= 60 ? 'warm' : 'cold',
          outreach_status: 'new',
          data_source: 'csv_import',
          decision_makers: row.contact_name ? 1 : 0,
        })
        .select()
        .single()

      if (projectError) {
        console.error(`❌ Error importing ${row.project_name}:`, projectError.message)
        skipped++
        continue
      }

      imported++
      console.log(`✅ Imported: ${row.project_name} (Score: ${grooveScore})`)

      // If contact info provided, create contact
      if (row.contact_name && row.contact_email && project) {
        const [firstName, ...lastNameParts] = row.contact_name.split(' ')
        const lastName = lastNameParts.join(' ') || firstName

        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            organization_id: ORGANIZATION_ID,
            first_name: firstName,
            last_name: lastName,
            email: row.contact_email,
            title: row.contact_title || null,
            phone: row.phone || null,
            role_category: 'decision_maker',
            decision_level: 'executive',
            email_verified: false,
          })
          .select()
          .single()

        if (!contactError && contact) {
          // Link contact to project
          await supabase.from('project_stakeholders').insert({
            project_id: project.id,
            contact_id: contact.id,
            role_in_project: 'owner',
            is_primary: true,
          })

          contacts++
          console.log(`   👤 Added contact: ${row.contact_name}`)
        }
      }

    } catch (error: any) {
      console.error(`❌ Error processing ${row.project_name}:`, error.message)
      skipped++
    }
  }

  console.log('\n📈 Import Summary:')
  console.log(`   ✅ Imported: ${imported} projects`)
  console.log(`   👤 Added: ${contacts} contacts`)
  console.log(`   ⏭️  Skipped: ${skipped} projects`)
  console.log('\n🎉 Import complete!')
}

// Get CSV path from command line
const csvPath = process.argv[2]

if (!csvPath) {
  console.error('❌ Please provide a CSV file path')
  console.log('Usage: npm run import-projects -- path/to/projects.csv')
  process.exit(1)
}

importProjects(csvPath).catch(console.error)
