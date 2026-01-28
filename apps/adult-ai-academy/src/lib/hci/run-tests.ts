/**
 * HCI Test Runner
 * Tests various interaction patterns against all 7 archetypes
 */

import { ARCHETYPES, InteractionPattern, calculateHCICompatibility, HCIMetrics, UserArchetype } from './archetypes';

interface TestResult {
    pattern: string;
    interaction: InteractionPattern;
    results: Array<{
        archetype: UserArchetype;
        metrics: HCIMetrics;
    }>;
    averageScore: number;
    bestFit: string;
    worstFit: string;
}

// Define test patterns representing different content strategies
const TEST_PATTERNS: Array<{ name: string; pattern: InteractionPattern }> = [
    {
        name: 'Adult AI Academy Default (30s Video)',
        pattern: {
            contentLength: 'short',
            format: 'video',
            cognitiveComplexity: 'medium',
            estimatedDuration: 8,
            addressesBarriers: ['time', 'complexity', 'skepticism', 'learning', 'fear'],
            supportsGoals: ['save time', 'learn tools', 'practical', 'quick', 'easy', 'hands-on']
        }
    },
    {
        name: 'Quick Visual Guide (15s)',
        pattern: {
            contentLength: 'short',
            format: 'visual',
            cognitiveComplexity: 'low',
            estimatedDuration: 5,
            addressesBarriers: ['complexity', 'learning', 'fear'],
            supportsGoals: ['simple', 'quick', 'easy']
        }
    },
    {
        name: 'Interactive Workshop (10min)',
        pattern: {
            contentLength: 'medium',
            format: 'interactive',
            cognitiveComplexity: 'medium',
            estimatedDuration: 10,
            addressesBarriers: ['hands-on', 'practical', 'learning'],
            supportsGoals: ['learn tools', 'hands-on', 'practical']
        }
    },
    {
        name: 'Deep-Dive Text Article',
        pattern: {
            contentLength: 'long',
            format: 'text',
            cognitiveComplexity: 'high',
            estimatedDuration: 20,
            addressesBarriers: ['data security', 'ethical', 'compliance', 'accuracy'],
            supportsGoals: ['understand', 'compliance', 'accuracy', 'expertise']
        }
    },
    {
        name: 'Executive Summary (5min Video)',
        pattern: {
            contentLength: 'short',
            format: 'video',
            cognitiveComplexity: 'low',
            estimatedDuration: 5,
            addressesBarriers: ['time', 'ROI', 'workflow'],
            supportsGoals: ['reclaim time', 'strategic', 'efficiency', 'automate']
        }
    },
    {
        name: 'Step-by-Step Tutorial (Medium)',
        pattern: {
            contentLength: 'medium',
            format: 'video',
            cognitiveComplexity: 'low',
            estimatedDuration: 8,
            addressesBarriers: ['complexity', 'learning', 'fear', 'support'],
            supportsGoals: ['learn at own pace', 'simple', 'reliable', 'supported']
        }
    },
    {
        name: 'Data-Driven Case Study',
        pattern: {
            contentLength: 'medium',
            format: 'interactive',
            cognitiveComplexity: 'high',
            estimatedDuration: 12,
            addressesBarriers: ['accuracy', 'regulatory', 'data systems', 'auditable'],
            supportsGoals: ['automate analysis', 'predictive insights', 'accuracy', 'ROI']
        }
    },
    {
        name: 'Thought Leadership Text',
        pattern: {
            contentLength: 'medium',
            format: 'text',
            cognitiveComplexity: 'medium',
            estimatedDuration: 10,
            addressesBarriers: ['personal brand', 'expertise', 'authenticity'],
            supportsGoals: ['thinking partner', 'expertise', 'brand', 'automate admin']
        }
    }
];

function runAllTests(): TestResult[] {
    const results: TestResult[] = [];

    for (const { name, pattern } of TEST_PATTERNS) {
        const archetypeResults = ARCHETYPES.map(archetype => ({
            archetype,
            metrics: calculateHCICompatibility(archetype, pattern)
        }));

        const scores = archetypeResults.map(r => r.metrics.overallScore);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        const sorted = [...archetypeResults].sort((a, b) => b.metrics.overallScore - a.metrics.overallScore);

        results.push({
            pattern: name,
            interaction: pattern,
            results: archetypeResults,
            averageScore,
            bestFit: sorted[0].archetype.name,
            worstFit: sorted[sorted.length - 1].archetype.name
        });
    }

    return results;
}

function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

function getScoreEmoji(score: number): string {
    if (score >= 0.8) return '🟢';
    if (score >= 0.6) return '🟡';
    return '🔴';
}

function printResults(results: TestResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('HCI TEST RESULTS - Adult AI Academy');
    console.log('Testing 8 interaction patterns against 7 user archetypes');
    console.log('='.repeat(80));

    // Summary Table
    console.log('\n## PATTERN SUMMARY\n');
    console.log('| Pattern | Avg Score | Best Fit | Worst Fit |');
    console.log('|---------|-----------|----------|-----------|');

    for (const result of results.sort((a, b) => b.averageScore - a.averageScore)) {
        console.log(`| ${result.pattern} | ${getScoreEmoji(result.averageScore)} ${formatPercentage(result.averageScore)} | ${result.bestFit} | ${result.worstFit} |`);
    }

    // Detailed Results per Pattern
    console.log('\n' + '='.repeat(80));
    console.log('## DETAILED RESULTS BY PATTERN');
    console.log('='.repeat(80));

    for (const result of results) {
        console.log(`\n### ${result.pattern}`);
        console.log(`Average Score: ${getScoreEmoji(result.averageScore)} ${formatPercentage(result.averageScore)}`);
        console.log(`Config: ${result.interaction.contentLength} | ${result.interaction.format} | ${result.interaction.cognitiveComplexity} complexity | ${result.interaction.estimatedDuration}min`);
        console.log('');
        console.log('| Archetype | Mindset | Overall | Content | Format | Cognitive | Attention | Barriers | Goals |');
        console.log('|-----------|---------|---------|---------|--------|-----------|-----------|----------|-------|');

        const sorted = result.results.sort((a, b) => b.metrics.overallScore - a.metrics.overallScore);
        for (const { archetype, metrics } of sorted) {
            console.log(`| ${archetype.name} | ${archetype.adoptionMindset} | ${getScoreEmoji(metrics.overallScore)} ${formatPercentage(metrics.overallScore)} | ${formatPercentage(metrics.contentLengthMatch)} | ${formatPercentage(metrics.formatMatch)} | ${formatPercentage(metrics.cognitiveLoadMatch)} | ${formatPercentage(metrics.attentionSpanMatch)} | ${formatPercentage(metrics.barrierAddressment)} | ${formatPercentage(metrics.goalAlignment)} |`);
        }
    }

    // Archetype Analysis
    console.log('\n' + '='.repeat(80));
    console.log('## ARCHETYPE ANALYSIS');
    console.log('Which patterns work best for each archetype?');
    console.log('='.repeat(80));

    for (const archetype of ARCHETYPES) {
        const patternScores = results.map(r => ({
            pattern: r.pattern,
            score: r.results.find(ar => ar.archetype.id === archetype.id)!.metrics.overallScore
        })).sort((a, b) => b.score - a.score);

        console.log(`\n### ${archetype.name} (${archetype.adoptionMindset})`);
        console.log(`Role: ${archetype.role} | Industry: ${archetype.industry}`);
        console.log(`Tech Comfort: ${archetype.techComfortLevel}/10 | Loss Aversion: ${archetype.lossAversionLevel}/10`);
        console.log(`Prefers: ${archetype.interactionPreferences.preferredContentLength} ${archetype.interactionPreferences.preferredFormat}, ${archetype.interactionPreferences.attentionSpan}min attention span`);
        console.log('');
        console.log('Best patterns:');
        for (let i = 0; i < 3; i++) {
            console.log(`  ${i + 1}. ${getScoreEmoji(patternScores[i].score)} ${patternScores[i].pattern}: ${formatPercentage(patternScores[i].score)}`);
        }
        console.log('Worst patterns:');
        for (let i = patternScores.length - 2; i < patternScores.length; i++) {
            console.log(`  - ${getScoreEmoji(patternScores[i].score)} ${patternScores[i].pattern}: ${formatPercentage(patternScores[i].score)}`);
        }
    }

    // Recommendations
    console.log('\n' + '='.repeat(80));
    console.log('## RECOMMENDATIONS');
    console.log('='.repeat(80));

    const bestOverall = results.sort((a, b) => b.averageScore - a.averageScore)[0];
    console.log(`\n### Best Overall Pattern: ${bestOverall.pattern}`);
    console.log(`Average compatibility: ${formatPercentage(bestOverall.averageScore)}`);
    console.log(`This pattern provides the most consistent performance across all archetypes.`);

    // Find patterns that excel for specific mindsets
    const optimists = ARCHETYPES.filter(a => a.adoptionMindset === 'Optimist');
    const maybes = ARCHETYPES.filter(a => a.adoptionMindset === 'Maybe');
    const unaware = ARCHETYPES.filter(a => a.adoptionMindset === 'Unaware');

    console.log('\n### Best Patterns by Adoption Mindset:');

    for (const [mindset, archs] of [['Optimist', optimists], ['Maybe', maybes], ['Unaware', unaware]] as const) {
        const patternScores = results.map(r => ({
            pattern: r.pattern,
            avgScore: (archs as UserArchetype[]).reduce((sum, arch) =>
                sum + r.results.find(ar => ar.archetype.id === arch.id)!.metrics.overallScore, 0
            ) / archs.length
        })).sort((a, b) => b.avgScore - a.avgScore);

        console.log(`\n${mindset} mindset (${archs.length} archetypes):`);
        console.log(`  Best: ${patternScores[0].pattern} (${formatPercentage(patternScores[0].avgScore)})`);
        console.log(`  2nd:  ${patternScores[1].pattern} (${formatPercentage(patternScores[1].avgScore)})`);
    }

    console.log('\n### Key Insights:');
    console.log('1. Short video content performs well across most archetypes');
    console.log('2. High cognitive complexity alienates Late Adopters and overwhelmed executives');
    console.log('3. Interactive formats excel with tech-forward and data-driven users');
    console.log('4. Step-by-step tutorials are essential for "Maybe" and "Unaware" mindsets');
    console.log('5. Match content duration to attention span for best engagement');
}

// Export for programmatic use
export { runAllTests, TEST_PATTERNS };
export type { TestResult };

// Run if executed directly
const results = runAllTests();
printResults(results);
