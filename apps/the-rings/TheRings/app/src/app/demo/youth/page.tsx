import Link from 'next/link'
import { Cyclone } from '@/components/ui/cyclone'

export default function YouthDemo() {
  const champion = {
    name: 'Marcus',
    age: 14,
    crew: 'Code Breakers',
    streak: 12,
    totalBadges: 8,
  }

  const rings = [
    { id: '1', name: 'Self', slug: 'self', level: 45, maxLevel: 100 },
    { id: '2', name: 'Brain', slug: 'brain', level: 72, maxLevel: 100 },
    { id: '3', name: 'Body', slug: 'body', level: 38, maxLevel: 100 },
    { id: '4', name: 'Bubble', slug: 'bubble', level: 55, maxLevel: 100 },
    { id: '5', name: 'Scene', slug: 'scene', level: 68, maxLevel: 100 },
    { id: '6', name: 'Neighborhood', slug: 'neighborhood', level: 25, maxLevel: 100 },
    { id: '7', name: 'Community', slug: 'community', level: 30, maxLevel: 100 },
    { id: '8', name: 'World', slug: 'world', level: 15, maxLevel: 100 },
    { id: '9', name: 'Ether', slug: 'ether', level: 82, maxLevel: 100 },
  ]

  const activeQuests = [
    { title: 'Game Dev: Build Your First Platformer', progress: 65, pillar: 'TechNest' },
    { title: 'Cybersecurity Basics', progress: 30, pillar: 'TechNest' },
  ]

  const recentBadges = [
    { name: 'First Commit', icon: '💻', date: 'Today' },
    { name: 'Team Player', icon: '🤝', date: 'Yesterday' },
    { name: '10-Day Streak', icon: '🔥', date: '3 days ago' },
  ]

  const crewChat = [
    { from: 'Sophia', message: 'who can help me with collision detection?', time: '2 min' },
    { from: 'Devon', message: 'i got you, check the discord', time: '5 min' },
    { from: 'You', message: 'just finished level 2!', time: '12 min' },
  ]

  const buildingHotspots = [
    { zone: 'Gaming Arena', activity: 'Rocket League Tournament', people: 12 },
    { zone: 'Creative Studio', activity: 'Open Studio', people: 8 },
    { zone: 'Boxing Ring', activity: 'Sparring Session', people: 6 },
  ]

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-sm text-muted-foreground hover:text-primary">
              ← Back
            </Link>
            <span className="font-mono text-lg font-bold tracking-widest text-primary text-glow-cyan">
              {champion.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono">STREAK</div>
              <div className="font-mono text-yellow-400 font-bold">🔥 {champion.streak}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono">BADGES</div>
              <div className="font-mono text-accent font-bold">{champion.totalBadges}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="group relative overflow-hidden bg-card border-2 border-primary/50 p-6 text-center hover:border-primary transition-all glow-cyan">
            <div className="text-3xl mb-2">📍</div>
            <div className="font-mono font-bold text-primary tracking-wider">TAP IN</div>
          </button>
          <button className="group relative overflow-hidden bg-card border-2 border-accent/50 p-6 text-center hover:border-accent transition-all glow-magenta">
            <div className="text-3xl mb-2">📸</div>
            <div className="font-mono font-bold text-accent tracking-wider">LOOT DROP</div>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Cyclone & Quests */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cyclone Visualization */}
            <div className="hud-border bg-card/50 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 text-center">
                Your Cyclone
              </h2>
              <Cyclone rings={rings} size="md" animated={true} />
            </div>

            {/* Active Quests */}
            <div className="hud-border bg-card/50 p-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Active Quests
              </h2>
              <div className="space-y-4">
                {activeQuests.map((quest, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono text-sm text-foreground">{quest.title}</span>
                      <span className="text-xs text-cyan-400">{quest.pillar}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">{quest.progress}%</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm px-3 py-2 bg-primary/20 text-primary rounded hover:bg-primary/30 font-mono">
                Browse More Quests
              </button>
            </div>

            {/* Recent Badges */}
            <div className="hud-border bg-card/50 p-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Recent Badges
              </h2>
              <div className="flex gap-4">
                {recentBadges.map((badge, i) => (
                  <div key={i} className="text-center flex-1">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-mono text-foreground">{badge.name}</div>
                    <div className="text-[10px] text-muted-foreground">{badge.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Crew Chat */}
            <div className="hud-border bg-card/50 p-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
                Crew: {champion.crew}
              </h2>
              <div className="space-y-2 mb-3">
                {crewChat.map((msg, i) => (
                  <div key={i} className={`text-sm ${msg.from === 'You' ? 'text-primary' : 'text-foreground'}`}>
                    <span className="font-mono text-xs text-muted-foreground">{msg.from}: </span>
                    {msg.message}
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Say something..."
                className="w-full px-3 py-2 bg-card border border-border/50 rounded text-sm font-mono"
              />
            </div>

            {/* Building Hotspots */}
            <div className="hud-border bg-card/50 p-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                What's Happening Now
              </h2>
              <div className="space-y-3">
                {buildingHotspots.map((spot, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <div className="font-mono text-sm text-foreground">{spot.zone}</div>
                      <div className="text-xs text-muted-foreground">{spot.activity}</div>
                    </div>
                    <div className="text-sm font-mono text-green-400">{spot.people} 👤</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Link */}
            <div className="hud-border bg-card/50 p-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Your Portfolio
              </h2>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-primary mb-1">23</div>
                <div className="text-xs text-muted-foreground">Artifacts</div>
              </div>
              <button className="w-full mt-3 text-sm px-3 py-2 bg-accent/20 text-accent rounded hover:bg-accent/30 font-mono">
                View Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-muted-foreground font-mono py-4">
          This is a simulated youth view showing quests, badges, crew chat, and ring progress.
        </div>
      </main>
    </div>
  )
}
