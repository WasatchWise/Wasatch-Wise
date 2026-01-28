/**
 * ElevenLabs Voice Service
 *
 * This service handles text-to-speech generation using ElevenLabs API.
 * Dan the Wasatch Sasquatch uses the "Liam" voice for all spoken content.
 *
 * Uses REST API directly (no SDK dependency required)
 */

// ElevenLabs API configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs - Liam is Dan's official voice
export const VOICES = {
  DAN: "TX3LPaxmHKxFdv7VOQHJ", // Liam - warm, friendly, curious tone
} as const;

// Voice settings for optimal quality
const VOICE_SETTINGS = {
  stability: 0.5,        // Balance between consistency and expressiveness
  similarity_boost: 0.75, // Keep Liam's natural characteristics
  style: 0.0,            // No additional style manipulation
  use_speaker_boost: true // Enhanced clarity
};

/**
 * Generate speech audio from text using Dan's voice (Liam)
 *
 * @param text - The text to convert to speech
 * @param language - Optional language code for multilingual generation (e.g., 'en', 'es', 'fr')
 * @param voiceId - Optional voice ID (defaults to Dan/Liam)
 * @returns Audio as Buffer
 */
export async function generateSpeech(
  text: string,
  language: string = 'en',
  voiceId: string = VOICES.DAN
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    // Use multilingual-v2 for non-English languages
    const modelId = language === 'en' ? 'eleven_turbo_v2_5' : 'eleven_multilingual_v2';

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          language_code: language, // Explicit language for better pronunciation
          voice_settings: VOICE_SETTINGS
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error("ElevenLabs speech generation failed:", error);
    throw new Error(`Failed to generate speech: ${error}`);
  }
}

/**
 * Generate speech and return as base64 data URL for direct playback
 *
 * @param text - The text to convert to speech
 * @returns Base64-encoded audio data URL
 */
export async function generateSpeechDataURL(text: string): Promise<string> {
  const audioBuffer = await generateSpeech(text);
  const base64Audio = audioBuffer.toString('base64');
  return `data:audio/mpeg;base64,${base64Audio}`;
}

/**
 * Generate speech for a destination intro
 * Formatted for the SLCTrips video template:
 * [OPEN {variables}] {content} [CLOSE]
 *
 * @param destinationName - Name of the destination
 * @param driveTime - Drive time from SLC Airport (e.g., "45 minutes")
 * @param description - Main content description
 * @param destinationCount - Total number of destinations on platform
 * @returns Audio buffer
 */
export async function generateDestinationVoiceover(
  destinationName: string,
  driveTime: string,
  description: string,
  destinationCount: number = 700
): Promise<Buffer> {
  // Format following the brand VO template
  const script = `Just ${driveTime} from Salt Lake City International Airport, ${description} This is just one of over ${destinationCount} destinations you can explore for free right now at slctrips.com. From Salt Lake to Everywhere.`;

  return generateSpeech(script);
}

/**
 * Get available voices from ElevenLabs API
 * Useful for finding or verifying voice IDs
 */
export async function getAvailableVoices() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    throw error;
  }
}

export default {
  generateSpeech,
  generateSpeechDataURL,
  generateDestinationVoiceover,
  getAvailableVoices,
  VOICES
};
