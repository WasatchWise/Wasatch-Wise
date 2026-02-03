# TDD Implementation Plan: "Mario 1-1" Lead Magnet

**Timeline:** 5 Days (Sprint 1)  
**Goal:** Build the "Invisible Tutorial" - Cognitive Audit Quiz that converts leads

---

## Day 1: Foundation

### Morning (2-3 hours)

1. **Install Dependencies**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add card button progress radio-group
   npm install nuqs
   ```

2. **Run Database Migration**
   - Execute `lib/supabase/tdd-schema-migration.sql` in Supabase SQL Editor
   - Verify tables: `user_profiles`, `audits`, `ai_logs`
   - Verify RLS policies are active

3. **Update Environment Variables**
   - Verify `ANTHROPIC_API_KEY` is set
   - Verify `RESEND_API_KEY` is set
   - Add `NEXT_PUBLIC_APP_URL` for email links

### Afternoon (2-3 hours)

4. **Create Auth Setup** (if not exists)
   - Set up Supabase Auth
   - Create `lib/auth/` utilities
   - Test user registration/login

5. **Create User Profile Service**
   - `lib/services/user-profiles.ts`
   - Functions: `getUserProfile`, `createUserProfile`, `linkUserToClient`

---

## Day 2: The Logic

### Morning (3-4 hours)

1. **Create Audit Server Action**
   - `app/actions/submit-audit.ts`
   - Migrate logic from `app/actions/quiz.ts`
   - Save to `audits` table (not `quiz_results`)
   - Link to `user_profiles` via `submitted_by`

2. **Create AI Analysis Function**
   - `lib/ai/analyze-audit.ts`
   - System prompt: "You are a specialized School Compliance Officer..."
   - Output: JSON with `risk_level`, `liability_gap`, `prescription`
   - Log to `ai_logs` table

3. **Update Claude Integration**
   - Ensure using Vercel AI SDK pattern
   - Add streaming support
   - Add token counting

### Afternoon (2-3 hours)

4. **Create Audit Status Workflow**
   - `lib/services/audits.ts`
   - Functions: `createAudit`, `analyzeAudit`, `getAuditReport`
   - Status transitions: `pending_analysis` → `analyzing` → `report_generated`

5. **Test End-to-End**
   - Submit test audit
   - Verify AI analysis runs
   - Verify data saved correctly

---

## Day 3: The UI (Shadcn)

### Morning (3-4 hours)

1. **Create Quiz Page**
   - `app/quiz/page.tsx` (or `/audit` route)
   - Multi-step form component
   - Use Nuqs for URL state: `?step=1`, `?step=2`, etc.

2. **Build Question Components**
   - `components/quiz/QuestionCard.tsx`
   - `components/quiz/ProgressBar.tsx`
   - `components/quiz/AnswerRadio.tsx`
   - Use Shadcn components

3. **Add "Labor Illusion" Loading**
   - `components/quiz/AnalysisLoader.tsx`
   - Sequential messages:
     - "Analyzing Policy Compliance..."
     - "Checking FERPA Compliance..."
     - "Generating Risk Assessment..."
   - Use `<Suspense>` boundaries

### Afternoon (2-3 hours)

4. **Create Results Page**
   - `app/quiz/results/page.tsx`
   - Display scores (compliance, safety, fluency)
   - Show risk level and recommendations
   - "Download Report" button

5. **Add Progress Persistence**
   - Use Nuqs to save answers in URL
   - On refresh, restore from URL params
   - Shareable quiz links

---

## Day 4: The Reward (Email)

### Morning (2-3 hours)

1. **Create React Email Template**
   - `emails/AuditResultEmail.tsx`
   - Include:
     - Personalized greeting
     - Score breakdown
     - Top 3 risks
     - Recommended actions
     - CTA button

2. **Set Up Resend**
   - Create Resend account
   - Verify domain
   - Create email template in Resend dashboard

3. **Create Email Server Action**
   - `app/actions/send-audit-email.ts`
   - Use React Email to render
   - Send via Resend API
   - Update audit status to `email_sent`

### Afternoon (2-3 hours)

4. **Wire Email to Audit Flow**
   - After AI analysis completes
   - Automatically send email
   - Handle errors gracefully

5. **Create Email Preview**
   - `app/admin/email-preview` route
   - Preview email with test data
   - Test different score scenarios

---

## Day 5: The Hook (Deploy & Launch)

### Morning (2-3 hours)

1. **Final Testing**
   - Test complete flow: Quiz → Analysis → Email
   - Test error cases
   - Test RLS policies (different users)
   - Test email delivery

2. **Performance Optimization**
   - Add loading states
   - Optimize images
   - Check Core Web Vitals

3. **Deploy to Vercel**
   - Push to `main` branch
   - Verify deployment
   - Test production URL

### Afternoon (1-2 hours)

4. **Create Landing Page**
   - Update `/` or create `/quiz` landing
   - Value proposition
   - "Start Quiz" CTA
   - Social proof

5. **Launch Checklist**
   - [ ] Database migration complete
   - [ ] RLS policies tested
   - [ ] Email delivery working
   - [ ] Quiz flow tested
   - [ ] Analytics tracking (optional)
   - [ ] Error monitoring (Sentry optional)

---

## Technical Specifications

### Quiz Questions (10 Questions)

1. Board-approved AI use policy? (Yes/In Progress/No)
2. Percentage of teachers using AI weekly? (0%/<25%/25-50%/>50%)
3. FERPA compliance training? (Yes/Planned/No)
4. Process for evaluating AI tools? (Formal/Informal/None)
5. Parent trust in data privacy? (High/Moderate/Low/Unsure)
6. AI-related incidents? (None/Minor/Major)
7. Dedicated AI governance staff? (Full-time/Part-time/None)
8. Teacher confidence in AI? (Very/Somewhat/Not confident)
9. AI tool usage tracking? (Comprehensive/Partial/None)
10. AI policies communicated to parents? (Yes/Somewhat/No)

### Scoring Algorithm

- Each question: 0-10 points
- Max score: 100 points
- **Compliance Score:** Questions 1, 3, 4, 7, 9 (policy/governance)
- **Safety Score:** Questions 2, 6, 8 (usage/incidents)
- **Fluency Score:** Questions 5, 10 (communication/trust)

### AI Analysis Prompt

```
You are a specialized School Compliance Officer analyzing a district's AI readiness quiz.

Quiz Answers: {answers}
Scores: Compliance {score_compliance}/50, Safety {score_safety}/30, Fluency {score_fluency}/20

Analyze these results and output JSON:
{
  "risk_level": "HIGH|MEDIUM|LOW",
  "liability_gap": "Primary concern (1 sentence)",
  "prescription": "Recommended action (1 sentence)",
  "top_risks": ["Risk 1", "Risk 2", "Risk 3"],
  "next_steps": ["Step 1", "Step 2", "Step 3"]
}
```

### Email Template Structure

1. **Header:** Personalized greeting
2. **Score Summary:** Visual breakdown (compliance/safety/fluency)
3. **Risk Level:** Badge (High/Medium/Low)
4. **Top 3 Risks:** Bulleted list
5. **Recommended Actions:** Numbered list
6. **CTA:** "Schedule Consultation" button
7. **Footer:** Contact info, unsubscribe

---

## Success Metrics

- **Quiz Completion Rate:** >70%
- **Email Open Rate:** >40%
- **Email Click-Through:** >10%
- **Time to First Value:** <5 minutes (quiz → email)
- **Core Web Vitals:** All green

---

## Post-Launch (Week 2+)

1. **"Ask Dan" Voice Agent** (Feature B)
2. **Proposal Writer** (Feature C)
3. **Analytics Dashboard**
4. **A/B Testing** (quiz variations)
5. **TikTok Pixel Integration**

---

## Notes

- **Do NOT deviate from stack:** Next.js 15, Supabase, Claude, Shadcn
- **Security First:** All RLS policies must be tested
- **User Experience:** "Labor Illusion" is critical - make waiting feel valuable
- **Email is the Hook:** This is where conversion happens - make it perfect
