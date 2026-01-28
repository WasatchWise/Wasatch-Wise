
import { NextRequest, NextResponse } from 'next/server'
import { processEngagement, EngagementType } from '@/lib/utils/tracker'
import { sendWarmCallAlert } from '@/lib/utils/notifications'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { contact_email, project_name, event, classification } = body

        if (!contact_email || !event) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const signal = {
            contact_email,
            project_name: project_name || 'Unknown Project',
            engagement_type: event as EngagementType,
            occurred_at: new Date(), // Now
            classification
        }

        const action = processEngagement(signal)

        // In a real implementation, this would trigger the Notification Service (Phase 4)
        // For now, we just log the decision "The Brain" made.
        console.log(`👁️ SIGNAL RECEIVED: ${event} from ${contact_email}`)
        console.log(`   Action: ${action.notification_type.toUpperCase()} (${action.reason})`)

        if (action.should_notify && action.notification_type === 'immediate') {
            // Trigger "Call Now" Alert (Phase 4)
            await sendWarmCallAlert(signal)
        } else if (action.should_notify && action.notification_type === 'queued') {
            // TODO: Add to DB Queue
            console.log(`   🕒 QUEUING FOT 8:00 AM...`)
        }

        return NextResponse.json({
            success: true,
            action_taken: action
        })

    } catch (error: any) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
