
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send'

interface SendGridEmailParams {
    to: string
    subject: string
    html: string
    text?: string
    from?: { email: string; name: string }
    replyTo?: { email: string; name: string }
    customArgs?: Record<string, string>
    categories?: string[]
}

export async function sendEmailWithSendGrid(params: SendGridEmailParams): Promise<boolean> {
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
        console.error('❌ SENDGRID_API_KEY is missing via process.env.')
        return false
    }

    // Default Sender - Mike Sartain at Groove
    // SENDGRID_FROM_EMAIL must be a verified sender identity in SendGrid
    // For Groove: msartain@getgrooven.com should be verified
    const defaultFromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'msartain@getgrooven.com'
    const defaultFromName = process.env.SENDGRID_FROM_NAME || 'Mike Sartain'
    const from = params.from || { email: defaultFromEmail, name: defaultFromName }
    
    // Reply-to goes to Mike so responses come to him
    const replyTo = params.replyTo || { email: 'msartain@getgrooven.com', name: 'Mike Sartain' }

    const body = {
        personalizations: [
            {
                to: [{ email: params.to }],
                custom_args: params.customArgs // Pass metadata to webhook
            }
        ],
        from: from,
        reply_to: replyTo,
        subject: params.subject,
        categories: params.categories,
        content: [
            {
                type: 'text/plain',
                value: params.text || params.html.replace(/<[^>]*>?/gm, '') // Simple strip tags fallback
            },
            {
                type: 'text/html',
                value: params.html
            }
        ],
        tracking_settings: {
            open_tracking: {
                enable: true
            },
            click_tracking: {
                enable: true,
                enable_text: true
            }
        }
    }

    try {
        const response = await fetch(SENDGRID_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('❌ SendGrid Error:', JSON.stringify(errorData, null, 2))
            return false
        }

        return true

    } catch (error) {
        console.error('❌ SendGrid Network Error:', error)
        return false
    }
}
