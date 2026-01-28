import { NextResponse } from 'next/server';
import { saveProjectLocally, ProjectBundle } from '@/lib/storage/local-save';
import { z } from 'zod';

const saveRequestSchema = z.object({
    projectName: z.string().min(1).max(100),
    topic: z.string().min(1),
    pillar: z.string().min(1),
    duration: z.string(),
    mindset: z.string().optional(),
    refinedContent: z.object({
        socialHook: z.string(),
        nepqTrigger: z.string().optional(),
        videoScript: z.string().optional(),
        storyboard: z.array(z.object({
            sceneNumber: z.number(),
            assetType: z.enum(['image', 'video']),
            scriptSegment: z.string(),
            imagePrompt: z.string().optional(),
            veoVideoPrompt: z.string().optional(),
        })),
        dissection: z.object({
            audience: z.string(),
            character: z.string(),
            lookAndTone: z.string(),
            nepqEncouragement: z.string(),
        }).optional(),
    }),
    generatedAssets: z.object({
        images: z.array(z.object({
            sceneNumber: z.number(),
            url: z.string(),
        })).optional(),
        audio: z.object({
            url: z.string(),
            provider: z.string(),
        }).optional(),
    }).optional(),
    audioConfig: z.object({
        instrumental: z.boolean(),
        vocalType: z.enum(['male', 'female', 'none']),
        style: z.string(),
        lyrics: z.string(),
    }).optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = saveRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const bundle = validationResult.data as ProjectBundle;
        const result = await saveProjectLocally(bundle);

        return NextResponse.json({
            success: true,
            message: `Project saved to ${result.projectPath}`,
            projectPath: result.projectPath,
            filesCreated: result.files.length,
            files: result.files,
        });
    } catch (error) {
        console.error('Save API Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to save project';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
