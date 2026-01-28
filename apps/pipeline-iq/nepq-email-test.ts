/**
 * Test NEPQ Email Generation directly
 * This verifies the NEPQ integration without needing the browser
 */

import { generateGrooveNEPQEmail } from './lib/groove/email-generation'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testNEPQEmailGeneration() {
    console.log('🧪 Testing NEPQ Email Generation\n')
    console.log('='.repeat(60))

    // Find projects with email contacts
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching projects:', error.message)
        return
    }

    // Find a contact with an email
    let testContact: any = null
    let testProject: any = null

    for (const project of projects || []) {
        const contacts = project.raw_data?.original?.contacts || []
        const withEmail = contacts.find((c: any) => c.email && c.email.includes('@'))
        if (withEmail) {
            testContact = withEmail
            testProject = project
            break
        }
    }

    if (!testContact || !testProject) {
        console.error('❌ No contacts with emails found in database')
        return
    }

    console.log(`\n📧 Testing with contact: ${testContact.email}`)
    console.log(`🏨 Project: ${testProject.project_name}`)
    console.log('='.repeat(60))

    try {
        // Generate NEPQ-aligned email
        const email = await generateGrooveNEPQEmail({
            contact: {
                first_name: testContact.first_name || 'There',
                last_name: testContact.last_name || '',
                title: testContact.title || 'Decision Maker',
            },
            project: {
                project_name: testProject.project_name,
                project_type: testProject.project_type || ['hotel'],
                project_stage: testProject.project_stage || 'planning',
                project_value: testProject.project_value,
                city: testProject.city || 'Unknown',
                state: testProject.state || 'US',
            },
            company: { company_name: testContact.company || 'Unknown' },
            nepqContext: {
                isFirstContact: true,
                hasResponded: false,
                engagementLevel: 'low',
                painIdentified: false,
                solutionPresented: false,
            },
        })

        console.log('\n✅ NEPQ Email Generated Successfully!\n')
        console.log('='.repeat(60))
        console.log('📊 NEPQ METADATA:')
        console.log('='.repeat(60))
        console.log(`   Stage: ${email.nepqStage}`)
        console.log(`   Alignment Score: ${email.nepqAlignmentScore}/100`)
        console.log(`   Value Props: ${email.groovValueProps?.join(', ') || 'None'}`)
        console.log(`   Pain Points: ${email.painPointsAddressed?.join(', ') || 'None'}`)
        console.log(`   Products: ${email.productsMentioned?.join(', ') || 'None'}`)

        console.log('\n' + '='.repeat(60))
        console.log('📧 GENERATED EMAIL:')
        console.log('='.repeat(60))
        console.log(`\nSubject: ${email.subject}`)
        console.log(`\n${email.body}`)

        console.log('\n' + '='.repeat(60))
        console.log('📋 ADDITIONAL INFO:')
        console.log('='.repeat(60))
        console.log(`   Best Send Time: ${email.best_send_time}`)
        console.log(`   Follow-up Days: ${email.follow_up_days}`)

        if (email.languageValidation) {
            console.log(`   Language Valid: ${email.languageValidation.isValid}`)
            if (email.languageValidation.issues?.length) {
                console.log(`   Issues: ${email.languageValidation.issues.join(', ')}`)
            }
        }

        console.log('\n🎉 NEPQ Integration Test PASSED!\n')

    } catch (err: any) {
        console.error('❌ Error generating NEPQ email:', err.message)
        console.error(err.stack)
    }
}

testNEPQEmailGeneration()
