import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function sendFeedbackEmail(submission: { name: string; email: string; category: string; message: string }) {
  const sendgridKey = process.env.SENDGRID_API_KEY
  if (!sendgridKey) {
    console.warn('SendGrid API key not configured - email notification skipped')
    return false
  }

  try {
    // Default recipient - can be overridden via environment variable
    const recipientEmail = process.env.FEEDBACK_RECIPIENT_EMAIL || 'admin@wasatchwise.com'
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }],
          subject: `New Feedback: ${submission.category}`,
        }],
        from: { 
          email: 'noreply@getintherings.com',
          name: 'The Rings Feedback System'
        },
        reply_to: { email: submission.email, name: submission.name },
        content: [{
          type: 'text/html',
          value: `
            <h2>New Feedback Submission</h2>
            <p><strong>Category:</strong> ${submission.category}</p>
            <p><strong>From:</strong> ${submission.name} (${submission.email})</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${submission.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Submitted at ${new Date().toLocaleString()}</small></p>
          `
        }],
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending feedback email:', error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, category, message } = body

    // Validate input
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Get client IP for spam prevention
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    const supabase = await createClient()
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    let userId = null

    if (user) {
      // Get user profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      
      if (profile) {
        userId = profile.id
      }
    }

    // Insert feedback submission
    const { data, error } = await supabase
      .from('feedback_submissions')
      .insert({
        name,
        email,
        category,
        message,
        user_id: userId,
        ip_address: ip,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      return NextResponse.json(
        { error: 'Failed to submit feedback. Please try again.' },
        { status: 500 }
      )
    }

    // Send email notification (don't fail the request if email fails)
    sendFeedbackEmail({ name, email, category, message }).catch(err => {
      console.error('Failed to send feedback email notification:', err)
    })

    return NextResponse.json(
      { success: true, id: data.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback. Please try again.' },
      { status: 500 }
    )
  }
}

