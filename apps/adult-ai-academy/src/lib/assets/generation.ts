import OpenAI from 'openai';
import { serverConfig } from '../config';
import { retryWithBackoff, retryPresets } from '../utils/retry';

const getOpenAI = () => {
    if (!serverConfig.openai.isConfigured) return null;
    return new OpenAI({
        apiKey: serverConfig.openai.apiKey,
    });
};

export async function generateImage(prompt: string): Promise<string> {
    const openai = getOpenAI();
    if (!openai) {
        console.warn("OpenAI API Key missing. Using placeholder image.");
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop";
    }

    try {
        console.log("Generating image with DALL-E 3...");
        const response = await retryWithBackoff(
            () => openai.images.generate({
                model: "dall-e-3",
                prompt: `${prompt}. High-quality, cinematic lighting, professional photography style, brand consistent.`,
                n: 1,
                size: "1024x1024",
                quality: "standard",
            }),
            {
                ...retryPresets.critical,
                logger: (msg) => console.log(`[DALL-E Retry] ${msg}`),
            }
        );

        return response.data?.[0]?.url || '';
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("DALL-E generation failed after retries, using placeholder:", message);
        // Fallback to a professional office placeholder to keep the workflow moving
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop";
    }
}

export async function generateVideoSimulated(prompt: string): Promise<string> {
    console.log("Simulating VEO3/Sora generation for prompt:", prompt);
    // Simulate a delay for video processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Return a high-quality placeholder for now as VEO/Sora APIs are restricted
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
}
