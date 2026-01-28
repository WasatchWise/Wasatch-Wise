import { retry } from '@/lib/utils/retry';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/utils/errors';
import { withTimeout, API_TIMEOUTS } from '@/lib/utils/timeout';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_JOHN_VOICE_ID ||
  process.env.ELEVENLABS_VOICE_ID ||
  'Liam';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function textToSpeech({
  text,
  voiceId = ELEVENLABS_VOICE_ID,
  modelId = 'eleven_turbo_v2_5',
  stability = 0.5,
  similarityBoost = 0.75,
}: ElevenLabsOptions): Promise<ArrayBuffer> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (text.length > 5000) {
    throw new Error('Text exceeds maximum length of 5000 characters');
  }

  // Validate voice settings
  if (stability < 0 || stability > 1) {
    throw new Error('Stability must be between 0 and 1');
  }

  if (similarityBoost < 0 || similarityBoost > 1) {
    throw new Error('Similarity boost must be between 0 and 1');
  }

  try {
    const audioBuffer = await logger.logAPICall('ElevenLabs', 'textToSpeech', () =>
      retry(
        async () => {
          const response = await withTimeout(
            fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
              method: 'POST',
              headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text,
                model_id: modelId,
                voice_settings: {
                  stability,
                  similarity_boost: similarityBoost,
                },
              }),
            }),
            API_TIMEOUTS.elevenlabs,
            'ElevenLabs TTS request timed out'
          );

          if (!response.ok) {
            const error = new Error(
              `ElevenLabs API error: ${response.status} ${response.statusText}`
            ) as Error & { status?: number };
            error.status = response.status;
            throw error;
          }

          const buffer = await response.arrayBuffer();

          if (!buffer || buffer.byteLength === 0) {
            throw new Error('Empty audio response from ElevenLabs');
          }

          return buffer;
        },
        {
          maxAttempts: 3,
          retryable: (error): boolean => {
            if (error instanceof Error) {
              const status = 'status' in error ? (error.status as number | undefined) : undefined;
              return (
                error.message.includes('timeout') ||
                error.message.includes('network') ||
                error.message.includes('ECONNRESET') ||
                (status !== undefined && status >= 500)
              );
            }
            return false;
          },
        }
      )
    );

    return audioBuffer;
  } catch (error) {
    logger.error('ElevenLabs API error', error, {
      voiceId,
      textLength: text.length,
      modelId,
    });

    if (error instanceof Error) {
      throw new ExternalAPIError(
        `ElevenLabs API error: ${error.message}`,
        'elevenlabs',
        error
      );
    }

    throw new ExternalAPIError('Unknown ElevenLabs API error', 'elevenlabs', error);
  }
}

