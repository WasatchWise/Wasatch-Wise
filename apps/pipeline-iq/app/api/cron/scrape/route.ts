import { NextRequest, NextResponse } from 'next/server'
import { ConstructionWireScraper } from '@/lib/scrapers/construction-wire'
import { logger } from '@/lib/logger'

/**
 * POST /api/cron/scrape - Daily automated scraper
 * Runs daily at 6 AM UTC to fetch new projects from Construction Wire
 *
 * Cron schedule: 0 6 * * * (daily at 6 AM UTC / midnight MST)
 */
export async function POST(request: NextRequest) {
  const requestId = `cron_scrape_${Date.now()}`

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron scrape attempt', { requestId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('Starting automated daily scrape', { requestId })

    const scraper = new ConstructionWireScraper()

    // Scrape with expanded options - get more projects
    const results = await scraper.scrapeAndSave({
      projectTypes: [
        'hotel',
        'multifamily',
        'senior_living',
        'student_housing',
        'mixed_use',
        'retail',
        'office',
        'healthcare',
      ],
      states: [
        // Major markets
        'TX', 'CA', 'FL', 'GA', 'AZ', 'NC', 'CO', 'TN', 'WA', 'NV',
        'VA', 'NY', 'IL', 'PA', 'OH', 'MI', 'NJ', 'MA', 'MD', 'SC',
      ],
      minValue: 2000000, // $2M minimum
      maxResults: 500,   // Get up to 500 per run
    })

    if (!results.success) {
      logger.error('Automated scrape failed', { requestId, error: results.error })
      return NextResponse.json({
        success: false,
        error: results.error,
        requestId,
      }, { status: 500 })
    }

    logger.info('Automated scrape completed', {
      requestId,
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors,
      duration: results.duration,
    })

    return NextResponse.json({
      success: true,
      message: 'Daily scrape completed',
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors,
      duration: results.duration,
      requestId,
    })
  } catch (error: any) {
    logger.error('Cron scrape error', { requestId, error: error.message })
    return NextResponse.json({
      success: false,
      error: error.message,
      requestId,
    }, { status: 500 })
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/cron/scrape',
    description: 'Daily automated scraper for Construction Wire',
    schedule: '0 6 * * * (daily at 6 AM UTC)',
    method: 'POST',
    auth: 'Bearer CRON_SECRET required',
  })
}
