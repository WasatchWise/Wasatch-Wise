export interface VideoAnalytics {
    videoId: string;
    platform: 'tiktok' | 'youtube' | 'meta';
    viewCount: number;
    retentionRate: number; // 0 to 1
    hookRate: number;      // 0 to 1 (engagement within first 3 seconds)
    dwellTimeSeconds: number; // New: High-intent metric for B2B
    retentionCurveAUC: number; // Area Under the Attention Curve
    reWatchRate: number;    // Percent of viewers who re-watched key segments
    shareCount: number;
    commentSentimentalScore: number; // -1 to 1
    topPositiveComments: string[];
}

export interface PerformancePattern {
    patternType: 'hook' | 'trigger' | 'tone' | 'attribution';
    content: string;
    effectivenessScore: number;
}

export interface TemplatePerformance {
    templateId: string;
    templateName: string;
    mindset: 'Optimist' | 'Maybe' | 'Unaware';
    videoId: string;
    metrics: {
        viewCount: number;
        retentionRate: number;
        hookRate: number;
        reWatchRate: number;
        retentionCurveAUC: number;
        shareCount: number;
        commentSentimentalScore: number;
    };
    overallScore: number; // Calculated performance score
    timestamp: string;
}

// Type declaration for global template performance store
declare global {
    var templatePerformanceStore: TemplatePerformance[] | undefined;
}

import { updateLeadPropensity } from '../supabase/client';

/**
 * Calculate overall performance score from analytics
 * Weighted formula prioritizing engagement and retention
 */
function calculatePerformanceScore(video: VideoAnalytics): number {
    // Weighted score (0-1) combining multiple signals
    const weights = {
        retentionRate: 0.3,      // Most important: did they watch?
        hookRate: 0.25,          // Critical: did they engage early?
        retentionCurveAUC: 0.2,  // Quality: how well did we hold attention?
        reWatchRate: 0.15,       // High-intent: did they re-watch?
        shareCount: 0.05,        // Virality: did they share?
        commentSentiment: 0.05   // Sentiment: positive comments?
    };

    // Normalize share count (assuming max 1000 shares is 1.0)
    const normalizedShares = Math.min(video.shareCount / 1000, 1.0);
    
    // Normalize comment sentiment (-1 to 1) -> (0 to 1)
    const normalizedSentiment = (video.commentSentimentalScore + 1) / 2;

    const score = (
        video.retentionRate * weights.retentionRate +
        video.hookRate * weights.hookRate +
        video.retentionCurveAUC * weights.retentionCurveAUC +
        video.reWatchRate * weights.reWatchRate +
        normalizedShares * weights.shareCount +
        normalizedSentiment * weights.commentSentiment
    );

    return Math.min(1.0, Math.max(0, score));
}

/**
 * Ingests raw analytics data and synchronizes with CRM propensity scores.
 * Also tracks template performance for feedback loop.
 * Weights high-intent signals (Re-watches, AUC) to identify high-ticket leads.
 */
export async function ingestAnalytics(
    data: VideoAnalytics[], 
    leadEmail?: string,
    templateId?: string,
    templateName?: string,
    mindset?: 'Optimist' | 'Maybe' | 'Unaware'
): Promise<void> {
    console.log(`Ingesting analytics for ${data.length} videos...`);

    for (const video of data) {
        // High-Intent Logic (from aaa_brains.md): 
        // Re-watch Segments (+30), Dwell Time (+25), 90% Completion (+20)
        let scoreIncrement = 0;

        if (video.reWatchRate > 0.4) scoreIncrement += 30;
        if (video.dwellTimeSeconds > 60) scoreIncrement += 25;
        if (video.retentionRate > 0.9) scoreIncrement += 20;

        if (leadEmail && scoreIncrement > 0) {
            console.log(`[Learning Lab] High-intent detected for ${leadEmail} (Video: ${video.videoId}). Syncing to CRM...`);
            await updateLeadPropensity(leadEmail, scoreIncrement);
        }

        // Track template performance if template info provided
        if (templateId && mindset) {
            const performance: TemplatePerformance = {
                templateId,
                templateName: templateName || templateId,
                mindset,
                videoId: video.videoId,
                metrics: {
                    viewCount: video.viewCount,
                    retentionRate: video.retentionRate,
                    hookRate: video.hookRate,
                    reWatchRate: video.reWatchRate,
                    retentionCurveAUC: video.retentionCurveAUC,
                    shareCount: video.shareCount,
                    commentSentimentalScore: video.commentSentimentalScore
                },
                overallScore: calculatePerformanceScore(video),
                timestamp: new Date().toISOString()
            };

            // Store template performance (would integrate with database in production)
            await storeTemplatePerformance(performance);
            console.log(`[Learning Lab] Template performance tracked: ${templateId} scored ${(performance.overallScore * 100).toFixed(1)}%`);
        }
    }
}

/**
 * Stores template performance data for analytics feedback loop.
 * In production, this would persist to Supabase or analytics database.
 */
async function storeTemplatePerformance(performance: TemplatePerformance): Promise<void> {
    // TODO: Integrate with Supabase to store template_performance table
    // For now, we'll use a mock storage that can be queried
    if (!globalThis.templatePerformanceStore) {
        globalThis.templatePerformanceStore = [];
    }
    globalThis.templatePerformanceStore.push(performance);
    
    // Keep only last 1000 entries in memory
    const store = globalThis.templatePerformanceStore;
    if (store.length > 1000) {
        store.shift();
    }
}

/**
 * Retrieves the most effective content patterns based on historical analytics.
 */
export async function getTopPerformingPatterns(): Promise<PerformancePattern[]> {
    // Mocking high-performing patterns derived from the "Area Under the Attention Curve"
    return [
        {
            patternType: 'hook',
            content: "You've been taught to manage people, but the future is managing the agents who manage the tasks.",
            effectivenessScore: 0.95
        },
        {
            patternType: 'trigger',
            content: "Stop fighting the scale. Start building a narrative that rewrites itself based on outcome data.",
            effectivenessScore: 0.92
        },
        {
            patternType: 'attribution',
            content: "High-intent leads re-watched the 'ROI Strategy' segment 2.4x more than general viewers.",
            effectivenessScore: 0.88
        }
    ];
}

/**
 * Get template performance statistics for a specific template or all templates
 */
export async function getTemplatePerformanceStats(
    templateId?: string,
    mindset?: 'Optimist' | 'Maybe' | 'Unaware',
    daysBack: number = 30
): Promise<{
    templateId: string;
    templateName: string;
    mindset: 'Optimist' | 'Maybe' | 'Unaware';
    avgScore: number;
    sampleSize: number;
    avgRetention: number;
    avgHookRate: number;
    avgReWatchRate: number;
}[]> {
    const store = globalThis.templatePerformanceStore || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Filter by date
    let filtered = store.filter((p: TemplatePerformance) => 
        new Date(p.timestamp) >= cutoffDate
    );

    // Filter by template or mindset if specified
    if (templateId) {
        filtered = filtered.filter((p: TemplatePerformance) => p.templateId === templateId);
    }
    if (mindset) {
        filtered = filtered.filter((p: TemplatePerformance) => p.mindset === mindset);
    }

    // Group by template and calculate averages
    const templateMap = new Map<string, TemplatePerformance[]>();
    for (const perf of filtered) {
        const key = perf.templateId;
        if (!templateMap.has(key)) {
            templateMap.set(key, []);
        }
        templateMap.get(key)!.push(perf);
    }

    const stats = Array.from(templateMap.entries()).map(([id, performances]) => {
        const avgScore = performances.reduce((sum, p) => sum + p.overallScore, 0) / performances.length;
        const avgRetention = performances.reduce((sum, p) => sum + p.metrics.retentionRate, 0) / performances.length;
        const avgHookRate = performances.reduce((sum, p) => sum + p.metrics.hookRate, 0) / performances.length;
        const avgReWatchRate = performances.reduce((sum, p) => sum + p.metrics.reWatchRate, 0) / performances.length;

        return {
            templateId: id,
            templateName: performances[0].templateName,
            mindset: performances[0].mindset,
            avgScore,
            sampleSize: performances.length,
            avgRetention,
            avgHookRate,
            avgReWatchRate
        };
    });

    // Sort by average score (descending)
    return stats.sort((a, b) => b.avgScore - a.avgScore);
}

/**
 * Get recommended template based on performance data and context
 */
export async function getRecommendedTemplate(
    detectedMindset: 'Optimist' | 'Maybe' | 'Unaware',
    preferredFormat?: 'text' | 'video' | 'interactive' | 'visual'
): Promise<string | null> {
    const stats = await getTemplatePerformanceStats(undefined, detectedMindset, 30);

    if (stats.length === 0) {
        // No performance data yet, return null to use default selection
        return null;
    }

    // Filter by format if specified
    let candidates = stats;
    if (preferredFormat) {
        // This would require checking template pattern format
        // For now, return top performer for mindset
        candidates = stats.slice(0, 1);
    }

    // Return top performing template ID
    return candidates[0]?.templateId || null;
}
