import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { withErrorHandling, sanitizeRequestBody } from '@/lib/utils/api-wrapper';
import { ValidationError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { sanitizeString } from '@/lib/utils/sanitize';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function handler(req: NextRequest) {
  // Check API key before processing
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'API configuration error: ANTHROPIC_API_KEY is not set' },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { message, conversationHistory = [] } = sanitizeRequestBody(body);

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new ValidationError('Message is required and cannot be empty');
  }

  if (message.length > 2000) {
    throw new ValidationError('Message exceeds maximum length of 2000 characters');
  }

  // Validate conversation history
  if (!Array.isArray(conversationHistory)) {
    throw new ValidationError('Conversation history must be an array');
  }

  if (conversationHistory.length > 20) {
    throw new ValidationError('Conversation history exceeds maximum length');
  }

  const sanitizedMessage = sanitizeString(message);
  const systemPrompt = `You are WiseBot, an AI governance consultant at WasatchWise. You help school districts understand AI governance, compliance, and best practices. Be friendly, knowledgeable, and conversational. Keep responses concise (2-3 paragraphs max). If asked about services, mention the Cognitive Audit and 90-Day Compliance Protocol.`;

  const messages = [
    ...conversationHistory.filter(
      (msg: unknown) =>
        msg &&
        typeof msg === 'object' &&
        'role' in msg &&
        'content' in msg &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
    ),
    {
      role: 'user' as const,
      content: sanitizedMessage,
    },
  ];

  const supabase = await createClient();

  // Search knowledge base before calling Claude
  const { data: kbResults } = await supabase
    .from('knowledge_base')
    .select('id,question,answer,view_count')
    .eq('active', true)
    .textSearch('search_vector', sanitizedMessage, { type: 'websearch' })
    .limit(3);

  let enhancedSystemPrompt = systemPrompt;

  const kbResultsCount = kbResults?.length ?? 0;
  const kbUsed = kbResultsCount > 0;

  if (kbUsed && kbResults) {
    const kbContext = kbResults
      .map((kb) => `Q: ${kb.question}\nA: ${kb.answer}`)
      .join('\n\n');

    enhancedSystemPrompt = `${systemPrompt}

KNOWLEDGE BASE CONTEXT (Use this authoritative information when relevant):
${kbContext}

If the user's question closely matches one of the knowledge base entries above, use that information as your primary source. Always cite the knowledge base as your source when you use it.`;

    // Track KB usage (service role if available)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && kbResults && kbResults.length > 0) {
      const serviceClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const first = kbResults[0];
      (async () => {
        try {
          await serviceClient
            .from('knowledge_base')
            .update({
              view_count: (first.view_count ?? 0) + 1,
              last_viewed_at: new Date().toISOString(),
            })
            .eq('id', first.id);
        } catch {
          // Non-blocking
        }
      })();
    }
  }

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';
      try {
        const stream = await anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: enhancedSystemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        controller.close();

        // Log AI usage (non-blocking)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          logger.logDBOperation('insert', 'ai_content_log', async () => {
            try {
              const supabase = await createClient();
              await supabase.from('ai_content_log').insert({
                content_type: 'wisebot_chat',
                input_prompt: message.slice(0, 10000),
                output_text: fullResponse.slice(0, 50000),
                model: 'claude-3-5-sonnet-20241022',
                kb_enhanced: kbUsed,
                kb_results_count: kbResultsCount,
              });
            } catch (error) {
              logger.error('Failed to log WiseBot usage to database', error);
            }
          }).catch(() => {
            // Silently fail - logging is non-critical
          });
        }
      } catch (error) {
        logger.error('Streaming error', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        // Send error through stream so client can read it
        try {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`
            )
          );
        } catch {
          // If we can't send error through stream, just close
        }
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const POST = withErrorHandling(handler);
