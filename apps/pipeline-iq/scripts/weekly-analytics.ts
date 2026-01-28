/**
 * Weekly Email Analytics Report
 * Run: npx tsx scripts/weekly-analytics.ts
 * 
 * Generates a summary of last week's email performance
 * for analysis and optimization of future sends.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function generateWeeklyReport() {
    console.log('📊 WEEKLY EMAIL ANALYTICS REPORT')
    console.log('================================')
    console.log(`Report Date: ${new Date().toLocaleDateString()}`)
    console.log(`Period: Last 7 days\n`)

    // 1. Overall email stats from outreach_activities
    const { data: activityStats, error: activityError } = await supabase
        .from('outreach_activities')
        .select('*')
        .eq('activity_type', 'email')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (activityError) {
        console.error('Error fetching activities:', activityError)
    }

    const activities = activityStats || []
    
    console.log('📬 OVERALL PERFORMANCE')
    console.log('----------------------')
    console.log(`Total Emails Sent: ${activities.length}`)
    
    const opened = activities.filter(a => a.status === 'opened' || a.metadata?.opened).length
    const clicked = activities.filter(a => a.status === 'clicked' || a.metadata?.clicked).length
    const replied = activities.filter(a => a.status === 'replied').length
    const bounced = activities.filter(a => a.status === 'bounced' || a.status === 'failed').length

    const openRate = activities.length > 0 ? ((opened / activities.length) * 100).toFixed(1) : '0'
    const clickRate = activities.length > 0 ? ((clicked / activities.length) * 100).toFixed(1) : '0'
    const replyRate = activities.length > 0 ? ((replied / activities.length) * 100).toFixed(1) : '0'
    const bounceRate = activities.length > 0 ? ((bounced / activities.length) * 100).toFixed(1) : '0'

    console.log(`Opened: ${opened} (${openRate}%)`)
    console.log(`Clicked: ${clicked} (${clickRate}%)`)
    console.log(`Replied: ${replied} (${replyRate}%)`)
    console.log(`Bounced/Failed: ${bounced} (${bounceRate}%)`)

    // 2. Queue status
    console.log('\n📦 QUEUE STATUS')
    console.log('---------------')
    
    const { data: queueStats, error: queueError } = await supabase
        .from('outreach_queue')
        .select('status')

    if (!queueError && queueStats) {
        const pending = queueStats.filter(q => q.status === 'pending').length
        const sent = queueStats.filter(q => q.status === 'sent').length
        const failed = queueStats.filter(q => q.status === 'failed').length
        const skipped = queueStats.filter(q => q.status === 'skipped').length

        console.log(`Pending: ${pending}`)
        console.log(`Sent: ${sent}`)
        console.log(`Failed: ${failed}`)
        console.log(`Skipped: ${skipped}`)
    }

    // 3. Performance by day
    console.log('\n📅 DAILY BREAKDOWN')
    console.log('------------------')
    
    const byDay: Record<string, { sent: number; opened: number }> = {}
    activities.forEach(a => {
        const day = new Date(a.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        if (!byDay[day]) byDay[day] = { sent: 0, opened: 0 }
        byDay[day].sent++
        if (a.status === 'opened' || a.metadata?.opened) byDay[day].opened++
    })

    Object.entries(byDay).forEach(([day, stats]) => {
        const rate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(0) : '0'
        console.log(`${day}: ${stats.sent} sent, ${stats.opened} opened (${rate}%)`)
    })

    // 4. Performance by vertical
    console.log('\n🏢 BY VERTICAL')
    console.log('--------------')
    
    const byVertical: Record<string, { sent: number; opened: number }> = {}
    activities.forEach(a => {
        const vertical = a.metadata?.vertical || 'Unknown'
        if (!byVertical[vertical]) byVertical[vertical] = { sent: 0, opened: 0 }
        byVertical[vertical].sent++
        if (a.status === 'opened' || a.metadata?.opened) byVertical[vertical].opened++
    })

    Object.entries(byVertical)
        .sort((a, b) => b[1].sent - a[1].sent)
        .forEach(([vertical, stats]) => {
            const rate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(0) : '0'
            console.log(`${vertical}: ${stats.sent} sent, ${stats.opened} opened (${rate}%)`)
        })

    // 5. Performance by hour
    console.log('\n⏰ BY SEND HOUR (Local Time)')
    console.log('----------------------------')
    
    const byHour: Record<number, { sent: number; opened: number }> = {}
    activities.forEach(a => {
        const hour = a.metadata?.sent_hour_local
        if (hour !== undefined && hour !== null) {
            if (!byHour[hour]) byHour[hour] = { sent: 0, opened: 0 }
            byHour[hour].sent++
            if (a.status === 'opened' || a.metadata?.opened) byHour[hour].opened++
        }
    })

    Object.entries(byHour)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .forEach(([hour, stats]) => {
            const rate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(0) : '0'
            const hourLabel = `${hour.padStart(2, '0')}:00`
            console.log(`${hourLabel}: ${stats.sent} sent, ${stats.opened} opened (${rate}%)`)
        })

    // 6. Subject line performance
    console.log('\n✉️ SUBJECT LINE PERFORMANCE')
    console.log('---------------------------')
    
    const bySubject: Record<string, { sent: number; opened: number }> = {}
    activities.forEach(a => {
        const subject = a.subject || 'No subject'
        if (!bySubject[subject]) bySubject[subject] = { sent: 0, opened: 0 }
        bySubject[subject].sent++
        if (a.status === 'opened' || a.metadata?.opened) bySubject[subject].opened++
    })

    Object.entries(bySubject)
        .filter(([_, stats]) => stats.sent >= 1)
        .sort((a, b) => {
            const rateA = a[1].sent > 0 ? a[1].opened / a[1].sent : 0
            const rateB = b[1].sent > 0 ? b[1].opened / b[1].sent : 0
            return rateB - rateA
        })
        .slice(0, 10)
        .forEach(([subject, stats]) => {
            const rate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(0) : '0'
            const truncated = subject.length > 50 ? subject.substring(0, 47) + '...' : subject
            console.log(`"${truncated}" - ${stats.sent} sent, ${rate}% open`)
        })

    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS')
    console.log('------------------')
    
    if (activities.length === 0) {
        console.log('• No emails sent last week - time to fill the pipeline!')
    } else {
        const overallOpenRate = parseFloat(openRate)
        
        if (overallOpenRate < 15) {
            console.log('• Open rate is low (<15%) - test different subject lines')
        } else if (overallOpenRate >= 25) {
            console.log('• Great open rate (>25%) - maintain current approach')
        }
        
        if (parseFloat(bounceRate) > 2) {
            console.log('• High bounce rate - clean email list')
        }
        
        // Best hour recommendation
        const bestHour = Object.entries(byHour)
            .filter(([_, stats]) => stats.sent >= 2)
            .sort((a, b) => {
                const rateA = a[1].sent > 0 ? a[1].opened / a[1].sent : 0
                const rateB = b[1].sent > 0 ? b[1].opened / b[1].sent : 0
                return rateB - rateA
            })[0]
        
        if (bestHour) {
            console.log(`• Best performing hour: ${bestHour[0]}:00 local time`)
        }
    }

    console.log('\n================================')
    console.log('📋 Copy this report and paste into Claude Chrome extension')
    console.log('   for detailed analysis and send recommendations.')
    console.log('================================\n')
}

generateWeeklyReport()
