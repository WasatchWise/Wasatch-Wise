# GrooveLeads Pro

**Construction Project Intelligence Platform for Groove Technologies**

A powerful SaaS platform that discovers, qualifies, and helps you close high-value construction projects. Built with Next.js 14, Supabase, and TypeScript.

---

## 🚀 Features

### ✅ Currently Implemented

- **Project Pipeline Management**
  - Real-time project list with filtering and sorting
  - Advanced scoring algorithm (Groove Fit Score 0-100)
  - Project type categorization (Hotel, Multifamily, Senior Living, etc.)
  - Stage tracking (Planning, Pre-Construction, Design, Bidding, Construction)

- **Intelligent Scoring System**
  - Automated project scoring based on:
    - Project type fit (30 points)
    - Project stage (25 points)
    - Project value (20 points)
    - Size/units (10 points)
    - Timeline (10 points)
    - Location (5 points)

- **Dashboard & Analytics**
  - Pipeline value tracking
  - Average score metrics
  - Hot leads identification (Score 80+)
  - Real-time statistics

- **Modern UI/UX**
  - Responsive dashboard layout
  - Sidebar navigation
  - Real-time data updates
  - Search and filtering
  - Beautiful Tailwind CSS design

### 🔄 Coming Soon

- Construction Wire scraper integration
- Email campaign system with SendGrid
- Contact management
- Campaign analytics
- API routes for project operations
- Authentication with Supabase Auth
- BullMQ queue processing
- Stripe billing integration

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + Custom components
- **Real-time:** Supabase Realtime
- **Icons:** Lucide React

---

## 📦 Installation

The project is already set up and running! If you need to start from scratch:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🌐 Access the Application

The dev server is currently running at:

**http://localhost:3000**

### Available Routes:

- `/` - Landing page
- `/dashboard` - Main dashboard with stats
- `/projects` - Full project pipeline list
- `/contacts` - Contact management (coming soon)
- `/campaigns` - Email campaigns (coming soon)
- `/analytics` - Analytics dashboard (coming soon)
- `/settings` - Settings panel (coming soon)

---

## 🗄️ Database Schema

The application connects to your existing Supabase database with these tables:

- `high_priority_projects` - Main projects table
- `contacts` - Contact information
- `companies` - Company data
- `project_stakeholders` - Project-contact relationships
- `outreach_campaigns` - Email campaigns
- `outreach_activities` - Campaign tracking
- `scrape_logs` - Scraper audit logs
- `pipeline_metrics` - Aggregated metrics view

---

## 🔑 Environment Variables

All environment variables are configured in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rpephxkyyllvikmdnqem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]

# Organization
ORGANIZATION_ID=34249404-774f-4b80-b346-a2d9e6322584

# Construction Wire
CONSTRUCTION_WIRE_USERNAME=msartain@getgrooven.com
CONSTRUCTION_WIRE_PASSWORD=[configured]

# API Keys
GOOGLE_PLACES_API_KEY=[configured]
OPENAI_API_KEY=[configured]
STRIPE_SECRET_KEY=[configured]
```

---

## 📊 Current Data

Your database already contains:

- **1 Test Project:** Marriott Hotel Downtown SLC
  - Type: Hotel
  - Stage: Pre-Construction
  - Value: $8.5M
  - Units: 150
  - Location: Salt Lake City, UT
  - Groove Fit Score: 95/100

---

## 🎯 Scoring Algorithm

Projects are scored on a 100-point scale:

| Factor | Points | Criteria |
|--------|--------|----------|
| Project Type | 30 | Hotel, Senior Living, Multifamily (high-value) |
| Project Stage | 25 | Planning (best) → Construction (lower) |
| Project Value | 20 | $20M+ (best) → $500K+ |
| Size/Units | 10 | 100K+ sqft or 200+ units (best) |
| Timeline | 10 | Starting within 3 months (best) |
| Location | 5 | Priority states (UT, CA, TX, FL, NY, IL) |

**Bonuses:**
- +10% if 3+ Groove services needed
- +5% if large portfolio opportunity ($10M+ & 100+ units)

---

## 🚀 Next Steps

### Phase 1: Core Functionality (Next 2 weeks)
- [ ] Build Construction Wire scraper API route
- [ ] Create email campaign system
- [ ] Add contact detail pages
- [ ] Implement authentication

### Phase 2: Automation (Weeks 3-4)
- [ ] Set up BullMQ workers for background processing
- [ ] Configure cron jobs for daily scraping
- [ ] Add webhook handlers for email tracking
- [ ] Build campaign analytics

### Phase 3: Polish & Launch (Week 5-6)
- [ ] Add Stripe billing
- [ ] Set up monitoring (Sentry, PostHog)
- [ ] Deploy to Vercel
- [ ] User onboarding flow

---

## 📱 Features in Detail

### Projects Page

**Filters:**
- Search by project name or city
- Filter by stage (Planning, Pre-Construction, etc.)
- Filter by type (Hotel, Multifamily, etc.)
- Minimum Groove Fit Score

**Table Columns:**
- Project Name & Units
- Type badges
- Stage indicator
- Location
- Project Value
- Groove Fit Score with visual bar
- Outreach Status

**Real-time Updates:**
- Automatically refreshes when new projects are added
- Toast notifications for updates

### Dashboard

**Quick Stats:**
- Total Projects count
- Total Pipeline Value
- Average Groove Fit Score
- Hot Leads (Score 80+)

**Quick Actions:**
- Browse Projects
- Start Campaign

---

## 🔧 Development Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Generate Supabase types (after schema changes)
# npx supabase gen types typescript --project-id rpephxkyyllvikmdnqem > types/database.types.ts
```

---

## 🎨 UI Components

Custom Shadcn UI components available:

- `Button` - Primary, secondary, outline, ghost variants
- `Card` - Content cards with header/footer
- `Table` - Data tables with sorting
- Toast notifications via Sonner

All components are in `/components/ui/`

---

## 📁 Project Structure

```
groove/
├── app/
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── projects/         # Projects list
│   │   ├── contacts/         # Contacts (coming soon)
│   │   └── campaigns/        # Campaigns (coming soon)
│   ├── api/                  # API routes (coming soon)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── layout/               # Layout components
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                   # UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── table.tsx
├── lib/
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── service.ts        # Admin client
│   ├── hooks/                # Custom React hooks
│   │   ├── useProjects.ts
│   │   └── useRealtime.ts
│   ├── utils/                # Utility functions
│   │   └── scoring.ts        # Scoring algorithm
│   └── utils.ts              # General utilities
├── types/
│   └── database.types.ts     # Supabase types
├── .env.local                # Environment variables
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── tsconfig.json             # TypeScript config
```

---

## 🤝 Contributing

This is a private project for Groove Technologies. For questions or support:

- **Mike Sartain:** msartain@getgrooven.com
- **GitHub:** https://github.com/WasatchWise/Groove

---

## 📝 License

© 2025 Groove Technologies. All rights reserved.

---

## 🎉 You're Ready to Go!

Your application is fully functional and running at **http://localhost:3000**

Try visiting:
1. **http://localhost:3000/dashboard** - See your dashboard
2. **http://localhost:3000/projects** - View the Marriott project

The foundation is solid and ready for the next features! 🚀
