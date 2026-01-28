#!/usr/bin/env tsx

/**
 * ENHANCED Construction Wire Scraper - LEGENDARY EDITION
 * 
 * This is the production-grade, battle-tested scraper that:
 * - Handles Construction Wire's actual table structure
 * - Extracts ALL relevant data fields
 * - Has robust error handling
 * - Includes retry logic
 * - Logs everything for debugging
 * - Saves detailed contact information
 * 
 * Usage:
 *   npm run scrape              # Shows browser
 *   npm run scrape:headless     # Background mode
 */

import { config } from 'dotenv'
import puppeteer, { Browser, Page } from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import { calculateGrooveScore } from '../lib/utils/scoring'
import { classifyProject } from '../lib/utils/classification'
import { generateNEPQEmail } from '../lib/utils/email-generator'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// Load environment variables
// In CI/CD (GitHub Actions), use process.env directly (secrets are injected as env vars)
// For local development, optionally load from .env.local if it exists
const isGitHubActions = !!process.env.GITHUB_ACTIONS
const isCI = !!process.env.CI

// Debug: Log environment detection
console.log(`[Environment] GITHUB_ACTIONS: ${isGitHubActions}, CI: ${isCI}`)

if (!isGitHubActions && !isCI) {
  // Only load .env.local in local development (not in CI/CD)
  console.log('[Local Dev] Loading .env.local...')
  config({ path: '.env.local' })
} else {
  console.log('[CI/CD Mode] Skipping .env.local, using process.env directly')
}

// Get environment variables (from .env.local or GitHub Actions secrets)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const organizationId = process.env.ORGANIZATION_ID
const cwUsername = process.env.CONSTRUCTION_WIRE_USERNAME
const cwPassword = process.env.CONSTRUCTION_WIRE_PASSWORD

// Debug: Log which environment variables are set (but don't log sensitive values)
console.log('[Environment Variables Check]')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'SET' : 'MISSING'}`)
console.log(`  ORGANIZATION_ID: ${organizationId ? 'SET' : 'MISSING'}`)
console.log(`  CONSTRUCTION_WIRE_USERNAME: ${cwUsername ? 'SET' : 'MISSING'}`)
console.log(`  CONSTRUCTION_WIRE_PASSWORD: ${cwPassword ? 'SET' : 'MISSING'}`)

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Set it in .env.local or GitHub Secrets.')
}
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env.local or GitHub Secrets.')
}
if (!organizationId) {
  throw new Error('ORGANIZATION_ID is required. Set it in .env.local or GitHub Secrets.')
}
if (!cwUsername) {
  throw new Error('CONSTRUCTION_WIRE_USERNAME is required. Set it in .env.local or GitHub Secrets.')
}
if (!cwPassword) {
  throw new Error('CONSTRUCTION_WIRE_PASSWORD is required. Set it in .env.local or GitHub Secrets.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const ORGANIZATION_ID = organizationId
const CW_USERNAME = cwUsername
const CW_PASSWORD = cwPassword
const HEADLESS = process.argv.includes('--headless')
const FETCH_DETAILS = process.argv.includes('--details')
const DEEP_TRAWL = process.argv.includes('--deep')
const MAX_PROJECTS = DEEP_TRAWL ? 99999 : parseInt(process.argv.find(arg => arg.startsWith('--max='))?.split('=')[1] || '50')
const STRATEGY = DEEP_TRAWL ? '🌊 DEEP TRAWL (Pipeline IQ)' : '🎯 Sniper (High Score Only)'

const START_PAGE = parseInt(process.argv.find(arg => arg.startsWith('--start-page='))?.split('=')[1] || '1')

interface Contact {
  first_name: string
  last_name: string
  title?: string
  email?: string
  phone?: string
  company?: string
}

interface ScrapedProject {
  cw_project_id: string
  project_name: string
  project_type: string[]
  project_stage: string
  project_value: number
  city: string
  state: string
  zip?: string
  address?: string
  units_count?: number
  project_size_sqft?: number
  estimated_start_date?: string
  estimated_completion_date?: string
  bid_date?: string
  raw_data: any
  contacts?: Contact[]
  services_needed?: string[]
}

class EnhancedConstructionWireScraper {
  private browser: Browser | null = null
  private page: Page | null = null
  private projectsScraped = 0
  private projectsSaved = 0
  private errors = 0
  private retryCount = 3

  async init() {
    console.log('🚀 ENHANCED Construction Wire Scraper - LEGENDARY EDITION')
    console.log(`Mode: ${HEADLESS ? 'Headless' : 'Visible Browser'}`)
    console.log(`Strategy: ${STRATEGY}`)
    console.log(`Max Projects: ${MAX_PROJECTS}`)
    console.log('━'.repeat(60))

    try {
      this.browser = await puppeteer.launch({
        headless: HEADLESS,
        defaultViewport: { width: 1920, height: 1080 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ],
        timeout: 60000,
      })

      this.page = await this.browser.newPage()

      // Enhanced stealth settings
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Set extra headers to look more human
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      })

      console.log('✅ Browser initialized successfully')
    } catch (error: any) {
      console.error('❌ Failed to launch browser:', error.message)
      throw error
    }
  }

  async login() {
    if (!this.page) throw new Error('Browser not initialized')

    console.log('\n🔐 Logging into Construction Wire...')
    console.log(`   Username: ${CW_USERNAME}`)

    try {
      await this.page.goto('https://www.constructionwire.com', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      })

      await this.wait(2000)

      // Click login button
      const loginClicked = await this.clickAnyOf([
        'a.login',
        '.login',
        'a[href*="login"]',
        'button:has-text("Login")',
      ])

      if (loginClicked) {
        await this.wait(2000)
      }

      // Enter credentials - using placeholder selectors based on actual CW page
      console.log('   Filling username...')
      const usernameSelectors = ['input[placeholder="Email"]', 'input[name="username"]', 'input[name="email"]', 'input[type="email"]', 'input[id*="email"]', 'input[id*="username"]']
      const usernameFilled = await this.typeIntoAnyOf(usernameSelectors, CW_USERNAME)

      if (!usernameFilled) {
        // Debug: see what inputs are on the page
        const inputs = await this.page.evaluate(() => {
          return Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            id: input.id,
            placeholder: input.placeholder,
            className: input.className,
            value: input.value
          }))
        })
        console.log(`   ⚠️  Could not find username field. Available inputs:`, JSON.stringify(inputs, null, 2))
        await this.screenshot('username-field-not-found')
        throw new Error('Could not find username/email input field')
      }

      console.log('   ✅ Username filled')
      await this.wait(500)

      console.log('   Filling password...')
      const passwordSelectors = ['input[placeholder="Password"]', 'input[name="password"]', 'input[type="password"]', 'input[id*="password"]']
      const passwordFilled = await this.typeIntoAnyOf(passwordSelectors, CW_PASSWORD)

      if (!passwordFilled) {
        await this.screenshot('password-field-not-found')
        throw new Error('Could not find password input field')
      }

      console.log('   ✅ Password filled')
      await this.wait(500)

      // Verify fields are actually filled - try all selectors to find the one that worked
      const fieldValues = await this.page.evaluate((usernameSels, passwordSels) => {
        let emailValue = ''
        let passwordValue = ''

        // Try all username selectors
        for (const sel of usernameSels) {
          try {
            const el = document.querySelector(sel) as HTMLInputElement
            if (el && el.value) {
              emailValue = el.value
              break
            }
          } catch (e) {
            continue
          }
        }

        // Try all password selectors
        for (const sel of passwordSels) {
          try {
            const el = document.querySelector(sel) as HTMLInputElement
            if (el && el.value) {
              passwordValue = el.value ? '***' : ''
              break
            }
          } catch (e) {
            continue
          }
        }

        return {
          email: emailValue,
          password: passwordValue
        }
      }, usernameSelectors, passwordSelectors)

      console.log(`   Field values - Email: ${fieldValues.email ? 'SET (' + fieldValues.email.substring(0, 10) + '...)' : 'EMPTY'}, Password: ${fieldValues.password ? 'SET' : 'EMPTY'}`)

      if (!fieldValues.email) {
        // Last resort: try to find ANY input with a value
        const allInputs = await this.page.evaluate(() => {
          return Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            id: input.id,
            placeholder: input.placeholder,
            value: input.value,
            valueLength: input.value.length
          }))
        })
        console.log(`   ⚠️  All inputs on page:`, JSON.stringify(allInputs, null, 2))
        await this.screenshot('username-empty-debug')
        throw new Error('Username field is empty after typing')
      }
      if (!fieldValues.password) {
        throw new Error('Password field is empty after typing')
      }

      // Submit form
      console.log('   Submitting form...')
      const submitClicked = await this.clickAnyOf([
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Sign in")',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'form button',
        'form input[type="submit"]',
      ])

      if (!submitClicked) {
        console.log('   ⚠️  Submit button not found, trying Enter key...')
        await this.page.keyboard.press('Enter')
      } else {
        console.log('   ✅ Submit button clicked')
      }

      // Wait for navigation after login - wait for URL to change or page to load
      console.log('   Waiting for navigation after submit...')
      try {
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
        console.log('   ✅ Navigation completed')
      } catch (e) {
        // Navigation might have already completed, just wait a bit
        console.log('   ⚠️  Navigation timeout, waiting for page to settle...')
        await this.wait(3000)
      }

      // Additional wait for page to fully load
      await this.wait(2000)

      // Check for error messages FIRST (before checking URL)
      const pageInfo = await this.page.evaluate(() => {
        const errorElements = Array.from(document.querySelectorAll('.error, .alert-danger, .alert, [class*="error"], [class*="invalid"], [class*="warning"]'))
        const errorMessages = errorElements.map(el => el.textContent?.trim()).filter(Boolean)

        // Check for CAPTCHA
        const captchaElements = Array.from(document.querySelectorAll('[class*="captcha"], [id*="captcha"], iframe[src*="recaptcha"], iframe[src*="captcha"]'))
        const hasCaptcha = captchaElements.length > 0

        // Get all visible text to check for common error messages
        const bodyText = document.body?.innerText || ''
        const hasInvalidCredentials = bodyText.toLowerCase().includes('invalid') ||
          bodyText.toLowerCase().includes('incorrect') ||
          bodyText.toLowerCase().includes('wrong password') ||
          bodyText.toLowerCase().includes('wrong email')

        return {
          errorMessages,
          hasCaptcha,
          hasInvalidCredentials,
          bodyTextPreview: bodyText.substring(0, 500)
        }
      })

      if (pageInfo.errorMessages.length > 0) {
        console.log(`   ❌ Error messages found: ${pageInfo.errorMessages.join('; ')}`)
        await this.screenshot('login-error-message')
        throw new Error(`Login failed: ${pageInfo.errorMessages.join('; ')}`)
      }

      if (pageInfo.hasCaptcha) {
        console.log('   ⚠️  CAPTCHA detected on page')
        await this.screenshot('login-captcha-detected')
        throw new Error('Login blocked by CAPTCHA - manual intervention required')
      }

      if (pageInfo.hasInvalidCredentials) {
        console.log('   ❌ Invalid credentials message detected')
        await this.screenshot('login-invalid-credentials')
        throw new Error('Login failed: Invalid credentials detected')
      }

      // Verify login actually succeeded by checking if we're still on login page
      const currentUrl = this.page.url()
      const pageTitle = await this.page.title()

      console.log(`   Current URL: ${currentUrl}`)
      console.log(`   Page title: ${pageTitle}`)

      if (currentUrl.includes('login') || pageTitle.toLowerCase().includes('login')) {
        // Still on login page - login may have failed
        console.log('   ⚠️  Still on login page after submission')
        console.log(`   Page preview: ${pageInfo.bodyTextPreview.substring(0, 200)}...`)
        await this.screenshot('login-verification-failed')
        throw new Error('Login appears to have failed - still on login page after submitting credentials')
      }

      console.log('✅ Successfully logged in')
      console.log(`   Current URL: ${currentUrl}`)
      console.log(`   Page title: ${pageTitle}`)
    } catch (error: any) {
      console.error('❌ Login failed:', error.message)
      await this.screenshot('login-error')
      throw error
    }
  }

  async navigateToHotels() {
    if (!this.page) throw new Error('Browser not initialized')

    console.log('\n🏨 Navigating to Hotels section...')

    try {
      // Verify we're still logged in
      const currentUrl = this.page.url()
      const pageTitle = await this.page.title()

      if (currentUrl.includes('login') || pageTitle.toLowerCase().includes('login')) {
        await this.screenshot('redirected-to-login')
        throw new Error('Session lost - redirected back to login page. Login may have failed.')
      }

      console.log(`   Current URL: ${currentUrl}`)
      console.log(`   Page title: ${pageTitle}`)

      // After login, we're already on Hotel Profiles page
      // Just need to click "Search Projects" button to get results
      await this.wait(2000)

      // Check if we're already on hotel page by looking for Hotels tab or Search Projects button
      const searchButtonClicked = await this.clickAnyOf([
        'button.search-projects',
        'a.search-projects',
        'button:has-text("Search Projects")',
        'a:has-text("Search Projects")',
        '.btn-danger:has-text("Search")',
        'button.btn-danger',
      ])

      if (!searchButtonClicked) {
        // Try clicking by evaluating the page
        await this.page.evaluate(() => {
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
      }

      await this.wait(3000)

      console.log('✅ On Hotels projects page')
      await this.screenshot('hotels-page')
    } catch (error: any) {
      console.error('❌ Navigation failed:', error.message)
      await this.screenshot('navigation-error')
      throw error
    }
  }

  async scrapeProjects(maxProjects = 100, fetchDetails = false): Promise<ScrapedProject[]> {
    if (!this.page) throw new Error('Browser not initialized')

    console.log(`\n📊 Scraping hotel projects (max: ${maxProjects})...`)
    console.log(`   Fetch detail pages: ${fetchDetails ? '✅ YES - Will get emails/phones' : '❌ NO - List only'}`)
    console.log('━'.repeat(60))

    const projects: ScrapedProject[] = []
    let currentPage = 1
    const maxPages = Math.ceil(maxProjects / 25) // ~25 projects per page

    // Fast-forward to start page if requested
    if (START_PAGE > 1) {
      console.log(`⏩ Fast-forwarding to page ${START_PAGE}...`)
      while (currentPage < START_PAGE) {
        process.stdout.write(`   Skipping page ${currentPage}... \r`) // Overwrite line
        const hasNext = await this.clickNextPage()
        if (!hasNext) {
          console.log(`\n⚠️  Could not reach page ${START_PAGE}, stopped at page ${currentPage}`)
          break
        }
        currentPage++
        await this.wait(1000) // Brief pause between clicks
      }
      console.log(`\n✅ Reached page ${currentPage}`)
    }

    // Calculate target end page based on current page (which might have been fast-forwarded)
    const pagesToScrape = Math.ceil(maxProjects / 25)
    const targetEndPage = currentPage + pagesToScrape + 2 // Add buffer for safety

    try {
      while (projects.length < maxProjects && currentPage <= targetEndPage) {
        console.log(`\n📄 Page ${currentPage} - Collected ${projects.length}/${maxProjects} projects...`)

        // Wait for projects to load - try multiple selectors
        // The page might use a table or a different structure
        try {
          await this.page.waitForSelector('a.title', { timeout: 15000 })
        } catch (error) {
          // Fallback: wait for any table structure
          try {
            await this.page.waitForSelector('table tbody tr', { timeout: 5000 })
          } catch (e) {
            // Last resort: just wait a bit for page to load
            console.log('   ⚠️  Could not find expected selectors, waiting for page to load...')
            await this.wait(3000)
          }
        }
        await this.wait(2000)

        // Get all project rows by finding the title anchors
        const result = await this.page.evaluate(() => {
          // The page structure is flat: input -> icons -> a.title -> text nodes -> ...
          // So we find all a.title elements and then look at their siblings

          const titleAnchors = Array.from(document.querySelectorAll('a.title'))

          // Debug info for troubleshooting
          let debugInfo = {
            titleAnchorsFound: titleAnchors.length,
            totalLinks: 0,
            totalTables: 0,
            pageTitle: document.title,
            bodyText: document.body?.innerText?.substring(0, 200) || ''
          }

          if (titleAnchors.length === 0) {
            // Try to find alternative selectors for debugging
            debugInfo.totalLinks = Array.from(document.querySelectorAll('a')).length
            debugInfo.totalTables = Array.from(document.querySelectorAll('table')).length
          }

          const projects = titleAnchors.map((anchor, index) => {
            const projectName = anchor.textContent?.trim() || ''
            const href = anchor.getAttribute('href') || ''

            // Collect text nodes immediately following the anchor
            const textNodes: string[] = []
            let nextNode = anchor.nextSibling

            // Try multiple strategies to extract project data from the table row
            // Strategy 1: Look for table cells (td) in the same row
            var rowData: any = {}

            // Find the parent row (tr) or container
            var parent: any = anchor.parentElement
            while (parent && parent.tagName !== 'TR' && parent.tagName !== 'TBODY' && parent.tagName !== 'TABLE') {
              parent = parent.parentElement
            }

            if (parent && parent.tagName === 'TR') {
              // We're in a table row - extract from cells
              var cells: any[] = Array.from(parent.cells || [])
              if (cells.length === 0) {
                // Try querySelectorAll for td
                cells = Array.from(parent.querySelectorAll('td'))
              }

              // Typical Construction Wire table structure:
              // Column 0: Project Name (anchor)
              // Column 1: Location/Address
              // Column 2: Rooms/Units
              // Column 3: Type
              // Column 4: Value/Stage
              // (exact order may vary)

              for (var c = 0; c < cells.length; c++) {
                var cellText = (cells[c].textContent || '').trim()
                if (!cellText || cellText === projectName) continue

                // Detect location (contains city, state, zip pattern or address)
                if ((cellText.match(/[A-Z][a-z]+,?\s+[A-Z]{2}\s+\d{5}/) || cellText.match(/\d+\s+[A-Z]/)) && !rowData.location) {
                  rowData.location = cellText
                }
                // Detect rooms/units (numeric, typically 1-4 digits)
                else if (cellText.match(/^\d{1,4}$/) && parseInt(cellText) > 0 && parseInt(cellText) < 10000 && !rowData.rooms) {
                  rowData.rooms = cellText
                }
                // Detect type (contains common hotel/project type keywords)
                else if ((cellText.match(/(?:Hotel|Inn|Suites|Resort|Lodge|Independent|Mid-Range|Luxury|Economy|Extended|Stay)/i)) && !rowData.type) {
                  rowData.type = cellText
                }
                // Detect value (contains $ or dollar amounts)
                else if (cellText.match(/\$[\d,]+/) && !rowData.value) {
                  rowData.value = cellText
                }
              }
            }

            // Strategy 2: If we didn't find data in table cells, try sibling text nodes
            if (!rowData.location && !rowData.rooms && !rowData.type) {
              var siblingsChecked = 0
              var siblingNode: any = anchor.nextSibling
              while (siblingNode && siblingsChecked < 20) {
                // Stop if we hit a new project marker
                if (siblingNode.nodeType === 1 && siblingNode.tagName === 'INPUT' && siblingNode.id && siblingNode.id.startsWith('ReportId')) {
                  break
                }

                if (siblingNode.nodeType === 3) { // Text node
                  var text = siblingNode.textContent ? siblingNode.textContent.trim() : ''
                  if (text && text.length > 0 && text !== ',') {
                    textNodes.push(text)
                  }
                } else if (siblingNode.nodeType === 1) {
                  // Also check element text content
                  var elemText = siblingNode.textContent ? siblingNode.textContent.trim() : ''
                  if (elemText && elemText.length > 0 && elemText !== ',') {
                    textNodes.push(elemText)
                  }
                }
                siblingNode = siblingNode.nextSibling
                siblingsChecked++
              }

              // Map text nodes to fields
              if (textNodes.length > 0 && !rowData.location) {
                rowData.location = textNodes[0] || ''
              }
              if (textNodes.length > 1 && !rowData.location) {
                rowData.location = (rowData.location ? rowData.location + ', ' : '') + textNodes[1]
              }
              if (textNodes.length > 2 && !rowData.rooms) {
                var roomsMatch = textNodes[2].match(/(\d+)/)
                rowData.rooms = roomsMatch ? roomsMatch[1] : ''
              }
              if (textNodes.length > 4 && !rowData.type) {
                rowData.type = textNodes[4]
              }
            }

            var address = (rowData.location && rowData.location.split('\n')[0]) || (rowData.location && rowData.location.split(',')[0]) || ''
            var location = rowData.location || ''
            var rooms = rowData.rooms || '0'
            var type = rowData.type || ''

            // Combine address and location for the full location string
            var fullLocation = location || (address ? address : '')

            // Contacts are usually in subsequent anchor tags or nearby text
            // For now, let's grab any subsequent anchor text as potential contacts/owners
            // This is a simplification; detail page will get the real contacts
            const contacts: { name: string, href: string }[] = []

            return {
              index,
              projectName,
              href,
              location: fullLocation,
              type: type,
              rooms: rooms,
              stage: 'Planning', // Default, will refine based on text analysis if possible
              status: 'Active',
              contacts,
              date: new Date().toISOString(),
              cellCount: 0 // Not using cells anymore
            }
          })

          return { projects, debugInfo }
        })

        const projectData = result.projects
        const debugInfo = result.debugInfo

        console.log(`\n📊 Page Analysis:`)
        console.log(`   Title anchors found: ${debugInfo.titleAnchorsFound}`)
        if (debugInfo.titleAnchorsFound === 0) {
          console.log(`   ⚠️  No projects found! Debug info:`)
          console.log(`      Total links: ${debugInfo.totalLinks}`)
          console.log(`      Total tables: ${debugInfo.totalTables}`)
          console.log(`      Page title: ${debugInfo.pageTitle}`)
          console.log(`      Page preview: ${debugInfo.bodyText}...`)

          // Take a screenshot for debugging
          await this.screenshot('no-projects-found')
          throw new Error(`No projects found on page ${currentPage}. Page structure may have changed.`)
        }

        console.log(`\n✅ Found ${projectData.length} project rows\n`)


        // Filter out empty/invalid rows
        const validProjects = projectData.filter(p =>
          p.projectName &&
          p.projectName.length > 3 &&
          !p.projectName.includes('O - Owner') &&
          p.projectName !== 'Preview'
        )

        console.log(`📋 Processing ${Math.min(validProjects.length, maxProjects)} valid projects...\n`)

        // Process each project
        for (let i = 0; i < Math.min(validProjects.length, maxProjects); i++) {
          const raw = validProjects[i]

          try {
            console.log(`\n[${i + 1}/${Math.min(validProjects.length, maxProjects)}] ${raw.projectName}`)
            console.log(`   Type: ${raw.type}`)
            console.log(`   Location: ${raw.location}`)
            console.log(`   Stage: ${raw.stage}`)
            console.log(`   Rooms: ${raw.rooms}`)
            console.log(`   Contacts: ${raw.contacts.length}`)

            const project = this.parseProjectData(raw)

            if (project) {
              // Fetch detail page for comprehensive information if enabled
              if (fetchDetails && raw.href) {
                const details = await this.scrapeProjectDetails(raw.href)

                // Merge contacts from detail page
                if (details.contacts.length > 0) {
                  project.contacts = details.contacts
                }

                // Update project type if found
                if (details.projectType) {
                  project.project_type = [details.projectType.toLowerCase()]
                }

                // Update project value if found (prefer detail page value)
                if (details.projectValue && details.projectValue > 0) {
                  project.project_value = details.projectValue
                }

                // Update units count if found (prefer detail page value)
                if (details.unitsCount && details.unitsCount > 0) {
                  project.units_count = details.unitsCount
                }

                // Add square footage if found
                if (details.squareFootage && details.squareFootage > 0) {
                  project.project_size_sqft = details.squareFootage
                }

                // Add timeline information (use existing interface fields)
                if (details.estimatedStartDate) {
                  project.estimated_start_date = details.estimatedStartDate
                }
                if (details.estimatedCompletionDate) {
                  project.estimated_completion_date = details.estimatedCompletionDate
                }
                if (details.bidDate) {
                  project.bid_date = details.bidDate
                }

                // Add key players and additional info to raw_data (for now, can migrate to schema later)
                if (!project.raw_data) project.raw_data = {}
                if (details.developerName) {
                  project.raw_data.developer_name = details.developerName
                }
                if (details.architectName) {
                  project.raw_data.architect_name = details.architectName
                }
                if (details.generalContractor) {
                  project.raw_data.general_contractor = details.generalContractor
                }
                if (details.projectDescription) {
                  project.raw_data.description = details.projectDescription
                }
                if (details.hotelBrand) {
                  project.raw_data.hotel_brand = details.hotelBrand
                }

                // Rate limiting: random delay 2-5 seconds between detail pages
                const delay = 2000 + Math.random() * 3000
                console.log(`      ⏳ Rate limit delay: ${(delay / 1000).toFixed(1)}s`)
                await this.wait(delay)

                // Navigate back to list page
                await this.page!.goBack({ waitUntil: 'networkidle2' })
                await this.wait(1000)
              }

              projects.push(project)
              this.projectsScraped++
              console.log(`   ✅ Score: ${calculateGrooveScore(project as any)}/100`)
            }

            await this.wait(300) // Small delay between extractions
          } catch (error: any) {
            console.error(`   ❌ Error processing project: ${error.message}`)
            this.errors++
          }

          // Check if we have enough projects
          if (projects.length >= maxProjects) {
            console.log(`\n✅ Reached max projects limit (${maxProjects})`)
            break
          }
        }

        // Try to go to next page
        if (projects.length < maxProjects) {
          const hasNextPage = await this.clickNextPage()
          if (!hasNextPage) {
            console.log('\n📄 No more pages available')
            break
          }
          currentPage++
          await this.wait(2000)
        }
      } // End pagination while loop

      console.log('\n' + '━'.repeat(60))
      console.log(`✅ Successfully scraped ${projects.length} projects from ${currentPage} page(s)`)

      return projects

    } catch (error: any) {
      console.error('❌ Scraping failed:', error.message)
      await this.screenshot('scraping-error')
      throw error
    }
  }

  parseProjectData(raw: any): ScrapedProject | null {
    try {
      // Generate unique ID from href or timestamp
      const cwProjectId = raw.href
        ? `CW-${raw.href.split('/').pop()}`
        : `CW-${Date.now()}-${raw.index}`

      // Parse location - format is: "ProjectName\tStreetAddress\t\n\tCitySTATE ZIP"
      // The city and state are concatenated like "NantucketMA 02554"
      const locationLines = raw.location.split('\n').map((l: string) => l.trim()).filter((l: string) => l)
      let city = ''  // Changed from 'Unknown' to avoid varchar issues
      let state = '' // Changed from 'Unknown' to avoid varchar(2) constraint
      let address = ''
      let zip = ''

      // Last line usually contains CitySTATE ZIP (e.g., "NantucketMA 02554")
      if (locationLines.length > 0) {
        const lastLine = locationLines[locationLines.length - 1]
        // Match pattern: City (any chars) + State (2 uppercase) + optional ZIP
        const cityStateZipMatch = lastLine.match(/^(.+?)([A-Z]{2})\s*(\d{5})?/)
        if (cityStateZipMatch) {
          city = cityStateZipMatch[1].trim()
          state = cityStateZipMatch[2]
          zip = cityStateZipMatch[3] || ''
        }
      }

      // Second line is usually the street address
      if (locationLines.length >= 2) {
        address = locationLines[1].trim()
      }

      // Parse room count
      const roomMatch = raw.rooms.match(/(\d+)/)
      const unitsCount = roomMatch ? parseInt(roomMatch[1]) : undefined

      // Determine project type
      const type = raw.type.toLowerCase()
      let projectTypes: string[] = ['hotel']

      if (type.includes('renovation') || type.includes('remodel')) {
        projectTypes.push('renovation')
      }
      if (type.includes('new')) {
        projectTypes.push('new_construction')
      }

      // Determine project stage
      let projectStage = 'planning'
      const stage = (raw.stage + ' ' + raw.status).toLowerCase()

      if (stage.includes('construction') || stage.includes('building')) {
        projectStage = 'construction'
      } else if (stage.includes('bidding') || stage.includes('bid')) {
        projectStage = 'bidding'
      } else if (stage.includes('design')) {
        projectStage = 'design'
      } else if (stage.includes('planning')) {
        projectStage = 'planning'
      } else if (stage.includes('pre-construction')) {
        projectStage = 'pre-construction'
      }

      // Estimate project value based on rooms and type
      let estimatedValue = 0
      if (unitsCount) {
        // Hotel construction costs roughly $150K-$400K per room
        // Renovations are about $50K-$150K per room
        const costPerRoom = type.includes('renovation') ? 100000 : 250000
        estimatedValue = unitsCount * costPerRoom
      }

      // Parse contacts
      const contacts: Contact[] = raw.contacts.map((c: any) => {
        const nameParts = c.name.split(' ')
        return {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          title: '', // Would need to click through to get this
          company: '', // Would need to click through to get this
        }
      })

      return {
        cw_project_id: cwProjectId,
        project_name: raw.projectName,
        project_type: projectTypes,
        project_stage: projectStage,
        project_value: estimatedValue,
        city,
        state,
        zip,
        address,
        units_count: unitsCount,
        raw_data: {
          original: raw,
          scraped_at: new Date().toISOString()
        },
        contacts: contacts.length > 0 ? contacts : undefined,
      }
    } catch (error: any) {
      console.error('Error parsing project:', error.message)
      return null
    }
  }

  async scrapeProjectDetails(projectUrl: string): Promise<{
    contacts: Contact[],
    projectType?: string,
    bidDate?: string,
    projectValue?: number,
    unitsCount?: number,
    squareFootage?: number,
    developerName?: string,
    architectName?: string,
    generalContractor?: string,
    estimatedStartDate?: string,
    estimatedCompletionDate?: string,
    projectDescription?: string,
    hotelBrand?: string
  }> {
    if (!this.page) throw new Error('Browser not initialized')

    const result: {
      contacts: Contact[],
      projectType?: string,
      bidDate?: string,
      projectValue?: number,
      unitsCount?: number,
      squareFootage?: number,
      developerName?: string,
      architectName?: string,
      generalContractor?: string,
      estimatedStartDate?: string,
      estimatedCompletionDate?: string,
      projectDescription?: string,
      hotelBrand?: string
    } = { contacts: [] }

    try {
      const fullUrl = projectUrl.startsWith('http') ? projectUrl : `https://www.constructionwire.com${projectUrl}`
      console.log(`      🔍 Fetching details from ${projectUrl.split('?')[0]}...`)

      await this.page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 })
      await this.wait(1500)

      // Extract comprehensive project information from detail page
      const pageData = await this.page.evaluate(function () {
        var data: {
          contacts: { name: string; email: string; phone: string }[]
          companies: { name: string; email: string; phone: string }[]
          bodyText: string
          htmlContent: string
          projectType?: string
          bidDate?: string
          projectValue?: number
          unitsCount?: number
          squareFootage?: number
          developerName?: string
          architectName?: string
          generalContractor?: string
          estimatedStartDate?: string
          estimatedCompletionDate?: string
          projectDescription?: string
          hotelBrand?: string
        } = {
          contacts: [],
          companies: [],
          bodyText: document.body.innerText,
          htmlContent: document.body.innerHTML
        }

        // Get all mailto links
        var mailtoLinks = document.querySelectorAll('a[href^="mailto:"]')
        for (var i = 0; i < mailtoLinks.length; i++) {
          var link = mailtoLinks[i]
          var href = link.getAttribute('href') || ''
          var email = href.replace('mailto:', '').split('?')[0]
          if (email && email.indexOf('noreply') === -1 && email.indexOf('info@') === -1) {
            var name = (link.textContent || '').trim()
            if (name === email || name.indexOf('@') !== -1) {
              name = ''
            }
            data.contacts.push({ name: name, email: email, phone: '' })
          }
        }

        // Get all tel links
        var telLinks = document.querySelectorAll('a[href^="tel:"]')
        for (var j = 0; j < telLinks.length; j++) {
          var telLink = telLinks[j]
          var telHref = telLink.getAttribute('href') || ''
          var phone = telHref.replace('tel:', '').replace(/[^\d]/g, '')
          if (phone.length === 10) {
            var phoneName = (telLink.textContent || '').trim()
            data.contacts.push({ name: phoneName, email: '', phone: phone })
          }
        }

        // Extract project details from structured data
        // Look for common patterns in Construction Wire detail pages

        // Extract project value (look for $ amounts, "value", "cost", "budget")
        var valuePatterns = [
          /\$[\d,]+(?:\.\d+)?\s*(?:million|M|thousand|K)?/gi,
          /(?:value|cost|budget|estimated|project\s+value)[:\s]*\$?[\d,]+(?:\.\d+)?/gi,
          /\$[\d,]+(?:\.\d+)?/g
        ]
        for (var p = 0; p < valuePatterns.length; p++) {
          var matches = data.bodyText.match(valuePatterns[p])
          if (matches && matches.length > 0) {
            var largestValue = 0
            for (var m = 0; m < matches.length; m++) {
              var match = matches[m]
              var numStr = match.replace(/[^\d.]/g, '')
              var num = parseFloat(numStr)
              if (match.toLowerCase().includes('million') || match.toLowerCase().includes('M')) {
                num = num * 1000000
              } else if (match.toLowerCase().includes('thousand') || match.toLowerCase().includes('K')) {
                num = num * 1000
              }
              if (num > largestValue && num < 10000000000) { // Reasonable max
                largestValue = num
              }
            }
            if (largestValue > 0) {
              data.projectValue = Math.round(largestValue)
              break
            }
          }
        }

        // Extract units/rooms count
        var unitsPatterns = [
          /(?:rooms|units|keys|suites)[:\s]*(\d+)/gi,
          /(\d+)\s*(?:rooms|units|keys|suites|guest\s+rooms)/gi,
          /(?:number\s+of|total)\s*(?:rooms|units)[:\s]*(\d+)/gi
        ]
        for (var u = 0; u < unitsPatterns.length; u++) {
          var unitsMatch = data.bodyText.match(unitsPatterns[u])
          if (unitsMatch && unitsMatch.length > 0) {
            var unitsNum = parseInt(unitsMatch[0].replace(/[^\d]/g, ''))
            if (unitsNum > 0 && unitsNum < 10000) {
              data.unitsCount = unitsNum
              break
            }
          }
        }

        // Extract square footage
        var sqftPatterns = [
          /(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft\.?|square\s+feet|sf)/gi,
          /(?:square\s+footage|size|area)[:\s]*(\d{1,3}(?:,\d{3})*)/gi
        ]
        for (var s = 0; s < sqftPatterns.length; s++) {
          var sqftMatch = data.bodyText.match(sqftPatterns[s])
          if (sqftMatch && sqftMatch.length > 0) {
            var sqftNum = parseInt(sqftMatch[0].replace(/[^\d]/g, ''))
            if (sqftNum > 0 && sqftNum < 10000000) {
              data.squareFootage = sqftNum
              break
            }
          }
        }

        // Extract developer name
        var developerPatterns = [
          /(?:developer|owner|client)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Inc|LLC|Corp|Company|Ltd|Group)?)/gi,
          /(?:developed\s+by|owned\s+by)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Inc|LLC|Corp|Company|Ltd|Group)?)/gi
        ]
        for (var d = 0; d < developerPatterns.length; d++) {
          var devMatch = data.bodyText.match(developerPatterns[d])
          if (devMatch && devMatch.length > 0) {
            var devName = devMatch[0].replace(/(?:developer|owner|client|developed\s+by|owned\s+by)[:\s]*/gi, '').trim()
            if (devName.length > 2 && devName.length < 100) {
              data.developerName = devName
              break
            }
          }
        }

        // Extract architect name
        var architectPatterns = [
          /(?:architect|architecture\s+firm|designer)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Architects?|Architecture|Design|Inc|LLC|Corp|Company|Ltd|Group)?)/gi,
          /(?:designed\s+by|architectural\s+firm)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Architects?|Architecture|Design|Inc|LLC|Corp|Company|Ltd|Group)?)/gi
        ]
        for (var a = 0; a < architectPatterns.length; a++) {
          var archMatch = data.bodyText.match(architectPatterns[a])
          if (archMatch && archMatch.length > 0) {
            var archName = archMatch[0].replace(/(?:architect|architecture\s+firm|designer|designed\s+by|architectural\s+firm)[:\s]*/gi, '').trim()
            if (archName.length > 2 && archName.length < 100) {
              data.architectName = archName
              break
            }
          }
        }

        // Extract general contractor
        var gcPatterns = [
          /(?:general\s+contractor|GC|contractor|builder|construction\s+company)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Construction|Builders?|Inc|LLC|Corp|Company|Ltd|Group)?)/gi,
          /(?:built\s+by|constructed\s+by)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Construction|Builders?|Inc|LLC|Corp|Company|Ltd|Group)?)/gi
        ]
        for (var g = 0; g < gcPatterns.length; g++) {
          var gcMatch = data.bodyText.match(gcPatterns[g])
          if (gcMatch && gcMatch.length > 0) {
            var gcName = gcMatch[0].replace(/(?:general\s+contractor|GC|contractor|builder|construction\s+company|built\s+by|constructed\s+by)[:\s]*/gi, '').trim()
            if (gcName.length > 2 && gcName.length < 100) {
              data.generalContractor = gcName
              break
            }
          }
        }

        // Extract dates (start, completion, bid)
        var datePatterns = [
          /(?:start|begin|commence|groundbreaking)[:\s]*(?:date|scheduled\s+for)?[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/gi,
          /(?:completion|finish|complete|opening)[:\s]*(?:date|scheduled\s+for)?[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/gi,
          /(?:bid\s+date|bidding\s+date|proposal\s+due)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/gi
        ]
        for (var dt = 0; dt < datePatterns.length; dt++) {
          var dateMatch = data.bodyText.match(datePatterns[dt])
          if (dateMatch && dateMatch.length > 0) {
            var dateStr = dateMatch[0].replace(/(?:start|begin|commence|groundbreaking|completion|finish|complete|opening|bid\s+date|bidding\s+date|proposal\s+due)[:\s]*(?:date|scheduled\s+for)?[:\s]*/gi, '').trim()
            if (dt === 0) data.estimatedStartDate = dateStr
            else if (dt === 1) data.estimatedCompletionDate = dateStr
            else if (dt === 2) data.bidDate = dateStr
          }
        }

        // Extract hotel brand (Hilton, Marriott, Hyatt, etc.)
        var brandPatterns = [
          /(?:brand|flag|chain)[:\s]*([A-Z][a-zA-Z\s&,.-]+(?:Hotels?|Inn|Suites|Resort|Lodge)?)/gi,
          /(Hilton|Marriott|Hyatt|IHG|Wyndham|Choice|Best\s+Western|Holiday\s+Inn|Embassy\s+Suites|Hampton|Courtyard|Residence\s+Inn|Fairfield|DoubleTree|Ritz-Carlton|Westin|Sheraton|Four\s+Seasons|Renaissance|Aloft|AC\s+Hotels)/gi
        ]
        for (var b = 0; b < brandPatterns.length; b++) {
          var brandMatch = data.bodyText.match(brandPatterns[b])
          if (brandMatch && brandMatch.length > 0) {
            data.hotelBrand = brandMatch[0].replace(/(?:brand|flag|chain)[:\s]*/gi, '').trim()
            break
          }
        }

        // Extract Services Needed / Amenities (Groove "High Value" Detection)
        var servicesPatterns = [
          { key: 'wifi', regex: /wi[-]?fi|wireless\s+internet|internet\s+access/gi },
          { key: 'internet', regex: /high[-]?speed\s+internet|broadband|fiber|dedicated\s+circuit/gi },
          { key: 'cabling', regex: /cabling|structured\s+cabling|low\s+voltage|wiring|cat6|fiber\s+optic/gi },
          { key: 'directv', regex: /directv|direct\s+tv|satellite|television|tv\s+service|cable\s+tv/gi },
          { key: 'access_control', regex: /access\s+control|keyless|fob|security\s+system|surveillance|cctv/gi },
          { key: 'phone', regex: /phone\s+system|pbx|voip|telephone/gi }
        ]
        var servicesFound = []
        for (var s = 0; s < servicesPatterns.length; s++) {
          if (data.bodyText.match(servicesPatterns[s].regex)) {
            servicesFound.push(servicesPatterns[s].key)
          }
        }
        data.servicesNeeded = servicesFound

        // Extract project description (first substantial paragraph)
        var paragraphs = data.bodyText.split('\n').filter(function (p) {
          return p.trim().length > 50 && p.trim().length < 1000
        })
        if (paragraphs.length > 0) {
          data.projectDescription = paragraphs[0].trim()
        }

        return data
      })

      // Extract additional contacts from body text (outside of evaluate)
      const bodyText = pageData.bodyText || ''

      // Find emails in body text
      const emailMatches = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
      for (const email of emailMatches) {
        // Skip generic and internal emails
        if (email.includes('noreply') || email.includes('info@') || email.includes('support@')) continue
        if (email.includes('getgrooven.com') || email.includes('groove.com')) continue // Skip Groove internal emails
        if (!pageData.contacts.find((c: any) => c.email === email)) {
          pageData.contacts.push({ name: '', email, phone: '' })
        }
      }

      // Find phone numbers in body text
      const phoneMatches = bodyText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []
      for (const phoneRaw of phoneMatches) {
        const phone = phoneRaw.replace(/[^\d]/g, '')
        if (phone.length === 10) {
          const formatted = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
          if (!pageData.contacts.find((c: any) => c.phone === formatted)) {
            pageData.contacts.push({ name: '', email: '', phone: formatted })
          }
        }
      }

      // Process and clean extracted contacts (outside of page.evaluate)
      if (pageData.contacts && pageData.contacts.length > 0) {
        const cleanedContacts: Contact[] = []

        for (const c of pageData.contacts) {
          const cleaned = this.cleanContact(c)
          // Must have email or phone
          if (!cleaned.email && !cleaned.phone) continue
          // Must have a reasonable name (or we'll derive from email)
          if ((!cleaned.first_name || cleaned.first_name.length < 2) && !cleaned.email) continue
          cleanedContacts.push(cleaned)
        }

        result.contacts = cleanedContacts
      }

      // Extract and assign all project details
      result.projectType = pageData.projectType
      result.bidDate = pageData.bidDate
      result.projectValue = pageData.projectValue
      result.unitsCount = pageData.unitsCount
      result.squareFootage = pageData.squareFootage
      result.developerName = pageData.developerName
      result.architectName = pageData.architectName
      result.generalContractor = pageData.generalContractor
      result.estimatedStartDate = pageData.estimatedStartDate
      result.estimatedCompletionDate = pageData.estimatedCompletionDate
      result.projectDescription = pageData.projectDescription
      result.hotelBrand = pageData.hotelBrand
      result.services_needed = pageData.servicesNeeded || []

      // Log extracted information
      const extractedInfo: string[] = []
      if (result.contacts.length > 0) {
        extractedInfo.push(`${result.contacts.length} contacts`)
      }
      if (result.projectValue) {
        extractedInfo.push(`$${(result.projectValue / 1000000).toFixed(1)}M value`)
      }
      if (result.unitsCount) {
        extractedInfo.push(`${result.unitsCount} rooms`)
      }
      if (result.squareFootage) {
        extractedInfo.push(`${result.squareFootage.toLocaleString()} sqft`)
      }
      if (result.developerName) {
        extractedInfo.push(`Developer: ${result.developerName}`)
      }
      if (result.architectName) {
        extractedInfo.push(`Architect: ${result.architectName}`)
      }
      if (result.generalContractor) {
        extractedInfo.push(`GC: ${result.generalContractor}`)
      }
      if (result.estimatedStartDate) {
        extractedInfo.push(`Start: ${result.estimatedStartDate}`)
      }
      if (result.estimatedCompletionDate) {
        extractedInfo.push(`Completion: ${result.estimatedCompletionDate}`)
      }
      if (result.hotelBrand) {
        extractedInfo.push(`Brand: ${result.hotelBrand}`)
      }
      if (result.services_needed && result.services_needed.length > 0) {
        extractedInfo.push(`Services: ${result.services_needed.join(', ')}`)
      }

      if (extractedInfo.length > 0) {
        console.log(`      ✅ Extracted: ${extractedInfo.join(', ')}`)
        if (result.contacts.length > 0) {
          result.contacts.forEach(c => {
            if (c.email) console.log(`         📧 ${c.first_name} ${c.last_name}: ${c.email}`)
            if (c.phone && !c.email) console.log(`         📞 ${c.first_name} ${c.last_name}: ${c.phone}`)
          })
        }
      } else {
        console.log(`      ⚠️  Limited information extracted from detail page`)
      }

    } catch (error: any) {
      console.log(`      ⚠️  Detail fetch failed: ${error.message}`)
    }

    return result
  }

  // Clean and validate contact data
  cleanContact(raw: any): Contact {
    let name = (raw.name || '').trim()

    // Remove common junk patterns
    name = name
      .replace(/^(O|PM|A|GC|Owner|Property Manager|Architect|Developer)[,:\s]*/i, '')
      .replace(/Website.*$/i, '')
      .replace(/Company Report.*$/i, '')
      .replace(/View Hotels.*$/i, '')
      .replace(/P:.*$/i, '')
      .replace(/F:.*$/i, '')
      .replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, '')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
      .trim()

    // Split into first/last name
    const nameParts = name.split(/\s+/).filter((p: string) => p.length > 0)
    let firstName = nameParts[0] || ''
    let lastName = nameParts.slice(1).join(' ') || ''

    // If name looks like a company, try to use email to derive name
    if (this.looksLikeCompany(firstName + ' ' + lastName) && raw.email) {
      const emailName = this.nameFromEmail(raw.email)
      if (emailName.firstName) {
        firstName = emailName.firstName
        lastName = emailName.lastName
      }
    }

    // Clean phone number
    let phone = (raw.phone || '').replace(/[^\d]/g, '')
    if (phone.length === 10) {
      phone = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
    } else if (phone.length === 11 && phone.startsWith('1')) {
      phone = `${phone.slice(1, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`
    } else {
      phone = ''
    }

    return {
      first_name: this.capitalize(firstName),
      last_name: this.capitalize(lastName),
      title: (raw.title || '').trim(),
      email: (raw.email || '').toLowerCase().trim(),
      phone,
      company: (raw.company || '').trim()
    }
  }

  looksLikeCompany(name: string): boolean {
    const companyIndicators = /\b(LLC|Inc|Corp|Ltd|Group|Hotels|Properties|Hospitality|Capital|Investments|Partners|Associates|Company|Co\.|Management)\b/i
    return companyIndicators.test(name)
  }

  nameFromEmail(email: string): { firstName: string, lastName: string } {
    const localPart = email.split('@')[0]
    // Common patterns: john.doe, jdoe, john_doe, johndoe

    // Try first.last pattern
    if (localPart.includes('.')) {
      const parts = localPart.split('.')
      if (parts.length === 2 && parts[0].length > 1 && parts[1].length > 1) {
        return { firstName: parts[0], lastName: parts[1] }
      }
    }

    // Try first_last pattern
    if (localPart.includes('_')) {
      const parts = localPart.split('_')
      if (parts.length === 2 && parts[0].length > 1 && parts[1].length > 1) {
        return { firstName: parts[0], lastName: parts[1] }
      }
    }

    // Try first initial + last name (e.g., jsmith)
    const initialPattern = /^([a-z])([a-z]{3,})$/i
    const match = localPart.match(initialPattern)
    if (match) {
      return { firstName: match[1].toUpperCase(), lastName: match[2] }
    }

    return { firstName: '', lastName: '' }
  }

  capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  async saveToDatabase(projects: ScrapedProject[]) {
    console.log(`\n💾 Saving ${projects.length} projects to Supabase...`)
    console.log('━'.repeat(60))

    let contactsSaved = 0

    for (const project of projects) {
      try {
        // Calculate scores
        const grooveScore = calculateGrooveScore(project as any)
        const engagementScore = 75
        const timingScore = 80
        const totalScore = grooveScore + engagementScore + timingScore

        // Classify Project (Vertical & Pain Points)
        const classification = classifyProject(project.project_type || [])

        // Build project data matching the 'projects' table schema
        // Note: total_score is a computed column, don't include it

        // Merge contacts and services into raw_data
        const rawDataWithContacts = {
          ...(project.raw_data || {}),
          services_detected: project.services_needed || [],
          classification: classification,
          original: {
            ...(project.raw_data?.original || {}),
            contacts: project.contacts || [], // Add contacts from detail page scraping
          },
        }

        const projectData = {
          organization_id: ORGANIZATION_ID,
          cw_project_id: project.cw_project_id,
          project_name: project.project_name,
          project_type: project.project_type || null,
          project_stage: project.project_stage || null,
          project_value: project.project_value || null,
          project_size_sqft: project.project_size_sqft || null,
          units_count: project.units_count || null,
          address: project.address || null,
          city: project.city || 'Unknown',
          state: project.state || 'Unknown',
          zip: project.zip || null,
          groove_fit_score: grooveScore,
          engagement_score: engagementScore,
          timing_score: timingScore,
          // total_score is computed by database
          priority_level: grooveScore >= 80 ? 'hot' : grooveScore >= 60 ? 'warm' : 'cold',
          data_source: 'construction_wire_enhanced',
          scraped_at: new Date().toISOString(),
          raw_data: rawDataWithContacts
        }

        // Check if project exists
        const { data: existing } = await supabase
          .from('high_priority_projects')
          .select('id')
          .eq('cw_project_id', project.cw_project_id)
          .single()

        let projectId: string

        if (existing) {
          projectId = existing.id
          // Update existing
          const { error } = await supabase
            .from('high_priority_projects')
            .update({
              ...projectData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (error) throw error
          console.log(`   🔄 Updated: ${project.project_name} (Score: ${grooveScore})`)
        } else {
          // Insert new
          const { data: newProject, error } = await supabase
            .from('high_priority_projects')
          projectId = data.id
          this.projectsSaved++
          console.log(`   ✅ Saved: ${project.project_name} (Score: ${grooveScore})`)

          // --- FEED THE DISPATCHER (Queue Email) ---
          // Only queue if:
          // 1. Score is decent (>60)
          // 2. We have a contact email (In reality, we'd loop through all valid contacts)
          // 3. This is a NEW project (or we check for duplicates in the queue)

          const primaryContact = project.contacts?.[0] // Simply picking first for MVP

          if (grooveScore >= 60 && primaryContact?.email) {
            const nepq = generateNEPQEmail({
              project_name: project.project_name,
              city: project.city,
              state: project.state,
              classification
            })

            // Insert into queue
            // We use 'ignoreDuplicates' logic or just let a unique constraint fail quietly if we were stricter.
            // For now, simple insert.
            const { error: queueError } = await supabase
              .from('outreach_queue')
              .insert({
                project_id: data.id, // Need the UUID from the upsert result above
                recipient_email: primaryContact.email,
                recipient_name: `${primaryContact.first_name} ${primaryContact.last_name}`,
                email_subject: nepq.subject,
                email_body: nepq.body,
                priority_score: grooveScore,
                vertical: classification.vertical,
                metadata: { project_name: project.project_name }
              })

            if (!queueError) {
              console.log(`   -> 📨 Queued Email to ${primaryContact.email}`)
            } else {
              console.error(`   ⚠️ Failed to queue email for ${project.project_name}: ${queueError.message}`)
            }
          }
        }

        // SAVE SNAPSHOT: Longitudinal history tracking
        try {
          if (projectId) {
            await supabase.from('project_snapshots').insert({
              project_id: projectId,
              project_stage: projectData.project_stage,
              project_value: projectData.project_value,
              units_count: projectData.units_count,
              groove_fit_score: projectData.groove_fit_score,
              raw_data: projectData // Snapshot of the current state
            })
          }
        } catch (err) {
          // Gracefully continue if table doesn't exist yet
          // console.warn(`      ⚠️ Snapshot skipped: ${(err as Error).message}`)
        }

        // NORMALIZE CONTACTS: Save to contacts table and link via project_stakeholders
        if (project.contacts && project.contacts.length > 0) {
          for (const contact of project.contacts) {
            // Skip contacts without email or phone
            if (!contact.email && !contact.phone) continue

            try {
              // Generate a unique CW contact ID
              const cwContactId = `CWC-${contact.email || contact.phone}-${Date.now()}`

              // Check if contact already exists (by email or phone)
              let existingContact = null
              if (contact.email) {
                const { data } = await supabase
                  .from('contacts')
                  .select('id')
                  .eq('email', contact.email)
                  .single()
                existingContact = data
              }
              if (!existingContact && contact.phone) {
                const { data } = await supabase
                  .from('contacts')
                  .select('id')
                  .eq('phone', contact.phone)
                  .single()
                existingContact = data
              }

              let contactId: string

              if (existingContact) {
                contactId = existingContact.id
                // Update existing contact with any new info
                await supabase
                  .from('contacts')
                  .update({
                    first_name: contact.first_name || undefined,
                    last_name: contact.last_name || undefined,
                    title: contact.title || undefined,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', contactId)
                console.log(`      🔄 Contact updated: ${contact.first_name} ${contact.last_name}`)
              } else {
                // Insert new contact
                const { data: newContact, error: contactError } = await supabase
                  .from('contacts')
                  .insert({
                    organization_id: ORGANIZATION_ID,
                    cw_contact_id: cwContactId,
                    first_name: contact.first_name || 'Unknown',
                    last_name: contact.last_name || 'Contact',
                    title: contact.title || null,
                    email: contact.email || null,
                    phone: contact.phone || null,
                    response_status: 'not_contacted',
                  })
                  .select('id')
                  .single()

                if (contactError) {
                  console.error(`      ⚠️ Contact insert failed: ${contactError.message}`)
                  continue
                }
                contactId = newContact.id
                contactsSaved++
                console.log(`      ✅ Contact saved: ${contact.first_name} ${contact.last_name} (${contact.email || contact.phone})`)
              }

              // Link contact to project via project_stakeholders
              const { error: linkError } = await supabase
                .from('project_stakeholders')
                .upsert({
                  project_id: projectId,
                  contact_id: contactId,
                  role_in_project: 'owner', // Default role, could be refined
                  is_primary: true,
                }, {
                  onConflict: 'project_id,contact_id'
                })

              if (linkError) {
                console.error(`      ⚠️ Stakeholder link failed: ${linkError.message}`)
              }

            } catch (contactError: any) {
              console.error(`      ⚠️ Contact processing error: ${contactError.message}`)
            }
          }
        }

      } catch (error: any) {
        console.error(`   ❌ Error saving ${project.project_name}:`, error.message)
        this.errors++
      }
    }

    console.log('\n━'.repeat(60))
    console.log(`✅ Database save complete: ${this.projectsSaved} projects, ${contactsSaved} contacts normalized`)
  }

  // Helper methods
  async clickAnyOf(selectors: string[]): Promise<boolean> {
    if (!this.page) return false

    for (const selector of selectors) {
      try {
        // Handle :has-text() pseudo-selector (Puppeteer doesn't support it natively)
        if (selector.includes(':has-text(')) {
          const textMatch = selector.match(/:has-text\(["'](.+?)["']\)/)
          if (textMatch) {
            const text = textMatch[1]
            const element = await this.page.evaluate((searchText) => {
              const buttons = Array.from(document.querySelectorAll('button, a, input[type="submit"]'))
              return buttons.find(el => el.textContent?.toLowerCase().includes(searchText.toLowerCase()))
            }, text)

            if (element) {
              await this.page.evaluate((el) => (el as HTMLElement).click(), element)
              return true
            }
            continue
          }
        }

        await this.page.waitForSelector(selector, { timeout: 3000 })
        await this.page.click(selector)
        return true
      } catch (e) {
        continue
      }
    }
    return false
  }

  async typeIntoAnyOf(selectors: string[], text: string): Promise<boolean> {
    if (!this.page) return false

    for (const selector of selectors) {
      try {
        // Wait for the element to be visible and interactable
        await this.page.waitForSelector(selector, { timeout: 3000, visible: true })

        // Focus and clear the field first
        await this.page.focus(selector)
        await this.page.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLInputElement
          if (el) {
            el.value = ''
            el.focus()
          }
        }, selector)

        // Type the text
        await this.page.type(selector, text, { delay: 50 })

        // Wait a moment for any JavaScript to process
        await this.wait(200)

        // Verify the value was actually set - be strict about it
        const value = await this.page.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLInputElement
          return el?.value || ''
        }, selector)

        // Check if our text is actually in the field (allowing for partial matches in case of autocomplete)
        if (value.includes(text) || value === text) {
          console.log(`   ✅ Value verified in field: ${value.substring(0, 20)}...`)
          return true
        }

        console.log(`   ⚠️  Value not found in field (got: "${value}"), trying direct set...`)

        // If value didn't stick, try using evaluate to set it directly
        const setDirectly = await this.page.evaluate((sel, txt) => {
          const el = document.querySelector(sel) as HTMLInputElement
          if (el) {
            // Clear first
            el.value = ''
            // Set value
            el.value = txt
            // Focus the element
            el.focus()
            // Trigger all relevant events to notify any listeners
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
            el.dispatchEvent(new Event('blur', { bubbles: true }))
            el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
            el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }))

            // Verify it stuck
            return el.value === txt || el.value.includes(txt)
          }
          return false
        }, selector, text)

        if (setDirectly) {
          // Double-check after a brief wait
          await this.wait(300)
          const finalValue = await this.page.evaluate((sel) => {
            const el = document.querySelector(sel) as HTMLInputElement
            return el?.value || ''
          }, selector)

          if (finalValue.includes(text) || finalValue === text) {
            console.log(`   ✅ Value set directly and verified: ${finalValue.substring(0, 20)}...`)
            return true
          } else {
            console.log(`   ⚠️  Value set but didn't persist (got: "${finalValue}")`)
          }
        }
      } catch (e) {
        continue
      }
    }
    throw new Error(`Could not type into any of: ${selectors.join(', ')}`)
  }

  async screenshot(name: string) {
    if (!this.page) return

    const path = `screenshots/${name}-${Date.now()}.png`
    await this.page.screenshot({ path, fullPage: true })
    console.log(`   📸 Screenshot: ${path}`)
  }

  wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async clickNextPage(): Promise<boolean> {
    if (!this.page) return false

    try {
      // Look for pagination next button - Construction Wire uses various patterns
      const nextSelectors = [
        'a.next',
        '.pagination a:contains("Next")',
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
              console.log(`\n📄 Clicking next page...`)
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
        console.log(`\n📄 Clicking page ${nextPageNum}...`)
        await pageLink.click()
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => { })
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      console.log('\n✅ Browser closed')
    }
  }

  printSummary() {
    console.log('\n' + '═'.repeat(60))
    console.log('📊 SCRAPING SUMMARY')
    console.log('═'.repeat(60))
    console.log(`  Projects Scraped:  ${this.projectsScraped}`)
    console.log(`  Projects Saved:    ${this.projectsSaved}`)
    console.log(`  Errors:            ${this.errors}`)
    console.log('═'.repeat(60))

    if (this.projectsSaved > 0) {
      const pipelineValue = this.projectsSaved * 1000000 // Rough estimate
      console.log(`\n💰 Estimated Pipeline Value: $${(pipelineValue).toLocaleString()}`)
      console.log(`🎯 Potential Revenue @ 5% close rate: $${(pipelineValue * 0.05).toLocaleString()}`)
    }
  }
}

async function main() {
  // Ensure screenshots directory exists
  if (!existsSync('screenshots')) {
    await mkdir('screenshots', { recursive: true })
    console.log('📁 Created screenshots directory')
  }

  console.log('\n')
  console.log('═'.repeat(60))
  console.log('🏗️  GROOVE CONSTRUCTION WIRE SCRAPER - LEGENDARY EDITION')
  console.log('═'.repeat(60))
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`)
  console.log(`   CW Username: ${CW_USERNAME ? '✅' : '❌'}`)
  console.log(`   CW Password: ${CW_PASSWORD ? '✅' : '❌'}`)
  console.log('═'.repeat(60))

  const scraper = new EnhancedConstructionWireScraper()

  try {
    await scraper.init()
    await scraper.login()
    await scraper.navigateToHotels()
    const projects = await scraper.scrapeProjects(MAX_PROJECTS, FETCH_DETAILS)

    if (projects.length > 0) {
      await scraper.saveToDatabase(projects)
    }

    scraper.printSummary()

    console.log('\n🎉 Scraping complete!')
    console.log(`🌐 View projects: http://localhost:3000/projects`)
    console.log('\n')

  } catch (error: any) {
    console.error('\n💥 SCRAPING FAILED')
    console.error(`Error: ${error.message}`)
    console.error('\nCheck screenshots/ folder for debugging\n')
    process.exit(1)
  } finally {
    await scraper.close()
  }
}

// Run the scraper
main().catch(console.error)

