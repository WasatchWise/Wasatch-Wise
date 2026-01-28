import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { STYLE_INSTRUCTIONS } from './style-guide';
import { getTopPerformingPatterns } from './learning-lab';
import { serverConfig } from '../config';
import { retryWithBackoff, retryPresets } from '../utils/retry';
import { selectTemplate, generateSynthesisPrompt } from '../hci/pattern-templates';

const getOpenAI = () => {
    if (!serverConfig.openai.isConfigured) return null;
    return new OpenAI({
        apiKey: serverConfig.openai.apiKey,
    });
};

const getGemini = () => {
    if (!serverConfig.gemini.isConfigured) return null;
    return new GoogleGenerativeAI(serverConfig.gemini.apiKey!);
};

export type ContentDuration = '15s' | '30s' | '45s' | '60s' | '3m';

export interface Scene {
    sceneNumber: number;
    scriptSegment: string;
    assetType: 'video' | 'image';
    veoVideoPrompt: string;
    imagePrompt: string;
    avatarId?: string;
    voiceId?: string;
}

export interface CreativeDissection {
    audience: string;
    character: string;
    lookAndTone: string;
    nepqEncouragement: string;
    lossAversionTrigger: string;
    discoverySequence: string;
}

export interface ResearchResult {
    rawText: string;
    sourceUrl?: string;
    duration: ContentDuration;
    refinedContent: {
        dissection: CreativeDissection;
        socialHook: string;
        nepqTrigger: string;
        pedagogicalLesson: string;
        videoScript: string;
        storyboard: Scene[];
    };
    pillar: string;
    templateUsed?: string; // ID of the HCI template used
    detectedMindset?: 'Optimist' | 'Maybe' | 'Unaware';
}

export interface SynthesisOptions {
    /** Override the auto-detected mindset */
    mindsetOverride?: 'Optimist' | 'Maybe' | 'Unaware';
    /** Use a specific template by ID */
    templateId?: string;
    /** Preferred content format */
    preferredFormat?: 'text' | 'video' | 'interactive' | 'visual';
}

export async function tailorContentLive(
    rawText: string,
    duration: ContentDuration = '30s',
    options?: SynthesisOptions
): Promise<ResearchResult> {
    const sceneCountMap = {
        '15s': 3,
        '30s': 5,
        '45s': 7,
        '60s': 10,
        '3m': 20
    };

    const targetSceneCount = sceneCountMap[duration];

    // Phase 1: Select HCI template (auto-detect or override)
    const template = await selectTemplate(rawText, {
        mindsetOverride: options?.mindsetOverride,
        templateIdOverride: options?.templateId,
        preferredFormat: options?.preferredFormat,
        usePerformanceData: false, // Can be enabled once we have performance data
    });

    console.log(`[Synthesis] Using template: ${template.name} (${template.targetMindset} mindset)`);

    // Generate template-specific guidance
    const templateGuidance = generateSynthesisPrompt(template, rawText.slice(0, 100));

    // Phase 1.5: Ingest Analytics Learning (The Learning Loop)
    const topPatterns = await getTopPerformingPatterns();
    const patternsContext = topPatterns.map(p => `[${p.patternType.toUpperCase()}]: ${p.content} (Effectiveness: ${p.effectivenessScore})`).join('\n    ');

    const prompt = `
    You are the head of content for the "Adult AI Academy".

    STYLE GUIDE:
    ${STYLE_INSTRUCTIONS}

    HCI TEMPLATE GUIDANCE (Target: ${template.targetMindset} mindset):
    ${templateGuidance}

    WINNING PATTERNS (Based on recent analytics):
    ${patternsContext}
    
    INGESTED INFO:
    """
    ${rawText}
    """
    
    GOAL:
    Scrub this info and tailor it into a high-impact content piece for high-ticket B2B.
    Target duration: ${duration}. Produce exactly ${targetSceneCount} sequential scenes.
    
    PSYCHOGRAPHIC PROFILE (Target: 35-55 "Skeptical Adopter"):
    - Value Stability and Discipline over "hype".
    - High Loss Aversion (λ ≈ 2.25): Frame gains as "preventing loss" of time, status, or resources.
    - Trigger: "AI Replacement Dysfunction" (AIRD) and fear of technological obsolescence.
    - Solution: "Ageless Advantage" / "Superagency" (human amplification).

    NEPQ 5-STAGE FRAMEWORK:
    1. CONNECTION: Disarm System 1 (instinctive/emotional) using soft, curious inquiry. Avoid "Sales Breath".
    2. ENGAGEMENT (Discovery): Guide through Situation -> Problem -> Solution awareness.
       - Use "Expert Assumption": "Most firms find [X] is their biggest headache... you noticed that too?"
       - Use "Permission Pivot": "Can I ask a difficult question about your current ROI?"
    3. TRANSITION (The Bridge): Move from the problem to the possibility of a solution.
    4. PRESENTATION (The Prescription): Show how the solution solves the specific "gap" discovered.
    5. COMMITMENT: Use Consequence Questions to trigger loss aversion: "What happens if this isn't resolved by year-end?"
    
    OUTPUT FORMAT (JSON):
    {
      "dissection": {
        "audience": "Deep dive into the 35-55 B2B decision maker's fears/desires",
        "character": "The 'Pilot' persona - authoritative yet empathetic",
        "lookAndTone": "Cinematic, high-contrast, professional, 'Stable & Disciplined' aesthetic",
        "nepqEncouragement": "Disarming rhetorical questions (Permission Pivot)",
        "lossAversionTrigger": "The specific loss being prevented (Time, Status, Budget)",
        "discoverySequence": "A brief outline of the Situation -> Problem -> Consequence flow"
      },
      "socialHook": "Viral-ready hook using the 'Disrupt-Then-Reframe' technique",
      "nepqTrigger": "The core Consequence Question used to trigger commitment",
      "pedagogicalLesson": "Andragogy shift: Hook -> Proof -> Curriculum -> Mastery",
      "videoScript": "A full script broken into exactly ${targetSceneCount} scenes, adhering to Andragogy structure",
      "storyboard": [
        {
          "sceneNumber": 1,
          "scriptSegment": "Script line avoiding cliches (No 'Hope this finds you well')",
          "assetType": "video",
          "veoVideoPrompt": "Cinematic 8s clip prompt, high-fidelity visual proof",
          "imagePrompt": "DALL-E 3 prompt, professional/authoritative aesthetic",
          "avatarId": "Recommended HeyGen avatar id",
          "voiceId": "Recommended HeyGen voice id"
        }
      ],
      "pillar": "AI Anxiety | Work Automation | Daily AI Use | Personal Productivity"
    }
  `;

    const openai = getOpenAI();
    if (openai) {
        try {
            const modelName = serverConfig.openai.modelName;
            console.log(`Attempting synthesis with ${modelName}...`);
            const completion = await retryWithBackoff(
                () => openai.chat.completions.create({
                    model: modelName as Parameters<typeof openai.chat.completions.create>[0]['model'],
                    messages: [
                        { role: "system", content: "You are an expert in sales psychology and pedagogical content design." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                }),
                {
                    ...retryPresets.critical,
                    logger: (msg) => console.log(`[OpenAI Synthesis Retry] ${msg}`),
                }
            );

            const parsed = JSON.parse(completion.choices[0].message.content || '{}');

            return {
                rawText,
                duration,
                refinedContent: {
                    dissection: parsed.dissection || { audience: "", character: "", lookAndTone: "", nepqEncouragement: "" },
                    socialHook: (parsed.socialHook as string) || "Draft Hook",
                    nepqTrigger: (parsed.nepqTrigger as string) || "Psychological Trigger",
                    pedagogicalLesson: (parsed.pedagogicalLesson as string) || "Curriculum Bridge",
                    videoScript: (parsed.videoScript as string) || "Video Idea",
                    storyboard: (parsed.storyboard as Scene[]) || [],
                },
                pillar: parsed.pillar || "General AI Education",
                templateUsed: template.id,
                detectedMindset: template.targetMindset
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("OpenAI synthesis failed:", message);
        }
    }

    const genAI = getGemini();
    if (genAI) {
        try {
            const modelName = serverConfig.gemini.modelName;
            console.log(`Attempting synthesis with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await retryWithBackoff(
                () => model.generateContent(prompt),
                {
                    ...retryPresets.critical,
                    logger: (msg) => console.log(`[Gemini Synthesis Retry] ${msg}`),
                }
            );
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{}';
            const parsed = JSON.parse(jsonStr);

            return {
                rawText,
                duration,
                refinedContent: {
                    dissection: parsed.dissection || { audience: "", character: "", lookAndTone: "", nepqEncouragement: "" },
                    socialHook: (parsed.socialHook as string) || "Draft Hook",
                    nepqTrigger: (parsed.nepqTrigger as string) || "Psychological Trigger",
                    pedagogicalLesson: (parsed.pedagogicalLesson as string) || "Curriculum Bridge",
                    videoScript: (parsed.videoScript as string) || "Video Idea",
                    storyboard: (parsed.storyboard as Scene[]) || [],
                },
                pillar: parsed.pillar || "General AI Education",
                templateUsed: template.id,
                detectedMindset: template.targetMindset
            };
        } catch (geminiError) {
            const message = geminiError instanceof Error ? geminiError.message : 'Unknown error';
            console.error("Gemini synthesis failed:", message);
        }
    }

    // Final fallback to "Smart Mock" if all APIs fail
    console.warn("All AI providers failed. Falling back to dynamic mock based on input.");

    // Extract a simple topic from rawText for the mock
    // Improved regex to avoid single-letter matches (like "A") and look for phrases or quoted text
    const topicMatch = rawText.match(/['"](.*?)['"]/) ||
        rawText.match(/^([A-Z][a-z]+(?:\s+[a-z]+){0,3})\b/) ||
        rawText.match(/^([a-z]+(?:\s+[a-z]+){0,3})\b/i);

    let inferredTopic = topicMatch ? topicMatch[1] : "Your AI Content";

    // Clean up inferred topic if it's too short or generic
    if (inferredTopic.length < 3) inferredTopic = "AI Agents & Productivity";

    return {
        rawText,
        duration,
        refinedContent: {
            dissection: {
                audience: "Seasoned professionals and parents feeling the squeeze of the AI age.",
                character: "The Empathetic Strategist - Mid-40s, tech-forward but human-first.",
                lookAndTone: "Cinematic, high-contrast, blue/indigo palette with warm wood accents.",
                nepqEncouragement: "Are you ready to stop fighting the clock and start using the engine?",
                lossAversionTrigger: "Preventing the loss of 10 hours per week per employee.",
                discoverySequence: "Situation: Manual Workflows | Problem: Scalability Bottlenecks | Consequence: Revenue Stagnation"
            },
            socialHook: `How ${inferredTopic} uses AI to change the game for 50-year-old professionals.`,
            nepqTrigger: "Fear of missing out on automation efficiency.",
            pedagogicalLesson: `Module: Deep Dive into ${inferredTopic} with AI Agents.`,
            videoScript: `Hook: "Let's talk about ${inferredTopic}. It's moving faster than you think..."`,
            storyboard: Array.from({ length: targetSceneCount }).map((_, i) => ({
                sceneNumber: i + 1,
                scriptSegment: i === 0
                    ? `The current landscape of ${inferredTopic} is changing.`
                    : i === targetSceneCount - 1
                        ? `This is how you master ${inferredTopic} for your career.`
                        : `Step ${i}: Leveraging AI for ${inferredTopic} efficiency.`,
                assetType: i % 2 === 0 ? 'video' : 'image',
                veoVideoPrompt: `Cinematic visualization of ${inferredTopic} scene ${i + 1}, brand consistent lighting.`,
                imagePrompt: `Professional representation of ${inferredTopic}, scene ${i + 1}, 1024x1024 high fidelity.`,
                avatarId: i % 2 === 0 ? "josh_lite_20230714" : undefined,
                voiceId: i % 2 === 0 ? "0777d5c60c324ed0a6ef65855f14c598" : undefined
            }))
        },
        pillar: "Daily AI Use",
        templateUsed: template.id,
        detectedMindset: template.targetMindset
    };
}
