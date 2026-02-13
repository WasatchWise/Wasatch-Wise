# WasatchWise + Adult AI Academy: Full-Stack Optimization Plan
## February 12, 2026

---

## EXECUTIVE SUMMARY

After a complete audit of the monorepo (12 apps, 60+ API routes, 100+ pages, 100+ DB tables), documentation, and execution schedule, the #1 revenue blocker is: **leads come in but have nowhere to go**. The quiz works, the contact form works, WiseBot works — but there's no automated follow-up, no booking system, and no self-serve purchase path for the main revenue products.

This plan addresses three layers: **Revenue Pipeline** (get money flowing), **Technical Optimization** (make what exists work better), and **Marketing/Visibility** (get more people in the door).

---

## PRIORITY 1: REVENUE PIPELINE (This Week)

### 1A. Add Booking System to Every CTA
**Status:** No booking link exists anywhere on WasatchWise
**Impact:** CRITICAL — leads fill out contact form and wait for manual response
**Action:**
- Set up Cal.com (free tier) or Calendly
- Create "Free 30-Minute AI Governance Consultation" booking type
- Embed booking widget on:
  - `/pricing` page (replace "Book Discovery Call" links)
  - `/contact` page (add after form submission success message)
  - Quiz results page (after score display)
  - WiseBot (suggest booking after 3+ messages)
- Add scheduling link to all email templates (contact confirmation, quiz results)

### 1B. Automated Email Welcome Sequence (Resend)
**Status:** Contact form sends one confirmation email. Quiz saves email. Nothing else.
**Impact:** HIGH — captured leads go cold without nurture
**Action:**
- Create 5-email welcome sequence in Resend:
  1. Day 0: "Thanks for reaching out" + booking link + free resource
  2. Day 2: "The 3 Shadow AI risks your district faces right now" (value email)
  3. Day 5: "How Utah went from 8% to 92% compliance" (proof email)
  4. Day 8: "Quick question about your AI readiness" (engagement)
  5. Day 12: "Last chance: Free AI Governance Consultation" (urgency)
- Wire into contact form server action
- Wire into quiz completion server action
- Track opens/clicks in Supabase

### 1C. Fix the Quiz-to-Revenue Pipeline
**Status:** Quiz captures email + score, shows generic CTA
**Impact:** HIGH — quiz is the best lead magnet but goes nowhere
**Action:**
- After quiz results, show personalized next steps based on score:
  - Red (<50): "Your district needs urgent help. Book a free consultation." + booking embed
  - Yellow (50-74): "You're partially ready. Here's your custom action plan." + downloadable PDF + booking CTA
  - Green (75+): "Strong foundation. Let's take it to the next level." + advanced services CTA
- Add email to Resend welcome sequence automatically
- Send personalized follow-up email with score summary + next steps

### 1D. Low-Ticket Digital Product (Quick Revenue)
**Status:** Adult AI Academy has no purchasable products
**Impact:** MEDIUM — won't make big money but proves the model and generates testimonials
**Action:**
- Create "AI Governance Starter Kit" ($49-$99)
  - Includes: AI Policy Template, Vendor Vetting Checklist, Board Presentation Template, 30-min recorded training
  - Deliver via Stripe checkout + Supabase access control
  - Add to WasatchWise pricing page as entry-level tier
  - Add to quiz results (Red score: "Start with our Governance Starter Kit")
- Use existing @react-pdf/renderer to generate branded PDFs

### 1E. Expand Ask Before You App Self-Serve
**Status:** Only product with working Stripe checkout ($49-$299)
**Impact:** MEDIUM — quick wins available
**Action:**
- Add prominent CTA from WasatchWise landing page: "Get your first app reviewed free" (lead gen)
- Create bundle pricing: "10 App Reviews for $399" (volume discount)
- Add to quiz follow-up emails: "While you're building governance, protect what's already in use"

---

## PRIORITY 2: TECHNICAL OPTIMIZATION (This Week + Next)

### 2A. SEO Foundation
**Status:** Pages exist but lack structured SEO
**Impact:** HIGH (long-term) — organic search is the cheapest lead source
**Action:**
- Add comprehensive meta tags to all marketing pages:
  - Title tags optimized for target keywords
  - Meta descriptions with CTAs
  - Open Graph tags for social sharing
  - JSON-LD structured data (Organization, Service, FAQ)
- Target keywords:
  - "K-12 AI governance" (primary)
  - "school district AI policy"
  - "FERPA AI compliance"
  - "teacher AI training"
  - "student data privacy AI"
  - "AI readiness assessment schools"
- Add sitemap.xml and robots.txt
- Optimize blog posts with internal linking

### 2B. Performance Optimization
**Action:**
- Audit Core Web Vitals (LCP, FID, CLS)
- Implement image optimization (next/image with proper sizing)
- Add loading states for dynamic content
- Lazy load below-fold components
- Review and optimize Supabase queries (add indexes if needed)

### 2C. Analytics Enhancement
**Status:** GA4 live but minimal event tracking
**Action:**
- Add custom events for:
  - Quiz started, completed, score band
  - Contact form submitted
  - Pricing page viewed, tier clicked
  - WiseBot conversation started, messages sent
  - Blog post read (scroll depth)
  - Booking link clicked
  - CTA button clicks (all major CTAs)
- Set up GA4 conversion goals for: quiz completion, contact form submission, booking

### 2D. Email Infrastructure Decision
**Status:** Both Resend and SendGrid in the codebase; need to pick one
**Action:**
- **Recommendation: Resend** (already in root deps, better DX, cheaper)
- Migrate all SendGrid usage to Resend
- Set up Resend domain verification for wasatchwise.com
- Create email templates using @react-email (already in deps)

### 2E. Error Handling & Monitoring
**Action:**
- Add error boundaries to all client pages
- Set up Vercel error logging
- Add API route error reporting
- Monitor Supabase connection health
- Add uptime monitoring (free tier: UptimeRobot or Better Uptime)

---

## PRIORITY 3: MARKETING & VISIBILITY (Weeks 2-4)

### 3A. LinkedIn Content Machine
**Action:**
- Post 3x/week minimum
- Content calendar:
  - Monday: Educational post (AI governance insight)
  - Wednesday: Story post (Utah transformation, platform building)
  - Friday: CTA post (quiz link, consultation offer)
- Repurpose blog posts into LinkedIn carousels
- Engage with EdTech community daily (15 min)

### 3B. Blog Acceleration
**Status:** 1 post published, 1 drafted, outlines for more ready
**Action:**
- Publish 2 posts/week (per execution schedule)
- Focus on SEO-driven topics:
  - "How to Create an AI Governance Policy for Your School District"
  - "FERPA Compliance Checklist for AI Tools in K-12"
  - "The Complete Guide to Teacher AI Training"
  - "Shadow AI in Schools: What Administrators Need to Know"
- Add lead magnets to each post (related downloadable)
- Add internal links between posts and service pages
- Add email capture CTA at end of each post

### 3C. Free Tools as Lead Magnets
**Action:**
- Promote existing quiz more aggressively
- Create additional free tools:
  - "AI Tool Vetting Scorecard" (interactive, captures email)
  - "FERPA Compliance Quick Check" (5-question version)
  - "Shadow AI Audit Template" (downloadable PDF, requires email)
- Gate tools behind email capture
- Feed all captures into welcome sequence

### 3D. Direct Outreach Campaign
**Action:**
- Use Pipeline IQ to identify target districts
- Personalized email campaign to 50 districts/week
- Template: Problem → Proof (8%→92%) → Free consultation offer
- Follow up 3x over 2 weeks
- Track in Pipeline IQ CRM

---

## IMPLEMENTATION SEQUENCE

### THIS SESSION (Right Now):
1. ✅ Create SEO-optimized meta tags for all WasatchWise marketing pages
2. ✅ Add booking CTA component (Cal.com/Calendly embed-ready)
3. ✅ Create email capture/newsletter signup component
4. ✅ Add GA4 custom event tracking to key CTAs
5. ✅ Create "AI Governance Starter Kit" product page structure
6. ✅ Optimize quiz results page with score-based CTAs + booking
7. ✅ Add sitemap.xml generation

### THIS WEEK (Feb 12-16):
1. Set up Cal.com account + booking type
2. Configure Resend domain + API key
3. Build 5-email welcome sequence
4. Publish Blog Post #2
5. Create first digital product (Starter Kit PDF)
6. Set up Stripe product for Starter Kit
7. Daily LinkedIn posts (3 minimum)

### NEXT WEEK (Feb 17-23):
1. Launch email welcome sequence
2. Create 2 more blog posts
3. Begin direct outreach (10 districts)
4. Add more lead magnets
5. Optimize based on GA4 data
6. A/B test quiz CTA messaging

### MONTH 1 TARGET (By Mar 12):
- 50+ email subscribers
- 10+ consultation calls booked
- 1 paying client ($6K minimum)
- 8 blog posts published
- Email sequence operational
- 500+ monthly visitors

---

## WHAT JOHN NEEDS TO DO (Can't Be Automated):
1. **Create Cal.com account** → Share booking link URL
2. **Verify Resend domain** → DNS records for wasatchwise.com
3. **Record 30-min training video** → For Starter Kit digital product
4. **Create 3 PDF templates** → AI Policy, Vendor Vetting, Board Presentation
5. **Show up to consultation calls** → Close deals
6. **Post on LinkedIn daily** → Content templates provided
7. **Respond to leads within 24 hours** → Non-negotiable

---

## REVENUE PROJECTIONS (Conservative)

| Timeframe | Source | Revenue |
|-----------|--------|---------|
| Week 1-2 | Ask Before You App reviews (5 x $149 avg) | $745 |
| Week 2-4 | Starter Kit sales (10 x $79) | $790 |
| Month 1 | First consulting client (DAROS Briefing) | $6,300 |
| Month 2 | 2 more clients + digital products | $15,000 |
| Month 3 | Recurring + new + products | $25,000 |

**Break-even target:** $3,108/month (matches UI) → Achievable by Week 4 with 1 client

---

## METRICS TO TRACK WEEKLY

| Metric | Target (Month 1) |
|--------|-------------------|
| Website visitors (GA4) | 500/month |
| Quiz completions | 50/month |
| Email subscribers | 50 |
| Consultation calls booked | 10 |
| Contact form submissions | 20 |
| Blog posts published | 8 |
| LinkedIn posts | 12 |
| Revenue | $7,835 |
| Paying customers | 1 |
