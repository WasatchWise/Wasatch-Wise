/**
 * Content Pattern Templates
 * Pre-configured interaction patterns optimized for each adoption mindset
 * These templates can be used by the synthesis system to generate archetype-specific content
 */

import { InteractionPattern } from './archetypes';

export interface ContentPatternTemplate {
    id: string;
    name: string;
    targetMindset: 'Optimist' | 'Maybe' | 'Unaware';
    description: string;
    pattern: InteractionPattern;
    synthesisGuidance: {
        tone: string;
        focusAreas: string[];
        keyMessages: string[];
        avoid: string[];
        callToAction: string;
    };
}

export const PATTERN_TEMPLATES: ContentPatternTemplate[] = [
    {
        id: 'optimist-interactive',
        name: 'Optimist: Interactive Deep-Dive',
        targetMindset: 'Optimist',
        description: 'For tech-forward professionals who want data-driven, hands-on content',
        pattern: {
            contentLength: 'medium',
            format: 'interactive',
            cognitiveComplexity: 'high',
            estimatedDuration: 12,
            addressesBarriers: ['accuracy', 'regulatory', 'data systems', 'integration', 'ROI'],
            supportsGoals: ['automate analysis', 'predictive insights', 'accuracy', 'ROI', 'competitive edge', 'innovation']
        },
        synthesisGuidance: {
            tone: 'Data-driven, confident, forward-thinking. Avoid oversimplification - they want depth.',
            focusAreas: [
                'Concrete metrics and ROI data',
                'Technical implementation details',
                'Integration with existing systems',
                'Competitive advantages and innovation edge'
            ],
            keyMessages: [
                'Show measurable outcomes and data-backed results',
                'Emphasize cutting-edge capabilities and innovation',
                'Provide technical depth without being condescending',
                'Focus on scalability and competitive parity'
            ],
            avoid: [
                'Oversimplification (feels patronizing)',
                'Generic benefits without proof',
                'Vague promises',
                'Overly cautious or defensive tone'
            ],
            callToAction: 'Explore advanced features → | See the data → | Get hands-on access →'
        }
    },
    {
        id: 'maybe-practical',
        name: 'Maybe: Practical Step-by-Step',
        targetMindset: 'Maybe',
        description: 'For cautious professionals who need practical, immediately usable guidance',
        pattern: {
            contentLength: 'short',
            format: 'video',
            cognitiveComplexity: 'medium',
            estimatedDuration: 8,
            addressesBarriers: ['time', 'complexity', 'skepticism', 'learning', 'fear', 'support', 'reliability'],
            supportsGoals: ['save time', 'learn tools', 'practical', 'quick', 'immediate ROI', 'confidence', 'simple']
        },
        synthesisGuidance: {
            tone: 'Professional yet personable, practical, reassuring. Address skepticism head-on.',
            focusAreas: [
                'Immediate, practical applications',
                'Step-by-step guidance with clear outcomes',
                'Addressing specific barriers explicitly',
                'Building confidence through small wins'
            ],
            keyMessages: [
                'Show immediate ROI and time savings (e.g., "Save 4 hours per week")',
                'Address skepticism directly: "I understand your concerns about [barrier]..."',
                'Provide step-by-step, actionable guidance',
                'Emphasize reliability and human oversight ("AI assists, you decide")',
                'Frame as preventing loss: "Stop losing time on [pain point]"'
            ],
            avoid: [
                'Overpromising or hype language',
                'Ignoring their concerns',
                'Too complex or abstract concepts',
                'Making them feel behind or outdated'
            ],
            callToAction: 'Try it free → | See how it works → | Start your first project →'
        }
    },
    {
        id: 'unaware-visual',
        name: 'Unaware: Simple Visual Guide',
        targetMindset: 'Unaware',
        description: 'For late adopters who need very simple, visual, low-pressure content',
        pattern: {
            contentLength: 'short',
            format: 'visual',
            cognitiveComplexity: 'low',
            estimatedDuration: 5,
            addressesBarriers: ['complexity', 'learning', 'fear', 'support', 'trust', 'lack of information'],
            supportsGoals: ['simple', 'quick', 'easy', 'learn at own pace', 'reliable', 'supported']
        },
        synthesisGuidance: {
            tone: 'Supportive, non-intimidating, encouraging. Never make them feel "stupid" or behind.',
            focusAreas: [
                'Visual, step-by-step guides with minimal text',
                'Simple language, no jargon',
                'Building trust and reducing fear',
                'Emphasizing support and guidance'
            ],
            keyMessages: [
                'Use simple, jargon-free language',
                'Show visual examples and demonstrations',
                'Emphasize: "Learn at your own pace" and "We are here to help"',
                'Focus on one simple concept at a time',
                'Reassure: "You do not need to be a tech expert"',
                'Show real people (like them) succeeding'
            ],
            avoid: [
                'Technical jargon or acronyms',
                'Overwhelming with options',
                'Making them feel inadequate',
                'Complex interfaces or workflows',
                'Pressure or urgency tactics'
            ],
            callToAction: 'Start with basics → | Watch 2-minute demo → | Get free guide →'
        }
    },
    {
        id: 'maybe-security-focused',
        name: 'Maybe: Security & Compliance Focus',
        targetMindset: 'Maybe',
        description: 'For security-conscious professionals (legal, financial, healthcare)',
        pattern: {
            contentLength: 'medium',
            format: 'text',
            cognitiveComplexity: 'medium',
            estimatedDuration: 10,
            addressesBarriers: ['data security', 'ethical', 'compliance', 'accuracy', 'regulatory', 'confidentiality'],
            supportsGoals: ['understand', 'compliance', 'accuracy', 'expertise', 'maintain standards', 'responsible AI']
        },
        synthesisGuidance: {
            tone: 'Authoritative, thorough, compliance-focused. Build trust through transparency.',
            focusAreas: [
                'Data security and confidentiality measures',
                'Compliance and regulatory considerations',
                'Ethical AI use and responsible practices',
                'Accuracy and auditability'
            ],
            keyMessages: [
                'Lead with security and compliance features',
                'Provide detailed information about data handling',
                'Emphasize human oversight and auditability',
                'Show compliance with industry standards',
                'Address ethical concerns directly',
                'Position AI as a tool, not replacement for expertise'
            ],
            avoid: [
                'Vague security claims',
                'Downplaying risks or limitations',
                'Overselling capabilities',
                'Ignoring regulatory concerns'
            ],
            callToAction: 'Review security details → | See compliance info → | Schedule compliance demo →'
        }
    },
    {
        id: 'maybe-time-focused',
        name: 'Maybe: Time Reclamation Focus',
        targetMindset: 'Maybe',
        description: 'For overwhelmed executives who need quick wins and time savings',
        pattern: {
            contentLength: 'short',
            format: 'video',
            cognitiveComplexity: 'low',
            estimatedDuration: 5,
            addressesBarriers: ['time', 'ROI', 'workflow', 'limited time', 'immediate ROI'],
            supportsGoals: ['reclaim time', 'strategic', 'efficiency', 'automate', 'focus on high-value work', 'reduce burnout']
        },
        synthesisGuidance: {
            tone: 'Respectful of their time, efficient, results-focused. Show immediate value.',
            focusAreas: [
                'Concrete time savings (e.g., "Reclaim 4+ hours per week")',
                'Quick implementation (e.g., "Set up in 5 minutes")',
                'Delegating administrative tasks to AI',
                'Focusing on strategic, high-value work'
            ],
            keyMessages: [
                'Quantify time savings with specific numbers',
                'Show how to delegate routine tasks to AI agents',
                'Emphasize quick setup and immediate results',
                'Frame as "getting your time back" for strategic work',
                'Address the "75 emails, 12 meetings" pain point directly'
            ],
            avoid: [
                'Long explanations or deep dives',
                'Complex setup processes',
                'Abstract benefits',
                'Taking more of their time'
            ],
            callToAction: 'Reclaim your time → | 5-minute setup → | See time savings →'
        }
    },
    {
        id: 'maybe-brand-focused',
        name: 'Maybe: Personal Brand & Expertise',
        targetMindset: 'Maybe',
        description: 'For solo professionals concerned about maintaining personal brand and expertise',
        pattern: {
            contentLength: 'medium',
            format: 'text',
            cognitiveComplexity: 'medium',
            estimatedDuration: 10,
            addressesBarriers: ['personal brand', 'expertise', 'authenticity', 'client perception', 'IT support'],
            supportsGoals: ['automate admin', 'thinking partner', 'expertise', 'brand', 'authenticity', 'automate administrative']
        },
        synthesisGuidance: {
            tone: 'Respectful of expertise, positioning AI as enhancement, not replacement.',
            focusAreas: [
                'AI as "thinking partner" and assistant, not replacement',
                'Maintaining personal expertise and brand',
                'Automating admin while preserving strategic value',
                'Authentic, human-centered approach'
            ],
            keyMessages: [
                'Position AI as enhancing your expertise, not replacing it',
                'Emphasize automating administrative tasks, not strategic work',
                'Show how to maintain authenticity and personal brand',
                'Frame as "working smarter, not replacing yourself"',
                'Address client perception concerns directly'
            ],
            avoid: [
                'Suggesting AI replaces expertise',
                'Downplaying the value of human judgment',
                'Generic automation promises',
                'Ignoring brand/authenticity concerns'
            ],
            callToAction: 'Enhance your expertise → | See how experts use it → | Protect your brand →'
        }
    }
];

/**
 * Get templates for a specific mindset
 */
export function getTemplatesByMindset(mindset: 'Optimist' | 'Maybe' | 'Unaware'): ContentPatternTemplate[] {
    return PATTERN_TEMPLATES.filter(t => t.targetMindset === mindset);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ContentPatternTemplate | undefined {
    return PATTERN_TEMPLATES.find(t => t.id === id);
}

/**
 * Get the best template for a given interaction pattern score
 */
export function getBestTemplateForArchetype(
    archetypeId: string,
    preferredFormat?: 'text' | 'video' | 'interactive' | 'visual'
): ContentPatternTemplate | undefined {
    // This would ideally use the HCI compatibility scoring
    // For now, return templates based on mindset
    const templates = PATTERN_TEMPLATES.filter(t => {
        if (preferredFormat && t.pattern.format !== preferredFormat) return false;
        return true;
    });
    
    // Simple heuristic: return first matching template
    // In production, you'd calculate compatibility scores
    return templates[0];
}

/**
 * Detect mindset from topic/context keywords
 * Returns the most likely mindset based on content analysis
 */
export function detectMindsetFromContext(text: string): 'Optimist' | 'Maybe' | 'Unaware' {
    const lowerText = text.toLowerCase();

    // Optimist indicators: tech-forward, data-driven, innovation-focused
    const optimistKeywords = [
        'analytics', 'data-driven', 'metrics', 'roi', 'scale', 'innovation',
        'competitive', 'cutting-edge', 'advanced', 'integrate', 'automate at scale',
        'predictive', 'machine learning', 'deep learning', 'tech stack'
    ];

    // Unaware indicators: beginner, confused, hesitant, fear-based
    const unawareKeywords = [
        'beginner', 'never used', 'confused', 'overwhelmed', 'scared',
        'don\'t understand', 'too old', 'not tech', 'simple', 'basic',
        'first time', 'what is ai', 'how do i start', 'is it safe'
    ];

    // Maybe indicators: practical, cautious, specific concerns
    const maybeKeywords = [
        'security', 'compliance', 'time saving', 'practical', 'step by step',
        'worried about', 'concerned', 'reliable', 'trust', 'accurate',
        'busy', 'no time', 'quick', 'easy to use', 'will it work'
    ];

    let optimistScore = 0;
    let unawareScore = 0;
    let maybeScore = 0;

    for (const keyword of optimistKeywords) {
        if (lowerText.includes(keyword)) optimistScore++;
    }
    for (const keyword of unawareKeywords) {
        if (lowerText.includes(keyword)) unawareScore++;
    }
    for (const keyword of maybeKeywords) {
        if (lowerText.includes(keyword)) maybeScore++;
    }

    // Determine winner (Maybe is default if tied or no signals)
    if (optimistScore > maybeScore && optimistScore > unawareScore) {
        return 'Optimist';
    }
    if (unawareScore > maybeScore && unawareScore > optimistScore) {
        return 'Unaware';
    }
    return 'Maybe'; // Default to largest segment
}

/**
 * Select best template based on context and optional preferences
 * Optionally uses performance data to recommend best-performing templates
 */
export async function selectTemplate(
    text: string,
    options?: {
        mindsetOverride?: 'Optimist' | 'Maybe' | 'Unaware';
        templateIdOverride?: string;
        preferredFormat?: 'text' | 'video' | 'interactive' | 'visual';
        usePerformanceData?: boolean; // If true, uses analytics to recommend
    }
): Promise<ContentPatternTemplate> {
    // Explicit template override takes priority
    if (options?.templateIdOverride) {
        const template = getTemplateById(options.templateIdOverride);
        if (template) return template;
    }

    // Determine mindset (override or auto-detect)
    const mindset = options?.mindsetOverride || detectMindsetFromContext(text);

    // Try to get recommended template from performance data
    if (options?.usePerformanceData) {
        try {
            const { getRecommendedTemplate } = await import('../research/learning-lab');
            const recommendedId = await getRecommendedTemplate(mindset, options?.preferredFormat);
            if (recommendedId) {
                const recommended = getTemplateById(recommendedId);
                if (recommended) {
                    console.log(`[HCI] Using performance-recommended template: ${recommendedId}`);
                    return recommended;
                }
            }
        } catch {
            console.warn('[HCI] Could not load performance recommendations, using default selection');
        }
    }

    // Get templates for this mindset
    let templates = getTemplatesByMindset(mindset);

    // Filter by format preference if specified
    if (options?.preferredFormat) {
        const formatFiltered = templates.filter(t => t.pattern.format === options.preferredFormat);
        if (formatFiltered.length > 0) {
            templates = formatFiltered;
        }
    }

    // Return first matching template (could be enhanced with scoring)
    return templates[0] || PATTERN_TEMPLATES[1]; // Fallback to maybe-practical
}

/**
 * Generate synthesis prompt guidance from a template
 */
export function generateSynthesisPrompt(template: ContentPatternTemplate, topic: string): string {
    return `
CONTENT PATTERN: ${template.name}
TARGET MINDSET: ${template.targetMindset}
TOPIC: ${topic}

PATTERN CONFIGURATION:
- Content Length: ${template.pattern.contentLength}
- Format: ${template.pattern.format}
- Cognitive Complexity: ${template.pattern.cognitiveComplexity}
- Duration: ${template.pattern.estimatedDuration} minutes

TONE: ${template.synthesisGuidance.tone}

FOCUS AREAS:
${template.synthesisGuidance.focusAreas.map(area => `- ${area}`).join('\n')}

KEY MESSAGES TO INCLUDE:
${template.synthesisGuidance.keyMessages.map(msg => `- ${msg}`).join('\n')}

AVOID:
${template.synthesisGuidance.avoid.map(item => `- ${item}`).join('\n')}

BARRIERS TO ADDRESS:
${template.pattern.addressesBarriers.map(barrier => `- ${barrier}`).join('\n')}

GOALS TO SUPPORT:
${template.pattern.supportsGoals.map(goal => `- ${goal}`).join('\n')}

CALL TO ACTION: ${template.synthesisGuidance.callToAction}
`;
}

