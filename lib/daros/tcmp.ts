/**
 * Training & Change Management Packager (TCMP)
 * Generates structured training content as JSON → PDF/Slides
 */

import { createClient } from '@/lib/supabase/server';
import { getStakeholderMatrixFull } from './soe';

export interface TrainingContent {
  type: 'admin_deck' | 'teacher_session' | 'parent_sheet' | 'student_curriculum' | 'board_briefing';
  title: string;
  duration: string; // e.g., "60 minutes"
  slides: Array<{
    title: string;
    content: string;
    notes?: string;
    visuals?: string[]; // URLs or descriptions
  }>;
  handouts?: Array<{
    title: string;
    content: string;
    format: 'pdf' | 'docx' | 'html';
  }>;
  metadata: {
    districtName: string;
    generatedAt: string;
    version: number;
  };
}

/**
 * Generate admin training deck (60 minutes)
 */
export async function generateAdminTrainingDeck(districtId: string): Promise<TrainingContent> {
  const matrix = await getStakeholderMatrixFull(districtId);
  const district = matrix.district;

  return {
    type: 'admin_deck',
    title: 'AI Governance for District Leadership',
    duration: '60 minutes',
    slides: [
      {
        title: 'Welcome & Objectives',
        content: `Today's session will help you:\n• Understand AI governance fundamentals\n• Assess your district's current state\n• Build a practical 30/60/90 day plan\n• Create board-ready policies`,
        notes: 'Set clear expectations. This is about practical implementation, not theory.',
      },
      {
        title: 'The AI Landscape in K-12',
        content: `AI is here. The question isn't "if" but "how."\n\n• 70% of teachers use AI tools weekly\n• Districts face FERPA/COPPA compliance challenges\n• Parent trust is the currency of public education\n• Board oversight is increasing`,
        notes: 'Establish urgency without panic. Data-driven context.',
      },
      {
        title: 'Privacy by Design: The Foundation',
        content: `Every AI decision starts with privacy:\n\n1. Data minimization (collect only what's needed)\n2. Purpose limitation (use only for stated purpose)\n3. Transparency (clear communication)\n4. Accountability (documented processes)\n\nThis isn't optional—it's how we begin everything.`,
        notes: 'Core philosophy. Reference Bob\'s framework.',
      },
      {
        title: 'Your District\'s Current State',
        content: `Based on our assessment:\n\n• ${matrix.summary.homeRuns} stakeholder groups: Home Run outcomes\n• ${matrix.summary.triples} stakeholder groups: Triple outcomes\n• Average uptake score: ${Math.round(matrix.summary.averageUptake)}/100\n• Average resistance: ${Math.round(matrix.summary.averageResistance)}/100`,
        notes: 'Personalize to their specific matrix results.',
      },
      {
        title: 'The Stakeholder Framework',
        content: `Different groups need different outcomes:\n\n• Admin: Home Run (full governance)\n• Teachers: Triple (practical confidence)\n• Parents: Single/Double (transparency)\n• Students: Home Run (future-ready)\n\nHighest uptake, least resistance.`,
        notes: 'Explain Bob\'s framework. Show why different outcomes matter.',
      },
      {
        title: '30-Day Quick Wins',
        content: `Start here (low resistance, high impact):\n\n1. Draft acceptable use policy for staff\n2. Create AI tool inventory\n3. Send parent communication (transparency)\n4. Identify 2-3 "safe" AI tools for pilot\n\nThese build momentum without overwhelming.`,
        notes: 'Practical, achievable first steps.',
      },
      {
        title: '60-Day Foundation',
        content: `Build the infrastructure:\n\n1. Complete vendor risk assessments\n2. Launch teacher training program\n3. Establish monitoring process\n4. Board presentation (governance framework)\n\nThis is where systems take root.`,
        notes: 'Systematic implementation phase.',
      },
      {
        title: '90-Day Adoption',
        content: `Scale with confidence:\n\n1. Full policy implementation\n2. Ongoing training cadence\n3. Incident response protocols active\n4. Regular board updates\n\nYou're now operating with governance, not reacting to incidents.`,
        notes: 'Mature operations phase.',
      },
      {
        title: 'Common Pitfalls to Avoid',
        content: `What derails AI governance:\n\n• Waiting for perfect policy (start with good enough)\n• Ignoring parent concerns (transparency builds trust)\n• No training (teachers need practical skills)\n• Vendor trust without verification (audit contracts)\n\nLearn from others' mistakes.`,
        notes: 'Real-world lessons.',
      },
      {
        title: 'Next Steps & Resources',
        content: `You'll receive:\n\n• Stakeholder Matrix (customized)\n• 30/60/90 Adoption Plan\n• Controls Checklist\n• Board-Ready One-Pager\n\nQuestions? We're here to support implementation.`,
        notes: 'Set expectations for deliverables.',
      },
    ],
    metadata: {
      districtName: district.name,
      generatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

/**
 * Generate teacher practical session (45 minutes)
 */
export async function generateTeacherSession(districtId: string): Promise<TrainingContent> {
  const district = await getDistrict(districtId);

  return {
    type: 'teacher_session',
    title: 'AI Tools for Educators: Practical & Safe',
    duration: '45 minutes',
    slides: [
      {
        title: 'Welcome',
        content: `Today: Hands-on AI tools you can use safely.\n\nNo theory. Just practical skills.`,
      },
      {
        title: 'What AI Is (And Isn\'t)',
        content: `AI can:\n• Help draft lesson plans\n• Generate discussion questions\n• Provide feedback on student work\n• Create differentiated content\n\nAI cannot:\n• Replace your judgment\n• Know your students personally\n• Make ethical decisions for you`,
      },
      {
        title: 'The Golden Rules',
        content: `Three rules for safe AI use:\n\n1. Never input student names or PII\n2. Always review AI output before using\n3. Tell students when AI helped create content\n\nThese keep you compliant and ethical.`,
      },
      {
        title: 'Safe Tools to Start With',
        content: `District-approved tools:\n\n• [Tool 1] - Lesson planning\n• [Tool 2] - Content generation\n• [Tool 3] - Assessment ideas\n\nWe'll demo these today.`,
        notes: 'Customize based on district vendor list.',
      },
      {
        title: 'Hands-On Practice',
        content: `Let's try it:\n\n1. Generate a lesson plan for [topic]\n2. Create discussion questions\n3. Draft a parent communication\n\nYou'll leave with something you can use tomorrow.`,
      },
      {
        title: 'When to Ask for Help',
        content: `Contact IT or admin if:\n\n• Tool asks for student data\n• You're unsure about compliance\n• Parent has concerns\n• Something feels "off"\n\nBetter to ask than assume.`,
      },
      {
        title: 'Resources & Support',
        content: `You have:\n\n• Acceptable Use Policy (in staff handbook)\n• IT support for tool questions\n• This training deck (reference)\n• Ongoing training opportunities\n\nYou're not alone in this.`,
      },
    ],
    handouts: [
      {
        title: 'Quick Reference Guide',
        content: `AI Tool Safety Checklist:\n\n□ No student names or PII\n□ Output reviewed before use\n□ Students informed when AI used\n□ Tool is district-approved\n□ Questions? Ask IT`,
        format: 'pdf',
      },
    ],
    metadata: {
      districtName: district.name,
      generatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

/**
 * Generate parent info sheet (20 minutes)
 */
export async function generateParentSheet(districtId: string): Promise<TrainingContent> {
  const district = await getDistrict(districtId);

  return {
    type: 'parent_sheet',
    title: 'AI in Our Schools: What Parents Need to Know',
    duration: '20 minutes',
    slides: [
      {
        title: 'Introduction',
        content: `We're using AI tools to support learning. Here's what that means for your child.`,
      },
      {
        title: 'What We\'re Doing',
        content: `• Using AI to help teachers create better lessons\n• Providing students with AI literacy skills\n• Following strict privacy protections\n• Being transparent about our practices`,
      },
      {
        title: 'What We\'re NOT Doing',
        content: `• Sharing student data with AI companies\n• Using AI to make decisions about your child\n• Replacing teachers with AI\n• Hiding our AI use from families`,
      },
      {
        title: 'Your Rights',
        content: `You have the right to:\n\n• Know which AI tools we use\n• See our privacy policies\n• Opt out of certain uses (where possible)\n• Ask questions anytime\n\nWe're here to build trust, not hide practices.`,
      },
      {
        title: 'How We Protect Privacy',
        content: `We follow:\n\n• FERPA (Family Educational Rights and Privacy Act)\n• COPPA (Children's Online Privacy Protection Act)\n• State privacy laws\n• District privacy-by-design principles\n\nYour child's data is protected.`,
      },
      {
        title: 'Questions?',
        content: `Contact us:\n\n• Email: [district contact]\n• Phone: [district phone]\n• Website: [district website]\n\nWe're committed to transparency.`,
      },
    ],
    handouts: [
      {
        title: 'Parent FAQ',
        content: `Frequently Asked Questions:\n\nQ: Is my child's data safe?\nA: Yes. We follow FERPA/COPPA and never share PII with AI companies.\n\nQ: Can I opt out?\nA: In most cases, yes. Contact us to discuss options.\n\nQ: What AI tools are used?\nA: See our approved tool list at [URL].\n\nQ: How do I learn more?\nA: Attend our parent information session or contact [email].`,
        format: 'pdf',
      },
    ],
    metadata: {
      districtName: district.name,
      generatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

async function getDistrict(districtId: string) {
  const createClient = (await import('@/lib/supabase/server')).createClient;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .eq('id', districtId)
    .single();

  if (error) throw error;
  return data;
}
