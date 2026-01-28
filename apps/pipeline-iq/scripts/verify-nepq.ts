
import { classifyProject } from '../lib/utils/classification'
import { generateNEPQEmail } from '../lib/utils/email-generator'

const testProjects = [
    {
        name: "The Grand Hotel",
        type: ["Hotel"],
        city: "Chicago",
        state: "IL"
    },
    {
        name: "Sunrise Senior Living",
        type: ["Senior Living", "Assisted Living"],
        city: "Phoenix",
        state: "AZ"
    },
    {
        name: "Campus View Apartments",
        type: ["Student Housing"],
        city: "Austin",
        state: "TX"
    }
]

console.log("📧 VERIFYING THE PAYLOAD: NEPQ Emails\n")

testProjects.forEach(p => {
    // 1. Classify
    const classification = classifyProject(p.type)

    // 2. Generate Email
    const email = generateNEPQEmail({
        project_name: p.name,
        city: p.city,
        state: p.state,
        classification
    })

    console.log(`📨 TO: [Developer of ${p.name}]`)
    console.log(`SUBJECT: ${email.subject}`)
    console.log("-".repeat(40))
    console.log(email.body)
    console.log("\n" + "=".repeat(40) + "\n")
})
