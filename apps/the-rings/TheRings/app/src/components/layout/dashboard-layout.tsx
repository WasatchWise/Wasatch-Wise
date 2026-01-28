import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardNav } from './dashboard-nav'

export async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* HUD Header */}
      <header className="border-b border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-mono text-lg font-bold tracking-widest text-primary text-glow-cyan">
            THE RINGS
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-primary status-active pr-4">
              {profile?.champion_name || 'CHAMPION'}
            </span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="font-mono text-xs text-muted-foreground hover:text-destructive transition-colors">
                [EXIT]
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        {children}
      </main>
    </div>
  )
}

