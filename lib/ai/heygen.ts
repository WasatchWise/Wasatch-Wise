import { createClient } from '@/lib/supabase/server';
import { retry } from '@/lib/utils/retry';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/utils/errors';
import { withTimeout, API_TIMEOUTS } from '@/lib/utils/timeout';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY!;
const HEYGEN_API_URL = 'https://api.heygen.com';

export interface HeyGenVideoOptions {
  avatarId?: string;
  script: string;
  title: string;
  clientId?: string;
  usageContext?: string;
  voiceId?: string;
}

export async function createHeyGenVideo({
  avatarId = process.env.HEYGEN_AVATAR_ID || '2d1fcc53313c4fcb9db3eb4b323a92e6', // Dan (Wasatch County) default
  script,
  title,
  clientId,
  usageContext = 'general',
  voiceId,
}: HeyGenVideoOptions): Promise<string> {
  if (!script || script.trim().length === 0) {
    throw new Error('Script cannot be empty');
  }

  if (script.length > 5000) {
    throw new Error('Script exceeds maximum length of 5000 characters');
  }

  if (!title || title.trim().length === 0) {
    throw new Error('Title cannot be empty');
  }

  try {
    // Generate video with retry logic
    const videoId = await logger.logAPICall('HeyGen', 'generate', () =>
      retry(
        async () => {
          const response = await withTimeout(
            fetch(`${HEYGEN_API_URL}/v2/video/generate`, {
              method: 'POST',
              headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                video_inputs: [
                  {
                    character: {
                      type: 'avatar',
                      avatar_id: avatarId,
                      avatar_style: 'normal',
                    },
                    voice: {
                      type: 'text',
                      input_text: script,
                      voice_id: voiceId || process.env.HEYGEN_VOICE_ID || 'default',
                    },
                  },
                ],
                dimension: { width: 1920, height: 1080 },
                title,
              }),
            }),
            API_TIMEOUTS.heygen,
            'HeyGen video generation request timed out'
          );

          if (!response.ok) {
            const error = new Error(
              `HeyGen API error: ${response.status} ${response.statusText}`
            ) as Error & { status?: number };
            error.status = response.status;
            throw error;
          }

          const data = (await response.json()) as { data?: { video_id?: string } };
          return data?.data?.video_id || '';
        },
        {
          maxAttempts: 2, // Only retry once for video generation
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

    if (!videoId) {
      throw new Error('No video ID returned from HeyGen API');
    }

    // Poll for completion with timeout
    let videoUrl = '';
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max wait
    const pollStartTime = Date.now();
    const pollTimeout = 10 * 60 * 1000; // 10 minutes total

    while (!videoUrl && attempts < maxAttempts) {
      // Check overall timeout
      if (Date.now() - pollStartTime > pollTimeout) {
        throw new Error('Video generation polling timed out');
      }

      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10s
      attempts++;

      try {
        const statusResponse = await withTimeout(
          fetch(`${HEYGEN_API_URL}/v1/video_status.get?video_id=${videoId}`, {
            headers: { 'X-Api-Key': HEYGEN_API_KEY },
          }),
          5000,
          'Status check timed out'
        );

        if (!statusResponse.ok) {
          const error = new Error(
            `HeyGen status error: ${statusResponse.status} ${statusResponse.statusText}`
          ) as Error & { status?: number };
          error.status = statusResponse.status;
          throw error;
        }

        const statusData = (await statusResponse.json()) as {
          data?: { status?: string; video_url?: string; error?: string };
        };
        const status = statusData.data?.status;

        if (status === 'completed') {
          videoUrl = statusData.data?.video_url || '';
          if (!videoUrl) {
            throw new Error('Video URL not found in completed response');
          }
        } else if (status === 'failed') {
          throw new Error(
            `HeyGen video generation failed: ${statusData.data?.error || 'Unknown error'}`
          );
        }
        // Continue polling if status is 'processing' or other
      } catch (error) {
        // Log but continue polling unless it's a fatal error
        if (error instanceof Error && error.message.includes('failed')) {
          throw error;
        }
        logger.warn('Error checking video status', { error, attempt: attempts });
      }
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out after maximum attempts');
    }

    // Store in Supabase (non-blocking)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      logger.logDBOperation('insert', 'heygen_videos', async () => {
        try {
          const supabase = await createClient();
          await supabase.from('heygen_videos').insert({
            video_id: videoId,
            avatar_id: avatarId,
            script: script.slice(0, 10000), // Limit stored script length
            video_url: videoUrl,
            client_id: clientId || null,
            usage_context: usageContext,
          });
        } catch (error) {
          logger.error('Failed to log HeyGen video to database', error);
        }
      }).catch(() => {
        // Silently fail - logging is non-critical
      });
    }

    logger.info('HeyGen video generated successfully', {
      videoId,
      duration: `${attempts * 10}s`,
      usageContext,
    });

    return videoUrl;
  } catch (error) {
    logger.error('HeyGen API error', error, {
      avatarId,
      scriptLength: script.length,
      title,
    });

    if (error instanceof Error) {
      throw new ExternalAPIError(
        `HeyGen API error: ${error.message}`,
        'heygen',
        error
      );
    }

    throw new ExternalAPIError('Unknown HeyGen API error', 'heygen', error);
  }
}

