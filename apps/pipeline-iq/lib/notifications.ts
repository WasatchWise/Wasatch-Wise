import sgMail from '@sendgrid/mail'
import { logger } from '@/lib/logger'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface NotificationPayload {
    type: 'warm_call' | 'reply' | 'error'
    project: {
        name: string
        id: string
        city?: string
        state?: string
    }
    contact: {
        name: string
        email: string
        id?: string
        role?: string
    }
    activity: {
        type: string
        notes?: string
        metadata?: any
    }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'msartain@getgrooven.com'
const ADMIN_WEBHOOK_URL = process.env.ADMIN_WEBHOOK_URL

export async function sendWarmCallAlert(payload: NotificationPayload) {
    logger.info('Sending Warm Call Alert', { type: payload.type, project: payload.project.name })

    // 1. Send Email to Admin (Mike)
    try {
        const subject = `🔥 Warm Call Alert: ${payload.contact.name} @ ${payload.project.name}`
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF5722;">🔥 Warm Call Opportunity</h2>
        <p><strong>${payload.contact.name}</strong> (${payload.contact.role || 'Contact'}) from <strong>${payload.project.name}</strong> just engaged.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Action:</strong> ${payload.activity.type}</p>
            <p><strong>Notes:</strong> ${payload.activity.notes || 'No details'}</p>
            <p><strong>Location:</strong> ${payload.project.city || ''}, ${payload.project.state || ''}</p>
        </div>

        <a href="https://pipelineiq.net/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
      </div>
    `

        await sgMail.send({
            to: ADMIN_EMAIL,
            from: 'alerts@pipelineiq.net', // Ensure this sender is verified in SendGrid
            subject,
            html,
        })
        logger.info('Warm Call Email sent', { to: ADMIN_EMAIL })
    } catch (error) {
        logger.error('Failed to send Warm Call Email', { error })
    }

    // 2. Dispatch Webhook (if configured/Zapier)
    if (ADMIN_WEBHOOK_URL) {
        try {
            await fetch(ADMIN_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'warm_call_alert',
                    timestamp: new Date().toISOString(),
                    data: payload
                })
            })
            logger.info('Warm Call Webhook dispatched', { url: ADMIN_WEBHOOK_URL })
        } catch (error) {
            logger.error('Failed to dispatch Warm Call Webhook', { error })
        }
    }
}
