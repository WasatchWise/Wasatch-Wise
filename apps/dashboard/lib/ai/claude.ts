import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { retry } from '@/lib/utils/retry';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/utils/errors';
import { withTimeout, API_TIMEOUTS } from '@/lib/utils/timeout';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateWithClaude(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    systemPrompt?: string;
    clientId?: string;
    contentType?: string;
  } = {}
): Promise<string> {
  const {
    model = 'claude-3-5-sonnet-20241022',
    maxTokens = 4000,
    systemPrompt,
    clientId,
    contentType = 'general',
  } = options;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  if (prompt.length > 100000) {
    throw new Error('Prompt exceeds maximum length');
  }

  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await logger.logAPICall('Claude', 'generate', () =>
      retry(
        () =>
          withTimeout(
            anthropic.messages.create({
              model,
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            }),
            API_TIMEOUTS.claude,
            'Claude API request timed out'
          ),
        {
          maxAttempts: 3,
          retryable: (error) => {
            // Retry on network errors or 5xx errors
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
      )
    );

    const outputText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    if (!outputText) {
      throw new Error('Empty response from Claude API');
    }

    // Log usage to database (non-blocking)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      logger.logDBOperation('insert', 'ai_content_log', async () => {
        try {
          const supabase = await createClient();
          const inputTokens = response.usage.input_tokens;
          const outputTokens = response.usage.output_tokens;
          const costUsd = (
            (inputTokens * 0.003 + outputTokens * 0.015) /
            1000
          ).toFixed(4);

          await supabase.from('ai_content_log').insert({
            content_type: contentType,
            input_prompt: prompt.slice(0, 10000), // Limit stored prompt length
            output_text: outputText.slice(0, 50000), // Limit stored output length
            model,
            tokens_used: inputTokens + outputTokens,
            cost_usd: parseFloat(costUsd),
            client_id: clientId || null,
          });
        } catch (error) {
          // Log but don't fail the request
          logger.error('Failed to log AI usage to database', error);
        }
      }).catch(() => {
        // Silently fail - logging is non-critical
      });
    }

    return outputText;
  } catch (error) {
    logger.error('Claude API error', error, {
      model,
      contentType,
      promptLength: prompt.length,
    });

    if (error instanceof Error) {
      throw new ExternalAPIError(
        `Claude API error: ${error.message}`,
        'claude',
        error
      );
    }

    throw new ExternalAPIError('Unknown Claude API error', 'claude', error);
  }
}

export async function chatWithClaude(
  messages: ClaudeMessage[],
  options: {
    systemPrompt?: string;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { systemPrompt, maxTokens = 4000 } = options;

  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  try {
    const response = await logger.logAPICall('Claude', 'chat', () =>
      retry(
        () =>
          withTimeout(
            anthropic.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            }),
            API_TIMEOUTS.claude,
            'Claude chat request timed out'
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
      )
    );

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    if (!text) {
      throw new Error('Empty response from Claude API');
    }

    return text;
  } catch (error) {
    logger.error('Claude chat error', error, {
      messageCount: messages.length,
    });

    if (error instanceof Error) {
      throw new ExternalAPIError(
        `Claude chat error: ${error.message}`,
        'claude',
        error
      );
    }

    throw new ExternalAPIError('Unknown Claude chat error', 'claude', error);
  }
}

