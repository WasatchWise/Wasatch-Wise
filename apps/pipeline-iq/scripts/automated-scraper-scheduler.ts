#!/usr/bin/env tsx

/**
 * AUTOMATED SCRAPER SCHEDULER
 * 
 * This script manages automated scraping schedules and executes them.
 * Can be run as a cron job or standalone scheduler.
 * 
 * Usage:
 *   npm run scheduler        # Run scheduler once (checks & executes due scrapes)
 *   npm run scheduler:daemon # Run as daemon (continuous checking)
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ORGANIZATION_ID = process.env.ORGANIZATION_ID!

interface ScrapeSchedule {
  id: string
  source: string
  schedule_type: string
  schedule_cron: string
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  parameters: any
  notify_on_completion: boolean
  notify_on_error: boolean
  notification_emails: string[]
}

class AutomatedScheduler {
  private isDaemon: boolean = false
  private checkInterval: number = 60000 // 1 minute

  constructor(isDaemon: boolean = false) {
    this.isDaemon = isDaemon
  }

  async start() {
    console.log('🤖 Automated Scraper Scheduler Started')
    console.log('━'.repeat(60))
    console.log(`Mode: ${this.isDaemon ? 'Daemon (Continuous)' : 'One-time Check'}`)
    console.log(`Organization: ${ORGANIZATION_ID}`)
    console.log('━'.repeat(60))

    if (this.isDaemon) {
      console.log(`Checking every ${this.checkInterval / 1000} seconds...`)
      await this.runDaemon()
    } else {
      await this.checkAndExecute()
    }
  }

  async runDaemon() {
    while (true) {
      try {
        await this.checkAndExecute()
      } catch (error: any) {
        console.error('❌ Error in daemon loop:', error.message)
      }

      // Wait before next check
      await this.sleep(this.checkInterval)
    }
  }

  async checkAndExecute() {
    const now = new Date()
    console.log(`\n[${now.toISOString()}] Checking for due scrapes...`)

    // Get all active schedules that are due
    const { data: schedules, error } = await supabase
      .from('scrape_schedules')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('is_active', true)
      .lte('next_run_at', now.toISOString())

    if (error) {
      console.error('❌ Error fetching schedules:', error.message)
      return
    }

    if (!schedules || schedules.length === 0) {
      console.log('✓ No scrapes due at this time')
      return
    }

    console.log(`📋 Found ${schedules.length} scrape(s) due:\n`)

    // Execute each due scrape
    for (const schedule of schedules) {
      await this.executeScrape(schedule as ScrapeSchedule)
    }
  }

  async executeScrape(schedule: ScrapeSchedule) {
    console.log(`\n${'━'.repeat(60)}`)
    console.log(`🚀 Executing Scrape: ${schedule.source}`)
    console.log(`   Schedule Type: ${schedule.schedule_type}`)
    console.log(`   Last Run: ${schedule.last_run_at || 'Never'}`)
    console.log(`   Parameters:`, schedule.parameters)
    console.log(`${'━'.repeat(60)}\n`)

    const startTime = Date.now()
    let success = false
    let projectsFound = 0
    let projectsInserted = 0
    let projectsUpdated = 0
    let errorMessage = null

    // Create scrape log entry
    const { data: logEntry, error: logError } = await supabase
      .from('scrape_logs')
      .insert({
        organization_id: ORGANIZATION_ID,
        source: schedule.source,
        status: 'running',
        scrape_type: schedule.schedule_type === 'daily' ? 'incremental' : 'full',
        parameters: schedule.parameters,
      })
      .select()
      .single()

    if (logError) {
      console.error('❌ Failed to create scrape log:', logError.message)
      return
    }

    try {
      // Execute the appropriate scraper
      const result = await this.runScraper(schedule.source, schedule.parameters)
      
      success = result.success
      projectsFound = result.projectsFound || 0
      projectsInserted = result.projectsInserted || 0
      projectsUpdated = result.projectsUpdated || 0
      errorMessage = result.error

      if (success) {
        console.log(`✅ Scrape completed successfully`)
        console.log(`   Projects Found: ${projectsFound}`)
        console.log(`   Projects Inserted: ${projectsInserted}`)
        console.log(`   Projects Updated: ${projectsUpdated}`)
      } else {
        console.error(`❌ Scrape failed: ${errorMessage}`)
      }
    } catch (error: any) {
      success = false
      errorMessage = error.message
      console.error(`❌ Scrape exception: ${errorMessage}`)
    }

    const endTime = Date.now()
    const durationSeconds = Math.round((endTime - startTime) / 1000)

    // Update scrape log
    await supabase
      .from('scrape_logs')
      .update({
        status: success ? 'success' : 'failed',
        projects_found: projectsFound,
        projects_inserted: projectsInserted,
        projects_updated: projectsUpdated,
        duration_seconds: durationSeconds,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', logEntry.id)

    // Calculate next run time
    const nextRun = this.calculateNextRun(schedule)

    // Update schedule
    await supabase
      .from('scrape_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun.toISOString(),
      })
      .eq('id', schedule.id)

    console.log(`\n⏰ Next run scheduled for: ${nextRun.toISOString()}`)

    // Send notifications if configured
    if (
      (success && schedule.notify_on_completion) ||
      (!success && schedule.notify_on_error)
    ) {
      await this.sendNotification(schedule, success, {
        projectsFound,
        projectsInserted,
        projectsUpdated,
        errorMessage,
        durationSeconds,
      })
    }
  }

  async runScraper(source: string, parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let scriptPath: string

      // Map source to script
      switch (source.toLowerCase()) {
        case 'construction_wire':
          scriptPath = 'scripts/scrape-construction-wire-enhanced.ts'
          break
        default:
          reject(new Error(`Unknown scraper source: ${source}`))
          return
      }

      console.log(`   Executing: npx tsx ${scriptPath} --headless`)

      const scraper = spawn('npx', ['tsx', scriptPath, '--headless'], {
        cwd: process.cwd(),
        env: process.env,
      })

      let stdout = ''
      let stderr = ''

      scraper.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        process.stdout.write(text) // Pass through to console
      })

      scraper.stderr.on('data', (data) => {
        const text = data.toString()
        stderr += text
        process.stderr.write(text)
      })

      scraper.on('close', (code) => {
        if (code === 0) {
          // Parse output to get counts
          const foundMatch = stdout.match(/Found (\d+) project/)
          const scrapedMatch = stdout.match(/Scraped (\d+) projects/)
          const savedMatch = stdout.match(/Saved:\s*(\d+)/)

          resolve({
            success: true,
            projectsFound: foundMatch ? parseInt(foundMatch[1]) : 0,
            projectsInserted: savedMatch ? parseInt(savedMatch[1]) : 0,
            projectsUpdated: 0, // Would need to parse from scraper output
          })
        } else {
          resolve({
            success: false,
            error: stderr || `Scraper exited with code ${code}`,
          })
        }
      })

      scraper.on('error', (error) => {
        reject(error)
      })
    })
  }

  calculateNextRun(schedule: ScrapeSchedule): Date {
    const now = new Date()

    switch (schedule.schedule_type) {
      case 'daily':
        // Next day at same time
        const dailyNext = new Date(now)
        dailyNext.setDate(dailyNext.getDate() + 1)
        return dailyNext

      case 'weekly':
        // Next week at same time
        const weeklyNext = new Date(now)
        weeklyNext.setDate(weeklyNext.getDate() + 7)
        return weeklyNext

      case 'monthly':
        // Next month at same day
        const monthlyNext = new Date(now)
        monthlyNext.setMonth(monthlyNext.getMonth() + 1)
        return monthlyNext

      case 'custom':
        // Parse cron expression (simplified - would use node-cron in production)
        // For now, default to 24 hours
        const customNext = new Date(now)
        customNext.setHours(customNext.getHours() + 24)
        return customNext

      default:
        // Default to 24 hours
        const defaultNext = new Date(now)
        defaultNext.setHours(defaultNext.getHours() + 24)
        return defaultNext
    }
  }

  async sendNotification(
    schedule: ScrapeSchedule,
    success: boolean,
    details: any
  ) {
    console.log(`\n📧 Sending notification...`)

    const subject = success
      ? `✅ Scrape Completed: ${schedule.source}`
      : `❌ Scrape Failed: ${schedule.source}`

    const body = success
      ? `Scrape completed successfully!

Source: ${schedule.source}
Projects Found: ${details.projectsFound}
Projects Inserted: ${details.projectsInserted}
Projects Updated: ${details.projectsUpdated}
Duration: ${details.durationSeconds}s

View dashboard: http://localhost:3000/projects
`
      : `Scrape failed!

Source: ${schedule.source}
Error: ${details.errorMessage}
Duration: ${details.durationSeconds}s

Please check logs and fix the issue.
`

    // In production, would send actual emails via SendGrid/SES
    // For now, just log
    console.log(`   Subject: ${subject}`)
    console.log(`   Recipients: ${schedule.notification_emails.join(', ')}`)
    console.log(`   Body:\n${body}`)

    // Create in-app notification
    if (schedule.notification_emails.length > 0) {
      // Get users with these emails
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .in('email', schedule.notification_emails)

      if (users && users.length > 0) {
        for (const user of users) {
          await supabase.from('system_notifications').insert({
            organization_id: ORGANIZATION_ID,
            user_id: user.id,
            notification_type: success ? 'scrape_success' : 'scrape_failed',
            title: subject,
            message: body,
            priority: success ? 'normal' : 'high',
          })
        }
      }
    }

    console.log(`   ✓ Notification sent`)
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Main execution
async function main() {
  const isDaemon = process.argv.includes('--daemon')

  const scheduler = new AutomatedScheduler(isDaemon)
  await scheduler.start()
}

main().catch((error) => {
  console.error('💥 Scheduler error:', error)
  process.exit(1)
})

