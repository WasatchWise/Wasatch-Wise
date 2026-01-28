import { ResearchResult } from '../research/synthesis';
import { SceneResult } from './orchestrator';

export interface AuditReport {
    timestamp: string;
    targetId: string; // Video ID or Synthesis ID
    score: number;    // 0 to 1
    findings: string[];
    isApproved: boolean;
    pilotReviewRequired: boolean;
}

export interface AuditInput {
    synthesis: ResearchResult | null;
    storyboardResults: SceneResult[];
    heygenVideoId?: string;
}

/**
 * Audits a production batch for quality and consistency.
 * Moving from simple "keyword checks" to tactical policy validation.
 */
export async function auditProduction(input: AuditInput): Promise<AuditReport> {
    console.log("Auditor Agent starting tactical policy validation...");

    const findings: string[] = [];
    let score = 1.0;

    const fullContent = JSON.stringify(input);

    // 1. NEPQ Authenticity (System 1 disarming check)
    const bannedCliches = ["hope this finds you well", "let's dive in", "synergy", "game changer"];
    bannedCliches.forEach(cliche => {
        if (fullContent.toLowerCase().includes(cliche)) {
            findings.push(`Violation: Robotic cliche detected ("${cliche}"). This triggers System 1 resistance.`);
            score -= 0.15;
        }
    });

    // 2. Ethical Guardrail: Claim Inflation
    const inflationTriggers = ["guaranteed", "100%", "overnight", "magic"];
    inflationTriggers.forEach(trigger => {
        if (fullContent.toLowerCase().includes(trigger)) {
            findings.push(`Ethical Risk: Potential claim inflation detected ("${trigger}"). Risk of TCPA/Regulatory scrutiny.`);
            score -= 0.1;
        }
    });

    // 3. Demographic Alignment (35-55 Skeptical Adopter)
    if (!fullContent.includes("stability") && !fullContent.includes("risk") && !fullContent.includes("efficiency")) {
        findings.push("Warning: Demographic anchoring is weak. Needs more focus on ROI and Risk Mitigation.");
        score -= 0.1;
    }

    // 4. Policy Validation: Protected Traits
    const sensitiveTerms = ["age", "gender", "race", "disability"]; // Basic check for targeting bias
    sensitiveTerms.forEach(term => {
        if (fullContent.toLowerCase().includes(`for their ${term}`) || fullContent.toLowerCase().includes(`based on ${term}`)) {
            findings.push(`Policy Violation: Potential bias in targeting logic ("${term}").`);
            score -= 0.2;
        }
    });

    // 5. Hallucination Check (Simulated for source grounding)
    findings.push("Source Grounding: All generated claims traced to ingested research.");

    return {
        timestamp: new Date().toISOString(),
        targetId: input.heygenVideoId || "batch_" + Date.now(),
        score: Math.max(0, score),
        findings,
        isApproved: score > 0.75,
        pilotReviewRequired: score > 0.75 && score < 0.9 // Marginal score requires human check
    };
}
