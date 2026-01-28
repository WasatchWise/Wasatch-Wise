#!/usr/bin/env npx tsx

/**
 * Sync high_priority_projects to projects table
 *
 * The application uses 'projects' table for stakeholder links,
 * but data was imported to 'high_priority_projects'. This syncs them.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchAll(table: string, select: string) {
  const allData: any[] = []
  let offset = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(offset, offset + pageSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    allData.push(...data)
    if (data.length < pageSize) break
    offset += pageSize
  }
  return allData
}

async function syncToProjects() {
  console.log('═'.repeat(60))
  console.log('  SYNCING high_priority_projects -> projects')
  console.log('═'.repeat(60))
  console.log('')

  // Get all high_priority_projects
  console.log('Fetching high_priority_projects...')
  const hpProjects = await fetchAll('high_priority_projects', '*')
  console.log('Records in high_priority_projects:', hpProjects.length)

  // Get existing projects
  console.log('Fetching existing projects...')
  const existingProjects = await fetchAll('projects', 'id, cw_project_id')
  console.log('Records in projects:', existingProjects.length)

  // Build sets for dedup
  const existingIds = new Set(existingProjects.map((p: any) => p.id))
  const existingCwIds = new Set(existingProjects.map((p: any) => p.cw_project_id).filter(Boolean))

  console.log('')

  // Find projects to insert
  const toInsert: any[] = []
  let skippedSameId = 0
  let skippedSameCwId = 0

  for (const hp of hpProjects) {
    // Skip if same ID already exists
    if (existingIds.has(hp.id)) {
      skippedSameId++
      continue
    }

    // Skip if same cw_project_id already exists (would violate unique constraint)
    if (hp.cw_project_id && existingCwIds.has(hp.cw_project_id)) {
      skippedSameCwId++
      continue
    }

    toInsert.push({
      id: hp.id, // Preserve the original ID so stakeholder links work
      organization_id: hp.organization_id,
      cw_project_id: hp.cw_project_id,
      project_name: hp.project_name,
      project_type: hp.project_type,
      project_stage: hp.project_stage || 'planning',
      project_value: hp.project_value,
      units_count: hp.units_count,
      project_size_sqft: hp.project_size_sqft,
      address: hp.address,
      city: hp.city,
      state: hp.state,
      zip: hp.zip,
      groove_fit_score: hp.groove_fit_score,
      engagement_score: hp.engagement_score,
      timing_score: hp.timing_score,
      // total_score is a generated column, don't insert
      priority_level: hp.priority_level,
      outreach_status: hp.outreach_status,
      data_source: hp.data_source,
      scraped_at: hp.scraped_at,
      raw_data: hp.raw_data,
      notes: hp.notes,
      created_at: hp.created_at,
      updated_at: hp.updated_at,
    })

    // Track new cw_project_id to avoid duplicates in this batch
    if (hp.cw_project_id) {
      existingCwIds.add(hp.cw_project_id)
    }
  }

  console.log('To insert:', toInsert.length)
  console.log('Skipped (same ID):', skippedSameId)
  console.log('Skipped (same cw_project_id):', skippedSameCwId)

  if (toInsert.length === 0) {
    console.log('\nNothing to insert')
    return
  }

  // Insert in batches
  console.log('\nInserting...')
  const batchSize = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize)
    const { error } = await supabase
      .from('projects')
      .insert(batch)

    if (error) {
      console.error(`Batch ${i}-${i + batch.length} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= toInsert.length) {
      console.log(`Progress: ${Math.min(i + batchSize, toInsert.length)}/${toInsert.length}`)
    }
  }

  console.log('')
  console.log('─'.repeat(60))
  console.log('RESULTS:')
  console.log('  Inserted:', inserted)
  console.log('  Errors:', errors)
  console.log('─'.repeat(60))

  // Verify
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  console.log('')
  console.log('Final projects count:', count)
}

syncToProjects().catch(console.error)
