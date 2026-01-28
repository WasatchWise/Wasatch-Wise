
import { classifyProject } from '../lib/utils/classification'
import { generateNEPQEmail } from '../lib/utils/email-generator'
import { processEngagement } from '../lib/utils/tracker'
import { sendWarmCallAlert } from '../lib/utils/notifications'

console.log("🚀 SIMULATING FULL WARM CALL ENGINE FLOW\n")

// 1. THE BRAIN: Scraper finds a project
const rawProject = {
    name: "Marriott Downtown",
    type: ["Hotel"],
    desc: "New hotel with Wi-Fi requirements.",
    city: "Salt Lake City"
}
console.log(`1. [BRAIN] Detected Project: ${rawProject.name} (${rawProject.type})`)

const classification = classifyProject(rawProject.type)
console.log(`   -> Classified as: ${classification.vertical}`)
console.log(`   -> Pain Point: ${classification.pain_points[0]}`)

// 2. THE PAYLOAD: Generate Email
const email = generateNEPQEmail({
    project_name: rawProject.name,
    city: rawProject.city,
    state: "UT",
    classification
})
console.log(`\n2. [PAYLOAD] Generated Email:`)
console.log(`   Subject: ${email.subject}`)
console.log(`   Body Preview: "${email.body.split('\n')[2]}..."`)

// 3. THE EYES: Signal Detected (e.g. Webhook)
console.log(`\n3. [EYES] Simulating "Email Open" at 10:00 AM...`)
// Force 10 AM
const eventTime = new Date()
eventTime.setHours(10, 0, 0, 0)

const signal = {
    contact_email: "gm@marriott.com",
    project_name: rawProject.name,
    engagement_type: 'email_opened' as const,
    occurred_at: eventTime,
    classification
}

const action = processEngagement(signal)
console.log(`   -> Action: ${action.notification_type.toUpperCase()}`)

// 4. THE HAND-OFF: Alert Mike
if (action.should_notify && action.notification_type === 'immediate') {
    console.log(`\n4. [HAND-OFF] Triggering Alert...`)
    sendWarmCallAlert(signal)
}
