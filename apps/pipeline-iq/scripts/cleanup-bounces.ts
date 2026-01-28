/**
 * Bounce Cleanup Script
 * 
 * Fetches bounced/blocked addresses from SendGrid and:
 * 1. Reports which addresses bounced
 * 2. Checks if any are in the pending queue
 * 3. Marks them as 'skipped' to prevent future sends
 * 4. Optionally updates contacts as invalid
 * 
 * Run: npx tsx scripts/cleanup-bounces.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SendGridBounce {
    email: string
    created: number
    reason: string
    status: string
}

interface SendGridBlock {
    email: string
    created: number
    reason: string
    status: string
}

async function fetchSendGridBounces(): Promise<SendGridBounce[]> {
    console.log('📥 Fetching bounces from SendGrid...')
    
    try {
        const response = await fetch(`${SENDGRID_API_URL}/suppression/bounces`, {
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('❌ SendGrid API error:', error)
            return []
        }

        const bounces = await response.json()
        console.log(`   Found ${bounces.length} bounced addresses`)
        return bounces
    } catch (error) {
        console.error('❌ Failed to fetch bounces:', error)
        return []
    }
}

async function fetchSendGridBlocks(): Promise<SendGridBlock[]> {
    console.log('📥 Fetching blocks from SendGrid...')
    
    try {
        const response = await fetch(`${SENDGRID_API_URL}/suppression/blocks`, {
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('❌ SendGrid API error:', error)
            return []
        }

        const blocks = await response.json()
        console.log(`   Found ${blocks.length} blocked addresses`)
        return blocks
    } catch (error) {
        console.error('❌ Failed to fetch blocks:', error)
        return []
    }
}

async function cleanupBounces() {
    console.log('🧹 BOUNCE CLEANUP SCRIPT')
    console.log('========================')
    console.log(`Date: ${new Date().toLocaleDateString()}`)
    console.log('')

    // 1. Fetch bounces and blocks from SendGrid
    const bounces = await fetchSendGridBounces()
    const blocks = await fetchSendGridBlocks()

    const allBadEmails = new Set<string>()
    const bounceReasons: Record<string, string> = {}

    bounces.forEach(b => {
        allBadEmails.add(b.email.toLowerCase())
        bounceReasons[b.email.toLowerCase()] = `Bounce: ${b.reason}`
    })

    blocks.forEach(b => {
        allBadEmails.add(b.email.toLowerCase())
        bounceReasons[b.email.toLowerCase()] = `Block: ${b.reason}`
    })

    console.log('')
    console.log(`📊 Total bad addresses: ${allBadEmails.size}`)
    console.log('')

    // 2. Analyze by domain
    const domainCounts: Record<string, number> = {}
    allBadEmails.forEach(email => {
        const domain = email.split('@')[1]
        domainCounts[domain] = (domainCounts[domain] || 0) + 1
    })

    console.log('🏢 PROBLEMATIC DOMAINS:')
    console.log('-----------------------')
    Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([domain, count]) => {
            console.log(`   ${domain}: ${count} addresses`)
        })
    console.log('')

    // 3. Check pending queue for bad addresses
    console.log('📦 CHECKING PENDING QUEUE...')
    const { data: pendingQueue, error: queueError } = await supabase
        .from('outreach_queue')
        .select('id, recipient_email, recipient_name, project_id, metadata')
        .eq('status', 'pending')

    if (queueError) {
        console.error('❌ Failed to fetch queue:', queueError)
        return
    }

    console.log(`   Total pending: ${pendingQueue?.length || 0}`)

    const badInQueue: typeof pendingQueue = []
    const cleanInQueue: typeof pendingQueue = []

    pendingQueue?.forEach(item => {
        if (allBadEmails.has(item.recipient_email.toLowerCase())) {
            badInQueue.push(item)
        } else {
            cleanInQueue.push(item)
        }
    })

    console.log(`   ❌ Bounced/Blocked in queue: ${badInQueue.length}`)
    console.log(`   ✅ Clean addresses: ${cleanInQueue.length}`)
    console.log('')

    if (badInQueue.length > 0) {
        console.log('⚠️ BAD ADDRESSES IN PENDING QUEUE:')
        console.log('-----------------------------------')
        badInQueue.forEach(item => {
            const reason = bounceReasons[item.recipient_email.toLowerCase()] || 'Unknown'
            console.log(`   ${item.recipient_email}`)
            console.log(`      Reason: ${reason}`)
            console.log(`      Name: ${item.recipient_name || 'n/a'}`)
        })
        console.log('')

        // 4. Mark bad queue items as 'skipped'
        console.log('🔄 Marking bad addresses as skipped...')
        const badIds = badInQueue.map(item => item.id)
        
        const { error: updateError } = await supabase
            .from('outreach_queue')
            .update({ 
                status: 'skipped',
                error_message: 'Email address bounced/blocked - removed from queue'
            })
            .in('id', badIds)

        if (updateError) {
            console.error('❌ Failed to update queue:', updateError)
        } else {
            console.log(`   ✅ Marked ${badIds.length} items as skipped`)
        }
    }

    // 5. Check contacts table and mark as invalid
    console.log('')
    console.log('👥 CHECKING CONTACTS TABLE...')
    
    const badEmailArray = Array.from(allBadEmails)
    const { data: badContacts, error: contactError } = await supabase
        .from('contacts')
        .select('id, email, first_name, last_name')
        .in('email', badEmailArray)

    if (contactError) {
        console.log('   ⚠️ Could not check contacts table:', contactError.message)
    } else if (badContacts && badContacts.length > 0) {
        console.log(`   Found ${badContacts.length} contacts with bounced emails`)
        
        // Update contacts with bounced flag in metadata
        for (const contact of badContacts) {
            const reason = bounceReasons[contact.email.toLowerCase()]
            await supabase
                .from('contacts')
                .update({
                    metadata: {
                        email_status: 'bounced',
                        bounce_reason: reason,
                        bounce_date: new Date().toISOString()
                    }
                })
                .eq('id', contact.id)
        }
        console.log(`   ✅ Updated ${badContacts.length} contacts with bounce status`)
    } else {
        console.log('   No matching contacts found')
    }

    // 6. Summary
    console.log('')
    console.log('================================')
    console.log('📋 CLEANUP SUMMARY')
    console.log('================================')
    console.log(`Total bounced/blocked addresses: ${allBadEmails.size}`)
    console.log(`Removed from pending queue: ${badInQueue.length}`)
    console.log(`Clean emails ready to send: ${cleanInQueue.length}`)
    console.log('')
    
    if (cleanInQueue.length > 0) {
        console.log('✅ READY TO SEND!')
        console.log(`   ${cleanInQueue.length} clean emails in queue`)
        console.log('')
        console.log('To send, run:')
        console.log('   npx tsx scripts/dispatch-emails.ts')
    }

    // 7. List all bounced addresses for reference
    console.log('')
    console.log('📝 FULL BOUNCE LIST (for reference):')
    console.log('-------------------------------------')
    bounces.slice(0, 20).forEach(b => {
        const date = new Date(b.created * 1000).toLocaleDateString()
        console.log(`${b.email} | ${date} | ${b.status}`)
    })
    if (bounces.length > 20) {
        console.log(`... and ${bounces.length - 20} more`)
    }
}

cleanupBounces()
