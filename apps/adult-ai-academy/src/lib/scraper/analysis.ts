export type TopicCluster = 'AI Anxiety' | 'Work Automation' | 'Daily AI Use' | 'Personal Productivity';

export interface ContentPiece {
    id: string;
    hook: string;
    cluster: TopicCluster;
    targetAudience: string;
    curriculumStatus: 'Draft' | 'Social Only' | 'Curriculum Ready';
}

export function generateContentDraft(topic: string, cluster: TopicCluster): ContentPiece {
    const clusterGuidelines: Record<TopicCluster, string> = {
        'AI Anxiety': `Focus on "Ageless Advantage". Acknowledge that the speed of AI is scary, but highlight that it's a tool to amplify your 20+ years of wisdom, not replace it.`,
        'Work Automation': `Specifically for professionals like Attorneys or Accountants. Show them how to automate the "Invisible Labor" (discovery, auditing) so they can focus on high-level strategy.`,
        'Daily AI Use': `The "Fridge Inventory" approach. Real-world, non-techy applications that save 30 mins a day. Personal sovereignty through technical agency.`,
        'Personal Productivity': `How to filter the noise. Using AI as a 'Cognitive Buffer' to manage your schedule, emails, and life-admin.`,
    };

    // Use guideline to inform the hook generation
    const guideline = clusterGuidelines[cluster];
    const hook = `${topic} - ${guideline.split('.')[0]}.`;

    return {
        id: Math.random().toString(36).substr(2, 9),
        hook,
        cluster,
        targetAudience: "35-55 Skeptical Adopters",
        curriculumStatus: 'Draft'
    };
}

export function getSocialPostIdeas(cluster: TopicCluster, topic: string): string[] {
    if (cluster === 'Daily AI Use') {
        return [
            `LinkedIn: "Why I stopped asking 'What's for dinner' and started taking photos of my fridge."`,
            `TikTok: "Day 1 of using AI for my life, not my job. #AdultAIAcademy #GenX"`,
            `Curriculum: Module 4.2 - The Physical World to Digital Intelligence Bridge.`
        ];
    }
    if (cluster === 'AI Anxiety') {
        return [
            `LinkedIn: "20 years of experience isn't a liability in the AI age—it's your greatest moat."`,
            `TikTok: "Feeling behind on AI? You're not. You're actually perfectly positioned."`,
            `Curriculum: Introduction - The Ageless Advantage Framework.`
        ];
    }
    return [`General Draft for ${topic}`];
}
