import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/send';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create Supabase client inside function to avoid build-time errors
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = await params;

    // Get review and findings
    const { data: review, error: reviewError } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const { data: findings } = await supabase
      .from('review_findings')
      .select('*')
      .eq('review_id', id)
      .order('created_at', { ascending: false });

    // Generate simple HTML report (for now - can upgrade to PDF later)
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>App Review Report - ${review.app_name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #E87722; }
            .finding { margin: 20px 0; padding: 15px; border-left: 4px solid #E87722; background: #f9f9f9; }
            .severity-critical { border-left-color: #dc2626; }
            .severity-high { border-left-color: #ea580c; }
            .severity-medium { border-left-color: #f59e0b; }
            .severity-low { border-left-color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>App Review Report: ${review.app_name}</h1>
          <p><strong>Review Tier:</strong> ${review.review_tier}</p>
          <p><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h2>Findings</h2>
          ${findings && findings.length > 0
            ? findings.map((f: any) => `
                <div class="finding severity-${f.severity}">
                  <h3>${f.title}</h3>
                  <p><strong>Type:</strong> ${f.finding_type} | <strong>Severity:</strong> ${f.severity}</p>
                  <p>${f.description}</p>
                  ${f.recommendation ? `<p><strong>Recommendation:</strong> ${f.recommendation}</p>` : ''}
                </div>
              `).join('')
            : '<p>No findings recorded.</p>'
          }
        </body>
      </html>
    `;

    // For now, store report URL as a data URL (in production, upload to Supabase Storage)
    const reportUrl = `data:text/html;charset=utf-8,${encodeURIComponent(reportHtml)}`;

    // Save report record
    const { data: report, error: reportError } = await supabase
      .from('review_reports')
      .upsert({
        review_id: id,
        report_url: reportUrl,
        report_version: 1,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving report:', reportError);
    }

    // Update review status to completed
    await supabase
      .from('app_reviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Send email to customer
    if (review.customer_email) {
      await sendEmail({
        to: review.customer_email,
        subject: `Your App Review Report: ${review.app_name}`,
        html: `
          <p>Hi ${review.customer_name || 'there'},</p>
          <p>Your app review for <strong>${review.app_name}</strong> is complete!</p>
          <p>You can view your report by clicking the link below:</p>
          <p><a href="${reportUrl}" style="background: #E87722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Report</a></p>
          <p>If you have any questions, please reply to this email.</p>
          <p>Best,<br />WasatchWise Team</p>
        `,
      });
    }

    return NextResponse.json({ 
      success: true, 
      reportUrl,
      message: 'Report generated and emailed to customer'
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
