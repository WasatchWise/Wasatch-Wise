/**
 * Utility to send notifications to Discord via Webhooks.
 * This is used to alert admins of new submissions (bands, events, etc.)
 */

interface DiscordEmbed {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: { url: string };
    footer?: { text: string };
    timestamp?: string;
}

export async function sendDiscordNotification(payload: {
    content?: string;
    embeds?: DiscordEmbed[];
}) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('DISCORD_WEBHOOK_URL is not set. Skipping notification.');
        return { success: false, error: 'Webhook URL not configured' };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Discord Webhook Error:', errorText);
            return { success: false, error: `Discord API error: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        return { success: false, error: 'Network error' };
    }
}
