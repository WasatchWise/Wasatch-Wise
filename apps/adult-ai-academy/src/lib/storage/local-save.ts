import fs from 'fs/promises';
import path from 'path';

const OUTPUTS_DIR = path.join(process.cwd(), 'outputs');

/**
 * Downloads an image from URL and saves it locally
 */
async function downloadImage(url: string, filePath: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to download image: ${response.status}`);
            return false;
        }
        const buffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));
        return true;
    } catch (error) {
        console.error('Error downloading image:', error);
        return false;
    }
}

export interface ProjectBundle {
    projectName: string;
    topic: string;
    pillar: string;
    duration: string;
    mindset?: string;
    refinedContent: {
        socialHook: string;
        nepqTrigger?: string;
        videoScript?: string;
        storyboard: Array<{
            sceneNumber: number;
            assetType: 'image' | 'video';
            scriptSegment: string;
            imagePrompt?: string;
            veoVideoPrompt?: string;
        }>;
        dissection?: {
            audience: string;
            character: string;
            lookAndTone: string;
            nepqEncouragement: string;
        };
    };
    generatedAssets?: {
        images?: Array<{ sceneNumber: number; url: string }>;
        audio?: { url: string; provider: string };
    };
    audioConfig?: {
        instrumental: boolean;
        vocalType: 'male' | 'female' | 'none';
        style: string;
        lyrics: string;
    };
}

export interface SaveResult {
    success: boolean;
    projectPath: string;
    files: string[];
}

/**
 * Saves a production bundle to a local project folder.
 * Creates organized structure for easy access to all assets.
 */
export async function saveProjectLocally(bundle: ProjectBundle): Promise<SaveResult> {
    // Create project folder name: project-name-YYYY-MM-DD-HHMMSS
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeName = bundle.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const folderName = `${safeName}-${timestamp}`;
    const projectPath = path.join(OUTPUTS_DIR, folderName);

    const savedFiles: string[] = [];

    try {
        // Create folder structure
        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, 'scenes'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'images'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'audio'), { recursive: true });

        // 1. Save metadata
        const metadata = {
            projectName: bundle.projectName,
            topic: bundle.topic,
            pillar: bundle.pillar,
            duration: bundle.duration,
            mindset: bundle.mindset,
            createdAt: new Date().toISOString(),
            sceneCount: bundle.refinedContent.storyboard.length,
        };
        await fs.writeFile(
            path.join(projectPath, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );
        savedFiles.push('metadata.json');

        // 2. Save full script
        const scriptContent = `# ${bundle.topic}
Pillar: ${bundle.pillar}
Duration: ${bundle.duration}
${bundle.mindset ? `Mindset: ${bundle.mindset}` : ''}

## Hook
${bundle.refinedContent.socialHook}

${bundle.refinedContent.nepqTrigger ? `## NEPQ Trigger\n${bundle.refinedContent.nepqTrigger}\n` : ''}

## Full Script
${bundle.refinedContent.videoScript || 'No full script generated'}

## Scene Breakdown
${bundle.refinedContent.storyboard.map(scene => `
### Scene ${scene.sceneNumber} (${scene.assetType})
${scene.scriptSegment}
`).join('\n')}
`;
        await fs.writeFile(path.join(projectPath, 'script.md'), scriptContent);
        savedFiles.push('script.md');

        // 3. Save storyboard JSON (for programmatic access)
        await fs.writeFile(
            path.join(projectPath, 'storyboard.json'),
            JSON.stringify(bundle.refinedContent.storyboard, null, 2)
        );
        savedFiles.push('storyboard.json');

        // 4. Save individual scene prompts
        for (const scene of bundle.refinedContent.storyboard) {
            const sceneFile = `scene-${String(scene.sceneNumber).padStart(2, '0')}.txt`;
            const sceneContent = `Scene ${scene.sceneNumber} - ${scene.assetType.toUpperCase()}

SCRIPT:
${scene.scriptSegment}

${scene.assetType === 'image' ? `IMAGE PROMPT:\n${scene.imagePrompt || 'No prompt'}` : `VIDEO PROMPT:\n${scene.veoVideoPrompt || 'No prompt'}`}
`;
            await fs.writeFile(path.join(projectPath, 'scenes', sceneFile), sceneContent);
            savedFiles.push(`scenes/${sceneFile}`);
        }

        // 5. Save dissection/analysis if available
        if (bundle.refinedContent.dissection) {
            const dissection = `# Content Analysis

## Target Audience
${bundle.refinedContent.dissection.audience}

## Character/Persona
${bundle.refinedContent.dissection.character}

## Look & Tone
${bundle.refinedContent.dissection.lookAndTone}

## NEPQ Encouragement
${bundle.refinedContent.dissection.nepqEncouragement}
`;
            await fs.writeFile(path.join(projectPath, 'analysis.md'), dissection);
            savedFiles.push('analysis.md');
        }

        // 6. Save asset URLs and download images
        if (bundle.generatedAssets) {
            await fs.writeFile(
                path.join(projectPath, 'assets.json'),
                JSON.stringify(bundle.generatedAssets, null, 2)
            );
            savedFiles.push('assets.json');

            // Download generated images
            if (bundle.generatedAssets.images && bundle.generatedAssets.images.length > 0) {
                console.log(`[Storage] Downloading ${bundle.generatedAssets.images.length} images...`);
                for (const image of bundle.generatedAssets.images) {
                    const fileName = `scene-${String(image.sceneNumber).padStart(2, '0')}.png`;
                    const filePath = path.join(projectPath, 'images', fileName);
                    const downloaded = await downloadImage(image.url, filePath);
                    if (downloaded) {
                        savedFiles.push(`images/${fileName}`);
                        console.log(`[Storage] Downloaded: ${fileName}`);
                    }
                }
            }
        }

        // 7. Save audio config for Suno
        if (bundle.audioConfig) {
            const audioPrompt = bundle.audioConfig.instrumental
                ? `Style: ${bundle.audioConfig.style}\n\n[Instrumental]`
                : `Style: ${bundle.audioConfig.style}\nVocals: ${bundle.audioConfig.vocalType}\n\nLyrics:\n${bundle.audioConfig.lyrics}`;

            await fs.writeFile(
                path.join(projectPath, 'audio', 'suno-prompt.txt'),
                audioPrompt
            );
            savedFiles.push('audio/suno-prompt.txt');

            await fs.writeFile(
                path.join(projectPath, 'audio', 'config.json'),
                JSON.stringify(bundle.audioConfig, null, 2)
            );
            savedFiles.push('audio/config.json');
        }

        console.log(`[Storage] Project saved to: ${projectPath}`);
        console.log(`[Storage] Files: ${savedFiles.length}`);

        return {
            success: true,
            projectPath,
            files: savedFiles,
        };
    } catch (error) {
        console.error('[Storage] Failed to save project:', error);
        throw error;
    }
}

/**
 * Lists all saved projects
 */
export async function listProjects(): Promise<string[]> {
    try {
        await fs.mkdir(OUTPUTS_DIR, { recursive: true });
        const entries = await fs.readdir(OUTPUTS_DIR, { withFileTypes: true });
        return entries
            .filter(e => e.isDirectory() && !e.name.startsWith('.'))
            .map(e => e.name)
            .sort()
            .reverse(); // Most recent first
    } catch {
        return [];
    }
}

/**
 * Gets a project's metadata
 */
export async function getProjectMetadata(projectName: string): Promise<Record<string, unknown> | null> {
    try {
        const metadataPath = path.join(OUTPUTS_DIR, projectName, 'metadata.json');
        const content = await fs.readFile(metadataPath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}
