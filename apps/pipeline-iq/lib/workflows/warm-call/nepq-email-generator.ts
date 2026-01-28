/**
 * NEPQ Email Generator for Warm Call Workflow
 * Generates emails using Neuro-Emotional Persuasion Questioning principles
 * Includes: Hook, Problem (Vendor Sprawl), Asset Link, Soft CTA
 *
 * Now with branded HTML templates featuring:
 * - Groove logo and brand colors
 * - Professional signature block
 * - Google reviews social proof
 * - Mobile-responsive design
 */

import { generateVerticalEmail, ProjectContext, ContactContext, SequenceContext } from '@/lib/nepq/vertical-email-generator'
import { VerticalClassification } from './vertical-classifier'
import { getOrganizationConfig, OrganizationConfig, GROOVE_CONFIG } from '@/lib/config/organization'

export interface NEPQEmailPayload {
  subject: string
  body: string
  html: string
  painPoints: string[]
  vertical: string
  assetLink: string
  metadata: {
    projectName: string
    contactName: string
    verticalClassification: VerticalClassification
    generatedAt: string
  }
}

// Groove overview asset link
// Hosted on PipelineIQ domain (this app), not Groove's domain
// Supports vertical-specific URLs: /groove-in-45-seconds?vertical=hospitality
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://pipelineiq.net'

function getGroove45SecondsLink(classification: VerticalClassification): string {
  // Default to this PipelineIQ app's domain/URL
  // Override with GROOVE_45_SECONDS_LINK if you want a custom domain
  const defaultLink = `${BASE_URL}/groove-in-45-seconds`
  const baseLink = process.env.GROOVE_45_SECONDS_LINK || defaultLink

  // Use the grooveVertical from classification for URL parameter
  if (classification.grooveVertical && classification.grooveVertical !== 'multifamily') {
    return `${baseLink}?vertical=${classification.grooveVertical}`
  }

  return baseLink
}

/**
 * Generate NEPQ-compliant email for warm call workflow
 */
export async function generateNEPQEmail(
  project: ProjectContext,
  contact: ContactContext,
  classification: VerticalClassification,
  organizationId?: string
): Promise<NEPQEmailPayload> {
  // Generate vertical-specific link
  const assetLink = getGroove45SecondsLink(classification)
  // Generate the base email using vertical intelligence
  const sequenceContext: SequenceContext = {
    sequencePosition: 0, // First email
    engagementLevel: 'none',
  }

  const generatedEmail = generateVerticalEmail(
    project,
    contact,
    sequenceContext,
    {} // Nearby context can be enriched later
  )

  // Get organization config for personalization and branding
  let orgConfig: OrganizationConfig = GROOVE_CONFIG
  try {
    orgConfig = await getOrganizationConfig(organizationId)
  } catch (error) {
    console.warn('Failed to fetch org config, using defaults')
  }

  const signals = (project as any)?.signals || (project as any)?.rawSignals || null
  // Build the hook (connection) - reference specific scraped data
  const hook = buildHook(project, contact, classification)

  // Build the problem statement (vendor sprawl)
  const problemStatement = buildVendorSprawlProblem(project, classification, signals)

  // Build the asset link section (plain text version)
  const assetLinkSection = buildAssetLinkSection(assetLink)

  // Build the soft CTA
  const softCTA = buildSoftCTA(project, contact)
  const contactLine = buildContactLine(orgConfig)

  // Construct the full email body - simple, not salesy (plain text version)
  const emailBody = `${hook}

${problemStatement}

${assetLinkSection}

${softCTA}

${contactLine}`

  // Build branded HTML version with logo, colors, signature, and reviews badge
  const htmlBody = buildBrandedHTMLEmail(
    hook,
    problemStatement,
    assetLink,
    orgConfig
  )

  // Subject line per playbook: "Quick question re: [Project Name] / Low Voltage"
  const vendorGap = !!signals?.vendor_gaps?.low_voltage || !!signals?.vendorGapLowVoltage
  const subject = vendorGap
    ? `Quick question re: ${project.projectName} / Low Voltage`
    : `Quick question re: ${project.projectName}`

  return {
    subject,
    body: emailBody,
    html: htmlBody,
    painPoints: classification.painPoints,
    vertical: classification.verticalName,
    assetLink,
    metadata: {
      projectName: project.projectName,
      contactName: `${contact.firstName} ${contact.lastName || ''}`.trim(),
      verticalClassification: classification,
      generatedAt: new Date().toISOString(),
      // Additional metadata stored separately
      grooveVertical: classification.grooveVertical,
      grooveBundle: classification.grooveBundle,
    } as any,
  }
}

/**
 * Build the hook - connection based on scraped data
 */
function buildHook(
  project: ProjectContext,
  contact: ContactContext,
  classification: VerticalClassification
): string {
  const firstName = contact.firstName || 'there'
  const projectName = project.projectName
  const location = project.city && project.state ? `${project.city}, ${project.state}` : null
  const stage = (project.projectStage || '').trim()

  return `Hi ${firstName},

I’m not sure if this is relevant to you right now, but I noticed ${projectName}${location ? ` in ${location}` : ''}${stage ? ` is moving into ${stage}` : ''}.`
}

/**
 * Build the vendor sprawl problem statement - Groove's core value prop
 */
function buildVendorSprawlProblem(
  project: ProjectContext,
  classification: VerticalClassification,
  signals?: any
): string {
  const vendorGap = !!signals?.vendor_gaps?.low_voltage || !!signals?.vendorGapLowVoltage

  const stage = (project.projectStage || '').toLowerCase()
  const timingLine =
    stage.includes('planning') || stage.includes('design') || stage.includes('permit')
      ? `Typically, when teams get into planning/design, the “vendor sprawl” problem starts.`
      : stage.includes('shell') || stage.includes('early') || stage.includes('foundation') || stage.includes('pre')
        ? `Typically, once the shell is underway, teams start wrestling with coordination and schedule risk.`
        : `Typically, when projects hit this stage, coordination is where change orders show up.`

  const vendorGapLine = vendorGap
    ? `It also looks like the GC is in place, but the low-voltage/technology partner may not be locked in yet.`
    : null

  const seasonalHook = buildSeasonalHook(project.city, project.state)

  return `${timingLine}

Are you already set with a unified plan to handle Wi‑Fi/internet, TV, access control, and low‑voltage — or are you still piecing together different subcontractors?
${seasonalHook ? `\n${seasonalHook}` : ''}
${vendorGapLine ? `\n${vendorGapLine}` : ''}`
}

/**
 * Build seasonal/current event hook to show timeliness
 * Now includes Hyper-Local Logic for Major Events (Super Bowl, World Cup)
 */
function buildSeasonalHook(city?: string | null, state?: string | null): string | null {
  const month = new Date().getMonth() // 0 = Jan, 11 = Dec
  const cityName = city?.toLowerCase() || ''
  const stateVal = state?.toLowerCase() || ''

  // Hyper-Local: Super Bowl 2026 (Santa Clara / Bay Area) - Feb 2026
  if (month <= 1 && (cityName.includes('santa clara') || cityName.includes('san jose') || cityName.includes('san francisco'))) {
    return "With the Super Bowl coming to Levi's Stadium, the local network demand is going to be unprecedented. Is your property ready?"
  }

  // Hyper-Local: World Cup 2026 (Coming Summer 2026) - Major Hubs
  // Atlanta, Boston, Dallas, Houston, Kansas City, Los Angeles, Miami, New York/NJ, Philadelphia, Seattle, San Francisco
  const worldCupCities = ['atlanta', 'boston', 'dallas', 'houston', 'kansas city', 'los angeles', 'miami', 'new york', 'philadelphia', 'seattle']
  if (worldCupCities.some(c => cityName.includes(c)) || (stateVal.includes('nj') && cityName.includes('east rutherford'))) {
    return "With the World Cup coming to your backyard, international travelers will expect flawless connectivity. Is your infrastructure ready for the world stage?"
  }

  // Jan - March (March Madness)
  if (month >= 0 && month <= 2) {
    return "Especially with March Madness coming up in the spring, residents are going to be streaming heavily. Are you ready for the bandwidth spike?"
  }

  // Aug - Sept (Football)
  if (month >= 7 && month <= 8) {
    return "With football season starting up, residents will be glued to their screens. Is your network ready for the Sunday load?"
  }

  // Nov - Dec (Holidays)
  if (month >= 10 && month <= 11) {
    return "With the holidays approaching, guest device counts are going to skyrocket. Is your guest network ready?"
  }

  return null
}

/**
 * Helper to determine Time Zone (for staggering logic)
 */
export function estimateTimeZone(state?: string): 'ET' | 'CT' | 'MT' | 'PT' {
  if (!state) return 'ET'; // Default

  const s = state.toUpperCase().trim();
  if (['WA', 'OR', 'CA', 'NV'].includes(s)) return 'PT';
  if (['MT', 'ID', 'WY', 'UT', 'CO', 'AZ', 'NM'].includes(s)) return 'MT';
  if (['ND', 'SD', 'NE', 'KS', 'OK', 'TX', 'MN', 'IA', 'MO', 'AR', 'LA', 'WI', 'IL', 'MS', 'AL', 'TN', 'KY'].includes(s)) return 'CT';

  return 'ET'; // Simplified default
}

/**
 * Build the asset link section (reduces cognitive load)
 * This answers the repetitive questions Mike is tired of explaining
 */
function buildAssetLinkSection(link: string): string {
  return `I've put together a quick Groove overview that answers the most common questions: what we do, who we serve (hotels, MDU, new construction), why teams pick us (one roof, one point person, fewer headaches), and what happens next.

Check it out here: ${link}

This way you can see if we're relevant before we even talk.`
}

/**
 * Build the soft CTA (permissive language, avoids reactance)
 * No pricing, no estimates - just interest
 */
function buildSoftCTA(project: ProjectContext, contact: ContactContext): string {
  return `If it’s worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.

Best,
Mike`
}

function buildContactLine(config: OrganizationConfig): string {
  const signature = config.email.signature
  const email = signature.email
  const phone = signature.phone
  return `Reply to this email or reach me at ${email}${phone ? ` / ${phone}` : ''}.`
}

/**
 * Build branded HTML email with Groove styling
 * Features: Logo header, brand colors, CTA button, signature, reviews badge
 */
function buildBrandedHTMLEmail(
  hook: string,
  problemStatement: string,
  assetLink: string,
  config: OrganizationConfig
): string {
  const brandColor = config.branding.primaryColor || '#0082CA'

  // Ensure logo URL is absolute for email clients
  let logoUrl = config.branding.logoUrl || '/assets/Groove%20Logo.svg'
  if (logoUrl && !logoUrl.startsWith('http')) {
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
    const path = logoUrl.startsWith('/') ? logoUrl.slice(1) : logoUrl
    logoUrl = `${baseUrl}/${path}`
  }
  // Encode spaces if present (double check)
  logoUrl = logoUrl.replace(/ /g, '%20')
  const signature = config.email.signature
  const rating = config.branding.googleReviewsRating || '4.9'
  const reviewCount = config.branding.googleReviewsCount || '920+'

  // Convert plain text to HTML paragraphs
  const hookHtml = hook.split('\n\n').map(p =>
    `<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`
  ).join('')

  const problemHtml = problemStatement.split('\n\n').map(p =>
    `<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`
  ).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Message from ${signature.name}</title>
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
            <td style="padding: 24px 32px; border-bottom: 3px solid ${brandColor};">
              ${logoUrl ? `<img src="${logoUrl}" alt="${config.branding.companyName}" style="height: 40px; max-width: 180px;" />` : `<span style="font-size: 24px; font-weight: 700; color: ${brandColor};">${config.branding.companyName}</span>`}
            </td>
          </tr>

          <!-- Email Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Hook / Opening -->
              ${hookHtml}

              <!-- Problem Statement -->
              ${problemHtml}

              <!-- Asset Link Section -->
              <div style="margin: 28px 0; padding: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border-left: 4px solid ${brandColor};">
                <p style="margin: 0 0 12px 0; color: #333333; font-size: 15px; line-height: 1.5;">
                  I've put together a quick <strong>Groove overview</strong> that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.
                </p>
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
                  This way you can see if we're relevant before we even talk.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 6px; background-color: ${brandColor};">
                      <a href="${assetLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                        ▶ View Groove Overview
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Soft CTA -->
              <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                If it's worth a look, happy to do a quick 10 minutes to see if we can help avoid headaches later. If not, no worries.
              </p>
              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Reply to this email or reach me at ${signature.email}${signature.phone ? ` / ${signature.phone}` : ''}.
              </p>

              <!-- Sign-off -->
              <p style="margin: 0; color: #333333; font-size: 16px;">
                Best,<br>
                <strong>${signature.name}</strong>
              </p>

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
                          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #333333;">${signature.name}</p>
                          ${signature.title ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">${signature.title}</p>` : ''}
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: ${brandColor}; font-weight: 500;">${signature.company}</p>
                          ${signature.phone ? `<p style="margin: 0 0 2px 0; font-size: 14px; color: #333333;">📞 <a href="tel:${signature.phone}" style="color: #333333; text-decoration: none;">${signature.phone}</a></p>` : ''}
                          <p style="margin: 0 0 2px 0; font-size: 14px; color: #333333;">✉️ <a href="mailto:${signature.email}" style="color: ${brandColor}; text-decoration: none;">${signature.email}</a></p>
                          ${signature.website ? `<p style="margin: 0; font-size: 14px; color: #333333;">🌐 <a href="${signature.website}" style="color: ${brandColor}; text-decoration: none;">${signature.website.replace('https://', '')}</a></p>` : ''}
                        </td>

                        <!-- Google Reviews Badge -->
                        <td style="vertical-align: top; padding-left: 24px; border-left: 1px solid #e5e7eb;">
                          <div style="text-align: center;">
                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Google Reviews</p>
                            <p style="margin: 0 0 2px 0; font-size: 24px; font-weight: 700; color: #333333;">${rating} ⭐</p>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">${reviewCount} Reviews</p>
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
                ${config.branding.tagline || 'Property Technology Solutions'}
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

