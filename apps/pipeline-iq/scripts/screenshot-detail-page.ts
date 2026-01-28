#!/usr/bin/env tsx

/**
 * Quick script to screenshot a project detail page
 * to understand the contact data structure
 */

import { config } from 'dotenv'
import puppeteer from 'puppeteer'

config({ path: '.env.local' })

const CW_USERNAME = process.env.CONSTRUCTION_WIRE_USERNAME!
const CW_PASSWORD = process.env.CONSTRUCTION_WIRE_PASSWORD!

async function run() {
  console.log('🔍 Launching browser to screenshot detail page...')

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1400, height: 900 }
  })

  const page = await browser.newPage()

  try {
    // Login
    console.log('🔐 Logging in...')
    await page.goto('https://www.constructionwire.com/Account/Login', { waitUntil: 'networkidle2' })
    await page.type('input[placeholder="Email"]', CW_USERNAME)
    await page.type('input[placeholder="Password"]', CW_PASSWORD)

    // Click and wait for either navigation or network idle
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {})
    ])

    // Wait a bit more for any redirects
    await new Promise(r => setTimeout(r, 3000))
    console.log('✅ Logged in, current URL:', page.url())

    // Wait for table
    console.log('🏨 Waiting for projects table...')
    await page.waitForSelector('table tbody tr', { timeout: 15000 })

    // Find the first project link
    const projectLink = await page.$('table tbody tr td a[href*="/Client/Report/Details/"]')

    if (projectLink) {
      const href = await projectLink.evaluate(el => el.getAttribute('href'))
      console.log(`📍 Found project link: ${href}`)

      // Navigate directly to the detail page
      const fullUrl = `https://www.constructionwire.com${href}`
      console.log(`🔗 Navigating to: ${fullUrl}`)

      await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 60000 })
      await new Promise(r => setTimeout(r, 2000))

      // Screenshot the detail page
      await page.screenshot({
        path: 'screenshots/project-detail-page.png',
        fullPage: true
      })
      console.log('📸 Screenshot saved: screenshots/project-detail-page.png')

      // Dump the page structure
      const pageInfo = await page.evaluate(() => {
        // Get all tables on the page
        const tables = Array.from(document.querySelectorAll('table')).map(t => ({
          id: t.id,
          className: t.className,
          rows: t.rows.length
        }))

        // Get all headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim()).slice(0, 20)

        // Look for contact info patterns
        const bodyText = document.body.innerText
        const hasEmail = bodyText.includes('@')
        const hasPhone = /\(\d{3}\)|\d{3}-\d{3}-\d{4}/.test(bodyText)

        // Find elements that might contain contacts
        const contactElements: string[] = []
        document.querySelectorAll('*').forEach(el => {
          const text = el.textContent || ''
          if (text.includes('@') && text.length < 200) {
            contactElements.push(text.substring(0, 150))
          }
        })

        return { tables, headings, hasEmail, hasPhone, contactElements: contactElements.slice(0, 10) }
      })

      console.log('\n📋 Page Analysis:')
      console.log('  Tables found:', pageInfo.tables.length)
      pageInfo.tables.forEach(t => console.log(`    - ${t.className || t.id || 'unnamed'}: ${t.rows} rows`))
      console.log('  Headings:', pageInfo.headings.slice(0, 10))
      console.log('  Has email addresses:', pageInfo.hasEmail)
      console.log('  Has phone numbers:', pageInfo.hasPhone)
      if (pageInfo.contactElements.length > 0) {
        console.log('  Contact-like elements:')
        pageInfo.contactElements.forEach(c => console.log(`    - ${c}`))
      }

    } else {
      console.log('❌ No project link found')
      await page.screenshot({ path: 'screenshots/no-project-link.png', fullPage: true })
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    await page.screenshot({ path: 'screenshots/error-page.png', fullPage: true })
  }

  await browser.close()
  console.log('✅ Done')
}

run().catch(console.error)
