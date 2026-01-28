# Environment Setup Guide

Complete guide for setting up The Ring at Fullmer Legacy Center development environment.

## Prerequisites

- Node.js 18+ (if using Next.js)
- Supabase CLI (for database migrations)
- Git

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/WasatchWise/TheRings.git
cd TheRings
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and ensure all required variables are set. See `README.env.md` for detailed variable descriptions.

### 3. Supabase Setup

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Link to Your Project

```bash
supabase link --project-ref afwcgpjnyvknnuadsdsz
```

#### Run Migrations

```bash
supabase db push
```

This will apply the schema from `supabase/migrations/001_initial_schema.sql`.

#### Seed Initial Data

```bash
supabase db reset
```

Or manually run the seed file:

```bash
psql $DATABASE_URL -f supabase/seed.sql
```

## Database Schema

The database schema includes:

- **Sites** - Multi-tenant foundation
- **Users** - Extended profiles and site memberships
- **Rings** - 9 domains (Self, Body, Brain, Bubble, Scene, Neighborhood, Community, World, Ether)
- **Pillars** - 4 program pillars (Wellness, TechNest, Creative Studio, Civic Lab)
- **Quests** - Quest definitions with HOMAGO structure
- **Portfolios** - Champion's Portfolio system
- **Badges** - Achievement system
- **Ring Activation** - Cyclone visualization data
- **Sessions** - Daily program activities
- **Service Logs** - Civic engagement tracking
- **Partners** - Partner organizations and locations
- **Endorsements** - Mentor feedback

See `docs/database-schema.md` for complete documentation.

## Development Workflow

### Database Changes

1. Create a new migration file:
   ```bash
   supabase migration new migration_name
   ```

2. Edit the migration file in `supabase/migrations/`

3. Apply the migration:
   ```bash
   supabase db push
   ```

### Local Development

1. Start Supabase locally (optional):
   ```bash
   supabase start
   ```

2. Run your application (Next.js example):
   ```bash
   npm install
   npm run dev
   ```

## Environment Variables by Category

### Required

- **Supabase**: All variables required
- **Stripe**: Required for payment processing
- **Google APIs**: Required for Places and YouTube features

### Optional

- **Weather API**: Disables weather widgets if not provided
- **AI Services**: Falls back to templates if not provided
- **Voice & Avatar**: Optional ElevenLabs integration
- **Email**: Required for transactional emails
- **Images**: Required for Unsplash integration

### Future/Ring OS

These variables are reserved for future features and can be left blank:
- Portfolio storage
- Quest engine admin
- Ring scoring secrets
- Media CDN
- Partner APIs
- Tenant management

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit secrets to version control
- [ ] Use different keys for dev/staging/production
- [ ] Rotate keys if exposed
- [ ] Service role keys only used server-side
- [ ] Webhook secrets kept secure

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Verify network access

### Migration Errors

1. Check migration file syntax
2. Verify dependencies (foreign keys exist)
3. Check for conflicting data

### Environment Variable Issues

1. Verify `.env.local` exists
2. Check variable names match exactly
3. Ensure no extra spaces or quotes
4. Restart development server after changes

## Next Steps

1. Review database schema documentation
2. Set up Row Level Security policies
3. Create API routes for quest management
4. Build portfolio interface
5. Implement ring activation scoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Database Schema](./database-schema.md)
- [Environment Variables](./README.env.md)

