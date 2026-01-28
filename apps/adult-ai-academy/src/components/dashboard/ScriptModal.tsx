'use client';

import styles from './ScriptModal.module.css';

interface ScriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    script: string;
    painState: string;
    industryHook?: string;
    videoIdea?: string;
}

export default function ScriptModal({ isOpen, onClose, script, painState, industryHook, videoIdea }: ScriptModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass`} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 style={{ color: 'var(--primary)', fontWeight: 700 }}>NEPQ GENERATED SCRIPT</h3>
                    <span className="tag glass" style={{ fontSize: '0.6rem' }}>{painState}</span>
                </div>

                <div className={styles.content}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>STRATEGIC HOOK</p>
                        <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{industryHook}</p>
                    </div>

                    <p className={styles.scriptText}>{script}</p>

                    {videoIdea && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>VIDEO CONTENT IDEA</p>
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>{videoIdea}</p>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(script)}>Copy Script</button>
                    <button className="btn glass" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
