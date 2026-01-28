import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default async function PortfolioPage() {
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

  // Get portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', profile?.id)
    .single()

  // Get artifacts
  const { data: artifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('portfolio_id', portfolio?.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-primary mb-2">PORTFOLIO</h1>
            <p className="text-muted-foreground text-sm">
              Your collection of work and achievements
            </p>
          </div>
          <Link
            href="/loot-drop"
            className="font-mono text-sm px-4 py-2 bg-accent text-background hover:bg-accent/90 transition-colors"
          >
            + LOOT DROP
          </Link>
        </div>

        {artifacts && artifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artifacts.map((artifact) => (
              <Card key={artifact.id} className="p-4">
                <h3 className="font-bold mb-2">{artifact.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {artifact.type} • {new Date(artifact.created_at).toLocaleDateString()}
                </p>
                {artifact.description && (
                  <p className="text-sm text-muted-foreground">{artifact.description}</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Your portfolio is empty. Start by dropping some loot!
            </p>
            <Link
              href="/loot-drop"
              className="font-mono text-sm px-4 py-2 bg-primary text-background hover:bg-primary/90 transition-colors inline-block"
            >
              DROP LOOT
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

