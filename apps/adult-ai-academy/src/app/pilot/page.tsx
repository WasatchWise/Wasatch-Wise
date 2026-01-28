'use client';

import React, { useEffect, useState } from 'react';
import { getPendingBatches, updateBatchStatus } from '../../lib/supabase/client';
import styles from './Pilot.module.css';

interface Batch {
    id: string;
    audit_score: number;
    synthesis?: {
        refinedContent?: {
            socialHook?: string;
            videoScript?: string;
        };
    };
    blackboard?: {
        inferences?: string[];
    };
}

export default function PilotDashboard() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = async () => {
        try {
            const data = await getPendingBatches();
            setBatches(data);
        } catch (err) {
            console.error("Failed to load pending batches:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: string) => {
        try {
            await updateBatchStatus(id, 'completed');
            setBatches(batches.filter(b => b.id !== id));
        } catch {
            alert("Failed to approve batch. Check logs.");
        }
    };

    const handleRejection = async (id: string) => {
        try {
            await updateBatchStatus(id, 'failed');
            setBatches(batches.filter(b => b.id !== id));
        } catch {
            alert("Failed to reject batch. Check logs.");
        }
    };

    const getScoreClass = (score: number) => {
        if (score >= 0.9) return styles.scoreHigh;
        if (score >= 0.75) return styles.scoreMid;
        return styles.scoreLow;
    };

    if (loading) return <div className={styles.container}><h1>Loading Pilot Ops...</h1></div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Pilot Ops Dashboard</h1>
                <p>Human-in-the-Loop Oversight for Agentic Production</p>
            </header>

            {batches.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No batches requiring manual intervention at this time.</p>
                </div>
            ) : (
                <div className={styles.batchGrid}>
                    {batches.map((batch) => (
                        <div key={batch.id} className={styles.batchCard}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.scoreBadge} ${getScoreClass(batch.audit_score)}`}>
                                    Score: {(batch.audit_score * 100).toFixed(0)}%
                                </div>
                                <span className={styles.batchId}>{batch.id}</span>
                            </div>

                            <div className={styles.contentPreview}>
                                <h3>{batch.synthesis?.refinedContent?.socialHook || "Untitled Production"}</h3>
                                <p>{batch.synthesis?.refinedContent?.videoScript}</p>
                            </div>

                            <div className={styles.blackboardList}>
                                <h4>Agent Inferences</h4>
                                <ul>
                                    {batch.blackboard?.inferences?.slice(0, 3).map((inf: string, i: number) => (
                                        <li key={i}>{inf}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btn} ${styles.approveBtn}`}
                                    onClick={() => handleApproval(batch.id)}
                                >
                                    Approve & Release
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.rejectBtn}`}
                                    onClick={() => handleRejection(batch.id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
