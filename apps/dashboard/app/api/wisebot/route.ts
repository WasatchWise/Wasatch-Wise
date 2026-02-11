import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { sanitizeString } from '@/lib/utils/sanitize';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Service role client for database operations
const getServiceClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function POST(req: NextRequest) {
  try {
    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API configuration error: ANTHROPIC_API_KEY is not set' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeString(message);
    const serviceClient = getServiceClient();

    if (!serviceClient) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // 1. Get or create chat session
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      const { data: newSession } = await serviceClient
        .from('chat_sessions')
        .insert({})
        .select()
        .single();
      chatSessionId = newSession?.id;
    } else {
      // Update last_message_at
      await serviceClient
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatSessionId);
    }

    // 2. Save user message
    await serviceClient
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'user',
        content: sanitizedMessage,
      });

    // 3. Search knowledge sources for relevant content
    const { data: relevantSources, error: searchError } = await serviceClient
      .from('knowledge_sources')
      .select('*')
      .limit(5);

    // If full-text search is available, use it
    // For now, we'll use a simple filter on key_topics
    let filteredSources = relevantSources || [];
    if (sanitizedMessage) {
      const messageLower = sanitizedMessage.toLowerCase();
      filteredSources = (relevantSources || []).filter(source => {
        const topics = source.key_topics || [];
        const title = (source.title || '').toLowerCase();
        const summary = (source.summary || '').toLowerCase();
        return (
          topics.some((topic: string) => messageLower.includes(topic.toLowerCase())) ||
          title.includes(messageLower) ||
          summary.includes(messageLower)
        );
      }).slice(0, 5);
    }

    // 4. Build context from sources
    const knowledgeContext = filteredSources.length > 0
      ? filteredSources
          .map((source, idx) => `
[Source ${idx + 1}]: ${source.title}
${source.author ? `Author: ${source.author}` : ''}
${source.summary || ''}
Topics: ${(source.key_topics || []).join(', ')}
${source.url ? `URL: ${source.url}` : ''}
`)
          .join('\n\n')
      : '';

    // 5. Create enhanced prompt with citations
    const systemPrompt = `You are WiseBot, an AI governance assistant for K-12 education leaders at WasatchWise.

${knowledgeContext ? `KNOWLEDGE BASE:
${knowledgeContext}

CITATION RULES:
- When using information from the knowledge base above, cite your sources like this: [Source 1]
- If multiple sources support a claim, cite all: [Source 1, Source 2]
- If you're using general knowledge not from the sources above, don't cite
- Be specific about which source supports which claim
- Always cite when referencing specific frameworks, policies, or research from the knowledge base

` : ''}Answer questions about:
- AI governance policies
- Data privacy (FERPA, COPPA)
- Vendor evaluation
- Teacher training beyond prompting
- Student safety
- Ethical AI frameworks
- Shadow AI detection
- Policy gaps

Be helpful, accurate, conversational, and always cite your sources when using knowledge base information. Keep responses concise (2-3 paragraphs max).`;

    // 6. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: sanitizedMessage,
        },
      ],
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // 7. Parse citations from response
    const citationRegex = /\[Source (\d+)(?:,\s*Source (\d+))?\]/g;
    const citedSourceIndices = new Set<number>();
    let match;
    
    while ((match = citationRegex.exec(assistantMessage)) !== null) {
      citedSourceIndices.add(parseInt(match[1]) - 1);
      if (match[2]) {
        citedSourceIndices.add(parseInt(match[2]) - 1);
      }
    }

    const citedSources = Array.from(citedSourceIndices)
      .map(idx => filteredSources[idx])
      .filter(Boolean);

    // 8. Save assistant message with citations
    const { data: savedMessage } = await serviceClient
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'assistant',
        content: assistantMessage,
        sources_used: citedSources.map(s => s.id),
        kb_enhanced: citedSources.length > 0,
      })
      .select()
      .single();

    // 9. Save detailed citations
    if (savedMessage && citedSources.length > 0) {
      await serviceClient.from('message_citations').insert(
        citedSources.map(source => ({
          message_id: savedMessage.id,
          source_id: source.id,
          relevance_score: 0.85,
        }))
      );
    }

    // 10. Return response with citation details
    return NextResponse.json({
      response: assistantMessage,
      citations: citedSources.map((source, idx) => ({
        number: idx + 1,
        title: source.title,
        author: source.author,
        type: source.source_type,
        url: source.url,
        summary: source.summary,
        topics: source.key_topics,
      })),
      kbEnhanced: citedSources.length > 0,
      sessionId: chatSessionId,
    });

  } catch (error: any) {
    logger.error('WiseBot error:', error);
    return NextResponse.json(
      { error: 'Failed to get response', details: error.message },
      { status: 500 }
    );
  }
}
