import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function BadgesPage() {
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

  // Get user badges
  const { data: badges } = await supabase
    .from('user_badges')
    .select(`
      *,
      badges (*)
    `)
    .eq('user_id', profile?.id)
    .order('earned_at', { ascending: false })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-mono text-2xl font-bold text-primary mb-2">BADGES</h1>
          <p className="text-muted-foreground text-sm">
            Your earned achievements and recognition
          </p>
        </div>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((userBadge) => (
              <Card key={userBadge.id} className="p-6 text-center">
                <div className="text-4xl mb-3">{userBadge.badges?.icon || '🏆'}</div>
                <h3 className="font-bold text-lg mb-1">{userBadge.badges?.name || 'Badge'}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {userBadge.badges?.description || 'Achievement unlocked'}
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No badges yet. Complete quests and activities to earn your first badge!
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

