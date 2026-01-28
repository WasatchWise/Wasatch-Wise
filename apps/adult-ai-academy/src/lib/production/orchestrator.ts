import { tailorContentLive, ResearchResult, Scene, ContentDuration } from '../research/synthesis';
import { generateImage, generateVideoSimulated } from '../assets/generation';
import { generateHeyGenVideo, HeyGenScene } from '../assets/heygen';
import { auditProduction, AuditReport, AuditInput } from './auditor';
import { sendAuditReportToSlack } from './notifications';
import { persistBlackboardToGraph } from './knowledge-graph';
import { saveProductionBatch } from '../supabase/client';

export interface SceneResult {
    scene: Scene;
    imageUrl?: string;
    videoUrl?: string;
}

export interface ContextBlackboard {
    inferences: string[];
    decisions: string[];
    agentCommunications: Record<string, string>;
}

export interface ProductionBatch {
    synthesis: ResearchResult | null;
    storyboardResults: SceneResult[];
    heygenVideoId?: string;
    auditReport?: AuditReport;
    blackboard: ContextBlackboard;
    status: 'pending' | 'completed' | 'failed';
}

export async function runUnifiedProduction(rawText: string, duration: ContentDuration = '30s'): Promise<ProductionBatch> {
    console.log(`Starting Unified Production Batch (Multi-Scene Storyboard, Duration: ${duration})...`);

    try {
        // Phase 0: Initialize Context Blackboard
        const blackboard: ContextBlackboard = {
            inferences: ["Analyzing raw input for high-ticket B2B signals"],
            decisions: [],
            agentCommunications: {}
        };

        // Phase 1: Contextual Synthesis (Hooks, Pillar, and Sequential Storyboard)
        const synthesis = await tailorContentLive(rawText, duration);

        if (!synthesis || !synthesis.refinedContent || !synthesis.refinedContent.storyboard) {
            console.error("Synthesis produced no storyboard.");
            blackboard.inferences.push("Synthesis Failed: No storyboard produced.");
            return { synthesis: null, storyboardResults: [], blackboard, status: 'failed' };
        }

        const storyboard = synthesis.refinedContent.storyboard;
        blackboard.inferences.push(`Synthesis Complete: ${storyboard.length} scenes generated.`);
        blackboard.decisions.push(`Selected Duration: ${duration}`);

        console.log(`Orchestrating production for ${storyboard.length} brand-consistent scenes...`);

        // Phase 2: Concurrent Multi-Asset Production (Saga Step 1)
        const productionPromises = storyboard.map(async (scene) => {
            const sceneId = `Scene ${scene.sceneNumber}`;
            console.log(`[${sceneId}] Generating ${scene.assetType} asset...`);

            try {
                const [imgRes, vidRes] = await Promise.allSettled([
                    generateImage(scene.imagePrompt),
                    generateVideoSimulated(scene.veoVideoPrompt)
                ]);

                const result = {
                    scene,
                    imageUrl: imgRes.status === 'fulfilled' ? imgRes.value : undefined,
                    videoUrl: vidRes.status === 'fulfilled' ? vidRes.value : undefined,
                } as SceneResult;

                if (imgRes.status === 'fulfilled') {
                    blackboard.agentCommunications[`${sceneId}_asset`] = "Image generated successfully";
                }

                return result;
            } catch (err) {
                console.error(`[${sceneId}] Asset generation failed:`, err);
                blackboard.inferences.push(`Asset failure in ${sceneId}: ${String(err)}`);
                return { scene } as SceneResult;
            }
        });

        const storyboardResults = await Promise.all(productionPromises);

        // Phase 3: Unified HeyGen Production (Saga Step 2)
        let heygenVideoId: string | undefined;
        const videoScenes = storyboard.filter(s => s.assetType === 'video' && s.avatarId && s.voiceId);

        if (videoScenes.length > 0) {
            console.log("Triggering Unified HeyGen Production for video scenes...");
            try {
                const heygenScenes: HeyGenScene[] = videoScenes.map(s => ({
                    avatar_id: s.avatarId!,
                    voice_id: s.voiceId!,
                    input_text: s.scriptSegment,
                    avatar_style: 'normal'
                }));

                heygenVideoId = await generateHeyGenVideo(heygenScenes);
                blackboard.decisions.push(`HeyGen Video Initiated: ${heygenVideoId}`);
            } catch (heygenErr) {
                console.error("HeyGen Saga Step Failed:", heygenErr);
                blackboard.inferences.push("Compensating Transaction: Falling back to static assets due to HeyGen failure.");
            }
        }

        // Phase 4: Auditor Agent Verification
        console.log("Triggering Auditor Agent verification...");
        const auditInput: AuditInput = {
            synthesis,
            storyboardResults,
            heygenVideoId
        };
        const auditReport = await auditProduction(auditInput);

        blackboard.decisions.push(`Audit Complete: Score ${auditReport.score}`);

        // Phase 5: High-Fidelity HITL Notification
        console.log("Dispatching Audit Report to Pilot Dashboard...");
        await sendAuditReportToSlack(auditReport, blackboard);

        // Phase 6: Long-Term Persistence (Knowledge Graph)
        const batchId = auditReport.targetId;
        console.log("Persisting final state to Neo4j Knowledge Graph...");
        await persistBlackboardToGraph(batchId, blackboard);
        blackboard.inferences.push("State persisted to Neo4j Knowledge Graph.");

        // Phase 7: Persistent Library & Pilot Gate
        const finalBatch: ProductionBatch = {
            synthesis,
            storyboardResults,
            heygenVideoId,
            auditReport,
            blackboard,
            status: auditReport.pilotReviewRequired ? 'pending' : 'completed' // Wait for Pilot if marginal
        };

        console.log("Saving full batch to Supabase Library...");
        await saveProductionBatch({
            ...finalBatch,
            templateId: synthesis.templateUsed,
            detectedMindset: synthesis.detectedMindset
        });

        console.log("Unified Production Complete. Scenes captured.");
        return finalBatch;
    } catch (error) {
        console.error("Unified Production Shop Error:", error);
        return {
            synthesis: null,
            storyboardResults: [],
            blackboard: { inferences: ["Fatal Orchestration Error"], decisions: [], agentCommunications: {} },
            status: 'failed'
        };
    }
}
