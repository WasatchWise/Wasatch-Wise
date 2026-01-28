/**
 * HeyGen AI Avatar Integration
 * Generates personalized video messages from Mike Sartain's avatar
 */

interface HeyGenVideoParams {
  contactName: string
  contactTitle: string
  projectName: string
  projectType: string
  location: string
  projectValue: number
  keyBenefit: string
  callToAction: string
}

export async function generatePersonalizedVideoMessage(params: HeyGenVideoParams) {
  const {
    contactName,
    contactTitle,
    projectName,
    projectType,
    location,
    projectValue,
    keyBenefit,
    callToAction
  } = params

  // Personalized script that HeyGen avatar will speak
  const script = generateVideoScript(params)

  // HeyGen API call (you'll need to add your HeyGen API key to .env)
  const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: process.env.HEYGEN_MIKE_AVATAR_ID, // Mike's avatar ID
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: process.env.HEYGEN_MIKE_VOICE_ID, // Mike's voice ID
            speed: 1.0,
            emotion: 'friendly', // Options: friendly, serious, excited
          },
          background: {
            type: 'color',
            value: '#f0f4f8', // Clean, professional background
          },
        },
      ],
      dimension: {
        width: 1280,
        height: 720,
      },
      aspect_ratio: '16:9',
      test: false, // Set to true for testing
    }),
  })

  const result = await heygenResponse.json()

  return {
    video_id: result.data.video_id,
    status: result.data.status,
    video_url: result.data.video_url, // Available when processing is complete
    thumbnail_url: result.data.thumbnail_url,
    script: script,
    estimated_completion: new Date(Date.now() + 60000), // Usually ~1 minute
  }
}

function generateVideoScript(params: HeyGenVideoParams): string {
  const {
    contactName,
    contactTitle,
    projectName,
    projectType,
    location,
    projectValue,
    keyBenefit,
    callToAction
  } = params

  // Format numbers nicely
  const formattedValue = projectValue >= 1000000
    ? `$${(projectValue / 1000000).toFixed(1)} million`
    : `$${(projectValue / 1000).toFixed(0)}K`

  // Personalized, natural script
  const script = `Hey ${contactName.split(' ')[0]},

Mike Sartain here from Groove Technologies.

I came across the ${projectName} project in ${location}, and I had to reach out.

As a ${contactTitle} working on a ${formattedValue} ${projectType} project, I know you're juggling a million decisions right now. But here's something that caught my eye...

${keyBenefit}

Look, I'm not here to add to your vendor list. I'm here because we've done this exact type of project dozens of times, and our clients consistently tell us we're the easiest decision they made.

One conversation. Fifteen minutes. ${callToAction}

I'll show you exactly how we can deliver on time, under budget, and with zero headaches.

Sound good? Just hit reply or grab time on my calendar. I'll make it worth your while.

Talk soon,
Mike`

  return script
}

export async function checkVideoStatus(videoId: string) {
  const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
    headers: {
      'X-Api-Key': process.env.HEYGEN_API_KEY || '',
    },
  })

  const result = await response.json()

  return {
    status: result.data.status, // 'pending', 'processing', 'completed', 'failed'
    video_url: result.data.video_url,
    thumbnail_url: result.data.thumbnail_url,
    duration: result.data.duration,
  }
}

export async function embedVideoInEmail(videoUrl: string, thumbnailUrl: string, contactName: string): Promise<string> {
  // Returns HTML for email with embedded video
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h2 style="color: white; margin: 0;">Personal Message for ${contactName}</h2>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Hey ${contactName.split(' ')[0]}, I recorded a quick personal message for you about your project...
        </p>

        <div style="position: relative; border-radius: 8px; overflow: hidden; margin: 20px 0;">
          <a href="${videoUrl}" target="_blank" style="display: block; position: relative;">
            <img src="${thumbnailUrl}" alt="Video Message" style="width: 100%; height: auto; display: block;" />
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
              <div style="width: 0; height: 0; border-left: 25px solid #667eea; border-top: 15px solid transparent; border-bottom: 15px solid transparent; margin-left: 5px;"></div>
            </div>
          </a>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center; margin-top: 15px;">
          👆 Click to watch (1 minute)
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Quick to chat?</p>
          <a href="https://calendly.com/mike-groove" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Schedule 15 Minutes
          </a>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
          <p style="margin: 0; font-size: 13px; color: #666;">
            <strong>P.S.</strong> - I keep these videos private. This link is just for you.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
        <p>Mike Sartain | Senior Account Executive</p>
        <p>Groove Technologies | 📱 <a href="tel:+1234567890" style="color: #667eea;">(123) 456-7890</a></p>
      </div>
    </div>
  `
}

/**
 * Advanced: Generate multiple video variants for A/B testing
 */
export async function generateVideoVariants(params: HeyGenVideoParams) {
  // Different emotional tones and approaches
  const variants = [
    {
      name: 'friendly_consultative',
      emotion: 'friendly',
      style: 'casual',
      approach: 'consultative'
    },
    {
      name: 'confident_direct',
      emotion: 'serious',
      style: 'professional',
      approach: 'direct'
    },
    {
      name: 'excited_social_proof',
      emotion: 'excited',
      style: 'energetic',
      approach: 'social_proof'
    },
  ]

  const videoPromises = variants.map(variant => {
    // Adjust script based on variant
    const adjustedScript = generateVideoScript({
      ...params,
      // Modify keyBenefit and callToAction based on variant
    })

    return generatePersonalizedVideoMessage({
      ...params,
      // Pass variant preferences to HeyGen
    })
  })

  return Promise.all(videoPromises)
}

/**
 * Smart recommendations: Which prospects should get video?
 */
export function shouldUseVideoOutreach(project: any, contact: any): boolean {
  // High-value projects deserve video
  if (project.project_value >= 5000000) return true

  // Decision makers deserve video
  if (contact.decision_level === 'primary') return true

  // Hot leads (high score) deserve video
  if (project.groove_fit_score >= 85) return true

  // Second touchpoint after no response
  if (contact.contact_count >= 1 && contact.response_status === 'no_response') return true

  return false
}

/**
 * Track video engagement
 */
export interface VideoEngagement {
  video_id: string
  contact_id: string
  opened: boolean
  watch_duration: number
  completion_rate: number
  clicked_cta: boolean
  timestamp: Date
}

export async function trackVideoEngagement(engagement: VideoEngagement) {
  // Store in database
  // Update contact engagement score
  // Trigger follow-up workflows based on engagement

  return {
    engagement_score_increase: calculateEngagementBoost(engagement),
    recommended_follow_up: getFollowUpRecommendation(engagement),
  }
}

function calculateEngagementBoost(engagement: VideoEngagement): number {
  let boost = 0

  if (engagement.opened) boost += 10
  if (engagement.completion_rate > 0.75) boost += 20
  if (engagement.completion_rate === 1.0) boost += 10
  if (engagement.clicked_cta) boost += 30

  return boost
}

function getFollowUpRecommendation(engagement: VideoEngagement): string {
  if (engagement.clicked_cta) {
    return 'HOT! Follow up immediately - they clicked the CTA!'
  }

  if (engagement.completion_rate > 0.8) {
    return 'Warm lead - they watched most of the video. Follow up within 24 hours.'
  }

  if (engagement.opened && engagement.completion_rate < 0.3) {
    return 'Mild interest - they opened but didn\'t watch much. Try different approach.'
  }

  if (!engagement.opened) {
    return 'No engagement yet. Wait 3 days, then send follow-up email.'
  }

  return 'Monitor for engagement over next 48 hours.'
}
