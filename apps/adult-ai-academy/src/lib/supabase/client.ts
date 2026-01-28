import { createClient } from '@supabase/supabase-js';
import { clientConfig } from '../config';

const getSupabase = () => {
    if (!clientConfig.supabase.isConfigured) return null;
    return createClient(
        clientConfig.supabase.url!,
        clientConfig.supabase.anonKey!
    );
};

export async function saveProductionBatch(batch: {
    status: string;
    auditReport?: { targetId?: string; score: number };
    blackboard?: { inferences: string[]; decisions: string[]; agentCommunications?: Record<string, unknown> };
    synthesis?: unknown;
    storyboardResults?: unknown[];
    storyboard_results?: unknown[];
    heygen_video_id?: string;
    heygenVideoId?: string;
    templateId?: string;
    detectedMindset?: 'Optimist' | 'Maybe' | 'Unaware';
}) {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("Supabase credentials missing. Mocking batch save...");
        return { success: true, mock: true };
    }

    const { error } = await supabase
        .from('production_batches')
        .upsert([{
            id: batch.auditReport?.targetId || `batch_${Date.now()}`,
            status: batch.status,
            audit_score: batch.auditReport?.score,
            audit_report: batch.auditReport,
            blackboard: batch.blackboard,
            synthesis: batch.synthesis,
            storyboard_results: batch.storyboard_results || batch.storyboardResults,
            heygen_video_id: batch.heygen_video_id || batch.heygenVideoId,
            template_id: batch.templateId,
            detected_mindset: batch.detectedMindset,
            created_at: new Date().toISOString()
        }]);

    if (error) throw error;
    return { success: true };
}

export async function getPendingBatches() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('production_batches')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateBatchStatus(id: string, status: 'completed' | 'failed') {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
        .from('production_batches')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function updateLeadPropensity(email: string, scoreIncrement: number) {
    const supabase = getSupabase();
    if (!supabase) {
        console.log(`[CRM Mock] Incrementing propensity for ${email} by ${scoreIncrement}`);
        return;
    }

    const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('propensity_score')
        .eq('email', email)
        .single();

    if (fetchError) {
        console.error("Error fetching lead for propensity update:", fetchError);
        return;
    }

    const { error: updateError } = await supabase
        .from('leads')
        .update({ propensity_score: (lead?.propensity_score || 0) + scoreIncrement })
        .eq('email', email);

    if (updateError) throw updateError;
    console.log(`[CRM] Updated propensity for ${email}`);
}

export async function saveAssetToLibrary(assetData: {
    topic: string;
    pillar: string;
    refinedContent: { socialHook: string; nepqTrigger: string; videoScript: string };
    assets?: { video?: string; image?: string };
    rawText: string;
}) {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("Supabase credentials missing. Mocking save...");
        return { success: true, mock: true };
    }

    const { data, error } = await supabase
        .from('produced_assets')
        .insert([
            {
                topic: assetData.topic,
                pillar: assetData.pillar,
                social_hook: assetData.refinedContent.socialHook,
                nepq_trigger: assetData.refinedContent.nepqTrigger,
                video_script: assetData.refinedContent.videoScript,
                veo_video_url: assetData.assets?.video,
                dalle_image_url: assetData.assets?.image,
                raw_text: assetData.rawText,
            }
        ]);

    if (error) throw error;
    return { success: true, data };
}
