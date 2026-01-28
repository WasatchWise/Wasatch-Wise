import { NextRequest, NextResponse } from 'next/server';
import { generateWithClaude } from '@/lib/ai/claude';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch client data + audit results
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, cognitive_audits(*)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const audit = Array.isArray(client.cognitive_audits)
      ? client.cognitive_audits[0]
      : null;

    // Build Claude prompt
    const prompt = `You are a B2B AI governance consultant writing a proposal for a school district.

Client Details:
- Name: ${client.organization_name}
- Type: ${client.type || 'Not specified'}
- Size: ${client.district_size ? `${client.district_size} students` : 'Not specified'}
- Location: ${client.location || 'Not specified'}

${audit ? `Cognitive Audit Results:
- Admin Risk: ${audit.admin_risk_score}/100 (${audit.admin_risk_score < 50 ? 'RED' : audit.admin_risk_score < 75 ? 'YELLOW' : 'GREEN'})
- Teacher Burnout: ${audit.teacher_burnout_score}/100
- Parent Trust: ${audit.parent_trust_score}/100
- Overall: ${audit.overall_readiness}` : 'No audit data available yet.'}

Write a persuasive 90-Day Compliance Protocol proposal that:
1. Acknowledges their specific pain points ${audit ? '(use the audit data)' : ''}
2. Recommends phased approach (Weeks 1-4: Governance, 5-8: Onboarding, 9-12: Audit)
3. Includes pricing ($75K base + optional Annual Retainer $20K)
4. Uses NEPQ psychology (problem awareness → solution → consequence → commitment)
5. Includes case study reference (similar district size/region)

Format: Professional but conversational. Use "you/your" not "the district."`;

    const proposal = await generateWithClaude(prompt, {
      contentType: 'proposal',
      clientId,
      maxTokens: 4000,
    });

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}

