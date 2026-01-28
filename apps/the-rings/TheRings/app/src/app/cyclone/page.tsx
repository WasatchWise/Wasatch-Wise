import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { Cyclone } from '@/components/ui/cyclone'
import { Card } from '@/components/ui/card'

export default async function CyclonePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get rings data
  const { data: rings } = await supabase
    .from('rings')
    .select('*')
    .order('sort_order')

  // Get ring activation data (when implemented)
  // TODO: Calculate from cyclone_metrics or ring_activation_snapshots
  const cycloneRings = rings?.map(ring => ({
    id: ring.id,
    name: ring.name,
    slug: ring.slug,
    level: 0, // TODO: Calculate from cyclone_metrics
    maxLevel: 100,
  })) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-mono text-2xl font-bold text-primary mb-2">CYCLONE</h1>
          <p className="text-muted-foreground text-sm">
            Your growth across the nine rings of development
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center mb-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Your Cyclone</h2>
          </div>
          <Cyclone rings={cycloneRings} />
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Ring Activation</h3>
          <p className="text-sm text-muted-foreground">
            Complete quests, earn badges, and participate in activities to activate your rings.
            Each ring represents a domain of growth in your life.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}

