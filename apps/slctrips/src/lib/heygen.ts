/**
 * HeyGen Video Generation Service
 *
 * Creates talking avatar videos of Dan the Wasatch Sasquatch
 * Integrates with ElevenLabs audio for multilingual videos
 */

const HEYGEN_API_URL = 'https://api.heygen.com/v2';

// Guardian HeyGen Avatar IDs (talking photos)
// Protagonist & Main Characters
export const DAN_AVATAR_ID = '2d1fcc53313c4fcb9db3eb4b323a92e6'; // Dan - Wasatch County Guardian
export const LUNA_AVATAR_ID = 'b5369ca634974e8288404be2d617983e'; // Luna - Protagonist (no county)

// County Guardians
export const IRA_AVATAR_ID = 'a1ed9890db3444f4b241979264f61341';
export const BRUNO_AVATAR_ID = '69c570a48dd54479885c9132b22619cd';
export const ELSA_AVATAR_ID = '94173101cadd4ef3b876a58f18d4729c';
export const QUINCY_AVATAR_ID = 'a92b338ad5074bceb56dc7c4e7c2d832';
export const TAVAPUTS_AVATAR_ID = '5cb123ecd36249408cbce4e99ceb374c';
export const MARIS_AVATAR_ID = '18080c17745b4c0b81399fb0f4e22dde';
export const SEDGE_AVATAR_ID = '0352325edabd49ecbf54c65c9630ec85';

/**
 * Guardian Avatar Registry
 * Maps guardian codenames to HeyGen avatar IDs
 */
export const GUARDIAN_AVATARS = {
  dan: DAN_AVATAR_ID,
  luna: LUNA_AVATAR_ID,
  ira: IRA_AVATAR_ID,
  bruno: BRUNO_AVATAR_ID,
  elsa: ELSA_AVATAR_ID,
  quincy: QUINCY_AVATAR_ID,
  tavaputs: TAVAPUTS_AVATAR_ID,
  maris: MARIS_AVATAR_ID,
  sedge: SEDGE_AVATAR_ID
} as const;

export type GuardianCodename = keyof typeof GUARDIAN_AVATARS;

export interface VideoGenerationOptions {
  audioUrl?: string;
  audioAssetId?: string;
  text?: string;
  voiceId?: string;
  avatarId?: string;
  photoUrl?: string;
  title?: string;
  dimension?: {
    width: number;
    height: number;
  };
  backgroundColor?: string;
}

/**
 * Generate a talking photo video using HeyGen
 *
 * @param options - Video generation configuration
 * @returns video_id for polling status
 */
export async function generateTalkingVideo(
  options: VideoGenerationOptions
): Promise<string> {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  // Build the request body
  const requestBody: any = {
    video_inputs: [
      {
        character: {
          type: 'talking_photo',
          // Use avatar ID if provided, otherwise fall back to photo URL
          ...(options.avatarId
            ? { talking_photo_id: options.avatarId }
            : { talking_photo_url: options.photoUrl }),
          talking_photo_style: 'expressive',
          scale: 1.0,
          super_resolution: true
        },
        voice: options.audioUrl || options.audioAssetId
          ? {
              type: 'audio',
              audio_url: options.audioUrl,
              audio_asset_id: options.audioAssetId
            }
          : {
              type: 'text',
              input_text: options.text,
              voice_id: options.voiceId || '1bd001e7e50f421d891986aad5158bc8' // Default English voice
            },
        background: {
          type: 'color',
          value: options.backgroundColor || '#0d2a40' // Navy Ridge from brand
        }
      }
    ],
    dimension: options.dimension || {
      width: 1080,
      height: 1920 // Vertical video for social
    },
    title: options.title || 'Dan the Wasatch Sasquatch',
    test: false
  };

  try {
    const response = await fetch(`${HEYGEN_API_URL}/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HeyGen API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.data.video_id;

  } catch (error) {
    console.error('HeyGen video generation failed:', error);
    throw error;
  }
}

/**
 * Check the status of a video generation job
 *
 * @param videoId - The video ID returned from generateTalkingVideo
 * @returns Video status and URL when complete
 */
export async function getVideoStatus(videoId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}> {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${HEYGEN_API_URL}/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get video status: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: data.data.status,
      videoUrl: data.data.video_url,
      thumbnailUrl: data.data.thumbnail_url,
      duration: data.data.duration,
      error: data.data.error
    };

  } catch (error) {
    console.error('Failed to check video status:', error);
    throw error;
  }
}

/**
 * Poll for video completion
 *
 * @param videoId - The video ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 60)
 * @param intervalMs - Polling interval in ms (default: 10000)
 * @returns Final video status with URL
 */
export async function pollVideoCompletion(
  videoId: string,
  maxAttempts: number = 60,
  intervalMs: number = 10000
): Promise<{
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await getVideoStatus(videoId);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(`Video generation failed: ${status.error}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Video generation timed out');
}

/**
 * Get available avatars
 */
export async function getAvatars() {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  const response = await fetch(`${HEYGEN_API_URL}/avatars`, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch avatars: ${response.status}`);
  }

  const data = await response.json();
  return data.data.avatars;
}

/**
 * Get available voices
 */
export async function getVoices() {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  const response = await fetch(`${HEYGEN_API_URL}/voices`, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`);
  }

  const data = await response.json();
  return data.data.voices;
}

/**
 * Generate Dan's TripKit introduction video
 *
 * @param text - The script for Dan to speak
 * @param audioUrl - Optional: Use pre-generated ElevenLabs audio
 * @returns video_id for polling
 */
export async function generateDanTripKitVideo(
  text: string,
  audioUrl?: string
): Promise<string> {
  return generateTalkingVideo({
    avatarId: DAN_AVATAR_ID,
    text: audioUrl ? undefined : text,
    audioUrl,
    title: 'Dan - TripKit Introduction',
    backgroundColor: '#0d2a40' // Navy Ridge brand color
  });
}

/**
 * Generate Guardian video by codename
 *
 * @param guardianCodename - Guardian identifier (dan, luna, ira, etc.)
 * @param text - The script for the Guardian to speak
 * @param audioUrl - Optional: Use pre-generated ElevenLabs audio
 * @param title - Optional: Custom video title
 * @returns video_id for polling
 */
export async function generateGuardianVideo(
  guardianCodename: GuardianCodename,
  text: string,
  audioUrl?: string,
  title?: string
): Promise<string> {
  const avatarId = GUARDIAN_AVATARS[guardianCodename];

  if (!avatarId) {
    throw new Error(`Unknown guardian: ${guardianCodename}`);
  }

  return generateTalkingVideo({
    avatarId,
    text: audioUrl ? undefined : text,
    audioUrl,
    title: title || `${guardianCodename.charAt(0).toUpperCase() + guardianCodename.slice(1)} - Guardian Message`,
    backgroundColor: '#0d2a40' // Navy Ridge brand color
  });
}

export default {
  generateTalkingVideo,
  getVideoStatus,
  pollVideoCompletion,
  getAvatars,
  getVoices,
  generateDanTripKitVideo,
  generateGuardianVideo,
  GUARDIAN_AVATARS,
  DAN_AVATAR_ID,
  LUNA_AVATAR_ID
};
