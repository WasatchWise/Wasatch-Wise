#!/usr/bin/env tsx

/**
 * Construction Wire Scraper CLI
 *
 * Usage:
 *   npm run scrape                           # Run with default settings
 *   npm run scrape -- --types hotel,multifamily --states TX,CA
 *   npm run scrape -- --min-value 10000000 --max-results 50
 *
 * Schedule with cron:
 *   0 6 * * * cd /path/to/project && npm run scrape
 */

import { ConstructionWireScraper } from '../lib/scrapers/construction-wire'

async function main() {
  const args = process.argv.slice(2)

  // Parse command line arguments
  const options: any = {
    projectTypes: ['hotel', 'multifamily', 'senior_living', 'student_housing'],
    states: ['TX', 'CA', 'FL', 'GA', 'AZ', 'NC', 'TN', 'CO'],
    minValue: 5000000,
    maxResults: 100,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--types' && args[i + 1]) {
      options.projectTypes = args[i + 1].split(',')
      i++
    } else if (arg === '--states' && args[i + 1]) {
      options.states = args[i + 1].split(',')
      i++
    } else if (arg === '--min-value' && args[i + 1]) {
      options.minValue = parseInt(args[i + 1])
      i++
    } else if (arg === '--max-results' && args[i + 1]) {
      options.maxResults = parseInt(args[i + 1])
      i++
    } else if (arg === '--help') {
      console.log(`
Construction Wire Scraper CLI

Usage:
  npm run scrape                           # Run with default settings
  npm run scrape -- --types hotel,multifamily --states TX,CA
  npm run scrape -- --min-value 10000000 --max-results 50

Options:
  --types <types>           Project types (comma-separated)
                            Default: hotel,multifamily,senior_living,student_housing

  --states <states>         States to search (comma-separated)
                            Default: TX,CA,FL,GA,AZ,NC,TN,CO

  --min-value <value>       Minimum project value in dollars
                            Default: 5000000

  --max-results <number>    Maximum number of results
                            Default: 100

  --help                    Show this help message

Examples:
  npm run scrape -- --types hotel --states TX,FL --min-value 10000000
  npm run scrape -- --max-results 50
      `)
      process.exit(0)
    }
  }

  console.log('🚀 Starting Construction Wire scraper...')
  console.log('Options:', options)
  console.log('')

  const scraper = new ConstructionWireScraper()
  const results = await scraper.scrapeAndSave(options)

  if (results.success) {
    console.log('')
    console.log('✅ Scrape completed successfully!')
    console.log(`   Inserted: ${results.inserted}`)
    console.log(`   Updated: ${results.updated}`)
    console.log(`   Errors: ${results.errors}`)
    console.log(`   Duration: ${results.duration}s`)
    process.exit(0)
  } else {
    console.log('')
    console.log('❌ Scrape failed:', results.error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
