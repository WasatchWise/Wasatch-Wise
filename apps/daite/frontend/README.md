# DAiTE - Your Personal CYRAiNO

> A social healing platform where AI agents help humans connect through meaningful conversations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (for database)
- Google Gemini API key (for AI features)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your keys:
   - `VITE_SUPABASE_URL` - From your Supabase project
   - `VITE_SUPABASE_ANON_KEY` - From your Supabase project  
   - `VITE_GEMINI_API_KEY` - From [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/     # React components
├── lib/           # Utilities (Supabase client, etc.)
├── services/      # API services (Gemini AI)
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
└── App.tsx        # Main app component
```

## 🎯 Core Concept

**Agent-to-Agent Matching**: Two AI agents (CYRAiNOs) have conversations about their humans, analyzing compatibility and producing poetic narratives instead of simple compatibility scores.

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Database & Auth
- **Google Gemini** - AI agent conversations

## 📚 Next Steps

1. Set up Supabase database (see root `SUPABASE_SETUP.md`)
2. Implement user authentication
3. Build CYRAiNO profile creation
4. Create match discovery interface
5. Add messaging system

## 📝 License

[To be determined]
