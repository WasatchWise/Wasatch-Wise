import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send Welcome Wagon Week 1 Survival Guide email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slctrips.com';
    const welcomeWagonUrl = `${siteUrl}/welcome-wagon`;
    const firstName = name ? name.split(' ')[0] : 'there';

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Week 1 Welcome Wagon Kit - Salt Lake City</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%); padding: 50px 20px; text-align: center; border-radius: 0;">
          <div style="font-size: 64px; margin-bottom: 20px;">🏔️</div>
          <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Welcome to Utah!</h1>
          <p style="color: #e0e7ff; margin: 15px 0 0 0; font-size: 20px; font-weight: 500;">Your Week 1 Survival Guide</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
            Hi ${firstName},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
            Welcome to Utah! You've chosen an incredible place to call home. Moving is an adventure, and Salt Lake City is the perfect launching point for trading city smog for mountain views and traffic jams for trailheads.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
            <strong>The first week is crucial</strong> - it sets the tone for your entire relocation. This guide focuses on <strong>The Basecamp Blueprint:</strong> the essential, urgent steps you need to complete immediately. Get these right, and everything else becomes easier.
          </p>

          <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; margin: 30px 0;">
            <h2 style="color: #1e40af; margin-top: 0; font-size: 24px; margin-bottom: 20px;">⚡ URGENT: Utilities Setup (Do This First!)</h2>

            <p style="color: #374151; margin-bottom: 15px; font-size: 14px;">
              <strong>Don't skip this.</strong> Without utilities set up, you could be sitting in the dark. Here are the exact numbers to call:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="background: #e5e7eb;">
                <th style="padding: 10px; text-align: left; font-size: 14px; color: #1f2937;">Utility</th>
                <th style="padding: 10px; text-align: left; font-size: 14px; color: #1f2937;">Contact</th>
              </tr>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <td style="padding: 10px; font-size: 14px; color: #374151;"><strong>Electric</strong></td>
                <td style="padding: 10px; font-size: 14px; color: #374151;">Rocky Mountain Power: <strong>(888) 221-7070</strong> (24/7)<br/>Setup online takes 5 min. Need SSN + driver's license.</td>
              </tr>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <td style="padding: 10px; font-size: 14px; color: #374151;"><strong>Natural Gas</strong></td>
                <td style="padding: 10px; font-size: 14px; color: #374151;">Dominion Energy: <strong>1-800-323-5517</strong><br/>Essential Oct-April for heat. Apply online or by phone.</td>
              </tr>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <td style="padding: 10px; font-size: 14px; color: #374151;"><strong>Water/Sewer/Trash</strong></td>
                <td style="padding: 10px; font-size: 14px; color: #374151;">SLC Public Utilities: <strong>(801) 483-6900</strong> (Mon-Fri, 8am-5pm)<br/>MUST call - no online setup. They'll arrange all three services + bins.</td>
              </tr>
              <tr style="border-bottom: 1px solid #d1d5db;">
                <td style="padding: 10px; font-size: 14px; color: #374151;"><strong>Internet</strong></td>
                <td style="padding: 10px; font-size: 14px; color: #374151;">Xfinity (801-244-0000), Google Fiber (check availability - best if you can get it), or CenturyLink. Average: $74/month. Expect 1-2 week install wait.</td>
              </tr>
            </table>

            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #991b1b; margin-top: 0; font-size: 16px; font-weight: bold; margin-bottom: 10px;">🚨 Emergency Contacts (Save These Now!)</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold; width: 40%;">Emergency</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>911</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold;">Police Non-Emergency</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>(801) 799-3000</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold;">Fire Non-Emergency</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>(801) 799-4231</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold;">Water/Sewer Emergency</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>(801) 483-6700</strong> (24/7)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold;">Plumbing Emergency</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>Roto-Rooter</strong> (24/7) or <strong>Manwill Plumbing</strong> (24/7)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; color: #991b1b; font-weight: bold;">Social/Health Services</td>
                  <td style="padding: 6px 10px; color: #7f1d1d;"><strong>211</strong> or <strong>(888) 826-9790</strong></td>
                </tr>
              </table>
            </div>

            <div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px; margin: 15px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>💧 Hard Water Alert:</strong> SLC has some of the hardest water in the country. Expect scale buildup on fixtures. If you own/rent a house, consider a water softener ($300-1000) to prevent pipe clogs and extend appliance life. Emergency plumber: Roto-Rooter 24/7, no weekend upcharge.</p>
            </div>

            <div style="margin-top: 25px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 10px;">📦 Day 1: Moving Day Essentials</h3>
              <ul style="color: #374151; padding-left: 20px; line-height: 1.8;">
                <li><strong>Groceries:</strong> Harmon's (local favorite, great deli), Smith's/Kroger (fuel points save $$), Trader Joe's (Murray, Sugarhouse), Whole Foods (downtown). <em>Pro tip: Smith's fuel points = serious gas savings.</em></li>
                <li><strong>Urgent Care:</strong> Salt Lake InstaCare (389 S 900 E) - download app to check wait times. U of U Hospital = best ER in state.</li>
                <li><strong>First Night Kit:</strong> TP, paper towels, snacks, bottled water (2x your normal intake - altitude!), ibuprofen (altitude headaches are REAL).</li>
              </ul>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 10px;">🚗 Days 2-3: DMV & Legal Requirements</h3>
              <ul style="color: #374151; padding-left: 20px; line-height: 1.8;">
                <li><strong>Schedule DMV Appointment NOW:</strong> Go to <a href="https://secure.utah.gov/dld-scheduled-visits/" style="color: #2563eb;">dmv.utah.gov</a> and book immediately - appointments fill 2-3 weeks out. You have <strong>60 days</strong> to get Utah license + register vehicle.</li>
                <li><strong>What to Bring to DMV:</strong>
                  <ul style="margin-top: 8px; padding-left: 20px; font-size: 14px;">
                    <li>Current driver's license</li>
                    <li>Proof of residency (utility bill, lease)</li>
                    <li>Vehicle title (if registering vehicle)</li>
                    <li>Safety inspection certificate (get BEFORE DMV - any mechanic, ~$20)</li>
                    <li>Emissions test results (required in Salt Lake County)</li>
                  </ul>
                </li>
                <li><strong>Banking:</strong> Zions Bank (best local, everywhere), America First Credit Union (best rates), or use your national bank. Get Venmo/Zelle - very popular here.</li>
                <li><strong>Healthcare:</strong> University of Utah Health (801-213-9500) or Intermountain Healthcare - both excellent. Schedule PCP appointment NOW - new patient waitlists can be 2-3 months.</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #92400e; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">🔓 UNLOCK: Renters' Rights Legal Toolkit</p>
              <p style="color: #78350f; font-size: 13px; margin: 0 0 15px 0; line-height: 1.5;">
                Renting in Utah? The 90-Day Guide includes: Utah Fit Premises Act breakdown, move-in inspection checklist to protect your deposit, landlord obligation requirements, and emergency eviction response plan (evictions can happen in 1 week here).
              </p>
              <a href="${welcomeWagonUrl}" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">See What's Inside →</a>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 10px;">🏡 Days 4-7: Getting Settled & Connected</h3>
              <ul style="color: #374151; padding-left: 20px; line-height: 1.8;">
                <li><strong>Master the Grid System:</strong> SLC streets use a logical grid centered on Temple Square (0 East, 0 South). Addresses increase as you go away from center. Example: 500 E 500 S = 5 blocks east, 5 south of Temple. Locals drop zeros: "200 West" = "Second West". This is your navigation cheat code!</li>
                <li><strong>Library Card (Free!):</strong> Any Salt Lake County Library - get Hoopla (movies/music), Libby (ebooks), museum passes, meeting rooms. Seriously underrated.</li>
                <li><strong>Join Local Groups:</strong> Facebook: "[Your City] Community" groups, Nextdoor (very active here), Buy Nothing groups (free stuff + instant friends).</li>
                <li><strong>Find Your Coffee Spot:</strong> Become a regular at: <strong>The Rose Establishment</strong> (235 S 400 W, Downtown - no Wi-Fi, encourages conversation), <strong>Café Niche</strong> (779 E 300 S, East Central - try the Cinnamon Streusel French Toast), <strong>La Barba</strong> (155 E 900 S - coffee + breakfast tacos), or <strong>Blue Copper</strong>. Best way to meet locals.</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #1e40af; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">📖 Want the Complete Reference Guide?</p>
              <p style="color: #1e3a8a; font-size: 13px; margin: 0 0 15px 0; line-height: 1.5;">
                This email covers the essentials, but we've created a comprehensive Week 1 Welcome Wagon Kit with detailed addresses, hours, coffee shop specialties, restaurant recommendations, hike details, neighborhood comparisons, and a complete action checklist.
              </p>
              <a href="${siteUrl}/welcome-wagon/week-one-guide" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">View Complete Week 1 Guide →</a>
            </div>

            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #1e40af; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">🔓 UNLOCK: Neighborhood Comparison Guide</p>
              <p style="color: #1e3a8a; font-size: 13px; margin: 0 0 15px 0; line-height: 1.5;">
                Not sure where to live? The 90-Day Guide includes detailed profiles of 10+ neighborhoods with housing costs, school ratings, walkability scores, restaurant scenes, and which areas match your lifestyle (families, young professionals, outdoor enthusiasts, etc.).
              </p>
              <a href="${welcomeWagonUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Explore Neighborhoods →</a>
            </div>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">🗺️ Utah Survival Tips (Things Locals Wish Newcomers Knew)</h3>
            <ul style="color: #047857; padding-left: 20px; line-height: 1.8;">
              <li><strong>Liquor Laws:</strong> Beer ≤5% ABV at grocery stores. Wine/spirits only at state liquor stores (closed Sundays/holidays). Restaurants serve any alcohol with food. Download DABS app to find nearest store. Stock up before major holidays!</li>
              <li><strong>Altitude Adjustment:</strong> You're at 4,226 ft. Expect: headaches (drink 2-3x your normal water), faster alcohol effects, sunburn in 15 minutes. Give yourself 2 weeks before hard exercise.</li>
              <li><strong>Air Quality:</strong> Download Utah Air app. Winter "inversions" trap smog (stay indoors on red days). Summer wildfire smoke. Get bedroom air purifier.</li>
              <li><strong>LDS Culture:</strong> ~60% of Utah is LDS. Genuinely friendly - expect welcome baskets from neighbors! Sunday = family day (stores/restaurants have shorter hours). Just be respectful of beliefs.</li>
              <li><strong>Weather:</strong> Summer: 95-100°F, LOW humidity (shade works!). Winter: 20-30°F + snow. Spring: Chaotic (70° one day, snow the next). Fall: Perfect. Buy: winter coat, ice scraper, sunscreen, layers.</li>
              <li><strong>Winter Driving:</strong> Winter tires help but aren't magic. Brake early. Check <a href="https://udottraffic.utah.gov" style="color: #059669;">udottraffic.utah.gov</a> before canyon drives.</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border: 2px solid #ec4899; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="color: #831843; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">🔓 UNLOCK: Complete Cultural Integration Guide</p>
            <p style="color: #9f1239; font-size: 13px; margin: 0 0 15px 0; line-height: 1.5;">
              Navigate LDS culture with confidence, find your community (hiking groups, sports leagues, professional networks), decode Utah slang, learn winter survival hacks, and get the full "making friends in SLC" playbook with specific groups/events to join.
            </p>
            <a href="${welcomeWagonUrl}" style="background: #ec4899; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Learn the Culture →</a>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🏔️ Your First Week Must-Do List</h3>
            <ol style="color: #1e3a8a; padding-left: 20px; line-height: 1.8; font-size: 14px;">
              <li><strong>Ensign Peak Trail</strong> - Easy 0.8 mi hike, 360° valley views. Your "I live here now" moment. Go at sunset!</li>
              <li><strong>Temple Square</strong> - Free tours, gardens. Lunch at Red Iguana (Mexican) or Spitz (Mediterranean). Take advantage of Free Fare Zone for public transit downtown.</li>
              <li><strong>Antelope Island</strong> - See BISON + Great Salt Lake. $15, 45 min drive. Swim in the lake (you'll float!). Bring water.</li>
              <li><strong>Memory Grove Park</strong> - Easy 2mi paved trail. Go easy (altitude!). Where locals run/bike before work.</li>
            </ol>
            <p style="color: #1e3a8a; margin-top: 15px; font-size: 13px;">
              <em>Want 1,634+ destinations organized by drive time?</em> <a href="${siteUrl}" style="color: #2563eb; font-weight: 600;">Explore SLCTrips.com →</a>
            </p>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">💰 Quick Money Hacks + Where to Eat</h3>
            <div style="margin-bottom: 15px;">
              <p style="color: #92400e; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Save Money:</p>
              <ul style="color: #78350f; padding-left: 20px; line-height: 1.6; font-size: 14px; margin: 0;">
                <li>Costco gas is 20-30¢ cheaper (membership pays for itself)</li>
                <li>Ski 7+ days? Get Ikon/Epic Pass ($700-900) vs $150/day tickets</li>
                <li>Temple Square parking: Free at City Creek mall (1hr with validation)</li>
                <li>Free museum days: Natural History Museum (1st Wed), state parks free on Pioneer Day (July 24)</li>
              </ul>
            </div>
            <div>
              <p style="color: #92400e; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">Where Locals Eat:</p>
              <ul style="color: #78350f; padding-left: 20px; line-height: 1.6; font-size: 14px; margin: 0;">
                <li><strong>Breakfast:</strong> <strong>Sweet Lake Biscuits & Limeade</strong> (54 W 1700 S - try The Hoss + mint limeade), Penny Ann's Café, <strong>Café Niche</strong> (779 E 300 S - Signature Niche Breakfast), or <strong>The Rose Establishment</strong> (235 S 400 W - Avocado Tartine)</li>
                <li><strong>Lunch:</strong> Pretty Bird (Nashville chicken), Even Stevens, Spitz</li>
                <li><strong>Dinner:</strong> Red Iguana (Mexican), Takashi (sushi), Copper Onion, Crown Burgers (late night)</li>
                <li><strong>Coffee:</strong> Blue Copper, Publik, La Barba, The Rose Establishment</li>
              </ul>
              <p style="color: #78350f; font-size: 13px; margin: 10px 0 0 0;"><em>Tip: Book weekend dinners early - Utah eats 6-7pm!</em></p>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0; padding: 35px 25px; background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%); border-radius: 12px; border: 2px solid #d1d5db;">
            <h3 style="color: #1f2937; font-size: 24px; margin-bottom: 15px; font-weight: 800;">Week 1 Done. What About the Next 83 Days?</h3>

            <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px; line-height: 1.7;">
              You've got the survival essentials. But moving to Utah is a <strong>90-day journey</strong> from "newcomer" to "local."
            </p>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: left; max-width: 500px; display: inline-block;">
              <p style="color: #1f2937; font-size: 15px; font-weight: bold; margin: 0 0 15px 0; text-align: center;">The 90-Day Welcome Wagon Includes:</p>
              <ul style="color: #374151; padding-left: 20px; line-height: 2; font-size: 14px; margin: 0;">
                <li>✅ <strong>Full 90-day timeline</strong> with week-by-week checklists</li>
                <li>✅ <strong>10+ neighborhood deep-dives</strong> (housing costs, schools, vibes)</li>
                <li>✅ <strong>Renters' rights legal toolkit</strong> + move-in checklist</li>
                <li>✅ <strong>Making friends playbook</strong> (groups, leagues, events to join)</li>
                <li>✅ <strong>"New in Town" Mt. Olympian quest</strong> (gamified exploration)</li>
                <li>✅ <strong>Full restaurant + activity directory</strong> organized by neighborhood</li>
                <li>✅ <strong>Winter survival guide</strong> (driving, gear, where to ski)</li>
                <li>✅ <strong>Interactive progress tracker</strong> syncs across devices</li>
                <li>✅ <strong>Lifetime updates</strong> + email support</li>
              </ul>
            </div>

            <a href="${welcomeWagonUrl}"
               style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; font-weight: 800; display: inline-block; font-size: 18px; box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); transition: transform 0.2s;">
              Get the Complete 90-Day Guide - $49
            </a>

            <p style="color: #9ca3af; font-size: 13px; margin-top: 15px; line-height: 1.6;">
              One-time payment • Lifetime access • 30-day money-back guarantee<br/>
              <em>Questions? Reply to this email - I read every message.</em>
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.7;">
              <strong>Welcome to Utah, ${firstName}!</strong><br/><br/>
              I've helped hundreds of families make this move successfully. The first week sets the tone - nail the utilities, schedule that DMV appointment, and get out to Ensign Peak for your first sunset.<br/><br/>
              Got questions about your specific situation? Hit reply - I read every email and usually respond within 24 hours.<br/><br/>
              - Dan<br/>
              <a href="mailto:Dan@slctrips.com" style="color: #2563eb;">Dan@slctrips.com</a>
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              SLCTrips • From Salt Lake, to Everywhere<br/>
              <a href="mailto:Dan@slctrips.com" style="color: #6b7280;">Dan@slctrips.com</a> • <a href="${siteUrl}" style="color: #6b7280;">SLCTrips.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 20px 0 0 0;">
              You received this because you requested the Week 1 Survival Guide.<br/>
              We never share your email. <a href="${siteUrl}/legal/privacy" style="color: #6b7280;">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
      </body>
      </html>
    `;

    // Send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: email,
          from: 'SLCTrips <dan@slctrips.com>',
          replyTo: 'Dan@slctrips.com',
          subject: '🏔️ Your Week 1 Survival Guide - Welcome to Utah!',
          html: emailHtml,
        });
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`✅ Week 1 Survival Guide email sent to ${email}`);
        }
        return NextResponse.json({ 
          success: true,
          message: 'Email sent successfully'
        });
      } catch (error: unknown) {
        console.error('❌ Error sending email:', error);
        // Return error but don't expose internal details
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: 'Failed to send email', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
          { status: 500 }
        );
      }
    } else {
      console.warn('⚠️ SENDGRID_API_KEY not configured. Email would have been sent to:', email);
      // In development, still return success so the form works
      // In production, this should be an error
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Email service not configured' },
          { status: 503 }
        );
      }
      return NextResponse.json({ 
        success: true,
        message: 'Email queued (SendGrid not configured in development)'
      });
    }
  } catch (error: unknown) {
    console.error('❌ Error in send-guide endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
}
