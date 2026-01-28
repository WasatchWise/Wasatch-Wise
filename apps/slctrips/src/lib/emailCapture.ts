/**
 * Centralized Email Capture Utility
 *
 * Provides consistent email capture with:
 * - Email validation
 * - Attribution tracking
 * - Deduplication (upsert semantics)
 * - Consistent error handling
 * - Type-safe source tracking
 */

import { supabase } from '@/lib/supabaseClient';
import { getAttribution, captureAttribution } from '@/lib/attribution';

// Valid email capture sources - centralized for consistency
export type EmailCaptureSource =
  | 'welcome_wagon_free_guide'
  | 'welcome_wagon_corporate'
  | 'reservation_welcome-wagon'
  | 'welcome_modal'
  | 'footer_newsletter'
  | 'tripkit_interest'
  | 'staykit_interest';

export type VisitorType = 'visiting' | 'relocating' | 'educator' | 'guardian' | 'unknown';

export interface EmailCaptureInput {
  email: string;
  source: EmailCaptureSource;
  visitorType?: VisitorType;
  name?: string;
  notes?: string;
  preferences?: string[];
}

export interface EmailCaptureResult {
  success: boolean;
  isNew: boolean; // true if new capture, false if existing email updated
  error?: string;
  correlationId?: string;
}

// Simple email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length < 5) {
    return { valid: false, error: 'Email is too short' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

// Generate a correlation ID for support/debugging
function generateCorrelationId(): string {
  return `ec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Capture an email with full attribution data
 * Uses upsert semantics - won't fail on duplicate, will update instead
 */
export async function captureEmail(input: EmailCaptureInput): Promise<EmailCaptureResult> {
  const correlationId = generateCorrelationId();

  // Validate email
  const validation = validateEmail(input.email);
  if (!validation.valid) {
    return {
      success: false,
      isNew: false,
      error: validation.error,
      correlationId,
    };
  }

  const normalizedEmail = input.email.trim().toLowerCase();

  // Ensure we have attribution data
  captureAttribution();
  const attribution = getAttribution();

  // Build notes with name if provided
  let notes = input.notes || '';
  if (input.name && !notes.includes('Name:')) {
    notes = input.name ? `Name: ${input.name}${notes ? ', ' + notes : ''}` : notes;
  }

  try {
    // First, check if this email already exists for this source
    const { data: existing } = await supabase
      .from('email_captures')
      .select('id, email')
      .eq('email', normalizedEmail)
      .eq('source', input.source)
      .single();

    if (existing) {
      // Update existing record (merge preferences, update timestamp)
      const { error: updateError } = await supabase
        .from('email_captures')
        .update({
          notes: notes || undefined,
          preferences: input.preferences || undefined,
          // Update attribution if we have newer data
          utm_source: attribution?.utm_source || undefined,
          utm_medium: attribution?.utm_medium || undefined,
          utm_campaign: attribution?.utm_campaign || undefined,
          referrer: attribution?.referrer || undefined,
          landing_page: attribution?.landing_page || undefined,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`[EmailCapture:${correlationId}] Update error:`, updateError);
        return {
          success: false,
          isNew: false,
          error: 'Failed to update your information. Please try again.',
          correlationId,
        };
      }

      return {
        success: true,
        isNew: false,
        correlationId,
      };
    }

    // Insert new record with full attribution
    const { error: insertError } = await supabase
      .from('email_captures')
      .insert([
        {
          email: normalizedEmail,
          source: input.source,
          visitor_type: input.visitorType || 'unknown',
          notes: notes || null,
          preferences: input.preferences || null,
          // Attribution data
          utm_source: attribution?.utm_source || null,
          utm_medium: attribution?.utm_medium || null,
          utm_campaign: attribution?.utm_campaign || null,
          referrer: attribution?.referrer || null,
          landing_page: attribution?.landing_page || null,
        },
      ]);

    if (insertError) {
      console.error(`[EmailCapture:${correlationId}] Insert error:`, insertError);

      // Check for specific error types
      if (insertError.code === '23505') {
        // Unique constraint violation - race condition, treat as success
        return {
          success: true,
          isNew: false,
          correlationId,
        };
      }

      return {
        success: false,
        isNew: false,
        error: 'Unable to save your information. Please try again.',
        correlationId,
      };
    }

    return {
      success: true,
      isNew: true,
      correlationId,
    };
  } catch (err) {
    console.error(`[EmailCapture:${correlationId}] Unexpected error:`, err);
    return {
      success: false,
      isNew: false,
      error: 'An unexpected error occurred. Please try again.',
      correlationId,
    };
  }
}

/**
 * Send a welcome guide email after capture
 * Separated from capture for retry capability
 */
export async function sendWelcomeGuide(
  email: string,
  name?: string
): Promise<{ success: boolean; error?: string; correlationId: string }> {
  const correlationId = generateCorrelationId();

  try {
    const response = await fetch('/api/welcome-wagon/send-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[SendGuide:${correlationId}] API error:`, errorData);
      return {
        success: false,
        error: errorData.error || 'Failed to send email. You can retry below.',
        correlationId,
      };
    }

    return {
      success: true,
      correlationId,
    };
  } catch (err) {
    console.error(`[SendGuide:${correlationId}] Network error:`, err);
    return {
      success: false,
      error: 'Network error. Please check your connection and retry.',
      correlationId,
    };
  }
}

/**
 * Combined capture + send for welcome wagon flow
 */
export async function captureAndSendWelcomeGuide(
  email: string,
  name?: string
): Promise<{
  captureResult: EmailCaptureResult;
  sendResult?: { success: boolean; error?: string; correlationId: string };
}> {
  // First capture
  const captureResult = await captureEmail({
    email,
    source: 'welcome_wagon_free_guide',
    visitorType: 'relocating',
    name,
  });

  // If capture failed, don't try to send
  if (!captureResult.success) {
    return { captureResult };
  }

  // Then send
  const sendResult = await sendWelcomeGuide(email, name);

  return { captureResult, sendResult };
}
