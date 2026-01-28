/**
 * HCI (Human-Computer Interaction) Test Archetypes
 * Based on Adult AI Academy's target demographic (35-55 professionals)
 * and adoption mindset research from aaa_brains.md
 */

export interface UserArchetype {
    id: string;
    name: string;
    age: number;
    role: string;
    industry: string;
    adoptionMindset: 'Optimist' | 'Maybe' | 'Unaware';
    techComfortLevel: number; // 1-10 scale
    primaryDriver: string;
    barriers: string[];
    painPoints: string[];
    goals: string[];
    interactionPreferences: {
        preferredContentLength: 'short' | 'medium' | 'long';
        preferredFormat: 'text' | 'video' | 'interactive' | 'visual';
        learningStyle: 'hands-on' | 'theoretical' | 'example-based' | 'step-by-step';
        attentionSpan: number; // minutes
    };
    cognitiveLoadTolerance: 'low' | 'medium' | 'high';
    lossAversionLevel: number; // 1-10 scale (λ ≈ 2.25 for target demographic)
}

export const ARCHETYPES: UserArchetype[] = [
    {
        id: 'tech-executive',
        name: 'The Tech-Forward Executive',
        age: 38,
        role: 'VP of Operations',
        industry: 'Technology',
        adoptionMindset: 'Optimist',
        techComfortLevel: 9,
        primaryDriver: 'Maintaining competitive parity and innovation edge',
        barriers: ['Sustaining interest in long-term adoption', 'Integrating with existing tech stack'],
        painPoints: [
            'Information overload from multiple AI tools',
            'Need to stay ahead of competitors',
            'Balancing innovation with team adoption'
        ],
        goals: [
            'Scale AI adoption across organization',
            'Find cutting-edge AI solutions',
            'Measure ROI on AI investments'
        ],
        interactionPreferences: {
            preferredContentLength: 'medium',
            preferredFormat: 'interactive',
            learningStyle: 'hands-on',
            attentionSpan: 15
        },
        cognitiveLoadTolerance: 'high',
        lossAversionLevel: 4
    },
    {
        id: 'cautious-manager',
        name: 'The Cautious Manager',
        age: 45,
        role: 'Mid-Level Manager',
        industry: 'Professional Services',
        adoptionMindset: 'Maybe',
        techComfortLevel: 6,
        primaryDriver: 'Time-savings and billable efficiency',
        barriers: ['Frustration with complex tools', 'Skepticism about AI reliability', 'Data security concerns'],
        painPoints: [
            'Worried about AI making errors in client work',
            'Pressure to maintain quality standards',
            'Feeling left behind by younger colleagues'
        ],
        goals: [
            'Save time on administrative tasks',
            'Learn practical, immediately usable tools',
            'Gain confidence without risking reputation'
        ],
        interactionPreferences: {
            preferredContentLength: 'short',
            preferredFormat: 'video',
            learningStyle: 'step-by-step',
            attentionSpan: 8
        },
        cognitiveLoadTolerance: 'medium',
        lossAversionLevel: 7
    },
    {
        id: 'legal-professional',
        name: 'The Security-Conscious Attorney',
        age: 42,
        role: 'Senior Partner',
        industry: 'Legal Services',
        adoptionMindset: 'Maybe',
        techComfortLevel: 5,
        primaryDriver: 'Efficiency without compromising confidentiality',
        barriers: [
            'Extreme data security concerns',
            'Fear of AI hallucinations affecting case outcomes',
            'Ethical and compliance considerations'
        ],
        painPoints: [
            'Discovery automation needs vs. security requirements',
            'Time spent on repetitive research tasks',
            'Client expectations for modern efficiency'
        ],
        goals: [
            'Automate discovery and research safely',
            'Understand AI limitations and ethical use',
            'Maintain professional edge with responsible AI'
        ],
        interactionPreferences: {
            preferredContentLength: 'medium',
            preferredFormat: 'text',
            learningStyle: 'example-based',
            attentionSpan: 12
        },
        cognitiveLoadTolerance: 'medium',
        lossAversionLevel: 9
    },
    {
        id: 'late-adopter',
        name: 'The Reluctant Late Adopter',
        age: 52,
        role: 'Department Director',
        industry: 'Healthcare',
        adoptionMindset: 'Unaware',
        techComfortLevel: 4,
        primaryDriver: 'Efficiency and exploration, but with high skepticism',
        barriers: [
            'Lack of information and trust',
            'Perceived decline in ability to learn new tools',
            'Fear of appearing incompetent'
        ],
        painPoints: [
            'Feeling "stupid" when technology is confusing',
            'Worry about job security',
            'Overwhelmed by rapid change'
        ],
        goals: [
            'Learn at own pace without pressure',
            'Find simple, reliable tools',
            'Feel supported in the learning process'
        ],
        interactionPreferences: {
            preferredContentLength: 'short',
            preferredFormat: 'visual',
            learningStyle: 'step-by-step',
            attentionSpan: 5
        },
        cognitiveLoadTolerance: 'low',
        lossAversionLevel: 8
    },
    {
        id: 'finance-analyst',
        name: 'The Data-Driven Financial Analyst',
        age: 40,
        role: 'Senior Financial Analyst',
        industry: 'Financial Services',
        adoptionMindset: 'Optimist',
        techComfortLevel: 8,
        primaryDriver: 'Data-backed decision-making and accuracy',
        barriers: ['Ensuring AI outputs meet regulatory standards', 'Integrating with existing data systems'],
        painPoints: [
            'Time spent on data analysis and reporting',
            'Need for accurate, auditable AI outputs',
            'Pressure to make faster decisions with better data'
        ],
        goals: [
            'Automate routine analysis tasks',
            'Leverage AI for predictive insights',
            'Maintain accuracy and compliance'
        ],
        interactionPreferences: {
            preferredContentLength: 'medium',
            preferredFormat: 'interactive',
            learningStyle: 'hands-on',
            attentionSpan: 10
        },
        cognitiveLoadTolerance: 'high',
        lossAversionLevel: 6
    },
    {
        id: 'overwhelmed-exec',
        name: 'The Overwhelmed Executive',
        age: 48,
        role: 'C-Suite Executive',
        industry: 'Manufacturing',
        adoptionMindset: 'Maybe',
        techComfortLevel: 6,
        primaryDriver: 'Workflow automation and reducing burnout',
        barriers: ['Limited time to learn new tools', 'Need for immediate ROI'],
        painPoints: [
            '75+ emails per day',
            '12+ Zoom meetings per week',
            'No time for deep work',
            'Feeling like a bottleneck'
        ],
        goals: [
            'Reclaim 4+ hours per week',
            'Delegate to AI agents effectively',
            'Focus on strategic decisions, not admin'
        ],
        interactionPreferences: {
            preferredContentLength: 'short',
            preferredFormat: 'video',
            learningStyle: 'example-based',
            attentionSpan: 6
        },
        cognitiveLoadTolerance: 'medium',
        lossAversionLevel: 5
    },
    {
        id: 'skeptical-solo',
        name: 'The Skeptical Solo Professional',
        age: 44,
        role: 'Independent Consultant',
        industry: 'Professional Services',
        adoptionMindset: 'Maybe',
        techComfortLevel: 5,
        primaryDriver: 'Time-savings without compromising personal brand',
        barriers: [
            'Fear of AI diluting personal expertise',
            'Concern about client perception',
            'Lack of IT support for troubleshooting'
        ],
        painPoints: [
            'Wearing multiple hats (admin, sales, delivery)',
            'Need to appear modern but maintain authenticity',
            'Limited budget for expensive tools'
        ],
        goals: [
            'Automate administrative tasks',
            'Use AI as a "thinking partner" not replacement',
            'Maintain personal brand and expertise'
        ],
        interactionPreferences: {
            preferredContentLength: 'medium',
            preferredFormat: 'text',
            learningStyle: 'theoretical',
            attentionSpan: 10
        },
        cognitiveLoadTolerance: 'medium',
        lossAversionLevel: 7
    }
];

/**
 * Get archetype by ID
 */
export function getArchetypeById(id: string): UserArchetype | undefined {
    return ARCHETYPES.find(arch => arch.id === id);
}

/**
 * Get archetypes by adoption mindset
 */
export function getArchetypesByMindset(mindset: 'Optimist' | 'Maybe' | 'Unaware'): UserArchetype[] {
    return ARCHETYPES.filter(arch => arch.adoptionMindset === mindset);
}

/**
 * Get archetypes by industry
 */
export function getArchetypesByIndustry(industry: string): UserArchetype[] {
    return ARCHETYPES.filter(arch => arch.industry === industry);
}

/**
 * Calculate HCI compatibility score for a given interaction pattern
 */
export interface HCIMetrics {
    contentLengthMatch: number; // 0-1
    formatMatch: number; // 0-1
    cognitiveLoadMatch: number; // 0-1
    attentionSpanMatch: number; // 0-1
    barrierAddressment: number; // 0-1
    goalAlignment: number; // 0-1
    overallScore: number; // 0-1
}

export interface InteractionPattern {
    contentLength: 'short' | 'medium' | 'long';
    format: 'text' | 'video' | 'interactive' | 'visual';
    cognitiveComplexity: 'low' | 'medium' | 'high';
    estimatedDuration: number; // minutes
    addressesBarriers: string[];
    supportsGoals: string[];
}

export function calculateHCICompatibility(
    archetype: UserArchetype,
    interaction: InteractionPattern
): HCIMetrics {
    // Content length match
    const contentLengthMatch = interaction.contentLength === archetype.interactionPreferences.preferredContentLength 
        ? 1.0 
        : (interaction.contentLength === 'medium' || archetype.interactionPreferences.preferredContentLength === 'medium')
            ? 0.7 
            : 0.4;

    // Format match
    const formatMatch = interaction.format === archetype.interactionPreferences.preferredFormat ? 1.0 : 0.6;

    // Cognitive load match (lower is better for mismatch)
    const cognitiveLoadScores = {
        'low': { 'low': 1.0, 'medium': 0.7, 'high': 0.3 },
        'medium': { 'low': 0.8, 'medium': 1.0, 'high': 0.7 },
        'high': { 'low': 0.5, 'medium': 0.8, 'high': 1.0 }
    };
    const cognitiveLoadMatch = cognitiveLoadScores[archetype.cognitiveLoadTolerance][interaction.cognitiveComplexity];

    // Attention span match (closer to preferred is better)
    const attentionSpanDiff = Math.abs(interaction.estimatedDuration - archetype.interactionPreferences.attentionSpan);
    const attentionSpanMatch = Math.max(0, 1 - (attentionSpanDiff / archetype.interactionPreferences.attentionSpan));

    // Barrier addressment (improved semantic matching)
    // Check if interaction barriers match archetype barriers using keyword matching
    const barrierKeywords: Record<string, string[]> = {
        'security': ['security', 'confidentiality', 'privacy', 'data protection', 'safeguard'],
        'skepticism': ['skepticism', 'doubt', 'distrust', 'reliability', 'concern'],
        'complexity': ['complexity', 'complex', 'difficult', 'complicated', 'challenging'],
        'time': ['time', 'efficient', 'quick', 'fast', 'speed', 'immediate'],
        'learning': ['learning', 'learn', 'understand', 'grasp', 'comprehension', 'education'],
        'fear': ['fear', 'worry', 'anxious', 'concerned', 'nervous', 'apprehensive'],
        'support': ['support', 'help', 'assistance', 'guidance', 'troubleshooting'],
        'ROI': ['ROI', 'return', 'value', 'investment', 'benefit', 'efficiency'],
        'compliance': ['compliance', 'regulatory', 'ethical', 'standards', 'requirements'],
        'accuracy': ['accuracy', 'accurate', 'reliable', 'correct', 'precise', 'auditable'],
        'brand': ['brand', 'reputation', 'expertise', 'authenticity', 'personal'],
        'data systems': ['integration', 'systems', 'infrastructure', 'existing', 'compatibility']
    };

    const barriersAddressed = archetype.barriers.filter(barrier => {
        const barrierLower = barrier.toLowerCase();
        // Check direct match
        if (interaction.addressesBarriers.some(b => 
            barrierLower.includes(b.toLowerCase()) || b.toLowerCase().includes(barrierLower)
        )) return true;
        // Check keyword match
        for (const [, keywords] of Object.entries(barrierKeywords)) {
            if (keywords.some(kw => barrierLower.includes(kw))) {
                if (interaction.addressesBarriers.some(b =>
                    keywords.some(kw => b.toLowerCase().includes(kw))
                )) return true;
            }
        }
        return false;
    }).length;
    
    const barrierAddressment = archetype.barriers.length > 0 
        ? barriersAddressed / archetype.barriers.length 
        : 0.5; // Neutral if no barriers

    // Goal alignment (improved semantic matching)
    const goalKeywords: Record<string, string[]> = {
        'save time': ['save time', 'time', 'efficient', 'efficiency', 'quick', 'fast', 'speed'],
        'learn tools': ['learn', 'learning', 'tools', 'skills', 'understand', 'grasp'],
        'automate': ['automate', 'automation', 'delegate', 'streamline', 'systematize'],
        'reclaim time': ['reclaim', 'time', 'free up', 'recover', 'gain time'],
        'accuracy': ['accuracy', 'accurate', 'precise', 'reliable', 'correct'],
        'compliance': ['compliance', 'regulatory', 'ethical', 'standards'],
        'brand': ['brand', 'reputation', 'expertise', 'authenticity', 'personal'],
        'thinking partner': ['thinking', 'partner', 'collaborate', 'assist', 'support'],
        'strategic': ['strategic', 'strategy', 'high-level', 'decisions'],
        'practical': ['practical', 'useful', 'applicable', 'hands-on', 'real-world'],
        'simple': ['simple', 'easy', 'straightforward', 'uncomplicated'],
        'reliable': ['reliable', 'dependable', 'trustworthy', 'consistent']
    };

    const goalsSupported = archetype.goals.filter(goal => {
        const goalLower = goal.toLowerCase();
        // Check direct match
        if (interaction.supportsGoals.some(g => 
            goalLower.includes(g.toLowerCase()) || g.toLowerCase().includes(goalLower)
        )) return true;
        // Check keyword match
        for (const [, keywords] of Object.entries(goalKeywords)) {
            if (keywords.some(kw => goalLower.includes(kw))) {
                if (interaction.supportsGoals.some(g =>
                    keywords.some(kw => g.toLowerCase().includes(kw))
                )) return true;
            }
        }
        return false;
    }).length;
    
    const goalAlignment = archetype.goals.length > 0
        ? goalsSupported / archetype.goals.length
        : 0.5; // Neutral if no goals

    // Overall score (weighted average)
    const overallScore = (
        contentLengthMatch * 0.15 +
        formatMatch * 0.15 +
        cognitiveLoadMatch * 0.25 +
        attentionSpanMatch * 0.15 +
        barrierAddressment * 0.15 +
        goalAlignment * 0.15
    );

    return {
        contentLengthMatch,
        formatMatch,
        cognitiveLoadMatch,
        attentionSpanMatch,
        barrierAddressment,
        goalAlignment,
        overallScore
    };
}

