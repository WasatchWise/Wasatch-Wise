'use server';

import { quizSubmissionSchema } from '@/lib/utils/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateWithClaude } from '@/lib/ai/claude';

function fallbackQuizMessage(tier: 'red' | 'yellow' | 'green', score: number) {
  switch (tier) {
    case 'green':
      return `Your score is ${score}/100 (green).\n\nYou have a strong foundation. The next step is to formalize what’s working (policy + tool vetting + training cadence), then improve visibility (AI tool inventory, incident reporting, and parent communication updates). If you want, we can help you turn this into a 90‑day governance plan.\n\nIf you’d like a quick next step: book a call and we’ll map the fastest path to “district-wide, consistent, and defensible.”`;
    case 'yellow':
      return `Your score is ${score}/100 (yellow).\n\nYou’re in the “partially ready” zone: some safeguards exist, but inconsistency creates risk (especially around training, tool evaluation, and communication). The biggest wins usually come from tightening policy language, standardizing staff guidance, and building a simple inventory + approval workflow.\n\nIf you’d like a quick next step: book a call and we’ll identify the 2–3 highest-impact fixes for the next 30 days.`;
    case 'red':
    default:
      return `Your score is ${score}/100 (red).\n\nYou likely have meaningful exposure from shadow AI and uneven practices. The priority is establishing a clear policy baseline, training staff on FERPA-safe AI use, and creating a lightweight tool vetting process so classrooms don’t fill the gap with unapproved tools.\n\nIf you’d like a quick next step: book a call and we’ll outline an immediate “stabilize → govern → train” plan you can execute in weeks, not months.`;
  }
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: 'Does your district have a board-approved AI use policy?',
    options: ['Yes', 'In Progress', 'No'],
    weights: { Yes: 10, 'In Progress': 5, No: 0 },
  },
  {
    id: 2,
    text: 'What percentage of teachers use AI tools weekly?',
    options: ['0%', '<25%', '25-50%', '>50%'],
    weights: { '0%': 0, '<25%': 3, '25-50%': 7, '>50%': 10 },
  },
  {
    id: 3,
    text: 'Have you conducted FERPA compliance training for staff using AI?',
    options: ['Yes', 'Planned', 'No'],
    weights: { Yes: 10, Planned: 5, No: 0 },
  },
  {
    id: 4,
    text: 'Do you have a process for evaluating AI tools before adoption?',
    options: ['Yes, formal process', 'Informal review', 'No process'],
    weights: { 'Yes, formal process': 10, 'Informal review': 5, 'No process': 0 },
  },
  {
    id: 5,
    text: 'How would you rate parent trust in your district regarding data privacy?',
    options: ['High', 'Moderate', 'Low', 'Unsure'],
    weights: { High: 10, Moderate: 5, Low: 0, Unsure: 2 },
  },
  {
    id: 6,
    text: 'Have you experienced any AI-related incidents (data leaks, misuse, etc.)?',
    options: ['No incidents', 'Minor incidents', 'Major incidents'],
    weights: { 'No incidents': 10, 'Minor incidents': 5, 'Major incidents': 0 },
  },
  {
    id: 7,
    text: 'Do you have dedicated staff for AI governance?',
    options: ['Yes, full-time', 'Yes, part-time', 'No'],
    weights: { 'Yes, full-time': 10, 'Yes, part-time': 5, No: 0 },
  },
  {
    id: 8,
    text: 'How confident are teachers in using AI tools responsibly?',
    options: ['Very confident', 'Somewhat confident', 'Not confident'],
    weights: { 'Very confident': 10, 'Somewhat confident': 5, 'Not confident': 0 },
  },
  {
    id: 9,
    text: 'Do you track AI tool usage across the district?',
    options: ['Yes, comprehensive tracking', 'Partial tracking', 'No tracking'],
    weights: { 'Yes, comprehensive tracking': 10, 'Partial tracking': 5, 'No tracking': 0 },
  },
  {
    id: 10,
    text: 'Have you communicated AI policies to parents?',
    options: ['Yes, clearly communicated', 'Somewhat communicated', 'Not communicated'],
    weights: { 'Yes, clearly communicated': 10, 'Somewhat communicated': 5, 'Not communicated': 0 },
  },
];

export async function submitQuiz(data: {
  email: string;
  organizationName?: string;
  role?: string;
  answers: Record<string, string>;
}) {
  // Validate
  const validation = quizSubmissionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  try {
    // Calculate score
    let totalScore = 0;
    const questionScores: Record<number, number> = {};

    QUIZ_QUESTIONS.forEach((question) => {
      const answer = data.answers[question.id.toString()];
      if (answer && question.weights[answer as keyof typeof question.weights] !== undefined) {
        const score = question.weights[answer as keyof typeof question.weights];
        if (score !== undefined) {
          questionScores[question.id] = score;
          totalScore += score;
        }
      }
    });

    const maxScore = QUIZ_QUESTIONS.length * 10;
    const percentageScore = Math.round((totalScore / maxScore) * 100);
    const tier =
      percentageScore >= 75 ? 'green' : percentageScore >= 50 ? 'yellow' : 'red';

    // Store in Supabase
    // Use service-role client so lead capture works in production even when
    // the public (anon) role does not have INSERT privileges on these tables.
    const supabase = createAdminClient();
    const { error: quizResultsError } = await supabase.from('quiz_results').insert({
      email: data.email,
      organization_name: data.organizationName,
      role: data.role,
      answers: data.answers,
      score: percentageScore,
      result_tier: tier,
    });
    if (quizResultsError) throw quizResultsError;

    const { error: emailCapturesError } = await supabase.from('email_captures').insert({
      email: data.email,
      name: data.organizationName,
      organization: data.organizationName,
      role: data.role,
      source: 'ai_readiness_quiz',
      lead_magnet: 'AI Readiness Quiz Results',
    });
    if (emailCapturesError) throw emailCapturesError;

    // Send to Make.com webhook (if configured). Try to deliver before returning,
    // but never fail the quiz if the webhook is down/misconfigured.
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            name: data.organizationName || '',
            organization: data.organizationName || '',
            role: data.role || '',
            score: percentageScore,
            tier: tier,
            source: 'ai_readiness_quiz',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!response.ok) {
          console.error('Make.com webhook failed:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('Make.com webhook error:', err);
      }
    }

    // Generate personalized message with Claude
    let personalizedMessage = fallbackQuizMessage(tier, percentageScore);
    let messageSource: 'claude' | 'fallback' = 'fallback';
    try {
      personalizedMessage = await generateWithClaude(
        `A school district just completed our AI readiness quiz. Their score is ${percentageScore}/100 (${tier}). Write a 2-paragraph personalized message explaining their result and recommending next steps. Be encouraging but direct about risks.`,
        {
          contentType: 'quiz_results',
          maxTokens: 300,
        }
      );
      messageSource = 'claude';
    } catch (err) {
      // Don't fail the quiz if Claude is unavailable/misconfigured.
      console.error('Claude quiz message generation failed; using fallback.', err);
    }

    return {
      success: true,
      overall_score: percentageScore,
      tier,
      message: personalizedMessage,
      message_source: messageSource,
      question_scores: questionScores,
    };
  } catch (error) {
    console.error('Quiz submission error:', error);
    return {
      success: false,
      error: 'Failed to process quiz. Please try again.',
    };
  }
}

