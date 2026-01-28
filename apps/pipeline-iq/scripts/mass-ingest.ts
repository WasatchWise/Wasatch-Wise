
import { spawn } from 'child_process'
import { config } from 'dotenv'

config({ path: '.env.local' })

/**
 * 🌊 PIPELINE IQ: MASS INGESTION
 * 
 * This script runs the scraper in "Deep Trawl" mode.
 * It is designed to run for extended periods to suck in as much data as possible.
 * 
 * Usage: npx tsx scripts/mass-ingest.ts
 */

console.log("🌊 STARTING MASS INGESTION: Pipeline IQ Mode")
console.log("   Target: Maximum Records")
console.log("   Strategy: Deep Trawl (No Limits)")
console.log("===========================================")

// Run the scraper with specific flags
// --deep: remove project limits
// --details: fetch emails/phones
// --headless: run fast
const scraper = spawn('npx', [
    'tsx',
    'scripts/scrape-construction-wire-enhanced.ts',
    '--deep',
    '--details',
    '--headless'
], {
    stdio: 'inherit',
    env: process.env
})

scraper.on('close', (code) => {
    console.log(`\n🌊 Mass Ingestion Complete (Exit Code: ${code})`)
    console.log("   Run 'npm run counts' to see the new database size.")
})

scraper.on('error', (err) => {
    console.error("❌ Mass Ingestion Failed:", err)
})
