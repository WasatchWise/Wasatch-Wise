import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * API Route: Request TripKit Access (Free Email Gate)
 * POST /api/tripkits/request-access
 *
 * Handles email collection for TK-000 free educator access.
 * Generates lifetime access code and stores in database.
 */

export async function POST(request: NextRequest) {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, tripkitSlug, name } = body;

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!tripkitSlug) {
      return NextResponse.json(
        { error: 'TripKit slug is required' },
        { status: 400 }
      );
    }

    // Get TripKit details
    const { data: tripkit, error: tripkitError } = await supabase
      .from('tripkits')
      .select('id, code, name, slug')
      .eq('slug', tripkitSlug)
      .single();

    if (tripkitError || !tripkit) {
      return NextResponse.json(
        { error: 'TripKit not found' },
        { status: 404 }
      );
    }

    // Check if user already has access to this TripKit
    const { data: existingAccess } = await supabase
      .from('tripkit_access_codes')
      .select('access_code, id')
      .eq('customer_email', email.toLowerCase())
      .eq('tripkit_id', tripkit.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingAccess) {
      // User already has access - return existing code
      return NextResponse.json({
        success: true,
        accessCode: existingAccess.access_code,
        accessCodeId: existingAccess.id,
        message: 'Welcome back! Your existing access has been restored.',
        isExisting: true
      });
    }

    // Generate new access code using database function
    const { data: newCodeData, error: codeError } = await supabase
      .rpc('generate_tripkit_access_code');

    if (codeError || !newCodeData) {
      console.error('Error generating access code:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate access code' },
        { status: 500 }
      );
    }

    const accessCode = newCodeData as string;

    // Create access code record
    const { data: accessRecord, error: insertError } = await supabase
      .from('tripkit_access_codes')
      .insert({
        access_code: accessCode,
        tripkit_id: tripkit.id,
        customer_email: email.toLowerCase(),
        customer_name: name || null,
        amount_paid: 0, // Free access
        is_active: true,
        activated_at: new Date().toISOString(),
        expires_at: null, // Lifetime access
        generated_by: 'free-educator-access',
        notes: 'Free lifetime access - Email gate collection',
        ip_address: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select('id')
      .single();

    if (insertError || !accessRecord) {
      console.error('Error creating access record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create access record' },
        { status: 500 }
      );
    }

    // Initialize progress record
    const { error: progressError } = await supabase
      .from('user_tripkit_progress')
      .insert({
        access_code_id: accessRecord.id,
        tripkit_id: tripkit.id,
        customer_email: email.toLowerCase(),
        destinations_visited: [],
        destinations_wishlist: [],
        completion_percentage: 0
      });

    if (progressError) {
      console.error('Error creating progress record:', progressError);
      // Non-fatal - access still works
    }

    // Send confirmation email
    await sendTripKitConfirmationEmail(
      email.toLowerCase(),
      name || 'Friend',
      accessCode,
      tripkit
    );

    // Add to email marketing list (users can opt-out later)
    const { error: emailError } = await supabase
      .from('email_captures')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        source: 'tk-000-access',
        visitor_type: 'educator',
        preferences: ['tripkits', 'education'],
        created_at: new Date().toISOString(),
      });

    if (emailError) {
      console.warn('Could not add to email list (non-fatal):', emailError);
    }

    return NextResponse.json({
      success: true,
      accessCode: accessCode,
      accessCodeId: accessRecord.id,
      tripkitName: tripkit.name,
      message: 'Access granted! Welcome to your lifetime TripKit.',
      isExisting: false
    });

  } catch (error) {
    console.error('Error in request-access API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send confirmation email with access link via SendGrid
 */
async function sendTripKitConfirmationEmail(
  email: string,
  name: string,
  accessCode: string,
  tripkit: { name: string; code: string }
) {
  const accessUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/tripkits/${tripkit.code === 'TK-000' ? 'meet-the-mt-olympians' : 'tk-000'}/view?access=${accessCode}`;
  
  // Email sending (no logging in production)

  // Email content for reference:
  const emailContent = {
    subject: `🎉 Your Free Access to ${tripkit.name}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #1e40af; margin-bottom: 20px;">Welcome, ${name}!</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thanks for signing up! You now have <strong>lifetime access</strong> to our free educational TripKit:
        </p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 24px;">${tripkit.name}</h2>
          <p style="color: #e5e7eb; margin: 10px 0 0 0;">Meet Utah's 29 County Guardians</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${accessUrl}" 
             style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px;">
            🚀 Access Your TripKit Now
          </a>
        </div>
        
        <div style="background: #f3f4f6; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1e40af;">What's Inside:</h3>
          <ul style="color: #374151; padding-left: 20px;">
            <li>✅ 29 County Guardians with educational stories</li>
            <li>✅ Curriculum frameworks for teachers</li>
            <li>✅ Growing content library</li>
            <li>✅ Forever free - no expiration!</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>📌 Save Your Link:</strong> Bookmark this URL for quick access:<br/>
            <a href="${accessUrl}" style="color: #2563eb; word-break: break-all;">${accessUrl}</a>
          </p>
        </div>
        
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 15px; margin-top: 30px;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            <strong>🎓 Perfect for:</strong> Teachers • Homeschool families • Utah Studies educators • Explorers
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Want more TripKits?</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/tripkits" 
             style="color: #2563eb; text-decoration: none; font-weight: 500;">
            Explore All TripKits →
          </a>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
            SLCTrips<br/>
            From Salt Lake, to Everywhere<br/>
            <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a>
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 20px 0 0 0;">
            You're receiving this because you requested access to ${tripkit.name}. 
            We never share your email. 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com'}/privacy" style="color: #6b7280;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `
  };

  // Send email via SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to: email,
        from: 'SLCTrips <dan@slctrips.com>',
        subject: emailContent.subject,
        html: emailContent.html,
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Confirmation email sent to ${email}`);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      // Don't fail the request if email fails
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ SENDGRID_API_KEY not configured. Email content:', JSON.stringify(emailContent, null, 2));
    }
  }
}
