#!/usr/bin/env tsx
/**
 * Detailed Data Issue Analysis
 * Analyzes specific data quality problems found in the verification
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'

dotenv.config({ path: '.env.local' })

async function analyzeIssues() {
  const supabase = createServiceSupabaseClient()

  console.log('🔍 Analyzing Data Quality Issues...\n')

  // 1. Check duplicate companies
  console.log('='.repeat(80))
  console.log('1. DUPLICATE COMPANIES ANALYSIS')
  console.log('='.repeat(80))
  
  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name, created_at, organization_id')
    .order('created_at', { ascending: false })

  if (companies) {
    // Find duplicates
    const nameMap = new Map<string, any[]>()
    companies.forEach((company) => {
      const normalizedName = company.company_name?.toLowerCase().trim() || ''
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, [])
      }
      nameMap.get(normalizedName)!.push(company)
    })

    const duplicates = Array.from(nameMap.entries())
      .filter(([_, instances]) => instances.length > 1)
      .sort((a, b) => b[1].length - a[1].length)

    console.log(`\nFound ${duplicates.length} duplicate company names\n`)
    
    duplicates.slice(0, 10).forEach(([name, instances]) => {
      console.log(`"${name}" - ${instances.length} instances:`)
      instances.forEach((inst, idx) => {
        console.log(`  ${idx + 1}. ID: ${inst.id}`)
        console.log(`     Created: ${inst.created_at}`)
        console.log(`     Org: ${inst.organization_id || 'N/A'}`)
      })
      console.log('')
    })
  }

  // 2. Check projects with missing location data
  console.log('='.repeat(80))
  console.log('2. PROJECTS WITH MISSING LOCATION DATA')
  console.log('='.repeat(80))
  
  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, city, state, cw_project_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (projects) {
    const missingLocation = projects.filter(
      (p) => !p.city || !p.state || p.city === 'N/A' || p.state === 'N/A'
    )

    console.log(`\nFound ${missingLocation.length} projects with missing/invalid location data\n`)
    
    missingLocation.slice(0, 20).forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.project_name}`)
      console.log(`   ID: ${project.cw_project_id}`)
      console.log(`   City: ${project.city || 'MISSING'}, State: ${project.state || 'MISSING'}`)
      console.log(`   Created: ${project.created_at}`)
      console.log('')
    })
  }

  // 3. Check high_priority_projects with missing location
  console.log('='.repeat(80))
  console.log('3. HIGH PRIORITY PROJECTS WITH MISSING LOCATION DATA')
  console.log('='.repeat(80))
  
  const { data: hpp } = await supabase
    .from('high_priority_projects')
    .select('id, project_name, city, state, cw_project_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (hpp) {
    const missingLocation = hpp.filter(
      (p) => !p.city || !p.state || p.city === 'N/A' || p.state === 'N/A'
    )

    console.log(`\nFound ${missingLocation.length} high priority projects with missing/invalid location data\n`)
    
    if (missingLocation.length > 0) {
      missingLocation.slice(0, 20).forEach((project, idx) => {
        console.log(`${idx + 1}. ${project.project_name}`)
        console.log(`   ID: ${project.cw_project_id}`)
        console.log(`   City: ${project.city || 'MISSING'}, State: ${project.state || 'MISSING'}`)
        console.log(`   Created: ${project.created_at}`)
        console.log('')
      })
    } else {
      console.log('✅ All high priority projects have valid location data!\n')
    }
  }

  // 4. Check data completeness for recent projects
  console.log('='.repeat(80))
  console.log('4. DATA COMPLETENESS CHECK (Recent Projects)')
  console.log('='.repeat(80))
  
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  if (projects) {
    const recent = projects.filter(
      (p) => new Date(p.created_at || '') >= yesterday
    )

    const completeness = {
      total: recent.length,
      hasProjectName: recent.filter((p) => p.project_name).length,
      hasCity: recent.filter((p) => p.city && p.city !== 'N/A').length,
      hasState: recent.filter((p) => p.state && p.state !== 'N/A').length,
      hasCwId: recent.filter((p) => p.cw_project_id).length,
    }

    console.log(`\nRecent Projects (last 24h): ${completeness.total}`)
    console.log(`  ✅ Has project name: ${completeness.hasProjectName} (${((completeness.hasProjectName / completeness.total) * 100).toFixed(1)}%)`)
    console.log(`  ✅ Has city: ${completeness.hasCity} (${((completeness.hasCity / completeness.total) * 100).toFixed(1)}%)`)
    console.log(`  ✅ Has state: ${completeness.hasState} (${((completeness.hasState / completeness.total) * 100).toFixed(1)}%)`)
    console.log(`  ✅ Has CW ID: ${completeness.hasCwId} (${((completeness.hasCwId / completeness.total) * 100).toFixed(1)}%)`)
    console.log('')
  }

  // 5. Sample of well-formed records
  console.log('='.repeat(80))
  console.log('5. SAMPLE OF WELL-FORMED RECORDS')
  console.log('='.repeat(80))
  
  if (projects) {
    const wellFormed = projects.filter(
      (p) => p.project_name && p.city && p.state && p.cw_project_id && 
             p.city !== 'N/A' && p.state !== 'N/A'
    )

    console.log(`\nFound ${wellFormed.length} well-formed projects\n`)
    
    wellFormed.slice(0, 5).forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.project_name}`)
      console.log(`   Location: ${project.city}, ${project.state}`)
      console.log(`   CW ID: ${project.cw_project_id}`)
      console.log(`   Created: ${project.created_at}`)
      console.log('')
    })
  }

  console.log('='.repeat(80))
  console.log('✅ Analysis Complete')
  console.log('='.repeat(80))
}

analyzeIssues().catch(console.error)

