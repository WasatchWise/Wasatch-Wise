import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  // Get recent sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', profile?.id)
    .order('session_date', { ascending: false })
    .limit(20)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-mono text-2xl font-bold text-primary mb-2">SESSIONS</h1>
          <p className="text-muted-foreground text-sm">
            Your program attendance and activity history
          </p>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold mb-1">
                      {new Date(session.session_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session.pillar_slug && `Pillar: ${session.pillar_slug}`}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-primary">
                    {session.homago_mode || 'Hanging Out'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No sessions recorded yet. Tap in to start tracking your attendance!
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

