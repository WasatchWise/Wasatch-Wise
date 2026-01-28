
import { ClassificationResult } from './classification'

interface ProjectDetails {
    project_name: string
    city: string | null
    state: string | null
    developer_name?: string
    classification: ClassificationResult
}

export function generateNEPQEmail(project: ProjectDetails): { subject: string, body: string } {
    const { classification } = project

    // 1. Subject Line: Low friction, curiosity loop
    // e.g. "Question about [Project Name]" or "The Wifi at [Project Name]"
    const subject = `Question about ${project.project_name}`

    // 2. The Hook: Localized context
    const locationContext = project.city ? `in ${project.city}` : ''
    const hook = `Saw the new ${project.project_name} development ${locationContext} and wanted to reach out.`

    // 3. The Problem (Vendor Sprawl & Vertical Specific Pain)
    // "Typical [Vertical] projects struggle with [Pain Point 1]..."
    const vertical = classification.vertical
    const primaryPain = classification.pain_points[0] || 'vendor coordination'

    let problemStatement = ''
    switch (vertical) {
        case 'Hospitality':
            problemStatement = `We find most hotel developers dread the ${primaryPain} piece—coordinating separate vendors for TV, Wi-Fi, and Phones is a nightmare.`
            break
        case 'Senior Living':
            problemStatement = `In senior living, ${primaryPain} is usually the headache. Juggling different systems when you just need staff to be efficient is tough.`
            break
        case 'Multifamily':
            problemStatement = `For MDU projects, the challenge is usually ${primaryPain} and keeping amenity fees simple for residents.`
            break
        case 'Student/Commercial':
            problemStatement = `Usually with student housing, ${primaryPain} is the bottleneck. You have 500 kids streaming 4K and only one pipe.`
            break
        default:
            problemStatement = `Typically, the headaches come from trying to piece together multiple vendors for your technology stack.`
    }

    // 4. The Solution (Groove Value Prop + Bundle)
    const solution = `Groove simplifies this by bringing it all "under one roof." We handle the entire ${classification.groove_bundle} (DirecTV, Internet, Coding) so you have one hand to shake.`

    // 5. The Asset Link (Cognitive Load Reducer)
    // This would be the "Groove in 45 Seconds" link
    const assetLink = `I put together a 45-second overview of how we do this: [Link]`

    // 6. The Soft CTA (NEPQ Permissive)
    const cta = `If it looks like we could take some of that weight off your plate, let me know. If not, no worries.`

    // Assembly
    const body = `
Hi [Name],

${hook}

${problemStatement}

${solution}

${assetLink}

${cta}

Best,

Mike
Groove Technology
`
    return { subject, body: body.trim() }
}
