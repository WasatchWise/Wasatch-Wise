# WasatchWise - AI Governance Platform

**District AI Readiness OS (DAROS)** - A comprehensive consultation firm platform for AI governance in K-12 education. Built to integrate with Clarion AI Partners, implementing Bob's stakeholder framework and privacy-by-design principles.

AI-powered sales machine for B2B education consulting, built with Next.js 15, Supabase, and AI integrations.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude API (Anthropic), HeyGen API, ElevenLabs API
- **Email**: Resend + React Email
- **Hosting**: Vercel

## Monorepo (Turborepo + npm workspaces)

- **Workspaces:** `apps/*` — each app has its own `package.json`.
- **From root:** `npm run dev` runs dev in all apps; `npm run build` / `npm run lint` same.
- **Single app:** `npm run dev:abya`, `npm run dev:dashboard`, `npm run dev:slctrips`, or `turbo run dev --filter=<package-name>`.
- **From app dir:** `cd apps/ask-before-you-app && npm run dev` works as before.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - Claude API key
- `RESEND_API_KEY` - Resend email API key

Optional (for full functionality):
- `HEYGEN_API_KEY` - For video generation
- `ELEVENLABS_API_KEY` - For voice synthesis
- `STRIPE_SECRET_KEY` - For payments

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schemas in your Supabase SQL editor:
   - Base schema: `lib/supabase/schema.sql`
   - DAROS schema: `lib/supabase/daros-schema.sql`
3. Create storage buckets (if needed):
   - `audit-reports` (private)
   - `case-study-images` (public)
   - `blog-images` (public)
   - `artifacts` (private) - For DAROS generated PDFs

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
wasatchwise/
├── app/
│   ├── (marketing)/          # Public marketing pages
│   │   ├── page.tsx          # Homepage
│   │   ├── contact/          # Contact form
│   │   └── layout.tsx        # Marketing layout
│   ├── (tools)/              # Interactive tools
│   │   ├── ai-readiness-quiz/  # Quiz tool
│   │   └── wisebot/          # AI assistant
│   ├── (portal)/             # Client portal (auth required)
│   ├── api/                  # API routes
│   │   ├── ai/               # AI endpoints
│   │   └── voice/            # Voice synthesis
│   └── actions/              # Server Actions
├── components/
│   ├── marketing/            # Marketing components
│   ├── tools/                # Tool components
│   ├── shared/               # Reusable UI
│   └── layout/               # Layout components
└── lib/
    ├── supabase/             # Supabase clients
    ├── ai/                   # AI integrations
    ├── email/                # Email templates
    └── utils/                # Utilities
```

## Key Features

### DAROS (District AI Readiness OS)
**Consultation Firm Platform** - See `DAROS_OVERVIEW.md` for full documentation

- **60-Minute Briefing Workflow** - Session management and artifact generation
- **Stakeholder Outcomes Engine** - Bob's framework (Home Run/Triple/Double/Single/Miss)
- **Policy & Controls Engine** - Privacy-by-design checklist system
- **Vendor Risk Mapper** - AI tool usage and data flow tracking
- **Adoption Plan Generator** - 30/60/90 day implementation roadmaps
- **Training Content Packager** - Admin/teacher/parent training decks
- **Artifact Generation** - Automated PDF/JSON outputs

### Marketing & Tools
### 1. Marketing Homepage
- Hero section with CTA
- Problem/Solution sections
- Case studies showcase
- TikTok feed integration

### 2. AI Readiness Quiz
- 10-question assessment
- Real-time scoring (Red/Yellow/Green)
- Email-gated results
- Personalized recommendations via Claude

### 3. WiseBot Assistant
- Claude-powered conversational AI
- ElevenLabs voice synthesis
- Real-time chat interface

### 4. Contact Form
- Server Action form submission
- Email notifications
- Supabase lead capture

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

### Environment Variables in Vercel

Make sure to add all environment variables from `.env.local` to your Vercel project settings.

## Database Schema

See `lib/supabase/schema.sql` for the complete database schema. Key tables:

- `clients` - Client/lead data
- `projects` - Project tracking
- `cognitive_audits` - Audit results
- `quiz_results` - Quiz submissions
- `email_captures` - Lead magnets
- `ai_content_log` - AI usage tracking

## AI Integrations

### Claude API
- Proposal generation
- Quiz result personalization
- Chatbot responses
- Blog post drafting

### HeyGen API
- Personalized video outreach
- John avatar explainers
- Case study testimonials

### ElevenLabs API
- Voice synthesis for chatbot
- Audio versions of content
- Podcast intros

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally: `npm run dev`
4. Commit: `git commit -m "feat: your feature"`
5. Push and create PR

## Next Steps

- [ ] Set up Supabase database
- [ ] Configure API keys
- [ ] Create HeyGen John avatar
- [ ] Set up ElevenLabs voice clone
- [ ] Deploy to Vercel
- [ ] Set up custom domain

## Support

For questions or issues, contact John Lyman at john@wasatchwise.com

