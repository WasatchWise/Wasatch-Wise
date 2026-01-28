# DAiTE - Helping Humans Embrace

> A social connection platform that uses AI agents to help humans embrace meaningful connections—all kinds of connections.

## 🎯 Vision

DAiTE helps humans embrace. It&apos;s not just about dating—it&apos;s about **finding your people**. Whether you&apos;re a parent seeking playdates, a musician finding collaborators, a single dad looking for community, or someone building post-COVID connections, DAiTE uses AI agents (CYRAiNOs) to facilitate deeper, more authentic relationships across friendship, community, collaboration, support, and romantic connections.

## ✨ Core Features

- **Agent-to-Agent Matching**: Two AI agents have conversations about their humans, discovering connections for friendship, community, playdates, collaboration, and more
- **CYRAiNO Profile Building**: Chat with your AI companion to build your personal connection agent
- **Connection Discovery**: Find parents for playdates, musicians for jam sessions, community for events, and people who get you
- **Intelligent Gathering Planning**: AI suggests creative meetups—playdates, coffee, music sessions, community events
- **Neurodivergent-First Design**: Built with accessibility and different communication styles in mind
- **Token Economy**: Accountability system to encourage genuine engagement and reduce ghosting
- **Visual DNA Calibration**: Train your CYRAiNO to understand your preferences

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WasatchWise/DAiTE.git
   cd DAiTE
   ```

2. **Navigate to the frontend directory**
   ```bash
   cd daite---your-personal-cyraino
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp ../.env.example .env.local
   ```
   Edit `.env.local` and add your API keys:
   - `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `SUPABASE_URL` - From your Supabase project settings
   - `SUPABASE_ANON_KEY` - From your Supabase project settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
DAiTE/
├── daite---your-personal-cyraino/    # Main frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── services/                # API services (Gemini AI)
│   │   ├── types.ts                 # TypeScript definitions
│   │   └── constants.ts             # App constants
│   ├── package.json
│   └── vite.config.ts
├── CYRAiNO Images/                  # Brand assets
├── *.pdf                            # Architecture documentation
├── .env.example                     # Environment variable template
├── vercel.json                      # Vercel deployment config
└── README.md                        # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via className)

### AI & Services
- **Google Gemini 2.5 Flash** - AI agent conversations and date planning
- **Supabase** - Database and authentication (to be integrated)

### Deployment
- **Vercel** - Hosting and serverless functions

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables

See `.env.example` for all required variables.

**Required:**
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 📊 Database Setup

DAiTE uses Supabase (PostgreSQL) with pgvector for semantic matching.

1. **Create Supabase Project**
   - Sign up at https://app.supabase.com
   - Create a new project

2. **Run Database Schema**
   - Open SQL Editor in Supabase
   - Copy and paste the schema from `Daite supabase schema.sql`
   - Execute to create all tables, indexes, and RLS policies

3. **Configure Environment**
   - Add Supabase credentials to `.env.local`

See `SUPABASE_SETUP.md` for detailed instructions.

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd daite---your-personal-cyraino
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel project settings
   - Add all variables from `.env.example`

4. **Configure Domain**
   - Add `daiteapp.com` in Vercel project settings
   - Update DNS records as instructed

The `vercel.json` in the root directory configures the deployment.

## 🏗️ Architecture

### Agent-to-Agent Matching

The core innovation: Two CYRAiNO agents have a conversation about their humans, analyzing compatibility and producing:
- A dialogue transcript
- Compatibility assessment
- Poetic narrative explaining why the match works
- Icebreakers and conversation starters

### CYRAiNO System

Each user has a personal AI agent (CYRAiNO) that:
- Learns their communication style
- Advocates for them in matching
- Helps craft messages
- Plans dates
- Provides coaching and insights

### Token Economy

Users earn tokens for:
- Completing profile
- Good feedback from dates
- Reliability (showing up, responding)
- Kindness scores

Users spend tokens for:
- Running vibe checks
- Premium features
- Boosts

## 📝 Current Status

### ✅ Implemented
- Frontend UI with all core features
- Agent-to-agent dialogue simulation
- CYRAiNO profile building via chat
- Date planning with AI suggestions
- Match discovery and management
- Visual preference calibration
- Token economy UI

### 🚧 In Progress
- Supabase database integration
- User authentication
- Backend API routes
- Real-time messaging
- Production deployment

### 📋 Planned
- AR coaching during calls
- Venue integration (SLCTrips)
- Group events and communities
- Advanced matching algorithms
- Mobile app

## 🤝 Contributing

This is currently a private project. For questions or collaboration, contact the project maintainer.

## 📄 License

[To be determined]

## 🙏 Acknowledgments

- Inspired by Cyrano de Bergerac
- Built with love for neurodivergent communities
- Designed for authentic human connection

## 📞 Support

For issues or questions:
- Check `AUDIT_REPORT.md` for project status
- Review `SUPABASE_SETUP.md` for database setup
- See architecture PDFs for detailed design docs

---

**Built with ❤️ by Wasatch Wise**

