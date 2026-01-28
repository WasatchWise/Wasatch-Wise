/**
 * Notification Service for Warm Call Triggers
 * Handles SMS, Slack, and Dashboard notifications
 */

import { logger } from '@/lib/logger'
import { sendEmailWithSendGrid } from '@/lib/utils/sendgrid'

export interface WarmCallNotification {
  prospectName: string
  building: string
  painPoint: string
  callScript: string
  engagementType: 'open' | 'click'
  engagementTime: Date
  projectId?: string | null
  contactId: string
  emailActivityId: string
}

export interface NotificationResult {
  sent: boolean
  channel: 'sms' | 'slack' | 'dashboard' | 'email'
  error?: string
}

/**
 * Send warm call notification via configured channels
 */
export async function sendWarmCallNotification(
  notification: WarmCallNotification
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []

  // Check business hours and timezone
  const isBusinessHours = checkBusinessHours(notification.engagementTime)
  
  if (!isBusinessHours) {
    logger.info('Engagement outside business hours - queuing for next business day', {
      engagementTime: notification.engagementTime,
      projectId: notification.projectId,
    })
    // Queue for next business day (8:00 AM)
    await queueForBusinessHours(notification)
    results.push({
      sent: false,
      channel: 'dashboard',
    })
    return results
  }

  // Send to all configured channels
  const channels = getNotificationChannels()

  for (const channel of channels) {
    try {
      switch (channel) {
        case 'sms':
          const smsResult = await sendSMSNotification(notification)
          results.push(smsResult)
          break
        case 'slack':
          const slackResult = await sendSlackNotification(notification)
          results.push(slackResult)
          break
        case 'dashboard':
          const dashboardResult = await sendDashboardNotification(notification)
          results.push(dashboardResult)
          break
        case 'email':
          const emailResult = await sendEmailNotification(notification)
          results.push(emailResult)
          break
      }
    } catch (error) {
      logger.error(`Failed to send ${channel} notification`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        notification,
      })
      results.push({
        sent: false,
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Check if engagement occurred during business hours (8 AM - 6 PM local time, Mon-Fri)
 */
function checkBusinessHours(engagementTime: Date): boolean {
  const hour = engagementTime.getHours()
  const day = engagementTime.getDay() // 0 = Sunday, 6 = Saturday

  // Monday-Friday: 8 AM - 6 PM
  if (day >= 1 && day <= 5 && hour >= 8 && hour < 18) {
    return true
  }

  return false
}

/**
 * Queue notification for next business day at 8:00 AM
 */
async function queueForBusinessHours(notification: WarmCallNotification): Promise<void> {
  // Calculate next business day 8:00 AM
  const nextBusinessDay = new Date(notification.engagementTime)
  nextBusinessDay.setDate(nextBusinessDay.getDate() + 1)
  nextBusinessDay.setHours(8, 0, 0, 0)

  // Skip weekends
  const day = nextBusinessDay.getDay()
  if (day === 0) nextBusinessDay.setDate(nextBusinessDay.getDate() + 1) // Sunday -> Monday
  if (day === 6) nextBusinessDay.setDate(nextBusinessDay.getDate() + 2) // Saturday -> Monday

  // Store in database for cron job to process
  // This would be implemented in the database/webhook handler
  logger.info('Queued notification for business hours', {
    scheduledTime: nextBusinessDay,
    notification,
  })
}

/**
 * Get configured notification channels
 */
function getNotificationChannels(): ('sms' | 'slack' | 'dashboard' | 'email')[] {
  const channels: ('sms' | 'slack' | 'dashboard' | 'email')[] = ['dashboard'] // Always enable dashboard

  if (process.env.WARM_CALL_NOTIFY_EMAIL || process.env.GMAIL_USER) {
    channels.push('email')
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.WARM_CALL_SMS_NUMBER) {
    channels.push('sms')
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    channels.push('slack')
  }

  return channels
}

/**
 * Send email notification (Mike)
 */
async function sendEmailNotification(notification: WarmCallNotification): Promise<NotificationResult> {
  const toEmail = process.env.WARM_CALL_NOTIFY_EMAIL || process.env.GMAIL_USER

  if (!toEmail) {
    return {
      sent: false,
      channel: 'email',
      error: 'Email notification not configured - missing WARM_CALL_NOTIFY_EMAIL or GMAIL_USER',
    }
  }

  const subject = `Warm call: ${notification.prospectName} ${notification.engagementType === 'open' ? 'opened' : 'clicked'}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <p><strong>Prospect:</strong> ${notification.prospectName}</p>
      <p><strong>Building:</strong> ${notification.building}</p>
      <p><strong>Pain Point:</strong> ${notification.painPoint}</p>
      <p><strong>Engagement:</strong> ${notification.engagementType === 'open' ? 'Email opened' : 'Link clicked'}</p>
      <p><strong>When:</strong> ${notification.engagementTime.toLocaleString()}</p>
      <hr />
      <p><strong>Call Script:</strong></p>
      <p style="white-space: pre-wrap;">${notification.callScript}</p>
    </div>
  `

  const sent = await sendEmailWithSendGrid({
    to: toEmail,
    subject,
    html,
  })

  if (sent) {
    logger.info('Warm call email notification sent', {
      toEmail,
      engagementType: notification.engagementType,
      projectId: notification.projectId,
      contactId: notification.contactId,
      emailActivityId: notification.emailActivityId,
    })
  } else {
    logger.error('Warm call email notification failed', {
      toEmail,
      engagementType: notification.engagementType,
      projectId: notification.projectId,
      contactId: notification.contactId,
      emailActivityId: notification.emailActivityId,
    })
  }

  return {
    sent,
    channel: 'email',
    error: sent ? undefined : 'Failed to send email notification via SendGrid',
  }
}

/**
 * Send SMS notification via Twilio REST API
 * Uses direct API calls to avoid SDK dependency
 */
async function sendSMSNotification(notification: WarmCallNotification): Promise<NotificationResult> {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const toNumber = process.env.WARM_CALL_SMS_NUMBER
  const fromNumber = process.env.TWILIO_FROM_NUMBER

  if (!twilioAccountSid || !twilioAuthToken || !toNumber || !fromNumber) {
    return {
      sent: false,
      channel: 'sms',
      error: 'SMS not configured - missing Twilio credentials',
    }
  }

  try {
    const message = `🔥 WARM CALL TRIGGER

${notification.prospectName} - ${notification.building}

Pain Point: ${notification.painPoint}
Engagement: ${notification.engagementType === 'open' ? 'Email opened' : 'Link clicked'}

Call Script:
${notification.callScript}

Call now while Groove is top-of-mind!`

    // Use Twilio REST API directly instead of SDK
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Twilio API error: ${response.statusText}`)
    }

    logger.info('SMS notification sent', { notification })
    return {
      sent: true,
      channel: 'sms',
    }
  } catch (error) {
    logger.error('Failed to send SMS', { error })
    return {
      sent: false,
      channel: 'sms',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(notification: WarmCallNotification): Promise<NotificationResult> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    return {
      sent: false,
      channel: 'slack',
      error: 'Slack webhook not configured',
    }
  }

  try {
    const slackMessage = {
      text: '🔥 Warm Call Trigger - Action Required',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔥 Warm Call Trigger',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Prospect:*\n${notification.prospectName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Building:*\n${notification.building}`,
            },
            {
              type: 'mrkdwn',
              text: `*Pain Point:*\n${notification.painPoint}`,
            },
            {
              type: 'mrkdwn',
              text: `*Engagement:*\n${notification.engagementType === 'open' ? '📧 Email Opened' : '🔗 Link Clicked'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Call Script:*\n${notification.callScript}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `⚡ Call now while Groove is top-of-mind!`,
            },
          ],
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    logger.info('Slack notification sent', { notification })
    return {
      sent: true,
      channel: 'slack',
    }
  } catch (error) {
    logger.error('Failed to send Slack notification', { error })
    return {
      sent: false,
      channel: 'slack',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send dashboard notification (store in database)
 */
async function sendDashboardNotification(notification: WarmCallNotification): Promise<NotificationResult> {
  // This would create a record in a notifications table
  // For now, we'll just log it - the actual DB insertion happens in the webhook handler
  logger.info('Dashboard notification created', { notification })
  
  return {
    sent: true,
    channel: 'dashboard',
  }
}

/**
 * Generate call script for warm call
 */
export function generateCallScript(
  prospectName: string,
  projectName: string,
  painPoint: string
): string {
  return `Hey ${prospectName}, it's Mike with Groove. I sent you a quick note earlier about ${projectName} and saw you had a chance to glance at it. I'm not sure if we're relevant yet, but wanted to ask...`
}

