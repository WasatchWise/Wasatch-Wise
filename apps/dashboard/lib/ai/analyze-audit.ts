/**
 * AI Audit Analysis
 * 
 * TDD Requirement: Claude 3.5 Sonnet analyzes quiz answers
 * Output: JSON with risk_level, liability_gap, prescription, top_risks, next_steps
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { retry } from '@/lib/utils/retry';
import { withTimeout, API_TIMEOUTS } from '@/lib/utils/timeout';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface AuditAnalysis {
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  liability_gap: string;
  prescription: string;
  top_risks: string[];
  next_steps: string[];
}

/**
 * Analyze audit with Claude 3.5 Sonnet
 */
export async function analyzeAudit(
  auditId: string,
  scores: { compliance: number; safety: number; fluency: number },
  answers: Record<string, string>,
  context?: { email: string; organization: string; role?: string }
): Promise<AuditAnalysis> {
  const supabase = await createClient();

  // Update status to analyzing
  await supabase
    .from('audits')
    .update({ status: 'analyzing' })
    .eq('id', auditId);

  // Build system prompt
  const systemPrompt = `You are a specialized School Compliance Officer analyzing a district's AI readiness quiz.

Your task is to identify liability risks and provide actionable recommendations.

Output ONLY valid JSON in this exact format:
{
  "risk_level": "HIGH|MEDIUM|LOW",
  "liability_gap": "Primary concern (1 sentence)",
  "prescription": "Recommended action (1 sentence)",
  "top_risks": ["Risk 1", "Risk 2", "Risk 3"],
  "next_steps": ["Step 1", "Step 2", "Step 3"]
}`;

  // Build user prompt with context
  const userPrompt = `Quiz Results:
- Compliance Score: ${scores.compliance}/100 (Policy & Governance)
- Safety Score: ${scores.safety}/100 (Usage & Incidents)
- Fluency Score: ${scores.fluency}/100 (Communication & Trust)

Quiz Answers:
${Object.entries(answers)
      .map(([q, a]) => `Q${q}: ${a}`)
      .join('\n')}

Analyze these results and provide your assessment.`;

  try {
    // Call Claude directly to get token usage
    const response = await retry(
      () =>
        withTimeout(
          anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 500,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt,
              },
            ],
          }),
          API_TIMEOUTS.claude,
          'Claude API request timed out'
        ),
      {
        maxAttempts: 3,
        retryable: (error) => {
          if (error instanceof Error) {
            return (
              error.message.includes('timeout') ||
              error.message.includes('network') ||
              error.message.includes('ECONNRESET')
            );
          }
          return false;
        },
      }
    );

    const outputText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    let analysis: AuditAnalysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : outputText;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse Claude response:', parseError);
      analysis = {
        risk_level: scores.compliance < 50 ? 'HIGH' : scores.compliance < 75 ? 'MEDIUM' : 'LOW',
        liability_gap: 'Unable to parse AI analysis. Please review scores manually.',
        prescription: 'Schedule a consultation to review AI governance policies.',
        top_risks: [
          scores.compliance < 50 ? 'Lack of formal AI governance policies' : '',
          scores.safety < 50 ? 'Unmonitored AI tool usage' : '',
          scores.fluency < 50 ? 'Insufficient parent communication' : '',
        ].filter(Boolean),
        next_steps: [
          'Review current AI use policies',
          'Conduct staff training',
          'Establish monitoring processes',
        ],
      };
    }

    // Validate analysis structure
    if (!analysis.risk_level || !analysis.liability_gap || !analysis.prescription) {
      throw new Error('Invalid analysis structure from Claude');
    }

    // Update audit with analysis
    await supabase
      .from('audits')
      .update({
        status: 'report_generated',
        ai_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auditId);

    // Log AI usage to ai_logs table (TDD requirement)
    const { data: { user } } = await supabase.auth.getUser();
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    await supabase.from('ai_logs').insert({
      user_id: user?.id || null,
      feature_used: 'quiz_generator',
      prompt_snapshot: userPrompt.slice(0, 1000), // Truncate for storage
      response_snapshot: JSON.stringify(analysis).slice(0, 2000),
      model_version: 'claude-3-5-sonnet',
      tokens_used: tokensUsed,
      cost_usd: parseFloat(
        (
          (response.usage.input_tokens * 0.003 + response.usage.output_tokens * 0.015) /
          1000
        ).toFixed(4)
      ),
    });

    // Trigger N8N Universal Lead Router (prioritize new var, fallback to old)
    const webhookUrl = process.env.LEAD_ROUTER_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL;

    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'quiz_audit', // Distinguish source
          audit_id: auditId,
          email: context?.email,
          organization: context?.organization,
          role: context?.role,
          analysis: analysis,
          scores: scores,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Lead router webhook failed:', err));
    }

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);

    // Update status to indicate failure
    await supabase
      .from('audits')
      .update({ status: 'pending_analysis' })
      .eq('id', auditId);

    throw error;
  }
}
