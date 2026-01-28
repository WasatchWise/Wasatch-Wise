#!/usr/bin/env tsx

/**
 * BULK SCRAPE Construction Wire - Complete Database Capture
 * 
 * This script scrapes ALL projects from Construction Wire, not just the latest 100.
 * Designed for one-time bulk capture of historical data.
 * 
 * Features:
 * - Resume capability (tracks last page scraped)
 * - Fast mode (list only, no detail pages)
 * - Full mode (with detail pages)
 * - Progress tracking
 * - Error recovery
 * 
 * Usage:
 *   npm run bulk-scrape                    # Fast mode (list only)
 *   npm run bulk-scrape -- --full          # Full mode (with details)
 *   npm run bulk-scrape -- --resume        # Resume from last page
 *   npm run bulk-scrape -- --start-page=50 # Start from specific page
 */

import { config } from 'dotenv'
import puppeteer, { Browser, Page } from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'

// Load environment variables
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI

if (!isGitHubActions && !isCI) {
  config({ path: '.env.local' })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const organizationId = process.env.ORGANIZATION_ID
const cwUsername = process.env.CONSTRUCTION_WIRE_USERNAME
const cwPassword = process.env.CONSTRUCTION_WIRE_PASSWORD

if (!supabaseUrl || !supabaseKey || !organizationId || !cwUsername || !cwPassword) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)
const ORGANIZATION_ID = organizationId
const CW_USERNAME = cwUsername
const CW_PASSWORD = cwPassword

const FULL_MODE = process.argv.includes('--full')
const RESUME_MODE = process.argv.includes('--resume')
const START_PAGE_ARG = process.argv.find(arg => arg.startsWith('--start-page='))
const START_PAGE = START_PAGE_ARG ? parseInt(START_PAGE_ARG.split('=')[1]) : undefined

const PROGRESS_FILE = '.bulk-scrape-progress.json'

interface Progress {
  lastPage: number
  totalProjects: number
  projectsScraped: number
  startTime: string
  lastUpdate: string
}

async function loadProgress(): Promise<Progress | null> {
  if (!RESUME_MODE && !existsSync(PROGRESS_FILE)) {
    return null
  }

  try {
    const data = await readFile(PROGRESS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function saveProgress(progress: Progress) {
  await writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

class BulkConstructionWireScraper {
  private browser: Browser | null = null
  private page: Page | null = null
  private projectsScraped = 0
  private projectsSaved = 0
  private errors = 0
  private currentPage = 1
  private progress: Progress | null = null

  async init() {
    console.log('\n════════════════════════════════════════════════════════════')
    console.log('🏗️  BULK CONSTRUCTION WIRE SCRAPER')
    console.log('════════════════════════════════════════════════════════════')
    console.log(`   Mode: ${FULL_MODE ? 'FULL (with details)' : 'FAST (list only)'}`)
    console.log(`   Resume: ${RESUME_MODE ? 'YES' : 'NO'}`)
    console.log('════════════════════════════════════════════════════════════\n')

    // Load progress
    this.progress = await loadProgress()
    if (this.progress) {
      console.log(`📊 Resuming from page ${this.progress.lastPage}`)
      console.log(`   Already scraped: ${this.progress.projectsScraped} projects\n`)
      this.currentPage = this.progress.lastPage + 1
    } else if (START_PAGE) {
      this.currentPage = START_PAGE
      console.log(`📊 Starting from page ${START_PAGE}\n`)
    }

    // Initialize browser (visible mode for debugging)
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })

    // Initialize progress tracking
    if (!this.progress) {
      this.progress = {
        lastPage: 0,
        totalProjects: 0,
        projectsScraped: 0,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }
      await saveProgress(this.progress)
    }
  }

  async typeIntoAnyOf(selectors: string[], text: string): Promise<boolean> {
    if (!this.page) return false

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          await element.type(text, { delay: 50 })
          return true
        }
      } catch (e) {
        // Try next selector
      }
    }
    return false
  }

  async clickAnyOf(selectors: string[]): Promise<boolean> {
    if (!this.page) return false

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          return true
        }
      } catch (e) {
        // Try next selector
      }
    }
    return false
  }

  async login() {
    if (!this.page) throw new Error('Browser not initialized')

    console.log('🔐 Logging into Construction Wire...')
    console.log(`   Username: ${CW_USERNAME}`)

    // Go to homepage first (like the enhanced scraper)
    await this.page.goto('https://www.constructionwire.com', {
      waitUntil: 'networkidle2',
      timeout: 60000
    })
    await this.wait(2000)

    // Click login button/link on homepage
    console.log('   Looking for login button...')
    const loginClicked = await this.clickAnyOf([
      'a.login',
      '.login',
      'a[href*="login"]',
      'a[href*="Login"]',
      'button:has-text("Login")',
      'a:has-text("Login")',
      'a:has-text("Sign In")',
    ])

    if (loginClicked) {
      console.log('   ✅ Login button clicked')
      await this.wait(2000)
    } else {
      // Try direct navigation to login page
      console.log('   No login button found, trying direct URL...')
      await this.page.goto('https://www.constructionwire.com/Account/Login', { waitUntil: 'networkidle2' })
      await this.wait(2000)
    }

    // Fill username with multiple selector options
    console.log('   Filling username...')
    const usernameFilled = await this.typeIntoAnyOf([
      'input[placeholder="Email"]',
      'input[name="username"]',
      'input[name="email"]',
      'input[type="email"]',
      'input[id*="email"]',
      'input[id*="username"]',
    ], CW_USERNAME)

    if (!usernameFilled) {
      throw new Error('Could not find username/email input field')
    }
    console.log('   ✅ Username filled')
    await this.wait(500)

    // Fill password
    console.log('   Filling password...')
    const passwordFilled = await this.typeIntoAnyOf([
      'input[placeholder="Password"]',
      'input[name="password"]',
      'input[type="password"]',
      'input[id*="password"]',
    ], CW_PASSWORD)

    if (!passwordFilled) {
      throw new Error('Could not find password input field')
    }
    console.log('   ✅ Password filled')
    await this.wait(500)

    // Click submit
    console.log('   Clicking submit...')
    const submitClicked = await this.clickAnyOf([
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'form button',
    ])

    if (submitClicked) {
      console.log('   ✅ Submit clicked')
    }

    await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
    await this.wait(2000)

    const currentUrl = this.page.url()
    if (currentUrl.includes('login')) {
      throw new Error('Login failed - still on login page')
    }

    console.log('✅ Successfully logged in\n')
  }

  async navigateToHotels() {
    if (!this.page) throw new Error('Browser not initialized')

    console.log('🏨 Navigating to Hotels section...')

    // After login, we're on the dashboard - need to click Search Projects
    await this.wait(2000)

    // Click Search Projects button
    const searchClicked = await this.clickAnyOf([
      'button.search-projects',
      'a.search-projects',
      'button:has-text("Search Projects")',
      'a:has-text("Search Projects")',
      '.btn-danger:has-text("Search")',
      'button.btn-danger',
    ])

    if (searchClicked) {
      console.log('   ✅ Search Projects button clicked')
    } else {
      // Try clicking by evaluating the page
      const clicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'))
        const searchBtn = buttons.find(el =>
          el.textContent?.includes('Search Projects') ||
          el.textContent?.includes('Search')
        )
        if (searchBtn) {
          (searchBtn as HTMLElement).click()
          return true
        }
        return false
      })
      if (clicked) {
        console.log('   ✅ Search button clicked via evaluate')
      } else {
        // Fallback: navigate directly to Hotels report
        console.log('   No search button found, navigating directly...')
        await this.page.goto('https://www.constructionwire.com/Client/Report/Hotels', { waitUntil: 'networkidle2' })
      }
    }

    await this.wait(3000)
    console.log('✅ On Hotels projects page\n')
  }

  async scrapeAllPages() {
    if (!this.page) throw new Error('Browser not initialized')

    console.log('📊 Starting bulk scrape...\n')
    let hasMorePages = true
    let consecutiveEmptyPages = 0

    while (hasMorePages && consecutiveEmptyPages < 3) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📄 Page ${this.currentPage}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

      const projects = await this.scrapeCurrentPage()

      if (projects.length === 0) {
        consecutiveEmptyPages++
        console.log(`⚠️  No projects found on page ${this.currentPage}`)
        if (consecutiveEmptyPages >= 3) {
          console.log('✅ Reached end of projects (3 empty pages)\n')
          break
        }
      } else {
        consecutiveEmptyPages = 0
        console.log(`✅ Found ${projects.length} projects on page ${this.currentPage}`)

        // Save projects
        await this.saveProjects(projects)

        // Update progress
        if (this.progress) {
          this.progress.lastPage = this.currentPage
          this.progress.projectsScraped += projects.length
          this.progress.lastUpdate = new Date().toISOString()
          await saveProgress(this.progress)
        }
      }

      // Try to go to next page
      const hasNextPage = await this.clickNextPage()
      if (!hasNextPage) {
        console.log('✅ No more pages available\n')
        hasMorePages = false
      } else {
        this.currentPage++
        await this.wait(2000)
      }
    }

    this.printSummary()
  }

  async clickNextPage(): Promise<boolean> {
    if (!this.page) return false

    try {
      // Look for pagination next button - Construction Wire uses various patterns
      const nextSelectors = [
        'a.next',
        '.pagination .next a',
        'a[rel="next"]',
        '.pager a.next',
        'li.next a',
        'a:has-text("Next")',
        'a:has-text(">")',
        '.pagination a:last-child'
      ]

      for (const selector of nextSelectors) {
        try {
          const nextBtn = await this.page.$(selector)
          if (nextBtn) {
            const isDisabled = await nextBtn.evaluate(el =>
              el.classList.contains('disabled') ||
              el.getAttribute('disabled') !== null ||
              el.getAttribute('aria-disabled') === 'true'
            )

            if (!isDisabled) {
              console.log(`   📄 Clicking next page...`)
              await nextBtn.click()
              await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => { })
              return true
            }
          }
        } catch (e) {
          continue
        }
      }

      // Also try finding by page numbers
      const currentPageNum = await this.page.evaluate(() => {
        const activePageEl = document.querySelector('.pagination .active, .pager .active')
        return activePageEl ? parseInt(activePageEl.textContent || '1') : 1
      })

      const nextPageNum = currentPageNum + 1
      const pageLink = await this.page.$(`a:has-text("${nextPageNum}")`)
      if (pageLink) {
        console.log(`   📄 Clicking page ${nextPageNum}...`)
        await pageLink.click()
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => { })
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  printSummary() {
    console.log(`\n✅ Bulk scrape complete!`)
    console.log(`   Total pages scraped: ${this.currentPage}`)
    console.log(`   Total projects: ${this.projectsScraped}`)
    console.log(`   Projects saved: ${this.projectsSaved}`)
    console.log(`   Errors: ${this.errors}\n`)
  }

  async scrapeCurrentPage(): Promise<any[]> {
    if (!this.page) throw new Error('Browser not initialized')

    // Extract projects from current page (simplified version)
    // This uses the same logic as the main scraper but without detail fetching in fast mode
    const projects = await this.page.evaluate(() => {
      const titleAnchors = Array.from(document.querySelectorAll('a.title, a[href*="/Details/"]'))
        .filter((a: any) => {
          const href = a.getAttribute('href') || ''
          const text = a.textContent?.trim() || ''
          return href.includes('/Details/') && text.length > 3
        })

      return titleAnchors.map((anchor: any) => {
        const projectName = anchor.textContent?.trim() || ''
        const href = anchor.getAttribute('href') || ''
        const cwProjectId = href.match(/\/Details\/(\d+)/)?.[1] || ''

        // Try to extract basic info from table row
        let location = ''
        let rooms = '0'
        let type = ''

        const parent = anchor.closest('tr')
        if (parent) {
          const cells = Array.from(parent.querySelectorAll('td'))
          for (const cell of cells) {
            const text = cell.textContent?.trim() || ''
            if (!text || text === projectName) continue

            if (text.match(/[A-Z][a-z]+,?\s+[A-Z]{2}\s+\d{5}/) && !location) {
              location = text
            } else if (text.match(/^\d{1,4}$/) && parseInt(text) > 0 && !rooms) {
              rooms = text
            } else if (text.match(/(?:Hotel|Inn|Suites|Resort)/i) && !type) {
              type = text
            }
          }
        }

        return {
          projectName,
          href,
          cwProjectId: cwProjectId ? `CW-${cwProjectId}` : '',
          location,
          rooms,
          type,
          stage: 'Planning'
        }
      })
    })

    this.projectsScraped += projects.length

    // In full mode, fetch detail pages (this would use the detail scraping logic)
    // For now, we'll do fast mode only
    if (FULL_MODE) {
      console.log(`   ⚠️  Full mode detail fetching not yet implemented`)
      console.log(`   💡 Use the main scraper for detail fetching\n`)
    }

    return projects
  }

  async saveProjects(projects: any[]) {
    for (const project of projects) {
      try {
        const projectData = {
          organization_id: ORGANIZATION_ID,
          cw_project_id: project.cwProjectId,
          project_name: project.projectName,
          project_type: project.type ? [project.type.toLowerCase()] : ['hotel'],
          project_stage: project.stage || 'planning',
          city: project.location?.split(',')[0]?.trim() || '',
          state: project.location?.match(/\b([A-Z]{2})\b/)?.[1] || '',
          address: project.location || '',
          units_count: parseInt(project.rooms) || null,
          raw_data: {
            href: project.href,
            scraped_at: new Date().toISOString()
          }
        }

        // Check if exists
        const { data: existing } = await supabase
          .from('high_priority_projects')
          .select('id')
          .eq('cw_project_id', project.cwProjectId)
          .single()

        if (existing) {
          // Update
          await supabase
            .from('high_priority_projects')
            .update(projectData)
            .eq('id', existing.id)
        } else {
          // Insert
          await supabase
            .from('high_priority_projects')
            .insert(projectData)
          this.projectsSaved++
        }
      } catch (error: any) {
        console.error(`   ❌ Error saving ${project.projectName}: ${error.message}`)
        this.errors++
      }
    }
  }

  async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      console.log('✅ Browser closed\n')
    }
  }
}

async function main() {
  const scraper = new BulkConstructionWireScraper()

  try {
    await scraper.init()
    await scraper.login()
    await scraper.navigateToHotels()
    await scraper.scrapeAllPages()
  } catch (error: any) {
    console.error(`\n❌ Scrape failed: ${error.message}`)
    process.exit(1)
  } finally {
    await scraper.close()
  }
}

main()

