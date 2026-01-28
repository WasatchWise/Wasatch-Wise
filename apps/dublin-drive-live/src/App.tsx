import { Tv, Radio, Signal } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <header className="border-b border-purple-500/30 bg-black/20 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Tv className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">KDDL</h1>
              <p className="text-xs text-purple-300">Dublin Drive Live</p>
            </div>
          </div>
          <nav className="ml-auto flex gap-6 text-sm">
            <a href="#" className="hover:text-purple-400 transition">Live</a>
            <a href="#" className="hover:text-purple-400 transition">Schedule</a>
            <a href="#" className="hover:text-purple-400 transition">Shows</a>
            <a href="#" className="hover:text-purple-400 transition">About</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-full px-4 py-1 mb-6">
            <Signal className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-sm text-red-300">LIVE NOW</span>
          </div>
          <h2 className="text-5xl font-bold mb-4">Your Local Voice</h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Broadcasting from Dublin Drive, bringing you local news, entertainment, and community stories.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <Tv className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Broadcasts</h3>
            <p className="text-sm text-gray-400">Watch live programming 24/7 with local news and entertainment.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <Radio className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community Radio</h3>
            <p className="text-sm text-gray-400">Audio streams featuring local music and talk shows.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
            <Signal className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Breaking News</h3>
            <p className="text-sm text-gray-400">Stay informed with real-time local news updates.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-sm text-gray-500">
        <p>&copy; 2025 KDDL Dublin Drive Live. A WasatchWise Production.</p>
      </footer>
    </div>
  )
}

export default App
