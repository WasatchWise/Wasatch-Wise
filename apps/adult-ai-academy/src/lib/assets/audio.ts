import { serverConfig } from '../config';

/**
 * Suno API integration for audio/music generation.
 * Uses the self-hosted Suno-API (https://github.com/Suno-API/Suno-API)
 * which provides an OpenAI-compatible interface.
 */

export interface AudioGenerationRequest {
    prompt: string;
    style?: string;
    instrumental?: boolean;
    duration?: number;
}

export interface AudioGenerationResult {
    success: boolean;
    audioUrl?: string;
    title?: string;
    duration?: number;
    provider: 'suno' | 'mock';
    error?: string;
}

export interface SunoGenerationResponse {
    id: string;
    audio_url?: string;
    title?: string;
    duration?: number;
    status: string;
}

/**
 * Generate music/audio using the Suno API.
 * Supports custom mode for specific prompts.
 */
export async function generateMusic(request: AudioGenerationRequest): Promise<AudioGenerationResult> {
    if (!serverConfig.suno.isConfigured) {
        console.log('[Suno] API not configured. Using mock.');
        return mockAudioGeneration(request);
    }

    const baseUrl = serverConfig.suno.apiUrl;

    try {
        console.log(`[Suno] Generating audio: "${request.prompt.slice(0, 50)}..."`);

        // Use the custom generation endpoint
        const response = await fetch(`${baseUrl}/api/custom_generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(serverConfig.suno.apiKey && {
                    'Authorization': `Bearer ${serverConfig.suno.apiKey}`
                }),
            },
            body: JSON.stringify({
                prompt: request.prompt,
                tags: request.style || 'professional, calm',
                make_instrumental: request.instrumental ?? true,
                wait_audio: true, // Wait for audio to be ready
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Suno API error: ${response.status} - ${error}`);
        }

        const data: SunoGenerationResponse[] = await response.json();

        if (data && data.length > 0 && data[0].audio_url) {
            return {
                success: true,
                audioUrl: data[0].audio_url,
                title: data[0].title,
                duration: data[0].duration,
                provider: 'suno',
            };
        }

        throw new Error('No audio URL in response');
    } catch (error) {
        console.error('[Suno] Generation failed:', error);
        return {
            success: false,
            provider: 'suno',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Generate background music for video content.
 */
export async function generateBackgroundMusic(options: {
    mood: 'uplifting' | 'professional' | 'calm' | 'energetic' | 'inspiring';
    topic?: string;
}): Promise<AudioGenerationResult> {
    const moodStyles: Record<string, string> = {
        uplifting: 'uplifting, positive, corporate, motivational',
        professional: 'corporate, professional, modern, subtle',
        calm: 'calm, ambient, peaceful, focus',
        energetic: 'energetic, upbeat, dynamic, exciting',
        inspiring: 'inspiring, cinematic, emotional, powerful',
    };

    const prompt = options.topic
        ? `Background music for: ${options.topic}. Mood: ${options.mood}`
        : `Professional background music. Mood: ${options.mood}`;

    return generateMusic({
        prompt,
        style: moodStyles[options.mood] || moodStyles.professional,
        instrumental: true,
    });
}

/**
 * Get generation status/result by ID.
 */
export async function getGenerationStatus(generationId: string): Promise<SunoGenerationResponse | null> {
    if (!serverConfig.suno.isConfigured) {
        return null;
    }

    try {
        const response = await fetch(`${serverConfig.suno.apiUrl}/api/get?ids=${generationId}`, {
            headers: {
                ...(serverConfig.suno.apiKey && {
                    'Authorization': `Bearer ${serverConfig.suno.apiKey}`
                }),
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data[0] || null;
    } catch {
        return null;
    }
}

/**
 * Mock audio generation when Suno is not configured.
 */
function mockAudioGeneration(request: AudioGenerationRequest): AudioGenerationResult {
    console.log(`[Audio Mock] Would generate: "${request.prompt.slice(0, 50)}..."`);
    console.log(`[Audio Mock] Style: ${request.style || 'default'}`);
    console.log(`[Audio Mock] Instrumental: ${request.instrumental ?? true}`);

    return {
        success: true,
        audioUrl: undefined,
        title: 'Mock Audio',
        duration: request.duration || 30,
        provider: 'mock',
    };
}
