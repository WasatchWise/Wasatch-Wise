import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Cyclone } from '@/components/ui/cyclone'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  // Get rings data
  const { data: rings } = await supabase
    .from('rings')
    .select('*')
    .order('sort_order')

  // Get user's badges count
  const { count: badgeCount } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile?.id)

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('activity_events')
    .select('*')
    .eq('user_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Format rings for Cyclone component
  const cycloneRings = rings?.map(ring => ({
    id: ring.id,
    name: ring.name,
    slug: ring.slug,
    level: 0, // TODO: Calculate from cyclone_metrics
    maxLevel: 100,
  })) || []

  return (
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="hud-border bg-card/50 p-4 text-center">
            <div className="text-3xl font-bold font-mono text-primary text-glow-cyan">{badgeCount || 0}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">Badges</div>
          </div>
          <div className="hud-border bg-card/50 p-4 text-center">
            <div className="text-3xl font-bold font-mono text-accent text-glow-magenta">{recentActivity?.length || 0}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">Actions</div>
          </div>
          <div className="hud-border bg-card/50 p-4 text-center">
            <div className="text-3xl font-bold font-mono text-green-400" style={{ textShadow: '0 0 10px rgba(74, 222, 128, 0.6)' }}>0</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">Quests</div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/tap-in"
            className="group relative overflow-hidden bg-card border-2 border-primary/50 p-6 text-center hover:border-primary transition-all glow-cyan"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg border border-primary/50 bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="font-mono font-bold text-primary tracking-wider">TAP IN</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">Check in to zone</div>
            </div>
          </Link>

          <Link
            href="/loot-drop"
            className="group relative overflow-hidden bg-card border-2 border-accent/50 p-6 text-center hover:border-accent transition-all glow-magenta"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg border border-accent/50 bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-mono font-bold text-accent tracking-wider">LOOT DROP</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">Capture artifact</div>
            </div>
          </Link>
        </div>

        {/* Cyclone Visualization */}
        <div className="hud-border bg-card/50 p-6">
          <div className="text-center mb-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Your Cyclone</h2>
          </div>
          <Cyclone rings={cycloneRings} />
        </div>

        {/* Recent Activity */}
        <div className="hud-border bg-card/50 p-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Activity Log
          </h3>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-foreground">
                    {event.event_type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground/50 ml-auto font-mono">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border/50 rounded">
              <p className="text-sm text-muted-foreground font-mono">
                No activity recorded
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Tap In or Drop Loot to begin
              </p>
            </div>
          )}
        </div>

        {/* HOMAGO Mode Indicator */}
        <div className="border border-border/30 bg-card/30 rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Current Mode</div>
              <div className="font-mono font-bold text-lg text-yellow-400" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.4)' }}>
                Hanging Out
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                <span className="text-[8px] text-muted-foreground font-mono">H</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-[8px] text-muted-foreground font-mono">M</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-[8px] text-muted-foreground font-mono">G</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
