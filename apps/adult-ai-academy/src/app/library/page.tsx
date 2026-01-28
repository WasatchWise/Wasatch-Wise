'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Library.module.css';

interface Asset {
    id: number;
    topic: string;
    pillar: string;
    media_url: string;
    type: string;
    hook: string;
}

const initialAssets: Asset[] = [
    {
        id: 1,
        topic: "AI Career Pivot",
        pillar: "AI Anxiety",
        media_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
        type: "image",
        hook: "Why your professional legacy is the ultimate moot in the AI age."
    },
    {
        id: 2,
        topic: "Automated Workflows",
        pillar: "Work Automation",
        media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        type: "video",
        hook: "The 3 AI tools that will save you 10 hours a week."
    }
];

export default function AssetLibrary() {
    const [assets] = useState<Asset[]>(initialAssets);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Asset Library</h2>
                <p className={styles.subtitle}>Your repository of brand-aligned, Academy-ready content.</p>
            </header>

            <div className={styles.assetGrid}>
                {assets.map(asset => (
                    <div key={asset.id} className={`${styles.assetCard} card`}>
                        <div className={styles.mediaWrapper}>
                            <Image src={asset.media_url} alt={asset.topic} className={styles.media} fill sizes="(max-width: 768px) 100vw, 33vw" />
                            <span className={styles.typeTag}>{asset.type.toUpperCase()}</span>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.meta}>
                                <span className={styles.pillarTag}>{asset.pillar}</span>
                            </div>
                            <h4 className={styles.topic}>{asset.topic}</h4>
                            <p className={styles.hook}>&ldquo;{asset.hook}&rdquo;</p>
                            <div className={styles.actions}>
                                <button className={styles.actionBtn}>Distribute to Socials</button>
                                <button className={styles.actionBtnSecondary}>Move to Curriculum</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
