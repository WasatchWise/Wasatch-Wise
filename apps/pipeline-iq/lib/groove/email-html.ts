
interface SignatureConfig {
    name: string
    title: string
    company: string
    phone: string
    email: string
    website: string
}

export function wrapEmailInHtml(content: string, sig: SignatureConfig): string {
    // Convert newlines to <br> for the body content
    const htmlBody = content
        .replace(/\n\n/g, '</p><p style="margin-bottom: 16px;">')
        .replace(/\n/g, '<br>')
    const appBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pipelineiq.net')
    const logoUrl = `${appBaseUrl}/assets/unnamed.png`

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Groove Technologies</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 12px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: hidden;">

          <!-- Logo -->
          <tr>
            <td style="padding: 16px 24px 8px 24px; border-bottom: 2px solid #0088cc;">
              <img src="${logoUrl}" alt="Groove Technologies" style="display: block; height: 32px; width: auto;">
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 24px 8px 24px; color: #333333; font-size: 16px; line-height: 1.6;">
              <p style="margin-top: 0; margin-bottom: 12px;">
                ${htmlBody}
              </p>
            </td>
          </tr>

          <!-- CTA Card -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f0f7fb; border-radius: 8px; border-left: 4px solid #0088cc;">
                <tr>
                  <td style="padding: 18px;">
                    <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; line-height: 1.5;">
                      I've put together a quick <strong>"Groove in 45 Seconds"</strong> overview that answers the most common questions: what we do, who we serve, why teams pick us, and what happens next.
                    </p>
                    <p style="margin: 0 0 12px 0; color: #667788; font-size: 14px;">
                      This way you can see if we're relevant before we even talk.
                    </p>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #0088cc; border-radius: 6px;">
                          <a href="https://pipelineiq.net/groove-in-45-seconds" target="_blank" style="display: inline-block; padding: 10px 18px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                            View Groove in 45 Seconds
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 8px 24px 20px 24px; color: #333333; font-size: 14px; line-height: 1.4;">
              <p style="margin: 10px 0 4px 0; font-weight: 700;">${sig.name}</p>
              <p style="margin: 0 0 6px 0; color: #667788;">${sig.title}</p>
              <p style="margin: 0 0 4px 0;">${sig.company}</p>
              <p style="margin: 0 0 4px 0;">${sig.phone}</p>
              <p style="margin: 0 0 4px 0;">
                <a href="mailto:${sig.email}" style="color: #0b6bb8; text-decoration: none;">${sig.email}</a>
              </p>
              <p style="margin: 0;">
                <a href="https://${sig.website}" style="color: #0b6bb8; text-decoration: none;">${sig.website}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `
}
