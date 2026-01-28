'use server';

/**
 * Submit Audit (Mario 1-1 Lead Magnet)
 * 
 * TDD Requirement: Single Server Action that:
 * 1. Saves answers to audits table
 * 2. Triggers AI analysis
 * 3. Updates status
 * 4. Returns results
 */

import { createClient } from '@/lib/supabase/server';
import { analyzeAudit } from '@/lib/ai/analyze-audit';
import { z } from 'zod';

const auditSubmissionSchema = z.object({
  email: z.string().email(),
  organizationName: z.string().optional(),
  role: z.string().optional(),
  answers: z.record(z.string(), z.string()),
});

export interface AuditResult {
  success: boolean;
  auditId?: string;
  scores?: {
    compliance: number;
    safety: number;
    fluency: number;
  };
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  analysis?: {
    liabilityGap: string;
    prescription: string;
    topRisks: string[];
    nextSteps: string[];
  };
  error?: string;
}

/**
 * Calculate scores from quiz answers
 */
function calculateScores(answers: Record<string, string>): {
  compliance: number;
  safety: number;
  fluency: number;
} {
  // Compliance questions: 1, 3, 4, 7, 9 (policy/governance)
  const complianceQuestions = [1, 3, 4, 7, 9];
  // Safety questions: 2, 6, 8 (usage/incidents)
  const safetyQuestions = [2, 6, 8];
  // Fluency questions: 5, 10 (communication/trust)
  const fluencyQuestions = [5, 10];

  const weights: Record<string, Record<string, number>> = {
    '1': { 'Yes': 10, 'In Progress': 5, 'No': 0 },
    '2': { '0%': 0, '<25%': 3, '25-50%': 7, '>50%': 10 },
    '3': { 'Yes': 10, 'Planned': 5, 'No': 0 },
    '4': { 'Yes, formal process': 10, 'Informal review': 5, 'No process': 0 },
    '5': { 'High': 10, 'Moderate': 5, 'Low': 0, 'Unsure': 2 },
    '6': { 'No incidents': 10, 'Minor incidents': 5, 'Major incidents': 0 },
    '7': { 'Yes, full-time': 10, 'Yes, part-time': 5, 'No': 0 },
    '8': { 'Very confident': 10, 'Somewhat confident': 5, 'Not confident': 0 },
    '9': { 'Yes, comprehensive tracking': 10, 'Partial tracking': 5, 'No tracking': 0 },
    '10': { 'Yes, clearly communicated': 10, 'Somewhat communicated': 5, 'Not communicated': 0 },
  };

  const calculateCategoryScore = (questionIds: number[]): number => {
    let total = 0;
    let max = 0;
    questionIds.forEach((qId) => {
      const answer = answers[qId.toString()];
      const questionWeights = weights[qId.toString()];
      if (answer && questionWeights && questionWeights[answer] !== undefined) {
        total += questionWeights[answer];
      }
      max += 10;
    });
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  return {
    compliance: calculateCategoryScore(complianceQuestions),
    safety: calculateCategoryScore(safetyQuestions),
    fluency: calculateCategoryScore(fluencyQuestions),
  };
}

/**
 * Submit audit and trigger AI analysis
 */
export async function submitAudit(
  data: z.infer<typeof auditSubmissionSchema>
): Promise<AuditResult> {
  // Validate input
  const validation = auditSubmissionSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }

  try {
    const supabase = await createClient();

    // Find or create client from organization name
    let clientId: string | null = null;
    if (data.organizationName) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_name', data.organizationName)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            organization_name: data.organizationName,
            contact_email: data.email,
            subscription_tier: 'free',
            stage: 'lead',
          })
          .select('id')
          .single();

        if (clientError || !newClient) {
          console.error('Failed to create client:', clientError);
        } else {
          clientId = newClient.id;
        }
      }
    }

    // Get user profile if exists (for authenticated users)
    let submittedBy: string | null = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profile) {
        submittedBy = profile.id;
      }
    }

    // Calculate scores
    const scores = calculateScores(data.answers);

    // Create audit record
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        client_id: clientId,
        submitted_by: submittedBy,
        answers: data.answers,
        score_compliance: scores.compliance,
        score_safety: scores.safety,
        score_fluency: scores.fluency,
        status: 'pending_analysis',
      })
      .select('id')
      .single();

    if (auditError || !audit) {
      return {
        success: false,
        error: 'Failed to save audit. Please try again.',
      };
    }

    // Trigger AI analysis (async - don't wait)
    analyzeAudit(audit.id, scores, data.answers, {
      email: data.email,
      organization: data.organizationName || '',
      role: data.role
    }).catch((error) => {
      console.error('AI analysis failed:', error);
      // Update status to indicate analysis failed
      supabase
        .from('audits')
        .update({ status: 'pending_analysis' })
        .eq('id', audit.id);
    });

    // Also capture email for lead gen
    await supabase.from('email_captures').insert({
      email: data.email,
      name: data.organizationName,
      organization: data.organizationName,
      role: data.role,
      source: 'cognitive_audit_quiz',
      lead_magnet: 'AI Readiness Audit Results',
    });

    return {
      success: true,
      auditId: audit.id,
      scores,
    };
  } catch (error) {
    console.error('Audit submission error:', error);
    return {
      success: false,
      error: 'Failed to process audit. Please try again.',
    };
  }
}
