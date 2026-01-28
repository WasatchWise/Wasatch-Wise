#!/usr/bin/env tsx

/**
 * Add Test Projects - LEGENDARY EDITION
 * 
 * Adds a variety of high-quality test projects to showcase the platform
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { calculateGrooveScore } from '../lib/utils/scoring'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ORGANIZATION_ID = process.env.ORGANIZATION_ID!

const testProjects = [
  {
    cw_project_id: 'CW-TEST-001',
    project_name: 'Four Seasons Resort & Spa Austin',
    project_type: ['hotel', 'spa'],
    project_stage: 'planning',
    project_value: 185000000,
    project_size_sqft: 425000,
    units_count: 350,
    address: '98 San Jacinto Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    services_needed: ['wifi', 'directv', 'phone_systems', 'structured_cabling', 'access_control', 'audio_visual'],
    estimated_start_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + (365 + 180) * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Luxury 5-star resort development. Strong relationship with developer. Multiple service opportunities.',
  },
  {
    cw_project_id: 'CW-TEST-002',
    project_name: 'The Domain Luxury Apartments Phase 3',
    project_type: ['multifamily', 'luxury'],
    project_stage: 'pre-construction',
    project_value: 92000000,
    project_size_sqft: 380000,
    units_count: 285,
    address: '11410 Century Oaks Terrace',
    city: 'Austin',
    state: 'TX',
    zip: '78758',
    services_needed: ['wifi', 'structured_cabling', 'access_control', 'smart_home'],
    estimated_start_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Premium multifamily development in high-growth area. Smart home integration required.',
  },
  {
    cw_project_id: 'CW-TEST-003',
    project_name: 'Sunrise Senior Living Community Dallas',
    project_type: ['senior_living', 'assisted_living'],
    project_stage: 'design',
    project_value: 58000000,
    project_size_sqft: 185000,
    units_count: 180,
    address: '5959 Royal Lane',
    city: 'Dallas',
    state: 'TX',
    zip: '75230',
    services_needed: ['wifi', 'directv', 'phone_systems', 'nurse_call', 'access_control'],
    estimated_start_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + (365 + 90) * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Senior living facility with specialized technology needs. Recurring revenue opportunity.',
  },
  {
    cw_project_id: 'CW-TEST-004',
    project_name: 'Graduate Hotel San Antonio Riverwalk',
    project_type: ['hotel', 'boutique'],
    project_stage: 'pre-construction',
    project_value: 45000000,
    project_size_sqft: 95000,
    units_count: 195,
    address: '123 E Houston Street',
    city: 'San Antonio',
    state: 'TX',
    zip: '78205',
    services_needed: ['wifi', 'directv', 'phone_systems', 'structured_cabling'],
    estimated_start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + (365 + 45) * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Boutique hotel in prime location. Part of Graduate Hotels chain.',
  },
  {
    cw_project_id: 'CW-TEST-005',
    project_name: 'University Towers Student Housing',
    project_type: ['student_housing', 'multifamily'],
    project_stage: 'bidding',
    project_value: 67000000,
    project_size_sqft: 285000,
    units_count: 420,
    address: '2210 Guadalupe Street',
    city: 'Austin',
    state: 'TX',
    zip: '78705',
    services_needed: ['wifi', 'structured_cabling', 'access_control', 'smart_home'],
    estimated_start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Student housing near UT Austin campus. High-speed internet critical. Currently in bidding phase.',
  },
  {
    cw_project_id: 'CW-TEST-006',
    project_name: 'Fairmont Hotel Houston Downtown',
    project_type: ['hotel', 'conference_center'],
    project_stage: 'planning',
    project_value: 210000000,
    project_size_sqft: 520000,
    units_count: 485,
    address: '1600 Smith Street',
    city: 'Houston',
    state: 'TX',
    zip: '77002',
    services_needed: ['wifi', 'directv', 'phone_systems', 'structured_cabling', 'access_control', 'audio_visual', 'conference_systems'],
    estimated_start_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + (730) * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Massive flagship hotel with 75,000 sq ft conference center. Premium opportunity.',
  },
  {
    cw_project_id: 'CW-TEST-007',
    project_name: 'Alta Vista Apartments Renovation',
    project_type: ['multifamily', 'renovation'],
    project_stage: 'construction',
    project_value: 18500000,
    project_size_sqft: 142000,
    units_count: 168,
    address: '7800 North Lamar Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78752',
    services_needed: ['wifi', 'structured_cabling', 'access_control'],
    estimated_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Full property renovation. Technology infrastructure upgrade needed. Already started.',
  },
  {
    cw_project_id: 'CW-TEST-008',
    project_name: 'Hilton Garden Inn Dallas Fort Worth Airport',
    project_type: ['hotel'],
    project_stage: 'design',
    project_value: 32000000,
    project_size_sqft: 78000,
    units_count: 142,
    address: '2050 Highway 360',
    city: 'Irving',
    state: 'TX',
    zip: '75062',
    services_needed: ['wifi', 'directv', 'phone_systems', 'structured_cabling'],
    estimated_start_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_completion_date: new Date(Date.now() + (365 + 60) * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Airport hotel development. Hilton brand standards required.',
  },
]

async function addTestProjects() {
  console.log('🚀 Adding Test Projects - LEGENDARY EDITION')
  console.log('━'.repeat(60))

  let added = 0
  let updated = 0
  let errors = 0

  for (const projectData of testProjects) {
    try {
      // Calculate scores
      const grooveScore = calculateGrooveScore(projectData as any)
      const engagementScore = 75
      const timingScore = projectData.project_stage === 'planning' ? 90 :
                         projectData.project_stage === 'pre-construction' ? 85 :
                         projectData.project_stage === 'design' ? 80 :
                         projectData.project_stage === 'bidding' ? 95 :
                         70
      const totalScore = grooveScore + engagementScore + timingScore

      // Check if exists
      const { data: existing } = await supabase
        .from('high_priority_projects')
        .select('id')
        .eq('cw_project_id', projectData.cw_project_id)
        .single()

      const fullProject = {
        ...projectData,
        organization_id: ORGANIZATION_ID,
        groove_fit_score: grooveScore,
        engagement_score: engagementScore,
        timing_score: timingScore,
        total_score: totalScore,
        priority_level: grooveScore >= 80 ? 'hot' : grooveScore >= 60 ? 'warm' : 'cold',
        outreach_status: 'new',
        data_source: 'test_data',
        raw_data: {},
      }

      if (existing) {
        // Update
        const { error } = await supabase
          .from('high_priority_projects')
          .update({
            ...fullProject,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
        console.log(`🔄 Updated: ${projectData.project_name} (Score: ${grooveScore})`)
        updated++
      } else {
        // Insert
        const { error } = await supabase
          .from('high_priority_projects')
          .insert(fullProject)

        if (error) throw error
        console.log(`✅ Added: ${projectData.project_name} (Score: ${grooveScore})`)
        added++
      }
    } catch (error: any) {
      console.error(`❌ Error with ${projectData.project_name}:`, error.message)
      errors++
    }
  }

  console.log('\n' + '━'.repeat(60))
  console.log('📊 SUMMARY')
  console.log('━'.repeat(60))
  console.log(`  Projects Added:   ${added}`)
  console.log(`  Projects Updated: ${updated}`)
  console.log(`  Errors:           ${errors}`)
  console.log('━'.repeat(60))

  if (added + updated > 0) {
    const totalValue = testProjects.reduce((sum, p) => sum + p.project_value, 0)
    console.log(`\n💰 Total Pipeline Value: $${totalValue.toLocaleString()}`)
    console.log(`🎯 View at: http://localhost:3000/projects`)
  }

  console.log('\n✅ Done!\n')
}

addTestProjects().catch(console.error)

