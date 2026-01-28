import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateMusic } from '@/lib/assets/audio';

const audioRequestSchema = z.object({
    style: z.string().min(1),
    lyrics: z.string().optional(),
    instrumental: z.boolean().default(true),
    vocalType: z.enum(['male', 'female', 'none']).default('none'),
    topic: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = audioRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { style, lyrics, instrumental, vocalType, topic } = validationResult.data;

        // Build prompt based on configuration
        let prompt = topic ? `Background music for: ${topic}. ` : '';
        if (!instrumental && lyrics) {
            prompt += `Lyrics:\n${lyrics}`;
        } else {
            prompt += 'Instrumental background music.';
        }

        console.log(`[Audio API] Generating audio - Style: ${style}, Instrumental: ${instrumental}, Vocals: ${vocalType}`);

        const result = await generateMusic({
            prompt,
            style: instrumental ? style : `${style}, ${vocalType} vocals`,
            instrumental,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Audio generation failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            audioUrl: result.audioUrl,
            title: result.title,
            duration: result.duration,
            provider: result.provider,
        });
    } catch (error) {
        console.error('Audio API Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate audio';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
