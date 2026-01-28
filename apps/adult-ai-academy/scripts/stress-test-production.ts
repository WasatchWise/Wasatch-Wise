import { runUnifiedProduction } from '../src/lib/production/orchestrator';

async function testDrive() {
    console.log("=== REVENUE ENGINE: FULL SYSTEM STRESS TEST ===");
    console.log("Scenario: Automated LinkedIn content for a Multi-Family Construction CFO (Skeptical Adopter, Age 48)");

    const input = `
        The multi-family construction industry is losing billions in manual site coordination. 
        Most project managers are still using spreadsheets and paper maps. 
        AI can automate the coordination, but veterans are skeptical. 
        We need to show how automation prevents the 'Replacement' fear and instead empowers the PM to be a 'Pilot'.
    `;

    try {
        const batch = await runUnifiedProduction(input, '15s');

        console.log("\n--- TEST RESULTS ---");
        console.log(`Status: ${batch.status.toUpperCase()}`);
        console.log(`Batch Score: ${(batch.auditReport?.score || 0) * 100}%`);

        console.log("\n[Blackboard Summary]");
        console.log(`Inferences: ${batch.blackboard.inferences.length}`);
        batch.blackboard.inferences.forEach((inf, i) => console.log(`  ${i + 1}. ${inf}`));

        console.log("\n[Auditor Findings]");
        batch.auditReport?.findings.forEach(f => console.log(`  - ${f}`));

        if (batch.status === 'pending') {
            console.log("\n⚠️ ACTION REQUIRED: Human Pilot Review Gated (Marginal Score Detected).");
        } else if (batch.status === 'completed') {
            console.log("\n✅ SUCCESS: Content Released to Production.");
        }

        console.log("\n=== TEST COMPLETE ===");
    } catch (err) {
        console.error("Stress Test CRITICAL FAILURE:", err);
    }
}

testDrive();
