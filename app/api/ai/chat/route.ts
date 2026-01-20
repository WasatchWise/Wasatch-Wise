import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { withErrorHandling, sanitizeRequestBody } from '@/lib/utils/api-wrapper';
import { ValidationError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { sanitizeString } from '@/lib/utils/sanitize';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function handler(req: NextRequest) {
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

  const systemPrompt = `You are Dan, an AI governance consultant at WasatchWise. You help school districts understand AI governance, compliance, and best practices. Be friendly, knowledgeable, and conversational. Keep responses concise (2-3 paragraphs max). If asked about services, mention the Cognitive Audit and 90-Day Compliance Protocol.`;

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
      content: sanitizeString(message),
    },
  ];

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text') {
            const text = chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }

        controller.close();
      } catch (error) {
        logger.error('Streaming error', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const POST = withErrorHandling(handler);
