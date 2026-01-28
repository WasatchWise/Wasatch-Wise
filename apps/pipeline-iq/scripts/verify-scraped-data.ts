#!/usr/bin/env tsx
/**
 * Data Fidelity Verification Script
 * Checks the quality and integrity of recently scraped data
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'
import { logger } from '../lib/logger'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface DataQualityReport {
  scrapeLogs: {
    total: number
    recent: number
    byStatus: Record<string, number>
    errors: string[]
  }
  projects: {
    total: number
    recent: number
    missingRequiredFields: number
    duplicates: number
    invalidData: string[]
    sampleRecords: any[]
  }
  highPriorityProjects: {
    total: number
    recent: number
    missingRequiredFields: number
    duplicates: number
    invalidData: string[]
    sampleRecords: any[]
  }
  companies: {
    total: number
    recent: number
    missingRequiredFields: number
    duplicates: number
    invalidData: string[]
  }
  contacts: {
    total: number
    recent: number
    missingRequiredFields: number
    duplicates: number
    invalidData: string[]
  }
  summary: {
    overallHealth: 'good' | 'warning' | 'critical'
    issues: string[]
    recommendations: string[]
  }
}

async function verifyDataFidelity(): Promise<DataQualityReport> {
  const supabase = createServiceSupabaseClient()
  const report: DataQualityReport = {
    scrapeLogs: {
      total: 0,
      recent: 0,
      byStatus: {},
      errors: [],
    },
    projects: {
      total: 0,
      recent: 0,
      missingRequiredFields: 0,
      duplicates: 0,
      invalidData: [],
      sampleRecords: [],
    },
    highPriorityProjects: {
      total: 0,
      recent: 0,
      missingRequiredFields: 0,
      duplicates: 0,
      invalidData: [],
      sampleRecords: [],
    },
    companies: {
      total: 0,
      recent: 0,
      missingRequiredFields: 0,
      duplicates: 0,
      invalidData: [],
    },
    contacts: {
      total: 0,
      recent: 0,
      missingRequiredFields: 0,
      duplicates: 0,
      invalidData: [],
    },
    summary: {
      overallHealth: 'good',
      issues: [],
      recommendations: [],
    },
  }

  // Get date from 24 hours ago
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  try {
    // 1. Check scrape_logs
    console.log('📊 Checking scrape logs...')
    const { data: allLogs, error: logsError } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (logsError) {
      report.scrapeLogs.errors.push(`Error fetching logs: ${logsError.message}`)
    } else if (allLogs) {
      report.scrapeLogs.total = allLogs.length
      report.scrapeLogs.recent = allLogs.filter(
        (log) => new Date(log.created_at || '') >= yesterday
      ).length

      // Group by status
      allLogs.forEach((log) => {
        const status = log.status || 'unknown'
        report.scrapeLogs.byStatus[status] =
          (report.scrapeLogs.byStatus[status] || 0) + 1
      })

      // Check for errors in recent logs
      const recentLogs = allLogs.filter(
        (log) => new Date(log.created_at || '') >= yesterday
      )
      recentLogs.forEach((log) => {
        if (log.error_message) {
          report.scrapeLogs.errors.push(
            `Log ${log.id}: ${log.error_message}`
          )
        }
      })
    }

    // 2. Check projects table
    console.log('📋 Checking projects table...')
    const { data: allProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      report.projects.invalidData.push(
        `Error fetching projects: ${projectsError.message}`
      )
    } else if (allProjects) {
      report.projects.total = allProjects.length
      report.projects.recent = allProjects.filter(
        (p) => new Date(p.created_at || '') >= yesterday
      ).length

      // Check for missing required fields
      allProjects.forEach((project) => {
        if (!project.project_name || project.project_name.trim() === '') {
          report.projects.missingRequiredFields++
        }
        if (!project.cw_project_id || project.cw_project_id.trim() === '') {
          report.projects.missingRequiredFields++
        }
        if (!project.project_stage || project.project_stage.trim() === '') {
          report.projects.missingRequiredFields++
        }
      })

      // Check for duplicates by cw_project_id
      const cwIds = allProjects
        .map((p) => p.cw_project_id)
        .filter((id) => id)
      const uniqueIds = new Set(cwIds)
      report.projects.duplicates = cwIds.length - uniqueIds.size

      // Get sample of recent records
      report.projects.sampleRecords = allProjects
        .filter((p) => new Date(p.created_at || '') >= yesterday)
        .slice(0, 5)
    }

    // 3. Check high_priority_projects table
    console.log('⭐ Checking high_priority_projects table...')
    const { data: allHighPriority, error: hppError } = await supabase
      .from('high_priority_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (hppError) {
      report.highPriorityProjects.invalidData.push(
        `Error fetching high priority projects: ${hppError.message}`
      )
    } else if (allHighPriority) {
      report.highPriorityProjects.total = allHighPriority.length
      report.highPriorityProjects.recent = allHighPriority.filter(
        (p) => new Date(p.created_at || '') >= yesterday
      ).length

      // Check for missing required fields
      allHighPriority.forEach((project) => {
        if (!project.project_name || project.project_name.trim() === '') {
          report.highPriorityProjects.missingRequiredFields++
        }
        if (!project.cw_project_id || project.cw_project_id.trim() === '') {
          report.highPriorityProjects.missingRequiredFields++
        }
        if (!project.city || project.city.trim() === '') {
          report.highPriorityProjects.missingRequiredFields++
        }
        if (!project.state || project.state.trim() === '') {
          report.highPriorityProjects.missingRequiredFields++
        }
      })

      // Check for duplicates by cw_project_id
      const cwIds = allHighPriority
        .map((p) => p.cw_project_id)
        .filter((id) => id)
      const uniqueIds = new Set(cwIds)
      report.highPriorityProjects.duplicates = cwIds.length - uniqueIds.size

      // Get sample of recent records
      report.highPriorityProjects.sampleRecords = allHighPriority
        .filter((p) => new Date(p.created_at || '') >= yesterday)
        .slice(0, 5)
    }

    // 4. Check companies table
    console.log('🏢 Checking companies table...')
    const { data: allCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) {
      report.companies.invalidData.push(
        `Error fetching companies: ${companiesError.message}`
      )
    } else if (allCompanies) {
      report.companies.total = allCompanies.length
      report.companies.recent = allCompanies.filter(
        (c) => new Date(c.created_at || '') >= yesterday
      ).length

      // Check for missing required fields
      allCompanies.forEach((company) => {
        if (!company.company_name || company.company_name.trim() === '') {
          report.companies.missingRequiredFields++
        }
      })

      // Check for duplicates by company_name
      const names = allCompanies
        .map((c) => c.company_name?.toLowerCase().trim())
        .filter((name) => name)
      const uniqueNames = new Set(names)
      report.companies.duplicates = names.length - uniqueNames.size
    }

    // 5. Check contacts table
    console.log('👤 Checking contacts table...')
    const { data: allContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (contactsError) {
      report.contacts.invalidData.push(
        `Error fetching contacts: ${contactsError.message}`
      )
    } else if (allContacts) {
      report.contacts.total = allContacts.length
      report.contacts.recent = allContacts.filter(
        (c) => new Date(c.created_at || '') >= yesterday
      ).length

      // Check for missing required fields
      allContacts.forEach((contact) => {
        if (!contact.first_name || contact.first_name.trim() === '') {
          report.contacts.missingRequiredFields++
        }
        if (!contact.last_name || contact.last_name.trim() === '') {
          report.contacts.missingRequiredFields++
        }
      })

      // Check for duplicates by email (if present)
      const emails = allContacts
        .map((c) => c.email?.toLowerCase().trim())
        .filter((email) => email)
      const uniqueEmails = new Set(emails)
      report.contacts.duplicates = emails.length - uniqueEmails.size
    }

    // Generate summary
    const totalIssues =
      report.scrapeLogs.errors.length +
      report.projects.missingRequiredFields +
      report.projects.duplicates +
      report.highPriorityProjects.missingRequiredFields +
      report.highPriorityProjects.duplicates +
      report.companies.missingRequiredFields +
      report.companies.duplicates +
      report.contacts.missingRequiredFields +
      report.contacts.duplicates

    if (totalIssues === 0) {
      report.summary.overallHealth = 'good'
    } else if (totalIssues < 10) {
      report.summary.overallHealth = 'warning'
    } else {
      report.summary.overallHealth = 'critical'
    }

    // Add issues to summary
    if (report.scrapeLogs.errors.length > 0) {
      report.summary.issues.push(
        `${report.scrapeLogs.errors.length} errors in scrape logs`
      )
    }
    if (report.projects.duplicates > 0) {
      report.summary.issues.push(
        `${report.projects.duplicates} duplicate projects found`
      )
    }
    if (report.highPriorityProjects.duplicates > 0) {
      report.summary.issues.push(
        `${report.highPriorityProjects.duplicates} duplicate high priority projects found`
      )
    }
    if (report.projects.missingRequiredFields > 0) {
      report.summary.issues.push(
        `${report.projects.missingRequiredFields} projects missing required fields`
      )
    }
    if (report.highPriorityProjects.missingRequiredFields > 0) {
      report.summary.issues.push(
        `${report.highPriorityProjects.missingRequiredFields} high priority projects missing required fields`
      )
    }

    // Add recommendations
    if (report.projects.duplicates > 0 || report.highPriorityProjects.duplicates > 0) {
      report.summary.recommendations.push(
        'Consider implementing duplicate detection before inserting new records'
      )
    }
    if (report.projects.missingRequiredFields > 0 || report.highPriorityProjects.missingRequiredFields > 0) {
      report.summary.recommendations.push(
        'Review scraper to ensure all required fields are being captured'
      )
    }
    if (report.scrapeLogs.recent === 0) {
      report.summary.recommendations.push(
        'No recent scrape logs found - verify scraper is running correctly'
      )
    }

    return report
  } catch (error) {
    logger.error('Error verifying data fidelity:', error)
    throw error
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting data fidelity verification...\n')
  
  try {
    const report = await verifyDataFidelity()

    // Print report
    console.log('\n' + '='.repeat(80))
    console.log('📊 DATA FIDELITY REPORT')
    console.log('='.repeat(80) + '\n')

    // Scrape Logs
    console.log('📝 SCRAPE LOGS:')
    console.log(`   Total logs: ${report.scrapeLogs.total}`)
    console.log(`   Recent (last 24h): ${report.scrapeLogs.recent}`)
    console.log(`   Status breakdown:`)
    Object.entries(report.scrapeLogs.byStatus).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`)
    })
    if (report.scrapeLogs.errors.length > 0) {
      console.log(`   ⚠️  Errors found: ${report.scrapeLogs.errors.length}`)
      report.scrapeLogs.errors.slice(0, 5).forEach((error) => {
        console.log(`     - ${error}`)
      })
    }
    console.log('')

    // Projects
    console.log('📋 PROJECTS:')
    console.log(`   Total: ${report.projects.total}`)
    console.log(`   Recent (last 24h): ${report.projects.recent}`)
    console.log(`   Missing required fields: ${report.projects.missingRequiredFields}`)
    console.log(`   Duplicates: ${report.projects.duplicates}`)
    if (report.projects.sampleRecords.length > 0) {
      console.log(`   Sample recent records:`)
      report.projects.sampleRecords.forEach((record, idx) => {
        console.log(`     ${idx + 1}. ${record.project_name} (${record.cw_project_id})`)
        console.log(`        Created: ${record.created_at}`)
        console.log(`        Stage: ${record.project_stage || 'N/A'}`)
        console.log(`        Location: ${record.city || 'N/A'}, ${record.state || 'N/A'}`)
      })
    }
    console.log('')

    // High Priority Projects
    console.log('⭐ HIGH PRIORITY PROJECTS:')
    console.log(`   Total: ${report.highPriorityProjects.total}`)
    console.log(`   Recent (last 24h): ${report.highPriorityProjects.recent}`)
    console.log(`   Missing required fields: ${report.highPriorityProjects.missingRequiredFields}`)
    console.log(`   Duplicates: ${report.highPriorityProjects.duplicates}`)
    if (report.highPriorityProjects.sampleRecords.length > 0) {
      console.log(`   Sample recent records:`)
      report.highPriorityProjects.sampleRecords.forEach((record, idx) => {
        console.log(`     ${idx + 1}. ${record.project_name} (${record.cw_project_id})`)
        console.log(`        Created: ${record.created_at}`)
        console.log(`        Stage: ${record.project_stage || 'N/A'}`)
        console.log(`        Location: ${record.city || 'N/A'}, ${record.state || 'N/A'}`)
        console.log(`        Score: ${record.total_score || 'N/A'}`)
      })
    }
    console.log('')

    // Companies
    console.log('🏢 COMPANIES:')
    console.log(`   Total: ${report.companies.total}`)
    console.log(`   Recent (last 24h): ${report.companies.recent}`)
    console.log(`   Missing required fields: ${report.companies.missingRequiredFields}`)
    console.log(`   Duplicates: ${report.companies.duplicates}`)
    console.log('')

    // Contacts
    console.log('👤 CONTACTS:')
    console.log(`   Total: ${report.contacts.total}`)
    console.log(`   Recent (last 24h): ${report.contacts.recent}`)
    console.log(`   Missing required fields: ${report.contacts.missingRequiredFields}`)
    console.log(`   Duplicates: ${report.contacts.duplicates}`)
    console.log('')

    // Summary
    console.log('='.repeat(80))
    console.log('📈 SUMMARY')
    console.log('='.repeat(80))
    console.log(`Overall Health: ${report.summary.overallHealth.toUpperCase()}`)
    console.log('')

    if (report.summary.issues.length > 0) {
      console.log('⚠️  ISSUES FOUND:')
      report.summary.issues.forEach((issue) => {
        console.log(`   - ${issue}`)
      })
      console.log('')
    } else {
      console.log('✅ No issues found!')
      console.log('')
    }

    if (report.summary.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:')
      report.summary.recommendations.forEach((rec) => {
        console.log(`   - ${rec}`)
      })
      console.log('')
    }

    console.log('='.repeat(80))
  } catch (error) {
    console.error('❌ Error generating report:', error)
    process.exit(1)
  }
}

main()

