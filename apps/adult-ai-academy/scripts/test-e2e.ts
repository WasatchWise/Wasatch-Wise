/**
 * End-to-End Test for Production Pipeline
 * Tests: Research → Synthesis (with HCI) → Assets → Production Orchestrator
 * 
 * Run with: npm run test:e2e
 * Requires: npm install -D tsx
 */

import { tailorContentLive } from '../src/lib/research/synthesis';
import { runUnifiedProduction } from '../src/lib/production/orchestrator';

interface TestCase {
    name: string;
    rawText: string;
    duration: '15s' | '30s' | '45s' | '60s' | '3m';
    mindsetOverride?: 'Optimist' | 'Maybe' | 'Unaware';
    templateId?: string;
    expectedMindset?: 'Optimist' | 'Maybe' | 'Unaware';
}

const TEST_CASES: TestCase[] = [
    {
        name: 'Optimist - Data-Driven Content',
        rawText: 'AI analytics and data-driven decision making for financial services. Metrics show 40% improvement in ROI when using predictive analytics.',
        duration: '30s',
        mindsetOverride: 'Optimist',
        expectedMindset: 'Optimist'
    },
    {
        name: 'Maybe - Practical Security Focus',
        rawText: 'Lawyers are worried about data security when using AI for discovery automation. Compliance and confidentiality are critical concerns.',
        duration: '30s',
        templateId: 'maybe-security-focused',
        expectedMindset: 'Maybe'
    },
    {
        name: 'Auto-Detect Maybe',
        rawText: 'Busy executives need practical tools to save time. Step-by-step guidance for automating email management and reclaiming 4 hours per week.',
        duration: '30s',
        expectedMindset: 'Maybe'
    },
    {
        name: 'Unaware - Simple Beginner',
        rawText: 'I am a beginner and never used AI before. I am confused and overwhelmed. What is AI? How do I start? Is it safe?',
        duration: '15s',
        expectedMindset: 'Unaware'
    },
    {
        name: 'Maybe - Time Reclamation',
        rawText: 'Overwhelmed C-suite executive managing 75 emails and 12 Zoom meetings daily. Need quick wins to delegate routine tasks and focus on strategy.',
        duration: '30s',
        templateId: 'maybe-time-focused',
        expectedMindset: 'Maybe'
    }
];

async function testSynthesis(testCase: TestCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`   Input: "${testCase.rawText.substring(0, 60)}..."`);
    console.log(`   Duration: ${testCase.duration}`);
    console.log(`   Override: ${testCase.mindsetOverride || 'Auto-detect'}`);
    if (testCase.templateId) {
        console.log(`   Template: ${testCase.templateId}`);
    }

    try {
        const startTime = Date.now();
        const result = await tailorContentLive(
            testCase.rawText,
            testCase.duration,
            {
                mindsetOverride: testCase.mindsetOverride,
                templateId: testCase.templateId
            }
        );
        const duration = Date.now() - startTime;

        // Validate result structure
        if (!result) {
            throw new Error('Result is null');
        }

        if (!result.refinedContent) {
            throw new Error('Missing refinedContent');
        }

        if (!result.refinedContent.storyboard || result.refinedContent.storyboard.length === 0) {
            throw new Error('Missing or empty storyboard');
        }

        // Validate HCI integration
        if (!result.detectedMindset) {
            console.log('   ⚠️  Warning: detectedMindset not returned');
        } else {
            console.log(`   ✓ Mindset detected: ${result.detectedMindset}`);
            if (testCase.expectedMindset && result.detectedMindset !== testCase.expectedMindset) {
                console.log(`   ⚠️  Warning: Expected ${testCase.expectedMindset}, got ${result.detectedMindset}`);
            }
        }

        if (!result.templateUsed) {
            console.log('   ⚠️  Warning: templateUsed not returned');
        } else {
            console.log(`   ✓ Template used: ${result.templateUsed}`);
        }

        // Validate storyboard scenes
        const expectedScenes: Record<string, number> = {
            '15s': 3,
            '30s': 5,
            '45s': 7,
            '60s': 10,
            '3m': 20
        };

        const expectedSceneCount = expectedScenes[testCase.duration];
        if (result.refinedContent.storyboard.length !== expectedSceneCount) {
            console.log(`   ⚠️  Warning: Expected ${expectedSceneCount} scenes, got ${result.refinedContent.storyboard.length}`);
        } else {
            console.log(`   ✓ Storyboard: ${result.refinedContent.storyboard.length} scenes`);
        }

        // Validate content quality
        if (!result.refinedContent.socialHook || result.refinedContent.socialHook.length < 10) {
            throw new Error('Invalid or missing socialHook');
        }

        if (!result.pillar || !['AI Anxiety', 'Work Automation', 'Daily AI Use', 'Personal Productivity'].includes(result.pillar)) {
            console.log(`   ⚠️  Warning: Unexpected pillar: ${result.pillar}`);
        } else {
            console.log(`   ✓ Pillar: ${result.pillar}`);
        }

        console.log(`   ✅ Synthesis passed (${duration}ms)`);
        return { success: true, result, duration };
    } catch (error) {
        console.log(`   ❌ Synthesis failed: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error, duration: 0 };
    }
}

async function testProductionPipeline(testCase: TestCase) {
    console.log(`\n🚀 Testing Full Production Pipeline: ${testCase.name}`);

    try {
        const startTime = Date.now();
        const result = await runUnifiedProduction(
            testCase.rawText,
            testCase.duration
        );
        const duration = Date.now() - startTime;

        // Validate batch structure
        if (!result) {
            throw new Error('Batch result is null');
        }

        if (result.status === 'failed') {
            throw new Error('Production batch failed');
        }

        // Validate synthesis
        if (!result.synthesis) {
            throw new Error('Missing synthesis in batch');
        }

        // Validate storyboard results
        if (!result.storyboardResults || result.storyboardResults.length === 0) {
            console.log('   ⚠️  Warning: No storyboard results (may be expected if assets failed)');
        } else {
            console.log(`   ✓ Storyboard results: ${result.storyboardResults.length} scenes`);
        }

        // Validate blackboard
        if (!result.blackboard) {
            throw new Error('Missing blackboard');
        }

        console.log(`   ✓ Blackboard: ${result.blackboard.inferences.length} inferences, ${result.blackboard.decisions.length} decisions`);

        // Validate audit report
        if (!result.auditReport) {
            console.log('   ⚠️  Warning: No audit report');
        } else {
            console.log(`   ✓ Audit score: ${(result.auditReport.score * 100).toFixed(1)}%`);
            console.log(`   ✓ Audit approved: ${result.auditReport.isApproved}`);
        }

        console.log(`   ✅ Production pipeline passed (${duration}ms)`);
        return { success: true, result, duration };
    } catch (error) {
        console.log(`   ❌ Production pipeline failed: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error, duration: 0 };
    }
}

async function runAllTests() {
    console.log('='.repeat(80));
    console.log('END-TO-END TEST: Adult AI Academy Production Pipeline');
    console.log('='.repeat(80));
    console.log(`\nTesting ${TEST_CASES.length} synthesis test cases...`);

    const synthesisResults = [];
    for (const testCase of TEST_CASES) {
        const result = await testSynthesis(testCase);
        synthesisResults.push({ testCase, result });
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(80));
    console.log('SYNTHESIS TEST SUMMARY');
    console.log('='.repeat(80));

    const passed = synthesisResults.filter(r => r.result.success).length;
    const failed = synthesisResults.filter(r => !r.result.success).length;
    const avgDuration = synthesisResults
        .filter(r => r.result.success)
        .reduce((sum, r) => sum + r.result.duration, 0) / passed || 0;

    console.log(`\n✅ Passed: ${passed}/${TEST_CASES.length}`);
    console.log(`❌ Failed: ${failed}/${TEST_CASES.length}`);
    console.log(`⏱️  Average duration: ${avgDuration.toFixed(0)}ms`);

    // Test full production pipeline with one test case
    console.log('\n' + '='.repeat(80));
    console.log('TESTING FULL PRODUCTION PIPELINE');
    console.log('='.repeat(80));

    const productionTest = TEST_CASES[1]; // Use the security-focused test case
    const productionResult = await testProductionPipeline(productionTest);

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nSynthesis Tests: ${passed}/${TEST_CASES.length} passed`);
    console.log(`Production Pipeline: ${productionResult.success ? '✅ PASSED' : '❌ FAILED'}`);

    if (failed > 0 || !productionResult.success) {
        console.log('\n⚠️  Some tests failed. Review errors above.');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

