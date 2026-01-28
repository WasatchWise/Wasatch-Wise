
import { classifyProject } from '../lib/utils/classification'
import { calculateGrooveScore } from '../lib/utils/scoring'

const testCases = [
    {
        name: "Luxury Hotel (Hospitality)",
        types: ["Hotel", "Resort"],
        desc: "New 500-room luxury hotel with high-speed internet and structured cabling.",
        services: ["wifi", "cabling", "internet"]
    },
    {
        name: "Assisted Living Facility (Senior Living)",
        types: ["Assisted Living", "Senior Care"],
        desc: "100-bed facility focused on resident care.",
        services: []
    },
    {
        name: "Student Dorm Check (Student/Commercial)",
        types: ["Student Housing", "Dormitory"],
        desc: "Campus expansion.",
        services: ["access_control", "internet"]
    },
    {
        name: "Generic Retail",
        types: ["Retail", "Store"],
        desc: "Strip mall.",
        services: []
    }
]

console.log("🧠 VERIFYING THE BRAIN: Classification & Scoring\n")

testCases.forEach(tc => {
    console.log(`📋 Testing: ${tc.name}`)

    // 1. Classify
    const classification = classifyProject(tc.types)
    console.log(`   vertical: ${classification.vertical}`)
    console.log(`   bundle:   ${classification.groove_bundle}`)
    console.log(`   pains:    ${classification.pain_points.join(', ')}`)

    // 2. Score
    const mockProject = {
        project_type: tc.types,
        project_stage: "Planning",
        project_value: 5000000,
        services_needed: tc.services
    }
    const score = calculateGrooveScore(mockProject as any)
    console.log(`   score:    ${score} (Services: ${tc.services.join(', ')})`)
    console.log("-".repeat(40))
})
