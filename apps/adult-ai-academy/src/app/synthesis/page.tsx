'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './Synthesis.module.css';

interface StoryboardScene {
    sceneNumber: number;
    assetType: 'image' | 'video';
    scriptSegment: string;
    imagePrompt?: string;
    veoVideoPrompt?: string;
}

interface RefinedContent {
    socialHook: string;
    nepqTrigger?: string;
    videoScript?: string;
    storyboard: StoryboardScene[];
    dissection?: {
        audience: string;
        character: string;
        lookAndTone: string;
        nepqEncouragement: string;
    };
}

interface SynthesisResult {
    pillar: string;
    duration: string;
    detectedMindset?: string;
    templateUsed?: string;
    refinedContent: RefinedContent;
}

interface StoryboardResult {
    scene: StoryboardScene;
    imageUrl?: string;
    videoUrl?: string;
}

interface AudioResult {
    audioUrl?: string;
    title?: string;
    duration?: number;
    provider: 'suno' | 'mock';
}

interface AudioConfig {
    enabled: boolean;
    instrumental: boolean;
    vocalType: 'male' | 'female' | 'none';
    style: string;
    lyrics: string;
}

interface VersionResult {
    mindset: string;
    templateName: string;
    result: SynthesisResult;
}

interface MultiVersionResult {
    versions: VersionResult[];
    duration: string;
}

// Inner component that uses search params
function SynthesisLabContent({ initialTopic, initialUrl }: { initialTopic?: string; initialUrl?: string }) {
    const [url, setUrl] = useState(initialUrl || '');
    const [rawText, setRawText] = useState(initialTopic || '');
    const [duration, setDuration] = useState<string>('30s');
    const [mindsetOverride, setMindsetOverride] = useState<'Optimist' | 'Maybe' | 'Unaware' | ''>('');
    const [templateId, setTemplateId] = useState<string>('');
    const [preferredFormat, setPreferredFormat] = useState<'text' | 'video' | 'interactive' | 'visual' | ''>('');
    const [generateMultiVersion, setGenerateMultiVersion] = useState(false);
    const [result, setResult] = useState<SynthesisResult | null>(null);
    const [multiVersionResult, setMultiVersionResult] = useState<MultiVersionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [multiVersionLoading, setMultiVersionLoading] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const [storyboardResults, setStoryboardResults] = useState<StoryboardResult[]>([]);
    const [heygenVideoId, setHeygenVideoId] = useState<string | null>(null);
    const [projectName, setProjectName] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [audioConfig, setAudioConfig] = useState<AudioConfig>({
        enabled: true,
        instrumental: true,
        vocalType: 'none',
        style: 'professional, corporate, calm, modern',
        lyrics: '',
    });
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
    const [assetGenerating, setAssetGenerating] = useState<number | null>(null); // scene number being generated
    const [allAssetsLoading, setAllAssetsLoading] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [flaggedScenes, setFlaggedScenes] = useState<Set<number>>(new Set());

    // Generate asset for a single scene
    const handleGenerateSceneAsset = async (scene: StoryboardScene) => {
        setAssetGenerating(scene.sceneNumber);
        try {
            const prompt = scene.assetType === 'image' ? scene.imagePrompt : scene.veoVideoPrompt;
            if (!prompt) {
                alert('No prompt available for this scene');
                return;
            }

            const response = await fetch('/api/assets/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    type: scene.assetType,
                }),
            });

            const data = await response.json();
            if (data.url) {
                setStoryboardResults(prev => {
                    const existing = prev.find(r => r.scene.sceneNumber === scene.sceneNumber);
                    if (existing) {
                        return prev.map(r =>
                            r.scene.sceneNumber === scene.sceneNumber
                                ? { ...r, imageUrl: scene.assetType === 'image' ? data.url : r.imageUrl, videoUrl: scene.assetType === 'video' ? data.url : r.videoUrl }
                                : r
                        );
                    } else {
                        return [...prev, { scene, imageUrl: scene.assetType === 'image' ? data.url : undefined, videoUrl: scene.assetType === 'video' ? data.url : undefined }];
                    }
                });
            }
        } catch (error) {
            console.error('Asset generation failed:', error);
            alert('Failed to generate asset. Check console for details.');
        } finally {
            setAssetGenerating(null);
        }
    };

    // Generate all scene assets
    const handleGenerateAllAssets = async () => {
        if (!result?.refinedContent?.storyboard) return;
        setAllAssetsLoading(true);
        setFlaggedScenes(new Set()); // Clear any previous flags

        for (const scene of result.refinedContent.storyboard) {
            await handleGenerateSceneAsset(scene);
        }

        setAllAssetsLoading(false);
        setReviewMode(true); // Enter review mode after generation
    };

    // Toggle flag on a scene
    const toggleFlag = (sceneNumber: number) => {
        setFlaggedScenes(prev => {
            const next = new Set(prev);
            if (next.has(sceneNumber)) {
                next.delete(sceneNumber);
            } else {
                next.add(sceneNumber);
            }
            return next;
        });
    };

    // Regenerate all flagged scenes
    const handleRegenerateFlagged = async () => {
        if (flaggedScenes.size === 0) return;
        setAllAssetsLoading(true);

        const scenes = result?.refinedContent?.storyboard?.filter(
            s => flaggedScenes.has(s.sceneNumber)
        ) || [];

        for (const scene of scenes) {
            await handleGenerateSceneAsset(scene);
        }

        setFlaggedScenes(new Set()); // Clear flags after regeneration
        setAllAssetsLoading(false);
    };

    // Approve and save project
    const handleApproveAndSave = async () => {
        setReviewMode(false);
        await handleSaveToProject();
    };

    const handleScrub = async () => {
        if (generateMultiVersion) {
            handleMultiVersion();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url, 
                    rawText, 
                    duration,
                    mindsetOverride: mindsetOverride || undefined,
                    templateId: templateId || undefined,
                    preferredFormat: preferredFormat || undefined
                }),
            });
            const data = await response.json();
            setResult(data);
            setMultiVersionResult(null); // Clear multi-version results
            setStoryboardResults([]); // Reset batch results
            setHeygenVideoId(null);
        } catch (error) {
            console.error('Scrub failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMultiVersion = async () => {
        setMultiVersionLoading(true);
        setResult(null); // Clear single result
        try {
            const response = await fetch('/api/research/multi-version', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    rawText,
                    duration,
                    usePerformanceData: false,
                    preferredFormat: preferredFormat || undefined
                }),
            });
            const data = await response.json();
            setMultiVersionResult(data);
            setStoryboardResults([]);
            setHeygenVideoId(null);
        } catch (error) {
            console.error('Multi-version generation failed:', error);
            alert('Multi-version generation failed. Check console for details.');
        } finally {
            setMultiVersionLoading(false);
        }
    };

    const handleBatchProduction = async () => {
        if (!rawText) {
            alert("Please provide raw text for production.");
            return;
        }
        setBatchLoading(true);
        try {
            const response = await fetch('/api/production/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText, duration }),
            });
            const data = await response.json();
            if (data.synthesis) {
                setResult(data.synthesis);
                setStoryboardResults(data.storyboardResults);
                setHeygenVideoId(data.heygenVideoId || null);
            }
        } catch (error) {
            console.error('Batch Production failed:', error);
            alert("Batch production encountered an error.");
        } finally {
            setBatchLoading(false);
        }
    };

    const handleSaveToProject = async () => {
        if (!result) {
            alert('No content to save. Generate content first.');
            return;
        }

        const name = projectName.trim() || result.pillar || 'untitled-project';
        setSaveStatus('Saving...');

        try {
            const response = await fetch('/api/projects/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: name,
                    topic: rawText.slice(0, 100) || url || 'Untitled',
                    pillar: result.pillar,
                    duration: result.duration,
                    mindset: result.detectedMindset,
                    refinedContent: result.refinedContent,
                    generatedAssets: (storyboardResults.length > 0 || audioConfig.enabled) ? {
                        images: storyboardResults
                            .filter(s => s.imageUrl)
                            .map(s => ({ sceneNumber: s.scene.sceneNumber, url: s.imageUrl! })),
                        audio: audioResult?.audioUrl ? {
                            url: audioResult.audioUrl,
                            provider: audioResult.provider,
                        } : undefined,
                    } : undefined,
                    audioConfig: audioConfig.enabled ? {
                        instrumental: audioConfig.instrumental,
                        vocalType: audioConfig.vocalType,
                        style: audioConfig.style,
                        lyrics: audioConfig.lyrics,
                    } : undefined,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSaveStatus(`Saved! ${data.filesCreated} files created`);
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('Save failed');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleGenerateAudio = async () => {
        if (!audioConfig.enabled) return;

        setAudioLoading(true);
        setAudioResult(null);

        try {
            const response = await fetch('/api/audio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    style: audioConfig.style,
                    lyrics: audioConfig.instrumental ? undefined : audioConfig.lyrics,
                    instrumental: audioConfig.instrumental,
                    vocalType: audioConfig.vocalType,
                    topic: result?.pillar || rawText.slice(0, 100) || undefined,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setAudioResult({
                    audioUrl: data.audioUrl,
                    title: data.title,
                    duration: data.duration,
                    provider: data.provider,
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Audio generation failed:', error);
            alert('Audio generation failed. Check console for details.');
        } finally {
            setAudioLoading(false);
        }
    };

    const generateLyricsFromScript = () => {
        if (!result?.refinedContent?.videoScript) return;
        // Create a condensed lyrical version of the script
        const script = result.refinedContent?.videoScript || '';
        const lines = script.split(/[.!?]+/).filter(l => l.trim()).slice(0, 8);
        const lyrics = lines.map(l => l.trim()).join('\n');
        setAudioConfig(prev => ({ ...prev, lyrics, instrumental: false, vocalType: 'female' }));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Content Studio</h2>
                <p className={styles.subtitle}>Transform your ideas into production-ready video content. Add a topic, generate your strategy, and create assets.</p>
            </header>

            <div className={styles.grid}>
                <section className={`${styles.panel} card`}>
                    <h3 className={styles.panelTitle}>1. Add Your Content</h3>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Import from URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/legal-ai-news"
                            className={styles.input}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>OR Paste Raw Text</label>
                        <textarea
                            placeholder="Paste LinkedIn bios, news snippets, or notes here..."
                            className={styles.textarea}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Target Content Duration</label>
                        <select
                            className={styles.select}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        >
                            <option value="15s">15 Seconds (3 Scenes)</option>
                            <option value="30s">30 Seconds (5 Scenes)</option>
                            <option value="45s">45 Seconds (7 Scenes)</option>
                            <option value="60s">60 Seconds (10 Scenes)</option>
                            <option value="3m">3 Minutes (20 Scenes)</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>HCI Template Selection (Optional)</label>
                        <div className={styles.templateControls}>
                            <select
                                className={styles.select}
                                value={mindsetOverride}
                                onChange={(e) => {
                                    setMindsetOverride(e.target.value as 'Optimist' | 'Maybe' | 'Unaware' | '');
                                    setTemplateId(''); // Clear template when mindset changes
                                }}
                            >
                                <option value="">Auto-detect Mindset</option>
                                <option value="Optimist">Optimist (Tech-forward)</option>
                                <option value="Maybe">Maybe (Cautious)</option>
                                <option value="Unaware">Unaware (Late Adopter)</option>
                            </select>
                            
                            <select
                                className={styles.select}
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                disabled={!mindsetOverride}
                            >
                                <option value="">Auto-select Template</option>
                                {mindsetOverride === 'Optimist' && (
                                    <>
                                        <option value="optimist-interactive">Interactive Deep-Dive</option>
                                    </>
                                )}
                                {mindsetOverride === 'Maybe' && (
                                    <>
                                        <option value="maybe-practical">Practical Step-by-Step</option>
                                        <option value="maybe-security-focused">Security & Compliance</option>
                                        <option value="maybe-time-focused">Time Reclamation</option>
                                        <option value="maybe-brand-focused">Personal Brand & Expertise</option>
                                    </>
                                )}
                                {mindsetOverride === 'Unaware' && (
                                    <>
                                        <option value="unaware-visual">Simple Visual Guide</option>
                                    </>
                                )}
                            </select>

                            <select
                                className={styles.select}
                                value={preferredFormat}
                                onChange={(e) => setPreferredFormat(e.target.value as 'text' | 'video' | 'interactive' | 'visual' | '')}
                            >
                                <option value="">Any Format</option>
                                <option value="text">Text</option>
                                <option value="video">Video</option>
                                <option value="interactive">Interactive</option>
                                <option value="visual">Visual</option>
                            </select>
                        </div>
                        <p className={styles.helpText}>
                            Leave empty for auto-detection, or override to target specific archetype
                        </p>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <input
                                type="checkbox"
                                checked={generateMultiVersion}
                                onChange={(e) => setGenerateMultiVersion(e.target.checked)}
                                style={{ marginRight: '0.5rem' }}
                            />
                            Generate Multi-Version (All 3 Mindsets)
                        </label>
                        <p className={styles.helpText}>
                            Generate content for Optimist, Maybe, and Unaware mindsets simultaneously for A/B testing
                        </p>
                    </div>

                    <div className={styles.fullWidthActions}>
                        <button
                            className="btn btn-primary fullWidthBtn"
                            onClick={handleScrub}
                            disabled={loading || multiVersionLoading || batchLoading}
                        >
                            {loading || multiVersionLoading
                                ? (generateMultiVersion ? 'Generating 3 Versions...' : 'Generating...')
                                : (generateMultiVersion ? 'Generate Multi-Version' : 'Generate Content Strategy')}
                        </button>
                        <button
                            className={`btn glass productionBtn`}
                            onClick={handleBatchProduction}
                            disabled={loading || batchLoading}
                        >
                            {batchLoading ? 'Generating Assets...' : 'Generate with Assets'}
                        </button>
                    </div>
                </section>

                <section className={`${styles.panel} card`}>
                    <h3 className={styles.panelTitle}>2. Review & Produce</h3>
                    {multiVersionResult ? (
                        <div className={styles.output}>
                            <div className={styles.statLine}>
                                <span className={styles.tag}>Multi-Version</span>
                                <span className={styles.tagSuccess}>{multiVersionResult.versions.length} Versions</span>
                                <span className={styles.tag}>Length: {multiVersionResult.duration}</span>
                            </div>

                            <div className={styles.multiVersionContainer}>
                                {multiVersionResult.versions.map((version, idx) => (
                                    <div key={idx} className={styles.versionCard}>
                                        <div className={styles.versionHeader}>
                                            <h4>{version.mindset} Mindset</h4>
                                            <span className={styles.tagMindset}>{version.templateName}</span>
                                        </div>
                                        
                                        <div className={styles.versionContent}>
                                            <div className={styles.resultItem}>
                                                <p className={styles.resultLabel}>PILLAR</p>
                                                <p className={styles.resultValue}>{version.result.pillar}</p>
                                            </div>
                                            
                                            <div className={styles.resultItem}>
                                                <p className={styles.resultLabel}>SOCIAL HOOK</p>
                                                <p className={styles.resultValue}>{version.result.refinedContent.socialHook}</p>
                                            </div>

                                            <div className={styles.resultItem}>
                                                <p className={styles.resultLabel}>NEPQ TRIGGER</p>
                                                <p className={styles.resultValue}>{version.result.refinedContent.nepqTrigger}</p>
                                            </div>

                                            <div className={styles.resultItem}>
                                                <p className={styles.resultLabel}>STORYBOARD</p>
                                                <p className={styles.resultValue}>
                                                    {version.result.refinedContent.storyboard?.length || 0} scenes
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        // Export or save multi-version results
                                        console.log('Multi-version results:', multiVersionResult);
                                        alert('Multi-version results logged to console. Export feature coming soon.');
                                    }}
                                >
                                    Export Multi-Version
                                </button>
                            </div>
                        </div>
                    ) : result ? (
                        <div className={styles.output}>
                            <div className={styles.statLine}>
                                <span className={styles.tag}>Pillar: {result.pillar}</span>
                                <span className={styles.tagSuccess}>Tone: Calm/Authoritative</span>
                                <span className={styles.tag}>Length: {result.duration}</span>
                                {result.detectedMindset && (
                                    <span className={styles.tagMindset} title="Detected User Mindset">
                                        Mindset: {result.detectedMindset}
                                    </span>
                                )}
                                {result.templateUsed && (
                                    <span className={styles.tagTemplate} title="HCI Template Used">
                                        Template: {result.templateUsed.replace(/-/g, ' ')}
                                    </span>
                                )}
                                {heygenVideoId && <span className={styles.tagHeygen}>HeyGen ID: {heygenVideoId}</span>}
                            </div>

                            {result.refinedContent?.dissection && (
                                <div className={styles.dissectionHub}>
                                    <div className={styles.dissectionItem}>
                                        <p className={styles.dissectionLabel}>Audience</p>
                                        <p className={styles.dissectionValue}>{result.refinedContent.dissection.audience}</p>
                                    </div>
                                    <div className={styles.dissectionItem}>
                                        <p className={styles.dissectionLabel}>Character</p>
                                        <p className={styles.dissectionValue}>{result.refinedContent.dissection.character}</p>
                                    </div>
                                    <div className={styles.dissectionItem}>
                                        <p className={styles.dissectionLabel}>Look & Tone</p>
                                        <p className={styles.dissectionValue}>{result.refinedContent.dissection.lookAndTone}</p>
                                    </div>
                                    <div className={styles.dissectionItem}>
                                        <p className={styles.dissectionLabel}>Encouragement (NEPQ)</p>
                                        <p className={styles.dissectionValue}>{result.refinedContent.dissection.nepqEncouragement}</p>
                                    </div>
                                </div>
                            )}

                            {result.refinedContent && (
                                <>
                                    <div className={styles.resultItem}>
                                        <p className={styles.resultLabel}>SOCIAL HOOK</p>
                                        <p className={styles.resultValue}>{result.refinedContent.socialHook}</p>
                                    </div>

                                    <div className={styles.resultItem}>
                                        <div className={styles.labelRow}>
                                            <p className={styles.resultLabel}>PRODUCTION STORYBOARD ({result.refinedContent.storyboard?.length || 0} Scenes)</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleGenerateAllAssets}
                                                    disabled={allAssetsLoading || assetGenerating !== null}
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                >
                                                    {allAssetsLoading ? 'Generating All...' : 'Generate All Images'}
                                                </button>
                                                <button
                                                    className="btn glass"
                                                    onClick={() => {
                                                        const prompts = result.refinedContent.storyboard?.map(scene =>
                                                            `Scene ${scene.sceneNumber} (${scene.assetType}):\n${scene.assetType === 'image' ? scene.imagePrompt : scene.veoVideoPrompt}`
                                                        ).join('\n\n---\n\n');
                                                        navigator.clipboard.writeText(prompts || '');
                                                        alert('All prompts copied to clipboard!');
                                                    }}
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                >
                                                    Copy All Prompts
                                                </button>
                                                {storyboardResults.some(r => r.imageUrl || r.videoUrl) && !reviewMode && (
                                                    <button
                                                        className="btn glass"
                                                        onClick={() => setReviewMode(true)}
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                    >
                                                        Review Assets
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Mode Panel */}
                                        {reviewMode && (
                                            <div className={styles.reviewPanel}>
                                                <div className={styles.reviewHeader}>
                                                    <h4>Asset Review - Quality Control</h4>
                                                    <p className={styles.helpText}>Click images to flag for regeneration. Check for contextual alignment and out-of-place elements.</p>
                                                </div>
                                                <div className={styles.reviewGrid}>
                                                    {storyboardResults.map((item) => (
                                                        <div
                                                            key={item.scene.sceneNumber}
                                                            className={`${styles.reviewCard} ${flaggedScenes.has(item.scene.sceneNumber) ? styles.flagged : ''}`}
                                                            onClick={() => toggleFlag(item.scene.sceneNumber)}
                                                        >
                                                            <div className={styles.reviewImageWrap}>
                                                                {item.imageUrl || item.videoUrl ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={item.imageUrl || item.videoUrl}
                                                                        alt={`Scene ${item.scene.sceneNumber}`}
                                                                        className={styles.reviewImage}
                                                                    />
                                                                ) : (
                                                                    <div className={styles.reviewPlaceholder}>No asset</div>
                                                                )}
                                                                {flaggedScenes.has(item.scene.sceneNumber) && (
                                                                    <div className={styles.flagBadge}>FLAGGED</div>
                                                                )}
                                                            </div>
                                                            <div className={styles.reviewInfo}>
                                                                <span className={styles.reviewSceneNum}>Scene {item.scene.sceneNumber}</span>
                                                                <span className={styles.reviewScript}>{item.scene.scriptSegment.slice(0, 60)}...</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={styles.reviewActions}>
                                                    <button
                                                        className="btn glass"
                                                        onClick={() => setReviewMode(false)}
                                                    >
                                                        Back to Edit
                                                    </button>
                                                    {flaggedScenes.size > 0 && (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={handleRegenerateFlagged}
                                                            disabled={allAssetsLoading}
                                                        >
                                                            {allAssetsLoading ? 'Regenerating...' : `Regenerate ${flaggedScenes.size} Flagged`}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleApproveAndSave}
                                                        disabled={flaggedScenes.size > 0 || !!saveStatus}
                                                    >
                                                        {saveStatus || 'Approve & Save Project'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.storyboard}>
                                            {(storyboardResults.length > 0 ? storyboardResults : (result.refinedContent.storyboard || []).map((s): StoryboardResult => ({ scene: s }))).map((item, idx) => (
                                        <div key={idx} className={styles.sceneCard}>
                                            <div className={styles.sceneHeader}>
                                                <span className={styles.sceneNumber}>Scene {item.scene.sceneNumber} ({item.scene.assetType})</span>
                                                {'imageUrl' in item || 'videoUrl' in item ? <span className={styles.tagSuccess}>Asset Ready</span> : <span className={styles.tag}>Draft</span>}
                                            </div>
                                            <div className={styles.sceneBody}>
                                                <div className={styles.sceneText}>
                                                    <p className={styles.scriptSegment}>{item.scene.scriptSegment}</p>
                                                    <div className={styles.assetPrompt}>
                                                        <strong>Logic:</strong> {item.scene.assetType === 'video' ? item.scene.veoVideoPrompt : item.scene.imagePrompt}
                                                    </div>
                                                </div>
                                                <div className={styles.sceneMedia}>
                                                    {'imageUrl' in item && item.imageUrl || 'videoUrl' in item && item.videoUrl ? (
                                                        // Using img for dynamic AI-generated URLs
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.imageUrl || item.videoUrl} alt="Preview" className={styles.preview} />
                                                    ) : (
                                                        <div className={styles.mediaPlaceholder}>
                                                            <button
                                                                className={styles.miniBtn}
                                                                onClick={() => handleGenerateSceneAsset(item.scene)}
                                                                disabled={assetGenerating === item.scene.sceneNumber || allAssetsLoading}
                                                            >
                                                                {assetGenerating === item.scene.sceneNumber ? 'Generating...' : `Generate ${item.scene.assetType}`}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.resultItem}>
                                <p className={styles.resultLabel}>AUDIO / MUSIC</p>
                                <div className={styles.audioSection}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={audioConfig.enabled}
                                            onChange={(e) => setAudioConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                                        />
                                        Include background music
                                    </label>

                                    {audioConfig.enabled && (
                                        <>
                                            <div className={styles.audioOptions}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={audioConfig.instrumental}
                                                        onChange={(e) => setAudioConfig(prev => ({
                                                            ...prev,
                                                            instrumental: e.target.checked,
                                                            vocalType: e.target.checked ? 'none' : 'female'
                                                        }))}
                                                    />
                                                    Instrumental only (no vocals)
                                                </label>

                                                {!audioConfig.instrumental && (
                                                    <select
                                                        className={styles.select}
                                                        value={audioConfig.vocalType}
                                                        onChange={(e) => setAudioConfig(prev => ({
                                                            ...prev,
                                                            vocalType: e.target.value as 'male' | 'female' | 'none'
                                                        }))}
                                                    >
                                                        <option value="female">Female Vocals</option>
                                                        <option value="male">Male Vocals</option>
                                                    </select>
                                                )}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label className={styles.label}>Style Tags</label>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    value={audioConfig.style}
                                                    onChange={(e) => setAudioConfig(prev => ({ ...prev, style: e.target.value }))}
                                                    placeholder="professional, corporate, uplifting, modern"
                                                />
                                            </div>

                                            {!audioConfig.instrumental && (
                                                <div className={styles.inputGroup}>
                                                    <div className={styles.labelRow}>
                                                        <label className={styles.label}>Lyrics</label>
                                                        {result?.refinedContent?.videoScript && (
                                                            <button
                                                                className={styles.miniBtn}
                                                                onClick={generateLyricsFromScript}
                                                                type="button"
                                                            >
                                                                Generate from Script
                                                            </button>
                                                        )}
                                                    </div>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={audioConfig.lyrics}
                                                        onChange={(e) => setAudioConfig(prev => ({ ...prev, lyrics: e.target.value }))}
                                                        placeholder="Enter lyrics for the song..."
                                                        style={{ minHeight: '100px' }}
                                                    />
                                                </div>
                                            )}

                                            <div className={styles.audioActions}>
                                                <button
                                                    className="btn glass"
                                                    onClick={handleGenerateAudio}
                                                    disabled={audioLoading}
                                                >
                                                    {audioLoading ? 'Generating...' : 'Generate via API'}
                                                </button>
                                                <button
                                                    className="btn glass"
                                                    onClick={() => {
                                                        const prompt = audioConfig.instrumental
                                                            ? `Style: ${audioConfig.style}\n\n[Instrumental]`
                                                            : `Style: ${audioConfig.style}\nVocals: ${audioConfig.vocalType}\n\nLyrics:\n${audioConfig.lyrics}`;
                                                        navigator.clipboard.writeText(prompt);
                                                        alert('Audio prompt copied! Paste into Suno.');
                                                    }}
                                                >
                                                    Copy for Suno
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {audioResult && (
                                        <div className={styles.audioResult}>
                                            {audioResult.audioUrl ? (
                                                <>
                                                    <audio controls src={audioResult.audioUrl} style={{ width: '100%', marginTop: '0.5rem' }} />
                                                    <p className={styles.helpText}>
                                                        {audioResult.title} ({audioResult.duration}s) - via {audioResult.provider}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={styles.helpText}>
                                                    Audio spec ready - use &quot;Copy for Suno&quot; to generate manually
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                                </>
                            )}

                            <div className={styles.actions}>
                                <input
                                    type="text"
                                    placeholder="Project name (optional)"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className={styles.input}
                                    style={{ maxWidth: '200px', marginRight: '0.5rem' }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveToProject}
                                    disabled={!!saveStatus}
                                >
                                    {saveStatus || 'Save to Folder'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            Ingest information to start the production shop.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Component to read search params (needs Suspense boundary)
function SearchParamsReader({ children }: { children: (params: { topic?: string; url?: string }) => React.ReactNode }) {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || undefined;
    const url = searchParams.get('url') || undefined;
    return <>{children({ topic, url })}</>;
}

// Main export with Suspense boundary for useSearchParams
export default function SynthesisLab() {
    return (
        <Suspense fallback={<div className={styles.container}><p>Loading...</p></div>}>
            <SearchParamsReader>
                {({ topic, url }) => (
                    <SynthesisLabContent initialTopic={topic} initialUrl={url} />
                )}
            </SearchParamsReader>
        </Suspense>
    );
}
