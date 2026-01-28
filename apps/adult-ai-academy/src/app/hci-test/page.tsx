'use client';

import { useState } from 'react';
import { ARCHETYPES, UserArchetype, InteractionPattern, calculateHCICompatibility, HCIMetrics } from '@/lib/hci/archetypes';
import styles from './HCITest.module.css';

export default function HCITestPage() {
    const [selectedArchetype, setSelectedArchetype] = useState<UserArchetype | null>(null);
    const [interaction, setInteraction] = useState<InteractionPattern>({
        contentLength: 'medium',
        format: 'video',
        cognitiveComplexity: 'medium',
        estimatedDuration: 10,
        addressesBarriers: [],
        supportsGoals: []
    });
    const [results, setResults] = useState<HCIMetrics | null>(null);
    const [allResults, setAllResults] = useState<Array<{ archetype: UserArchetype; metrics: HCIMetrics }>>([]);

    const handleArchetypeSelect = (arch: UserArchetype) => {
        setSelectedArchetype(arch);
        setResults(null);
    };

    const handleTestSingle = () => {
        if (selectedArchetype) {
            const metrics = calculateHCICompatibility(selectedArchetype, interaction);
            setResults(metrics);
        }
    };

    const handleTestAll = () => {
        const all = ARCHETYPES.map(arch => ({
            archetype: arch,
            metrics: calculateHCICompatibility(arch, interaction)
        }));
        setAllResults(all);
        setResults(null);
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return '#10b981'; // green
        if (score >= 0.6) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.8) return 'Excellent';
        if (score >= 0.6) return 'Good';
        if (score >= 0.4) return 'Fair';
        return 'Poor';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>HCI Test: 7 User Archetypes</h1>
                <p>Test interaction patterns against Adult AI Academy user archetypes</p>
            </header>

            <div className={styles.main}>
                {/* Archetype Selection */}
                <section className={styles.section}>
                    <h2>Select Archetype</h2>
                    <div className={styles.archetypeGrid}>
                        {ARCHETYPES.map(arch => (
                            <div
                                key={arch.id}
                                className={`${styles.archetypeCard} ${selectedArchetype?.id === arch.id ? styles.selected : ''}`}
                                onClick={() => handleArchetypeSelect(arch)}
                            >
                                <div className={styles.archetypeHeader}>
                                    <h3>{arch.name}</h3>
                                    <span className={styles.badge}>{arch.adoptionMindset}</span>
                                </div>
                                <div className={styles.archetypeDetails}>
                                    <p><strong>{arch.role}</strong> • {arch.industry}</p>
                                    <p>Age: {arch.age} • Tech Comfort: {arch.techComfortLevel}/10</p>
                                    <p className={styles.driver}>{arch.primaryDriver}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Interaction Pattern Configuration */}
                <section className={styles.section}>
                    <h2>Configure Interaction Pattern</h2>
                    <div className={styles.interactionForm}>
                        <div className={styles.formGroup}>
                            <label>Content Length</label>
                            <select
                                value={interaction.contentLength}
                                onChange={(e) => setInteraction({ ...interaction, contentLength: e.target.value as 'short' | 'medium' | 'long' })}
                            >
                                <option value="short">Short</option>
                                <option value="medium">Medium</option>
                                <option value="long">Long</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Format</label>
                            <select
                                value={interaction.format}
                                onChange={(e) => setInteraction({ ...interaction, format: e.target.value as 'text' | 'video' | 'interactive' | 'visual' })}
                            >
                                <option value="text">Text</option>
                                <option value="video">Video</option>
                                <option value="interactive">Interactive</option>
                                <option value="visual">Visual</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Cognitive Complexity</label>
                            <select
                                value={interaction.cognitiveComplexity}
                                onChange={(e) => setInteraction({ ...interaction, cognitiveComplexity: e.target.value as 'low' | 'medium' | 'high' })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Estimated Duration (minutes)</label>
                            <input
                                type="number"
                                value={interaction.estimatedDuration}
                                onChange={(e) => setInteraction({ ...interaction, estimatedDuration: parseInt(e.target.value) || 0 })}
                                min="1"
                                max="60"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Addresses Barriers (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g., data security, skepticism"
                                value={interaction.addressesBarriers.join(', ')}
                                onChange={(e) => setInteraction({
                                    ...interaction,
                                    addressesBarriers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Supports Goals (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g., save time, learn tools"
                                value={interaction.supportsGoals.join(', ')}
                                onChange={(e) => setInteraction({
                                    ...interaction,
                                    supportsGoals: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                onClick={handleTestSingle}
                                disabled={!selectedArchetype}
                                className={styles.button}
                            >
                                Test Selected Archetype
                            </button>
                            <button
                                onClick={handleTestAll}
                                className={styles.button}
                            >
                                Test All 7 Archetypes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Results */}
                {results && selectedArchetype && (
                    <section className={styles.section}>
                        <h2>Compatibility Results: {selectedArchetype.name}</h2>
                        <div className={styles.results}>
                            <div className={styles.scoreCard}>
                                <div className={styles.overallScore} style={{ color: getScoreColor(results.overallScore) }}>
                                    <span className={styles.scoreValue}>{(results.overallScore * 100).toFixed(1)}%</span>
                                    <span className={styles.scoreLabel}>{getScoreLabel(results.overallScore)}</span>
                                </div>
                            </div>

                            <div className={styles.metricsGrid}>
                                <div className={styles.metric}>
                                    <label>Content Length Match</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.contentLengthMatch * 100}%`, backgroundColor: getScoreColor(results.contentLengthMatch) }}
                                        />
                                        <span>{(results.contentLengthMatch * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className={styles.metric}>
                                    <label>Format Match</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.formatMatch * 100}%`, backgroundColor: getScoreColor(results.formatMatch) }}
                                        />
                                        <span>{(results.formatMatch * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className={styles.metric}>
                                    <label>Cognitive Load Match</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.cognitiveLoadMatch * 100}%`, backgroundColor: getScoreColor(results.cognitiveLoadMatch) }}
                                        />
                                        <span>{(results.cognitiveLoadMatch * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className={styles.metric}>
                                    <label>Attention Span Match</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.attentionSpanMatch * 100}%`, backgroundColor: getScoreColor(results.attentionSpanMatch) }}
                                        />
                                        <span>{(results.attentionSpanMatch * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className={styles.metric}>
                                    <label>Barrier Addressment</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.barrierAddressment * 100}%`, backgroundColor: getScoreColor(results.barrierAddressment) }}
                                        />
                                        <span>{(results.barrierAddressment * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div className={styles.metric}>
                                    <label>Goal Alignment</label>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.metricFill}
                                            style={{ width: `${results.goalAlignment * 100}%`, backgroundColor: getScoreColor(results.goalAlignment) }}
                                        />
                                        <span>{(results.goalAlignment * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* All Results Comparison */}
                {allResults.length > 0 && (
                    <section className={styles.section}>
                        <h2>All Archetypes Comparison</h2>
                        <div className={styles.comparisonTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Archetype</th>
                                        <th>Mindset</th>
                                        <th>Overall Score</th>
                                        <th>Content Match</th>
                                        <th>Format Match</th>
                                        <th>Cognitive Match</th>
                                        <th>Attention Match</th>
                                        <th>Barriers</th>
                                        <th>Goals</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allResults
                                        .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
                                        .map(({ archetype, metrics }) => (
                                            <tr key={archetype.id}>
                                                <td><strong>{archetype.name}</strong></td>
                                                <td><span className={styles.badge}>{archetype.adoptionMindset}</span></td>
                                                <td>
                                                    <span style={{ color: getScoreColor(metrics.overallScore), fontWeight: 'bold' }}>
                                                        {(metrics.overallScore * 100).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td>{(metrics.contentLengthMatch * 100).toFixed(0)}%</td>
                                                <td>{(metrics.formatMatch * 100).toFixed(0)}%</td>
                                                <td>{(metrics.cognitiveLoadMatch * 100).toFixed(0)}%</td>
                                                <td>{(metrics.attentionSpanMatch * 100).toFixed(0)}%</td>
                                                <td>{(metrics.barrierAddressment * 100).toFixed(0)}%</td>
                                                <td>{(metrics.goalAlignment * 100).toFixed(0)}%</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

