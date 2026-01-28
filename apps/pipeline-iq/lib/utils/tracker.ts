
import { ClassificationResult } from './classification'

export type EngagementType = 'email_opened' | 'link_clicked' | 'video_watched'

interface EngagementSignal {
    contact_email: string
    project_name: string
    engagement_type: EngagementType
    occurred_at: Date
    classification?: ClassificationResult
}

interface EngagementAction {
    should_notify: boolean
    notification_type: 'immediate' | 'queued' | 'ignore'
    priority: 'high' | 'normal'
    reason: string
}

// Business Hours: 8 AM - 6 PM MST (Mountain Standard Time)
const BUSINESS_START_HOUR = 8
const BUSINESS_END_HOUR = 18

export function processEngagement(signal: EngagementSignal): EngagementAction {
    const hour = signal.occurred_at.getHours() // Local time (server time)
    // Assuming server is running in same timezone or UTC. 
    // For safety in this MVP, we'll assume "Business Hours" checks local system time given the context.

    const isBusinessHours = hour >= BUSINESS_START_HOUR && hour < BUSINESS_END_HOUR
    const isHighIntent = signal.engagement_type === 'link_clicked' || signal.engagement_type === 'video_watched'

    // 1. High Intent (Clicks) -> ALWAYS Notify (Queue if late, Immediate if day)
    if (isHighIntent) {
        if (isBusinessHours) {
            return {
                should_notify: true,
                notification_type: 'immediate',
                priority: 'high',
                reason: 'High Intent Signal during Business Hours'
            }
        } else {
            return {
                should_notify: true,
                notification_type: 'queued',
                priority: 'high',
                reason: 'High Intent Signal (After Hours) - Queue for Morning'
            }
        }
    }

    // 2. Normal Intent (Opens) -> Notify if Business Hours
    if (signal.engagement_type === 'email_opened') {
        if (isBusinessHours) {
            return {
                should_notify: true,
                notification_type: 'immediate',
                priority: 'normal',
                reason: 'Email Opened during Business Hours'
            }
        } else {
            // User said: "Queue them for 8:00 AM the next day"
            return {
                should_notify: true,
                notification_type: 'queued',
                priority: 'normal',
                reason: 'Email Opened (After Hours) - Queue for Morning'
            }
        }
    }

    return {
        should_notify: false,
        notification_type: 'ignore',
        priority: 'normal',
        reason: 'Signal ignored'
    }
}
