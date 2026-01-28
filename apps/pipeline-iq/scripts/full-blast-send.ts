/**
 * FULL BLAST EMAIL SEND
 * Sends personalized NEPQ emails to ALL contacts with email addresses
 * No drip limits - sends everything NOW with full tracking
 */

import { createClient } from '@supabase/supabase-js'
import { sendEmailWithSendGrid } from '../lib/utils/sendgrid'
import { config } from 'dotenv'

config({ path: '.env.local' })

// --- BRANDED HTML EMAIL CONFIGURATION ---
const MIKE_SIGNATURE = {
    name: 'Mike Sartain',
    title: 'National Sales Executive',
    company: 'Groove Technology Solutions',
    phone: '801-396-6534',
    email: 'msartain@getgrooven.com',
    website: 'getgrooven.com'
}

const GROOVE_BRAND_COLOR = '#0082CA'
const GOOGLE_REVIEWS_RATING = '4.9'
const GOOGLE_REVIEWS_COUNT = '920+'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate NEPQ-style personalized email based on contact info
 */
function generateNEPQEmail(contact: {
    first_name: string | null
    last_name: string | null
    title: string | null
    email: string
}): { subject: string; body: string } {
    const firstName = contact.first_name || 'there'
    const title = contact.title?.toLowerCase() || ''
    
    // Determine role-based messaging
    const isExecutive = title.includes('president') || title.includes('ceo') || title.includes('owner') || title.includes('principal')
    const isVP = title.includes('vp') || title.includes('vice president') || title.includes('director')
    const isGM = title.includes('general manager') || title.includes('gm') || title.includes('manager')
    const isDev = title.includes('development') || title.includes('construction') || title.includes('project')
    
    let hook: string
    let problem: string
    
    if (isExecutive) {
        hook = `As someone running the show, you're probably juggling a lot of vendor relationships for technology infrastructure - WiFi, TV, phones, access control.`
        problem = `Most owners I talk to describe it as "vendor sprawl" - too many hands in the pot, nobody owns the outcome.`
    } else if (isVP || isDev) {
        hook = `In your role overseeing development and operations, you've probably seen how technology coordination becomes a headache across properties.`
        problem = `Multiple vendors, finger-pointing when things break, and contracts that don't align - it adds up.`
    } else if (isGM) {
        hook = `Running day-to-day operations, you're probably the one who hears about it first when the WiFi goes down or the TV system acts up.`
        problem = `And when you call the vendor, it's always "not our problem" - meanwhile guests are complaining.`
    } else {
        hook = `Quick question — are you involved in any upcoming projects where technology infrastructure (WiFi, TV, phone) is being planned?`
        problem = `We help teams consolidate vendors and cut costs while improving reliability.`
    }
    
    const subject = `Quick question, ${firstName}`
    
    const body = `Hi ${firstName},

${hook}

${problem}

Groove simplifies this by bringing it all "under one roof." We handle the entire hospitality technology stack (DirecTV, Internet, Phone Systems, Access Control) so you have one partner, one point of contact.

If it makes sense, I can share a quick overview.

Best,
Mike

Reply to this email or reach me at msartain@getgrooven.com / 801-396-6534.`

    return { subject, body }
}

/**
 * Build rich branded HTML email
 */
function buildBrandedHtmlEmail(plainTextBody: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pipelineiq.net'
    const logoUrl = `${baseUrl}/assets/unnamed.png`
    const ctaLink = `${baseUrl}/groove-in-45-seconds?vertical=hospitality`
    
    const bodyHtml = plainTextBody
        .split('\n\n')
        .map(p => `<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`)
        .join('')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message from ${MIKE_SIGNATURE.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Logo Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 3px solid ${GROOVE_BRAND_COLOR};">
              <img src="${logoUrl}" alt="Groove Technology Solutions" style="height: 40px; max-width: 180px;" />
            </td>
          </tr>
          <!-- Email Body -->
          <tr>
            <td style="padding: 32px;">
              ${bodyHtml}
              <!-- CTA Card -->
              <div style="margin: 28px 0; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border-left: 4px solid ${GROOVE_BRAND_COLOR};">
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px;">
                  I've put together a quick <strong>Groove overview</strong> that answers the most common questions.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 6px; background-color: ${GROOVE_BRAND_COLOR};">
                      <a href="${ctaLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">
                        ▶ View Groove Overview
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <tr>
                  <td style="padding-top: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 24px;">
                          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #333333;">${MIKE_SIGNATURE.name}</p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">${MIKE_SIGNATURE.title}</p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: ${GROOVE_BRAND_COLOR}; font-weight: 500;">${MIKE_SIGNATURE.company}</p>
                          <p style="margin: 0 0 2px 0; font-size: 14px;">📞 ${MIKE_SIGNATURE.phone}</p>
                          <p style="margin: 0 0 2px 0; font-size: 14px;">✉️ <a href="mailto:${MIKE_SIGNATURE.email}" style="color: ${GROOVE_BRAND_COLOR};">${MIKE_SIGNATURE.email}</a></p>
                          <p style="margin: 0; font-size: 14px;">🌐 <a href="https://${MIKE_SIGNATURE.website}" style="color: ${GROOVE_BRAND_COLOR};">${MIKE_SIGNATURE.website}</a></p>
                        </td>
                        <td style="vertical-align: top; padding-left: 24px; border-left: 1px solid #e5e7eb;">
                          <div style="text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Google Reviews</p>
                            <p style="margin: 0 0 2px 0; font-size: 24px; font-weight: 700; color: #333333;">${GOOGLE_REVIEWS_RATING} ⭐</p>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">${GOOGLE_REVIEWS_COUNT} Reviews</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                Property Technology Solutions - In-house from Beginning to End
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

async function fullBlastSend() {
    console.log('🚀 FULL BLAST EMAIL SEND')
    console.log('📧 Sending to ALL contacts with email addresses')
    console.log('🎨 Rich branded HTML with full tracking\n')

    // 1. Get all already-sent emails to avoid duplicates
    const { data: alreadySent } = await supabase
        .from('outreach_activities')
        .select('metadata->>recipient_email')
        .eq('activity_type', 'email')
        .eq('status', 'sent')
    
    const sentEmails = new Set(alreadySent?.map(a => (a as any)['metadata->>recipient_email']).filter(Boolean) || [])
    console.log(`📋 Already sent to ${sentEmails.size} unique emails (will skip these)`)

    // 2. Get SendGrid suppression list (bounces, blocks, unsubscribes)
    const suppressedEmails = new Set<string>()
    try {
        // Fetch bounces
        const bouncesRes = await fetch('https://api.sendgrid.com/v3/suppression/bounces', {
            headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
        })
        if (bouncesRes.ok) {
            const bounces = await bouncesRes.json()
            bounces.forEach((b: any) => suppressedEmails.add(b.email?.toLowerCase()))
        }
        
        // Fetch blocks
        const blocksRes = await fetch('https://api.sendgrid.com/v3/suppression/blocks', {
            headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
        })
        if (blocksRes.ok) {
            const blocks = await blocksRes.json()
            blocks.forEach((b: any) => suppressedEmails.add(b.email?.toLowerCase()))
        }
        
        // Fetch global unsubscribes
        const unsubRes = await fetch('https://api.sendgrid.com/v3/suppression/unsubscribes', {
            headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` }
        })
        if (unsubRes.ok) {
            const unsubs = await unsubRes.json()
            unsubs.forEach((u: any) => suppressedEmails.add(u.email?.toLowerCase()))
        }
        
        console.log(`🚫 SendGrid suppressions: ${suppressedEmails.size} emails will be skipped`)
    } catch (e) {
        console.log('⚠️ Could not fetch SendGrid suppressions, continuing anyway')
    }

    // 3. Fetch all contacts with emails
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email, title, organization_id')
        .not('email', 'is', null)
        .neq('email', '')
        .or('response_status.is.null,response_status.not.in.(unsubscribed,bounced)')
    
    if (error) {
        console.error('❌ Failed to fetch contacts:', error)
        return
    }

    console.log(`📦 Found ${contacts?.length || 0} total contacts with emails`)

    // Filter out already sent and suppressed
    const toSend = (contacts || []).filter(c => {
        const email = c.email?.toLowerCase()
        if (!email) return false
        if (sentEmails.has(email)) return false
        if (suppressedEmails.has(email)) return false
        return true
    })

    console.log(`✅ ${toSend.length} contacts to send (after filtering)\n`)

    if (toSend.length === 0) {
        console.log('🎉 All contacts have already been emailed!')
        return
    }

    // Confirmation
    console.log('=' .repeat(50))
    console.log(`⚡ SENDING ${toSend.length} EMAILS NOW`)
    console.log('=' .repeat(50))
    console.log('')

    const orgId = process.env.ORGANIZATION_ID || '34249404-774f-4b80-b346-a2d9e6322584'
    
    let sentCount = 0
    let failedCount = 0
    let skippedCount = 0

    // 4. Send to each contact
    for (let i = 0; i < toSend.length; i++) {
        const contact = toSend[i]
        const progress = `[${i + 1}/${toSend.length}]`
        
        try {
            // Generate personalized email
            const { subject, body } = generateNEPQEmail(contact)
            const richHtml = buildBrandedHtmlEmail(body)

            // Create activity record FIRST (for webhook tracking)
            const { data: activity, error: activityError } = await supabase
                .from('outreach_activities')
                .insert({
                    organization_id: orgId,
                    contact_id: contact.id,
                    activity_type: 'email',
                    subject: subject,
                    message_body: body,
                    status: 'pending',
                    metadata: {
                        recipient_email: contact.email,
                        recipient_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
                        title: contact.title,
                        sent_via: 'full_blast_send'
                    }
                })
                .select('id')
                .single()

            if (activityError) {
                console.log(`${progress} ⚠️ Activity creation failed for ${contact.email}, skipping`)
                skippedCount++
                continue
            }

            // Send email with activity_id for webhook tracking
            const success = await sendEmailWithSendGrid({
                to: contact.email,
                subject: subject,
                html: richHtml,
                text: body,
                customArgs: {
                    activity_id: activity.id,
                    contact_id: contact.id
                }
            })

            if (success) {
                // Update activity to sent
                await supabase
                    .from('outreach_activities')
                    .update({ status: 'sent', created_at: new Date().toISOString() })
                    .eq('id', activity.id)

                console.log(`${progress} ✅ ${contact.first_name || contact.email}`)
                sentCount++
            } else {
                // Update activity to failed
                await supabase
                    .from('outreach_activities')
                    .update({ status: 'failed' })
                    .eq('id', activity.id)

                console.log(`${progress} ❌ ${contact.email} - SendGrid failed`)
                failedCount++
            }

            // Small delay to avoid rate limits (100ms between emails)
            await new Promise(r => setTimeout(r, 100))

            // Progress update every 50 emails
            if ((i + 1) % 50 === 0) {
                console.log(`\n📊 Progress: ${sentCount} sent, ${failedCount} failed, ${skippedCount} skipped\n`)
            }

        } catch (err) {
            console.log(`${progress} ❌ ${contact.email} - Error: ${err}`)
            failedCount++
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('🏁 FULL BLAST COMPLETE')
    console.log('='.repeat(50))
    console.log(`✅ Sent: ${sentCount}`)
    console.log(`❌ Failed: ${failedCount}`)
    console.log(`⏭️ Skipped: ${skippedCount}`)
    console.log('='.repeat(50))
    console.log('\n🔔 Mike will receive warm call notifications as people engage!')
}

fullBlastSend()
