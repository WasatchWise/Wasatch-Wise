# Environment Variables Setup

This document explains how to configure environment variables for The Ring at Fullmer Legacy Center.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Review and update any values in `.env.local` as needed

3. Never commit `.env.local` to version control (it's in `.gitignore`)

## Variable Categories

### Supabase
Core database and authentication configuration. All values are required.

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, never expose to client)
- `SUPABASE_JWT_SECRET` - JWT secret for token signing
- `SUPABASE_PUBLISHABLE_KEY` - Publishable key for client-side operations
- `SUPABASE_SECRET_KEY` - Secret key for server-side operations
- `DATABASE_URL` - Direct PostgreSQL connection string

### Stripe (Live Mode)
Payment processing configuration. Currently configured for live/production mode.

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key for client-side Stripe.js
- `STRIPE_SECRET_KEY` - Secret key for server-side payment operations
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (get from Stripe Dashboard)

**Note:** The webhook secret is currently incomplete. Get the full value from your Stripe Dashboard under Developers > Webhooks.

### Weather API
Optional. If not provided, weather widgets will be disabled.

- `NEXT_PUBLIC_OPENWEATHER_API_KEY` - Get free key from [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)

### Google Cloud APIs
Required for destination photos, place details, and video enrichment.

- `GOOGLE_PLACES_API_KEY` - Google Places API key
- `YOUTUBE_API_KEY` - YouTube Data API v3 key

### AI Models
Used for content generation and AI features.

- `OPENAI_API_KEY` - OpenAI API key (get from [OpenAI Platform](https://platform.openai.com/api-keys))
- `GEMINI_API_KEY` - Google Gemini API key

If OpenAI key is not set, the system will fall back to template-based generation.

### Voice & Avatar
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice synthesis (Dan's voice/Liam)

### Email Delivery
- `SENDGRID_API_KEY` - SendGrid API key for transactional emails

### Images
- `UNSPLASH_APPLICATION_ID` - Unsplash application ID
- `UNSPLASH_ACCESS_KEY` - Unsplash access key
- `UNSPLASH_SECRET_KEY` - Unsplash secret key

### Project Links
- `THERINGS_GIT` - Git repository URL

### Ring OS - Future/Optional
These variables are reserved for future Ring OS features and can be left blank for now:

- `AUTH_JWT_SECRET` - Custom JWT secret (if using auth beyond Supabase)
- `AUTH_REFRESH_SECRET` - Refresh token secret
- `PORTFOLIO_STORAGE_BUCKET` - Storage bucket for portfolio artifacts
- `ARTIFACT_UPLOAD_URL` - Upload endpoint for artifacts
- `QUEST_ENGINE_ADMIN_KEY` - Admin key for quest engine operations
- `RING_SCORING_SECRET` - Secret for ring activation scoring
- `MEDIA_CDN_URL` - CDN URL for media assets
- `PARTNER_API_KEY` - API key for partner integrations
- `TENANT_MASTER_KEY` - Master key for multi-site replication

## Security Best Practices

1. **Never commit secrets** - `.env.local` should be in `.gitignore`
2. **Use different keys for different environments** - Development, staging, and production should have separate keys
3. **Rotate keys regularly** - Especially if they've been exposed
4. **Use service role keys only server-side** - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code
5. **Keep webhook secrets secure** - These verify that webhook requests are from Stripe

## Environment-Specific Files

- `.env.local` - Local development (gitignored)
- `.env.example` - Template with all required variables (committed)
- `.env.production` - Production environment (gitignored, set via deployment platform)

## Deployment Platforms

### Vercel
Set environment variables in the Vercel Dashboard under Project Settings > Environment Variables.

### Other Platforms
Set environment variables according to your platform's documentation. Most platforms support setting environment variables through their dashboard or CLI.

