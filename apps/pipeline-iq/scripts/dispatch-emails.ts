import { createClient } from '@supabase/supabase-js'
import { sendEmailWithSendGrid } from '../lib/utils/sendgrid'
import { config } from 'dotenv'

// Load env vars for local testing
config({ path: '.env.local' })

// --- BRANDED HTML EMAIL CONFIGURATION ---
// Mike's signature for rich HTML emails
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

/**
 * Build rich branded HTML email with Groove styling
 * Features: Logo header, brand colors, CTA button, signature, reviews badge
 */
function buildBrandedHtmlEmail(plainTextBody: string, assetLink?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pipelineiq.net')
    
    // Use PNG logo for email client compatibility (SVGs don't render in Outlook)
    const logoUrl = `${baseUrl}/assets/unnamed.png`
    const ctaLink = assetLink || `${baseUrl}/groove-in-45-seconds`
    
    // Convert plain text to HTML paragraphs
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
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Message from ${MIKE_SIGNATURE.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">

        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

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

              <!-- Asset Link Section / CTA Card -->
              <div style="margin: 28px 0; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border-left: 4px solid ${GROOVE_BRAND_COLOR};">
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px; line-height: 1.5;">
                  I've put together a quick <strong>Groove overview</strong> that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.
                </p>
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                  This way you can see if we're relevant before we even talk.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 6px; background-color: ${GROOVE_BRAND_COLOR};">
                      <a href="${ctaLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                        ▶ View Groove Overview
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Signature Block -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <tr>
                  <td style="padding-top: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Signature Info -->
                        <td style="vertical-align: top; padding-right: 24px;">
                          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #333333;">${MIKE_SIGNATURE.name}</p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">${MIKE_SIGNATURE.title}</p>
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: ${GROOVE_BRAND_COLOR}; font-weight: 500;">${MIKE_SIGNATURE.company}</p>
                          <p style="margin: 0 0 2px 0; font-size: 14px; color: #333333;">📞 <a href="tel:${MIKE_SIGNATURE.phone}" style="color: #333333; text-decoration: none;">${MIKE_SIGNATURE.phone}</a></p>
                          <p style="margin: 0 0 2px 0; font-size: 14px; color: #333333;">✉️ <a href="mailto:${MIKE_SIGNATURE.email}" style="color: ${GROOVE_BRAND_COLOR}; text-decoration: none;">${MIKE_SIGNATURE.email}</a></p>
                          <p style="margin: 0; font-size: 14px; color: #333333;">🌐 <a href="https://${MIKE_SIGNATURE.website}" style="color: ${GROOVE_BRAND_COLOR}; text-decoration: none;">${MIKE_SIGNATURE.website}</a></p>
                        </td>

                        <!-- Google Reviews Badge -->
                        <td style="vertical-align: top; padding-left: 24px; border-left: 1px solid #e5e7eb;">
                          <div style="text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Google Reviews</p>
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

// --- CONFIGURATION ---
// "Pipeline IQ" Mode: Continuous Drip
// Hourly Send Rate: ~6 emails/hour = ~144/day
const HOURLY_BATCH_SIZE = parseInt(process.env.HOURLY_BATCH_SIZE || '6')
const FORCE_RUN = process.argv.includes('--force')

// --- TIMEZONE MAP ---
const US_TIMEZONES: Record<string, string> = {
    // Eastern
    'CT': 'America/New_York', 'DE': 'America/New_York', 'DC': 'America/New_York', 'FL': 'America/New_York', 'GA': 'America/New_York', 'IN': 'America/New_York', 'KY': 'America/New_York', 'ME': 'America/New_York', 'MD': 'America/New_York', 'MA': 'America/New_York', 'MI': 'America/New_York', 'NH': 'America/New_York', 'NJ': 'America/New_York', 'NY': 'America/New_York', 'NC': 'America/New_York', 'OH': 'America/New_York', 'PA': 'America/New_York', 'RI': 'America/New_York', 'SC': 'America/New_York', 'TN': 'America/New_York', 'VT': 'America/New_York', 'VA': 'America/New_York', 'WV': 'America/New_York',
    // Central
    'AL': 'America/Chicago', 'AR': 'America/Chicago', 'IL': 'America/Chicago', 'IA': 'America/Chicago', 'KS': 'America/Chicago', 'LA': 'America/Chicago', 'MN': 'America/Chicago', 'MS': 'America/Chicago', 'MO': 'America/Chicago', 'NE': 'America/Chicago', 'ND': 'America/Chicago', 'OK': 'America/Chicago', 'SD': 'America/Chicago', 'TX': 'America/Chicago', 'WI': 'America/Chicago',
    // Mountain
    'AZ': 'America/Phoenix', 'CO': 'America/Denver', 'ID': 'America/Denver', 'MT': 'America/Denver', 'NM': 'America/Denver', 'UT': 'America/Denver', 'WY': 'America/Denver',
    // Pacific
    'CA': 'America/Los_Angeles', 'NV': 'America/Los_Angeles', 'OR': 'America/Los_Angeles', 'WA': 'America/Los_Angeles',
    // Other
    'AK': 'America/Anchorage', 'HI': 'Pacific/Honolulu'
}

// --- SETUP ---
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function dispatch() {
    console.log("🚀 PIPELINE IQ: Hourly Dispatcher")
    console.log("📅 Mode: Smart Research (Timezone & Weekend Aware)")
    console.log("🎨 Email Format: Rich Branded HTML (Groove logo, signature, reviews badge)")

    // 1. Fetch Pending Queue with Project Location
    // We fetch a bit more than batch size to allow for skipping
    const { data: queue, error } = await supabase
        .from('outreach_queue')
        .select(`
            *,
            project:projects(state)
        `)
        .eq('status', 'pending')
        .order('priority_score', { ascending: false }) // Hot leads first
        .limit(HOURLY_BATCH_SIZE * 3) // Fetch extra in case we skip many

    if (error) {
        console.error("❌ DB Error:", error)
        return
    }

    if (!queue || queue.length === 0) {
        console.log("✅ Queue Empty: Feeding the pipeline...")
        return
    }

    console.log(`📦 Found ${queue.length} pending emails. Analyzing timing...`)

    let sentCount = 0
    let failedCount = 0
    let skippedCount = 0

    // 2. Process Queue
    for (const item of queue) {
        // Stop if we hit batch limit
        if (sentCount >= HOURLY_BATCH_SIZE) break

        const projectState = item.project?.state
        const timeZone = US_TIMEZONES[projectState] || 'America/Los_Angeles' // Default to our time (PST) if unknown

        // Get Local Time for Recipient
        const now = new Date()
        const localTimeStr = now.toLocaleString('en-US', { timeZone, hour12: false })
        const localDate = new Date(localTimeStr)
        const localDay = localDate.getDay() // 0=Sun, 1=Mon...
        const localHour = localDate.getHours()
        const localMinute = localDate.getMinutes()
        const localTimeFloat = localHour + (localMinute / 60)

        // LOGIC: Smart & Human
        // 1. SLEEP GUARD: Never send between 9 PM and 8 AM (Avoid 2 AM "Stupid Automaton" vibes)
        // 2. WEEKNIGHT/SAT CAP: Stop at 7:00 PM (19:00)
        // 3. SUNDAY SPECIAL: Only send after 7:30 PM (19:30)

        const isSunday = localDay === 0
        const isSleepHours = localHour >= 21 || localHour < 8 // 9 PM - 8 AM

        let blocked = false
        let reason = ''

        if (isSleepHours) {
            blocked = true
            reason = `Sleep Guard (${localHour}:${localMinute})`
        } else if (isSunday) {
            // Sunday: Block BEFORE 7:30 PM
            if (localTimeFloat < 19.5) {
                blocked = true
                reason = `Sunday Morning/Afternoon Block (${localHour}:${localMinute})`
            }
        } else {
            // Mon-Sat: Block AFTER 7:00 PM
            if (localHour >= 19) {
                blocked = true
                reason = `Evening Cap 7PM (${localHour}:${localMinute})`
            }
        }

        if (blocked && !FORCE_RUN) {
            console.log(`⏸️ Skipping ${item.recipient_email}: ${reason} [State: ${projectState}]`)
            skippedCount++
            continue
        }


        // --- CONTENT PERSONALIZATION (Context-Aware) ---
        let finalSubject = item.email_subject
        let finalBody = item.email_body

        // SUNDAY SCARIES (Evening)
        if (isSunday && !blocked) {
            console.log("   ✨ Applying 'Sunday Scaries' NEPQ Context...")
            // Inject a Sunday-specific opening hook
            // We assume the body starts with "Hi [Name]," or similar.
            // We want to pivot to: "Hi [Name], avoiding the Sunday Scaries?"

            // Simple string injection for now (NEPQ "Connection" phase)
            const sundayIntro = `\n\n(Sent this on Sunday evening to get ahead of the week - hope it helps quiet any "Sunday Scaries" regarding this project!)\n\n`

            // If body starts with a greeting, insert after it.
            const greetingMatch = finalBody.match(/^(Hi|Hello|Dear)\s+.*?,/i)
            if (greetingMatch) {
                const greeting = greetingMatch[0]
                finalBody = finalBody.replace(greeting, `${greeting}${sundayIntro}`)
            } else {
                finalBody = `Hope you're having a relaxing Sunday.\n\n${finalBody}`
            }
        }

        // SATURDAY (Weekend Warrior / Low Pressure)
        // If it's Saturday, we acknowledge it to "Pull Back" (NEPQ) and remove pressure to reply immediately.
        if (localDay === 6 && !blocked) {
            console.log("   ✨ Applying 'Saturday Low-Pressure' NEPQ Context...")
            const saturdayIntro = `\n\n(I know it's the weekend, so please feel free to push this to Monday. Just wanted to get it to you while I was thinking about it.)\n\n`

            const greetingMatch = finalBody.match(/^(Hi|Hello|Dear)\s+.*?,/i)
            if (greetingMatch) {
                finalBody = finalBody.replace(greetingMatch[0], `${greetingMatch[0]}${saturdayIntro}`)
            }
        }

        console.log(`\n📨 Engaging: ${item.recipient_email} (${projectState || '??'} Local: ${localHour}:${localMinute < 10 ? '0' + localMinute : localMinute})`)

        // Build rich branded HTML email with Groove logo, signature, and reviews badge
        const assetLink = item.metadata?.asset_link || undefined
        const richHtml = buildBrandedHtmlEmail(finalBody, assetLink)

        // Send with both rich HTML and plain text fallback
        const success = await sendEmailWithSendGrid({
            to: item.recipient_email,
            subject: finalSubject,
            html: richHtml,
            text: finalBody,
            customArgs: {
                queue_id: item.id,
                project_id: item.project_id
            }
        })

        // Update DB & Log Activity
        if (success) {
            // 1. Update Queue Status
            await supabase
                .from('outreach_queue')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString()
                })
                .eq('id', item.id)

            // 2. The Listener: Log to Outreach Activities
            // We try to find the contact_id if possible, otherwise just log the email
            // Use the Organization ID from environment or fallback to the Groove ID
            const orgId = process.env.ORGANIZATION_ID || '34249404-774f-4b80-b346-a2d9e6322584'

            await supabase
                .from('outreach_activities')
                .insert({
                    organization_id: orgId,
                    project_id: item.project_id,
                    // contact_id: item.metadata?.contact_id || null, // If we had it
                    activity_type: 'email',
                    subject: item.email_subject,
                    message_body: item.email_body,
                    status: 'sent',
                    metadata: {
                        recipient_email: item.recipient_email,
                        queue_id: item.id,
                        sent_hour_local: localHour,
                        sent_day_local: localDay,
                        timezone: timeZone,
                        ...item.metadata
                    }
                })

            console.log("   ✅ SENT & LOGGED")
            sentCount++
        } else {
            await supabase
                .from('outreach_queue')
                .update({
                    status: 'failed',
                    error_message: 'SendGrid API Failed'
                })
                .eq('id', item.id)

            console.log("   ❌ FAILED")
            failedCount++
        }

        // Safety Delay (2 seconds between sends)
        await new Promise(r => setTimeout(r, 2000))
    }

    // 4. Summary
    console.log("\n==================================")
    console.log(`🏁 BATCH COMPLETE`)
    console.log(`✅ Sent: ${sentCount}`)
    console.log(`⏭️ Skipped (Timing): ${skippedCount}`)
    console.log(`❌ Failed: ${failedCount}`)
    console.log("==================================")
}

dispatch()
