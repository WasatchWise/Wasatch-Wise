
import { processEngagement } from '../lib/utils/tracker'

console.log("👁️ VERIFYING THE EYES: Signal Detection\n")

const now = new Date()

// Helper to create a date at specific hour
function atHour(h: number) {
    const d = new Date()
    d.setHours(h, 30, 0, 0)
    return d
}

const scenarios = [
    {
        name: "Business Hours Open (10:30 AM)",
        signal: {
            contact_email: "lead@hotel.com",
            project_name: "The Grand",
            engagement_type: "email_opened",
            occurred_at: atHour(10)
        },
        expected: "immediate"
    },
    {
        name: "After Hours Open (11:30 PM)",
        signal: {
            contact_email: "lead@nightowl.com",
            project_name: "Night Club",
            engagement_type: "email_opened",
            occurred_at: atHour(23)
        },
        expected: "queued"
    },
    {
        name: "Business Hours CLICK (2:30 PM) - HIGH INTENT",
        signal: {
            contact_email: "hot@lead.com",
            project_name: "Big Deal",
            engagement_type: "link_clicked",
            occurred_at: atHour(14)
        },
        expected: "immediate"
    },
    {
        name: "After Hours CLICK (3:00 AM) - HIGH INTENT",
        signal: {
            contact_email: "insomniac@lead.com",
            project_name: "Sleepless Towers",
            engagement_type: "link_clicked",
            occurred_at: atHour(3)
        },
        expected: "queued"
    }
]

scenarios.forEach(s => {
    const result = processEngagement(s.signal as any)
    console.log(`Test: ${s.name}`)
    console.log(`   Result: ${result.notification_type.toUpperCase()}`)
    console.log(`   Reason: ${result.reason}`)

    if (result.notification_type === s.expected) {
        console.log("   ✅ PASS")
    } else {
        console.log(`   ❌ FAIL (Expected ${s.expected})`)
    }
    console.log("-".repeat(40))
})
