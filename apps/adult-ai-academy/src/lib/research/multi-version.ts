/**
 * Multi-Version Content Generation
 * Generates the same content for all 3 adoption mindsets simultaneously
 * Useful for A/B testing and maximizing reach across different user segments
 */

import { tailorContentLive, ResearchResult, ContentDuration, SynthesisOptions } from './synthesis';
import { PATTERN_TEMPLATES } from '../hci/pattern-templates';

export interface MultiVersionResult {
    originalText: string;
    duration: ContentDuration;
    versions: {
        mindset: 'Optimist' | 'Maybe' | 'Unaware';
        templateId: string;
        templateName: string;
        result: ResearchResult;
    }[];
    generatedAt: string;
}

/**
 * Generate content versions for all three mindsets
 * Each version uses the best template for that mindset
 */
export async function generateMultiVersion(
    rawText: string,
    duration: ContentDuration = '30s',
    options?: {
        usePerformanceData?: boolean; // Use analytics to select best templates
        preferredFormat?: 'text' | 'video' | 'interactive' | 'visual';
    }
): Promise<MultiVersionResult> {
    const mindsets: Array<'Optimist' | 'Maybe' | 'Unaware'> = ['Optimist', 'Maybe', 'Unaware'];
    
    console.log(`[Multi-Version] Generating content for ${mindsets.length} mindsets...`);

    // Generate all versions in parallel for speed
    const versionPromises = mindsets.map(async (mindset) => {
        // Get best template for this mindset
        let templateId: string | undefined;
        
        if (options?.usePerformanceData) {
            try {
                const { getRecommendedTemplate } = await import('./learning-lab');
                templateId = await getRecommendedTemplate(mindset, options?.preferredFormat) || undefined;
            } catch {
                console.warn(`[Multi-Version] Could not get performance recommendation for ${mindset}, using default`);
            }
        }

        // Get default template if no recommendation
        if (!templateId) {
            const templates = PATTERN_TEMPLATES.filter(t => t.targetMindset === mindset);
            if (options?.preferredFormat) {
                const filtered = templates.filter(t => t.pattern.format === options.preferredFormat);
                if (filtered.length > 0) {
                    templateId = filtered[0].id;
                }
            }
            if (!templateId) {
                templateId = templates[0]?.id;
            }
        }

        const template = PATTERN_TEMPLATES.find(t => t.id === templateId);
        
        console.log(`[Multi-Version] Generating ${mindset} version with template: ${template?.name || templateId}`);

        const synthesisOptions: SynthesisOptions = {
            mindsetOverride: mindset,
            templateId: templateId,
            preferredFormat: options?.preferredFormat
        };

        try {
            const result = await tailorContentLive(rawText, duration, synthesisOptions);
            return {
                mindset,
                templateId: templateId || 'unknown',
                templateName: template?.name || 'Unknown Template',
                result
            };
        } catch (error) {
            console.error(`[Multi-Version] Failed to generate ${mindset} version:`, error);
            throw error;
        }
    });

    const versions = await Promise.all(versionPromises);

    return {
        originalText: rawText,
        duration,
        versions,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Generate multi-version with production pipeline for all mindsets
 */
export async function generateMultiVersionWithProduction(
    rawText: string,
    duration: ContentDuration = '30s',
    options?: {
        usePerformanceData?: boolean;
        preferredFormat?: 'text' | 'video' | 'interactive' | 'visual';
    }
) {
    const { generateMultiVersion } = await import('./multi-version');
    const { runUnifiedProduction } = await import('../production/orchestrator');

    console.log(`[Multi-Version Production] Generating and producing content for all mindsets...`);

    // Generate synthesis for all mindsets
    const multiVersion = await generateMultiVersion(rawText, duration, options);

    // Run production pipeline for each version
    const productionPromises = multiVersion.versions.map(async (version) => {
        console.log(`[Multi-Version Production] Producing ${version.mindset} version...`);
        
        // Re-run production with the synthesized content
        // Note: This could be optimized to skip synthesis and go straight to production
        const production = await runUnifiedProduction(rawText, duration);
        
        return {
            mindset: version.mindset,
            templateId: version.templateId,
            templateName: version.templateName,
            synthesis: version.result,
            production
        };
    });

    const productions = await Promise.all(productionPromises);

    return {
        multiVersion,
        productions,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Compare versions to identify differences and similarities
 */
export function compareVersions(multiVersion: MultiVersionResult): {
    commonPillar: string | null;
    uniqueHooks: Array<{ mindset: string; hook: string }>;
    hookSimilarity: number; // 0-1 score
    templateVariety: Array<string>;
} {
    const versions = multiVersion.versions;
    
    // Check if all versions share the same pillar
    const pillars = versions.map(v => v.result.pillar);
    const commonPillar = pillars.every(p => p === pillars[0]) ? pillars[0] : null;

    // Extract unique hooks
    const uniqueHooks = versions.map(v => ({
        mindset: v.mindset,
        hook: v.result.refinedContent.socialHook
    }));

    // Calculate hook similarity (simple word overlap)
    const calculateSimilarity = (text1: string, text2: string): number => {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    };

    let totalSimilarity = 0;
    let comparisons = 0;
    for (let i = 0; i < uniqueHooks.length; i++) {
        for (let j = i + 1; j < uniqueHooks.length; j++) {
            totalSimilarity += calculateSimilarity(uniqueHooks[i].hook, uniqueHooks[j].hook);
            comparisons++;
        }
    }
    const hookSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;

    // Get template variety
    const templateVariety = [...new Set(versions.map(v => v.templateId))];

    return {
        commonPillar,
        uniqueHooks,
        hookSimilarity,
        templateVariety
    };
}

