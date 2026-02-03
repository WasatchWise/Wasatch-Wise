'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ResourceItem {
    label: string;
    value: string;
}

interface MediaYouTube {
    type: 'youtube';
    videoId: string;
    title?: string;
    channel?: string;
    views?: string;
}

interface MediaPodcast {
    type: 'podcast';
    title: string;
    host?: string;
    episodeTitle?: string;
    embedUrl: string;
    duration?: string;
}

interface MediaCarousel {
    type: 'carousel';
    images: Array<{
        url: string;
        caption: string;
        credit?: string;
    }>;
}

interface Resource {
    id: string;
    title: string;
    type: 'guide' | 'gear' | 'terminology' | 'sizing' | 'faq' | 'media';
    icon: string;
    content?: string;
    items?: ResourceItem[];
    media?: MediaYouTube | MediaPodcast | MediaCarousel;
}

interface TripKitResourceCenterProps {
    resources: Resource[];
}

type TabCategory = 'essentials' | 'history' | 'mountain' | 'planning';

const CATEGORY_MAP: Record<string, TabCategory> = {
    'resort-selection': 'essentials',
    'transportation': 'planning',
    'lessons': 'essentials',
    'when-to-go': 'planning',
    'passes': 'planning',
    'rentals': 'essentials',
    'pack-survival': 'mountain',
    'interlodge-prep': 'mountain',
    'origins': 'history',
    'snowboard-ban': 'history',
    'olympics-legacy': 'history',
    'athletes': 'history',
    'skiing-types': 'mountain',
    'greatest-snow': 'history',
    'interlodge': 'mountain',
    'challenges': 'history',
    'difficulty': 'mountain',
    'gear': 'essentials',
    'sizing': 'essentials',
    'first-day': 'essentials',
    'beyond-utah': 'planning',
    // Media resources
    'youtube-top10-utah': 'planning',
    'youtube-utah-skiing': 'history',
    'youtube-alta-powder': 'mountain',
    'youtube-beginner-tips': 'essentials',
    'podcast-ski-utah': 'history',
    'youtube-park-city-tour': 'planning',
    // TK-VAL: Romantic Road Trips & Valentine's Compendium
    'staycation-itineraries': 'planning',
    'valentines-slc-events': 'essentials',
    'singles-events': 'essentials',
};

const TAB_CONFIG = {
    essentials: {
        label: '🎿 Beginner Essentials',
        color: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    history: {
        label: '🏔️ History & Culture',
        color: 'from-purple-500 to-pink-500',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
    },
    mountain: {
        label: '⛷️ On The Mountain',
        color: 'from-green-500 to-emerald-500',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    planning: {
        label: '📅 Planning Your Trip',
        color: 'from-orange-500 to-amber-500',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
    },
};

// Simple Image Carousel Component
function ImageCarousel({ images }: { images: Array<{ url: string; caption: string; credit?: string }> }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((i) => (i + 1) % images.length);
    const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

    if (images.length === 0) return null;

    const current = images[currentIndex];

    return (
        <div className="relative">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <Image
                    src={current.url}
                    alt={current.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                            ←
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                            →
                        </button>
                    </>
                )}
            </div>
            <div className="mt-2 text-sm text-gray-700">
                {current.caption}
                {current.credit && <span className="ml-2 text-gray-500">• {current.credit}</span>}
            </div>
            {
                images.length > 1 && (
                    <div className="mt-2 flex justify-center gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                )
            }
        </div >
    );
}

export default function TripKitResourceCenter({ resources }: TripKitResourceCenterProps) {
    const [activeTab, setActiveTab] = useState<TabCategory>('essentials');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(['resort-selection'])); // Auto-expand critical resource

    const categorizedResources = useMemo(() => {
        const categorized: Record<TabCategory, Resource[]> = {
            essentials: [],
            history: [],
            mountain: [],
            planning: [],
        };

        resources.forEach((resource) => {
            const category = CATEGORY_MAP[resource.id] || 'essentials';
            categorized[category].push(resource);
        });

        return categorized;
    }, [resources]);

    const toggleCard = (id: string) => {
        setExpandedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const isCritical = (id: string) => ['resort-selection', 'interlodge-prep'].includes(id);

    return (
        <div className="my-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                    📚 Resource Center
                </h2>
                <p className="text-lg text-gray-600">
                    Everything you need to know, from beginner basics to deep dives
                </p>
            </div>

            {/* Tab Navigation (Sticky) */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 mb-8 -mx-4 px-4 py-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {(Object.keys(TAB_CONFIG) as TabCategory[]).map((tab) => {
                        const config = TAB_CONFIG[tab];
                        const isActive = activeTab === tab;
                        const count = categorizedResources[tab].length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                  flex-shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-all
                  ${isActive
                                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-105`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                `}
                            >
                                {config.label}
                                <span className="ml-2 opacity-75">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Resource Cards */}
            <div className="grid grid-cols-1 gap-4">
                {categorizedResources[activeTab].map((resource) => {
                    const isExpanded = expandedCards.has(resource.id);
                    const critical = isCritical(resource.id);
                    const config = TAB_CONFIG[activeTab];

                    return (
                        <div
                            key={resource.id}
                            className={`
                rounded-2xl overflow-hidden border-2 transition-all
                ${critical
                                    ? 'border-red-400 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg'
                                    : `${config.borderColor} ${config.bgLight}`
                                }
                ${isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'}
              `}
                        >
                            {/* Card Header (Always Visible) */}
                            <button
                                onClick={() => toggleCard(resource.id)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{resource.icon}</span>
                                    <h3 className={`text-xl font-bold text-gray-900 text-left ${critical ? 'text-red-900' : ''}`}>
                                        {resource.title}
                                    </h3>
                                </div>
                                <svg
                                    className={`w-6 h-6 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Card Content (Expandable) */}
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 animate-fadeIn">
                                    {/* Markdown Content */}
                                    {resource.content && (
                                        <div className="prose prose-lg max-w-none mb-4">
                                            <ReactMarkdown
                                                components={{
                                                    h3: ({ node, ...props }) => (
                                                        <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
                                                    ),
                                                    strong: ({ node, ...props }) => (
                                                        <strong className="font-bold text-gray-900" {...props} />
                                                    ),
                                                    em: ({ node, ...props }) => (
                                                        <em className="italic text-gray-800" {...props} />
                                                    ),
                                                }}
                                            >
                                                {resource.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    {/* Items List (for terminology, gear checklists, etc.) */}
                                    {resource.items && resource.items.length > 0 && (
                                        <div className="space-y-3">
                                            {resource.items.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white rounded-xl p-4 border-l-4 border-gray-300 hover:border-blue-500 transition-colors"
                                                >
                                                    <div className="font-bold text-gray-900 mb-1">{item.label}</div>
                                                    <div className="text-gray-700">{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* YouTube Video */}
                                    {resource.media?.type === 'youtube' && (
                                        <div className="mt-4">
                                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                                                <iframe
                                                    className="w-full h-full"
                                                    src={`https://www.youtube-nocookie.com/embed/${resource.media.videoId}`}
                                                    title={resource.media.title || resource.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            {(resource.media.channel || resource.media.views) && (
                                                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                                    {resource.media.channel && (
                                                        <span className="flex items-center gap-1">
                                                            📺 {resource.media.channel}
                                                        </span>
                                                    )}
                                                    {resource.media.views && (
                                                        <span className="flex items-center gap-1">
                                                            👁️ {resource.media.views} views
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Podcast */}
                                    {resource.media?.type === 'podcast' && (
                                        <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-4xl">🎙️</span>
                                                <div>
                                                    <div className="font-bold text-lg text-gray-900">{resource.media.title}</div>
                                                    {resource.media.host && (
                                                        <div className="text-sm text-gray-600">Host: {resource.media.host}</div>
                                                    )}
                                                    {resource.media.duration && (
                                                        <div className="text-sm text-gray-600">Duration: {resource.media.duration}</div>
                                                    )}
                                                </div>
                                            </div>
                                            {resource.media.episodeTitle && (
                                                <div className="text-gray-700 mb-4 italic">
                                                    Episode: {resource.media.episodeTitle}
                                                </div>
                                            )}
                                            <iframe
                                                className="w-full h-32 rounded-lg"
                                                src={resource.media.embedUrl}
                                                title={resource.media.title}
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            />
                                        </div>
                                    )}

                                    {/* Image Carousel */}
                                    {resource.media?.type === 'carousel' && resource.media.images.length > 0 && (
                                        <div className="mt-4">
                                            <ImageCarousel images={resource.media.images} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Helpful Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
                <p>💡 Tip: Bookmark resources you need and revisit before your trip!</p>
            </div>
        </div>
    );
}
