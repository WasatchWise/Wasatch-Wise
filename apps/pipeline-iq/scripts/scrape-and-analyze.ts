#!/usr/bin/env tsx

/**
 * SCRAPE + PSYCHOLOGY ANALYSIS PIPELINE
 *
 * Scrapes leads from Construction Wire and runs psychology analysis
 * to prioritize leads by conversion probability.
 *
 * Usage:
 *   npx tsx scripts/scrape-and-analyze.ts --max=50
 *   npx tsx scripts/scrape-and-analyze.ts --max=100 --headless
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  calculatePsychologyScore,
  getConsequenceQuestionsForLead,
  getOptimalSequence,
} from '../lib/psychology'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AnalyzedLead {
  id: string
  project_name: string
  project_value: number
  priority_rank: 'A' | 'B' | 'C' | 'D'
  conversion_probability: number
  key_insight: string
  recommended_approach: string
  top_questions: string[]
  estimated_revenue: number // Your cut: $1k per deal + $1k per system
}

async function analyzePipeline(): Promise<void> {
  console.log('\n')
  console.log('═'.repeat(60))
  console.log('🧠 PSYCHOLOGY-DRIVEN PIPELINE ANALYSIS')
  console.log('═'.repeat(60))

  // Fetch all projects from high_priority_projects view
  const { data: projects, error } = await supabase
    .from('high_priority_projects')
    .select('*')
    .order('groove_fit_score', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch projects:', error.message)
    return
  }

  if (!projects || projects.length === 0) {
    console.log('⚠️  No projects found. Run the scraper first:')
    console.log('   npm run scrape --max=50')
    return
  }

  console.log(`\n📊 Analyzing ${projects.length} projects...\n`)

  const analyzedLeads: AnalyzedLead[] = []
  const tierCounts = { A: 0, B: 0, C: 0, D: 0 }

  for (const project of projects) {
    try {
      // Calculate psychology score
      const psychologyScore = calculatePsychologyScore(
        {
          title: null,
          roleCategory: null,
          decisionLevel: null,
          contactCount: 0,
          lastResponseSentiment: null,
          hasObjected: false,
        },
        {
          projectName: project.project_name,
          projectType: project.project_type || [],
          projectStage: project.project_stage || 'planning',
          projectValue: project.project_value || 0,
          estimatedCompletionDate: project.estimated_completion_date,
          servicesNeeded: project.services_needed || [],
        },
        {
          responseCount: 0,
          daysSinceLastContact: undefined,
        },
        {
          dayOfWeek: new Date().getDay(),
          timeOfDay: new Date().getHours() < 12 ? 'morning' :
                     new Date().getHours() < 17 ? 'afternoon' : 'evening',
          endOfQuarter: false,
        }
      )

      // Get consequence questions
      const questions = getConsequenceQuestionsForLead(
        {
          projectType: project.project_type || [],
          projectStage: project.project_stage || 'planning',
          projectValue: project.project_value || 0,
          servicesNeeded: project.services_needed || [],
        },
        {
          selfMonitorProfile: psychologyScore.selfMonitor.profile,
          identityDimension: psychologyScore.identityThreat.identityDimension,
        },
        3
      )

      // Get optimal sequence
      const sequence = getOptimalSequence(
        {
          projectType: project.project_type || [],
          projectStage: project.project_stage || 'planning',
          servicesNeeded: project.services_needed || [],
        },
        {
          selfMonitorProfile: psychologyScore.selfMonitor.profile,
        }
      )

      // Estimate systems per deal based on project type
      const projectTypes = (project.project_type || []).map((t: string) => t.toLowerCase())
      let estimatedSystems = 4 // Default

      if (projectTypes.some((t: string) => ['hotel', 'resort'].includes(t))) {
        estimatedSystems = 6 // Cabling, DIRECTV, WiFi, Phone, Access, Video
      } else if (projectTypes.some((t: string) => ['senior_living', 'assisted_living'].includes(t))) {
        estimatedSystems = 5 // Cabling, WiFi, DAS, ERCES, Leak Detection
      } else if (projectTypes.some((t: string) => ['multifamily', 'apartment'].includes(t))) {
        estimatedSystems = 5 // Cabling, WiFi, Della OS, Smart Locks, Access
      }

      // Your revenue: $1k per conversion + $1k per system
      const estimatedRevenue = 1000 + (estimatedSystems * 1000)

      tierCounts[psychologyScore.priorityRank]++

      analyzedLeads.push({
        id: project.id,
        project_name: project.project_name,
        project_value: project.project_value || 0,
        priority_rank: psychologyScore.priorityRank,
        conversion_probability: psychologyScore.conversionProbability,
        key_insight: psychologyScore.keyInsight,
        recommended_approach: sequence?.name || 'Standard NEPQ',
        top_questions: questions.map(q => q.question),
        estimated_revenue: estimatedRevenue,
      })

      // Update project with psychology data
      await supabase
        .from('projects')
        .update({
          raw_data: {
            ...project.raw_data,
            psychology_score: psychologyScore,
            analyzed_at: new Date().toISOString(),
          }
        })
        .eq('id', project.id)

    } catch (err: any) {
      console.error(`   ❌ Error analyzing ${project.project_name}: ${err.message}`)
    }
  }

  // Sort by conversion probability
  analyzedLeads.sort((a, b) => b.conversion_probability - a.conversion_probability)

  // Print results
  console.log('\n' + '━'.repeat(60))
  console.log('🎯 PRIORITY LEADS (Top 10 by Conversion Probability)')
  console.log('━'.repeat(60))

  const top10 = analyzedLeads.slice(0, 10)
  for (let i = 0; i < top10.length; i++) {
    const lead = top10[i]
    console.log(`\n${i + 1}. [${lead.priority_rank}] ${lead.project_name}`)
    console.log(`   💰 Project Value: $${(lead.project_value / 1000000).toFixed(1)}M`)
    console.log(`   📈 Conversion: ${lead.conversion_probability}%`)
    console.log(`   💡 ${lead.key_insight}`)
    console.log(`   🎯 Approach: ${lead.recommended_approach}`)
    console.log(`   💵 Your Est. Revenue: $${lead.estimated_revenue.toLocaleString()}`)
    if (lead.top_questions.length > 0) {
      console.log(`   ❓ Lead Question: "${lead.top_questions[0]}"`)
    }
  }

  // Summary stats
  console.log('\n' + '═'.repeat(60))
  console.log('📊 PIPELINE SUMMARY')
  console.log('═'.repeat(60))
  console.log(`\n   Total Leads: ${analyzedLeads.length}`)
  console.log(`   ├─ A-Tier (Hot): ${tierCounts.A}`)
  console.log(`   ├─ B-Tier (Warm): ${tierCounts.B}`)
  console.log(`   ├─ C-Tier (Cool): ${tierCounts.C}`)
  console.log(`   └─ D-Tier (Cold): ${tierCounts.D}`)

  // Revenue projections
  const avgSystemsPerDeal = 4.5
  const revenuePerDeal = 1000 + (avgSystemsPerDeal * 1000) // $5,500

  const aRevenue = tierCounts.A * 0.10 * revenuePerDeal // 10% close rate
  const bRevenue = tierCounts.B * 0.05 * revenuePerDeal // 5% close rate
  const cRevenue = tierCounts.C * 0.02 * revenuePerDeal // 2% close rate

  console.log(`\n   💰 CONSERVATIVE REVENUE PROJECTION`)
  console.log(`   ├─ A-Tier @ 10% close: $${aRevenue.toLocaleString()}`)
  console.log(`   ├─ B-Tier @ 5% close:  $${bRevenue.toLocaleString()}`)
  console.log(`   ├─ C-Tier @ 2% close:  $${cRevenue.toLocaleString()}`)
  console.log(`   └─ TOTAL EXPECTED:     $${(aRevenue + bRevenue + cRevenue).toLocaleString()}`)

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Analysis complete! Psychology scores saved to database.')
  console.log('═'.repeat(60))
  console.log('\n')
}

// Run analysis
analyzePipeline().catch(console.error)
