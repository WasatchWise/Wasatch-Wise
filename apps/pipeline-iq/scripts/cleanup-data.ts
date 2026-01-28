#!/usr/bin/env tsx
/**
 * Data Cleanup Script
 * Deduplicates companies and fixes data quality issues
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'

dotenv.config({ path: '.env.local' })

interface DuplicateGroup {
  normalizedName: string
  instances: Array<{
    id: string
    company_name: string
    created_at: string
    organization_id: string | null
    dataCompleteness: number
  }>
}

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,]/g, '')
    .replace(/\b(llc|inc|corp|corporation|ltd|limited)\b/gi, '')
    .trim()
}

function calculateDataCompleteness(company: any): number {
  let score = 0
  const fields = [
    'company_name',
    'website',
    'phone',
    'email',
    'address',
    'city',
    'state',
    'company_type',
    'cw_company_id',
  ]
  
  fields.forEach((field) => {
    if (company[field] && company[field] !== 'N/A' && company[field] !== '') {
      score++
    }
  })
  
  return score
}

function chooseCanonicalCompany(instances: any[]): any {
  // Sort by data completeness (desc), then by created_at (asc - oldest first)
  const sorted = [...instances].sort((a, b) => {
    if (b.dataCompleteness !== a.dataCompleteness) {
      return b.dataCompleteness - a.dataCompleteness
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
  
  return sorted[0]
}

async function mergeCompanyData(canonical: any, duplicate: any): Promise<any> {
  const merged = { ...canonical }
  
  // Merge non-null fields from duplicate into canonical
  const fieldsToMerge = [
    'website',
    'phone',
    'email',
    'address',
    'city',
    'state',
    'company_type',
    'cw_company_id',
    'organization_id',
  ]
  
  fieldsToMerge.forEach((field) => {
    if (!merged[field] && duplicate[field]) {
      merged[field] = duplicate[field]
    }
  })
  
  // Merge raw_data if it exists
  if (duplicate.raw_data && typeof duplicate.raw_data === 'object') {
    merged.raw_data = {
      ...(merged.raw_data || {}),
      ...(duplicate.raw_data || {}),
    }
  }
  
  return merged
}

async function cleanupData() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🧹 Starting data cleanup...\n')
  
  // Step 1: Find and deduplicate companies
  console.log('='.repeat(80))
  console.log('STEP 1: Deduplicating Companies')
  console.log('='.repeat(80))
  
  const { data: allCompanies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (companiesError) {
    console.error('Error fetching companies:', companiesError)
    return
  }
  
  if (!allCompanies || allCompanies.length === 0) {
    console.log('No companies found.')
    return
  }
  
  // Group by normalized name
  const nameMap = new Map<string, any[]>()
  allCompanies.forEach((company) => {
    const normalized = normalizeCompanyName(company.company_name)
    if (!nameMap.has(normalized)) {
      nameMap.set(normalized, [])
    }
    nameMap.get(normalized)!.push({
      ...company,
      dataCompleteness: calculateDataCompleteness(company),
    })
  })
  
  // Find duplicates
  const duplicateGroups: DuplicateGroup[] = []
  nameMap.forEach((instances, normalizedName) => {
    if (instances.length > 1) {
      duplicateGroups.push({
        normalizedName,
        instances,
      })
    }
  })
  
  console.log(`Found ${duplicateGroups.length} groups of duplicate companies\n`)
  
  let totalMerged = 0
  let totalDeleted = 0
  
  // Process each duplicate group
  for (const group of duplicateGroups) {
    const canonical = chooseCanonicalCompany(group.instances)
    const duplicates = group.instances.filter((c) => c.id !== canonical.id)
    
    console.log(`\nProcessing: "${canonical.company_name}"`)
    console.log(`  Canonical ID: ${canonical.id} (${canonical.dataCompleteness} fields)`)
    console.log(`  Duplicates to merge: ${duplicates.length}`)
    
    // Merge data from duplicates into canonical
    let mergedCompany = { ...canonical }
    for (const duplicate of duplicates) {
      mergedCompany = await mergeCompanyData(mergedCompany, duplicate)
    }
    
    // Remove computed fields that don't exist in DB
    const { dataCompleteness, ...companyToUpdate } = mergedCompany
    
    // Update canonical company with merged data
    const { error: updateError } = await supabase
      .from('companies')
      .update(companyToUpdate)
      .eq('id', canonical.id)
    
    if (updateError) {
      console.error(`  ❌ Error updating canonical company: ${updateError.message}`)
      continue
    }
    
      // Update all references to point to canonical company
      for (const duplicate of duplicates) {
        // Update project_stakeholders (contacts table doesn't have company_id in current schema)
        const { error: stakeholdersError } = await supabase
          .from('project_stakeholders')
          .update({ company_id: canonical.id })
          .eq('company_id', duplicate.id)
        
        if (stakeholdersError) {
          console.error(`  ⚠️  Error updating stakeholders for ${duplicate.id}: ${stakeholdersError.message}`)
        }
      
      // Delete duplicate company
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', duplicate.id)
      
      if (deleteError) {
        console.error(`  ❌ Error deleting duplicate ${duplicate.id}: ${deleteError.message}`)
      } else {
        totalDeleted++
        console.log(`  ✅ Merged and deleted duplicate: ${duplicate.id}`)
      }
    }
    
    totalMerged += duplicates.length
  }
  
  console.log(`\n✅ Company deduplication complete:`)
  console.log(`   - Merged ${totalMerged} duplicate companies`)
  console.log(`   - Deleted ${totalDeleted} duplicate records`)
  
  // Step 2: Fix missing location data
  console.log('\n' + '='.repeat(80))
  console.log('STEP 2: Fixing Missing Location Data')
  console.log('='.repeat(80))
  
  // First, try to get location from high_priority_projects if they share the same cw_project_id
  const { data: hppWithLocation } = await supabase
    .from('high_priority_projects')
    .select('cw_project_id, city, state')
    .not('city', 'is', null)
    .not('state', 'is', null)
  
  const locationMap = new Map<string, { city: string; state: string }>()
  if (hppWithLocation) {
    hppWithLocation.forEach((hpp) => {
      if (hpp.cw_project_id && hpp.city && hpp.state) {
        locationMap.set(hpp.cw_project_id, { city: hpp.city, state: hpp.state })
      }
    })
  }
  
  const { data: projectsMissingLocation } = await supabase
    .from('projects')
    .select('*')
    .or('city.is.null,state.is.null')
    .limit(100)
  
  if (projectsMissingLocation && projectsMissingLocation.length > 0) {
    console.log(`Found ${projectsMissingLocation.length} projects with missing location data\n`)
    
    let fixed = 0
    for (const project of projectsMissingLocation) {
      // Try to extract location from raw_data
      let city = project.city
      let state = project.state
      
      if (project.raw_data && typeof project.raw_data === 'object') {
        const raw = project.raw_data as any
        
        // Check various possible locations in raw_data
        if (!city && raw.city) city = raw.city
        if (!state && raw.state) state = raw.state
        if (!city && raw.location?.city) city = raw.location.city
        if (!state && raw.location?.state) state = raw.location.state
        if (!city && raw.address?.city) city = raw.address.city
        if (!state && raw.address?.state) state = raw.address.state
        if (!city && raw.original?.city) city = raw.original.city
        if (!state && raw.original?.state) state = raw.original.state
      }
      
      // Try to get location from high_priority_projects if available
      if ((!city || !state) && project.cw_project_id) {
        const hppLocation = locationMap.get(project.cw_project_id)
        if (hppLocation) {
          city = city || hppLocation.city
          state = state || hppLocation.state
        }
      }
      
      // Try to extract location from project name if still missing
      if ((!city || !state) && project.project_name) {
        const name = project.project_name.toLowerCase()
        
        // Common city patterns in hotel names
        const cityStateMap: Record<string, string> = {
          'anaheim': 'CA',
          'milwaukee': 'WI',
          'tulsa': 'OK',
          'tucson': 'AZ',
          'seattle': 'WA',
          'redmond': 'WA',
          'chicago': 'IL',
          'denver': 'CO',
          'bend': 'OR',
          'atlanta': 'GA',
          'naperville': 'IL',
          'lisle': 'IL',
          'springfield': 'IL',
          'miami': 'FL',
          'doral': 'FL',
          'san diego': 'CA',
          'annapolis': 'MD',
          'tampa': 'FL',
          'brandon': 'FL',
          'wichita': 'KS',
          'melbourne': 'FL',
          'palm bay': 'FL',
          'gilbert': 'AZ',
          'mesa': 'AZ',
          'dixon': 'CA',
          'columbus': 'OH',
          'westerville': 'OH',
          'parsippany': 'NJ',
          'burbank': 'CA',
          'hollywood': 'CA',
          'murfreesboro': 'TN',
          'northborough': 'MA',
          'waikiki': 'HI',
          'honolulu': 'HI',
          'decatur': 'AL',
          'midtown': 'NY',
          'manhattan': 'NY',
          'new york': 'NY',
        }
        
        // Special cases
        if (name.includes('waikiki') || name.includes('halekulani')) {
          city = 'Honolulu'
          state = 'HI'
        }
        if (name.includes('midtown') && !city) {
          city = 'New York'
          state = 'NY'
        }
        if (name.includes('northborough')) {
          city = 'Northborough'
          state = 'MA'
        }
        if (name.includes('decatur')) {
          city = 'Decatur'
          state = 'AL'
        }
        
        for (const [cityName, stateCode] of Object.entries(cityStateMap)) {
          if (name.includes(cityName)) {
            if (!city) city = cityName.charAt(0).toUpperCase() + cityName.slice(1)
            if (!state) state = stateCode
            break
          }
        }
      }
      
      // Don't set "Unknown" or invalid states - only update if we have real data
      if (city && state && city !== 'Unknown' && state !== 'XX' && state.length === 2) {
        const { error } = await supabase
          .from('projects')
          .update({ city, state })
          .eq('id', project.id)
        
        if (error) {
          console.error(`  ❌ Error updating project ${project.id}: ${error.message}`)
        } else {
          fixed++
          console.log(`  ✅ Fixed location for: ${project.project_name} (${city}, ${state})`)
        }
      } else if (!city || !state || city === 'Unknown' || state === 'XX') {
        console.log(`  ⚠️  Could not infer location for: ${project.project_name} (ID: ${project.cw_project_id})`)
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} projects with missing location data`)
  } else {
    console.log('✅ No projects with missing location data found')
  }
  
  // Step 3: Clean up any empty or invalid data
  console.log('\n' + '='.repeat(80))
  console.log('STEP 3: Cleaning Invalid Data')
  console.log('='.repeat(80))
  
  // Fix companies with "N/A" values
  const { data: companiesWithNA } = await supabase
    .from('companies')
    .select('id, company_name, website, phone, email, city, state')
    .or('website.eq.N/A,phone.eq.N/A,email.eq.N/A,city.eq.N/A,state.eq.N/A')
    .limit(100)
  
  if (companiesWithNA && companiesWithNA.length > 0) {
    console.log(`Found ${companiesWithNA.length} companies with "N/A" values\n`)
    
    let cleaned = 0
    for (const company of companiesWithNA) {
      const updates: any = {}
      
      if (company.website === 'N/A') updates.website = null
      if (company.phone === 'N/A') updates.phone = null
      if (company.email === 'N/A') updates.email = null
      if (company.city === 'N/A') updates.city = null
      if (company.state === 'N/A') updates.state = null
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', company.id)
        
        if (error) {
          console.error(`  ❌ Error cleaning company ${company.id}: ${error.message}`)
        } else {
          cleaned++
        }
      }
    }
    
    console.log(`✅ Cleaned ${cleaned} companies with invalid "N/A" values`)
  } else {
    console.log('✅ No companies with "N/A" values found')
  }
  
  // Step 4: Verify cleanup results
  console.log('\n' + '='.repeat(80))
  console.log('STEP 4: Verification')
  console.log('='.repeat(80))
  
  // Check remaining duplicates
  const { data: remainingCompanies } = await supabase
    .from('companies')
    .select('id, company_name')
  
  if (remainingCompanies) {
    const remainingNameMap = new Map<string, number>()
    remainingCompanies.forEach((c) => {
      const normalized = normalizeCompanyName(c.company_name)
      remainingNameMap.set(normalized, (remainingNameMap.get(normalized) || 0) + 1)
    })
    
    const remainingDuplicates = Array.from(remainingNameMap.entries())
      .filter(([_, count]) => count > 1)
      .length
    
    console.log(`\nRemaining duplicate company groups: ${remainingDuplicates}`)
    
    if (remainingDuplicates === 0) {
      console.log('✅ All duplicates have been resolved!')
    } else {
      console.log(`⚠️  ${remainingDuplicates} duplicate groups still exist`)
    }
  }
  
  // Check projects with missing location
  const { data: stillMissingLocation } = await supabase
    .from('projects')
    .select('id, project_name, city, state')
    .or('city.is.null,state.is.null')
    .limit(10)
  
  if (stillMissingLocation && stillMissingLocation.length > 0) {
    console.log(`\nProjects still missing location: ${stillMissingLocation.length}`)
    stillMissingLocation.forEach((p) => {
      console.log(`  - ${p.project_name} (City: ${p.city || 'MISSING'}, State: ${p.state || 'MISSING'})`)
    })
  } else {
    console.log('\n✅ All projects have location data!')
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ Data cleanup complete!')
  console.log('='.repeat(80))
}

cleanupData().catch((error) => {
  console.error('❌ Error during cleanup:', error)
  process.exit(1)
})

