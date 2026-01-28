
import { EngagementType } from './tracker'
import { ClassificationResult } from './classification'

interface NotificationPayload {
    recipient: 'Mike'
    prospect_name: string
    project_name: string
    pain_point: string
    engagement_type: EngagementType
    script: string
}

export async function sendWarmCallAlert(
    signal: {
        contact_email: string,
        project_name: string,
        engagement_type: EngagementType,
        classification?: ClassificationResult
    }
): Promise<boolean> {
    // Extract context
    // Default to generic if classification missing (e.g. legacy data)
    const painPoint = signal.classification?.pain_points[0] || 'Vendor Coordination'
    const prospectName = signal.contact_email.split('@')[0] // Fallback name derivation

    // Generate Script
    // "Hey [Name], it’s Mike with Groove. I sent you a quick note earlier about [Project Name] and saw you had a chance to glance at it. I’m not sure if we're relevant yet, but wanted to ask..."
    // NOTE: We can inject the specific pain point if we want to be more aggressive, but user requested the specific script above.
    // Let's add the Context as a "Cheat Sheet" for Mike.

    const script = `Hey ${prospectName}, it’s Mike with Groove. I sent you a quick note earlier about ${signal.project_name} and saw you had a chance to glance at it. I’m not sure if we're relevant yet, but wanted to ask...`

    // Generate Warm Call Assistant Link
    // pipelineiq.net/warm-call?c=Mike&p=Marriott&pain=Guest%20Satisfaction&type=open
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pipelineiq.net'
    const params = new URLSearchParams({
        c: prospectName,
        p: signal.project_name,
        pain: painPoint,
        type: signal.engagement_type.includes('click') ? 'click' : 'open',
        phone: '555-555-5555' // Placeholder - in real app, prospect.phone
    })
    const warmCallLink = `${baseUrl}/warm-call?${params.toString()}`

    const payload: NotificationPayload = {
        recipient: 'Mike',
        prospect_name: prospectName,
        project_name: signal.project_name,
        pain_point: painPoint,
        engagement_type: signal.engagement_type,
        script
    }

    // SIMULATE SMS / SLACK DELIVERY
    console.log("\n📲 [NOTIFICATION SENT TO MIKE]")
    console.log("==================================================")
    console.log(`🔔 WARM CALL ALERT: ${signal.project_name}`)
    console.log(`👤 Prospect: ${prospectName}`)
    console.log(`🎯 Context: They just ${signal.engagement_type === 'link_clicked' ? 'CLICKED the video' : 'OPENED the email'}`)
    console.log(`💡 Pain Point Pitched: "${painPoint}"`)
    console.log("--------------------------------------------------")
    console.log("🔗 ACTIVATE BATTLE SCREEN:")
    console.log(warmCallLink)
    console.log("--------------------------------------------------")
    console.log("📝 SCRIPT ON SCREEN:")
    console.log(`"${script}"`)
    console.log("==================================================\n")

    return true
}
