/**
 * Voice Generation API Endpoint
 *
 * Generates voiceovers for destinations using Dan's voice (Liam from ElevenLabs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, generateDestinationVoiceover } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Handle TripKit introduction voiceover
    if (body.type === 'tripkit') {
      const { tripkit_name, tripkit_description, destination_count } = body;

      if (!tripkit_name) {
        return NextResponse.json(
          { error: 'Missing required field: tripkit_name' },
          { status: 400 }
        );
      }

      // Generate script for TripKit intro
      const script = `Hey there, adventurer! Dan here. Welcome to ${tripkit_name}. ${
        tripkit_description || ''
      } I've personally curated ${destination_count || 'these amazing'} destinations just for you. Each spot has been hand-picked for its unique character and accessibility from Salt Lake City. Let's explore together! Hit that list view below to see where we're headed.`;

      const audioBuffer = await generateSpeech(script);
      const base64Audio = audioBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        audio: `data:audio/mpeg;base64,${base64Audio}`,
        format: 'mp3',
        voice: 'Liam (Dan)',
        script
      });
    }

    // Handle destination voiceover generation
    if (body.type === 'destination') {
      const { destinationName, driveTime, description, destinationCount } = body;

      if (!destinationName || !driveTime || !description) {
        return NextResponse.json(
          { error: 'Missing required fields: destinationName, driveTime, description' },
          { status: 400 }
        );
      }

      const audioBuffer = await generateDestinationVoiceover(
        destinationName,
        driveTime,
        description,
        destinationCount || 700
      );

      // Return audio as base64
      const base64Audio = audioBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        audio: `data:audio/mpeg;base64,${base64Audio}`,
        format: 'mp3',
        voice: 'Liam (Dan)'
      });
    }

    // Handle simple text-to-speech
    if (body.type === 'simple' || body.text) {
      const { text } = body;

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid text field' },
          { status: 400 }
        );
      }

      if (text.length > 5000) {
        return NextResponse.json(
          { error: 'Text exceeds maximum length of 5000 characters' },
          { status: 400 }
        );
      }

      const audioBuffer = await generateSpeech(text);
      const base64Audio = audioBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        audio: `data:audio/mpeg;base64,${base64Audio}`,
        format: 'mp3',
        voice: 'Liam (Dan)'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request type. Use type: "destination" or type: "simple" with text' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Voice generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate voice',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  const isConfigured = !!process.env.ELEVENLABS_API_KEY;

  return NextResponse.json({
    service: 'ElevenLabs Voice Generation',
    mascot: 'Dan the Wasatch Sasquatch',
    voice: 'Liam',
    configured: isConfigured,
    endpoints: {
      simple: {
        method: 'POST',
        body: { type: 'simple', text: 'Your text here' }
      },
      destination: {
        method: 'POST',
        body: {
          type: 'destination',
          destinationName: 'Summum Pyramid',
          driveTime: '45 minutes',
          description: 'you\'ll find one of Utah\'s strangest landmarks...',
          destinationCount: 700
        }
      }
    }
  });
}
