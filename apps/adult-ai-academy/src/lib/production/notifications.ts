import { AuditReport } from './auditor';

/**
 * Notification system for audit reports.
 * Reports are stored in Supabase (production_batches table) and
 * displayed in the Pilot dashboard at /pilot for human review.
 */
interface BlackboardData {
    inferences?: string[];
    decisions?: string[];
}

/**
 * Logs audit report for the Pilot dashboard.
 * The actual notification is handled by the Pilot UI polling Supabase.
 */
export async function sendAuditReport(
    report: AuditReport,
    blackboard?: BlackboardData
): Promise<boolean> {
    console.log("--- Audit Report ---");
    console.log(`Batch ID: ${report.targetId}`);
    console.log(`Score: ${(report.score * 100).toFixed(0)}%`);
    console.log(`Findings: ${report.findings.join(', ')}`);

    if (blackboard?.inferences?.length) {
        console.log(`Inferences: ${blackboard.inferences.length}`);
    }

    if (report.pilotReviewRequired) {
        console.log(`Status: PENDING PILOT REVIEW (score below threshold)`);
    } else {
        console.log(`Status: AUTO-APPROVED`);
    }

    // Report is already saved to Supabase via saveProductionBatch()
    // Pilot dashboard at /pilot will display pending batches
    return true;
}

// Keep old function name for backwards compatibility
export const sendAuditReportToSlack = sendAuditReport;
