import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { QuestBrowser } from '@/components/quests/quest-browser'
import Link from 'next/link'

export default async function QuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile with site_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  // Get user's site membership
  const { data: membership } = await supabase
    .from('site_memberships')
    .select('site_id')
    .eq('user_id', profile?.id)
    .single()

  const siteId = membership?.site_id

  // Get all pillars
  const { data: pillars } = await supabase
    .from('pillars')
    .select('id, name, slug, color_hex')
    .order('name')

  // Get all rings
  const { data: rings } = await supabase
    .from('rings')
    .select('id, name, slug')
    .order('sort_order')

  // Helper for Supabase nested relations
  type PillarData = { name?: string; slug?: string; color_hex?: string }
  type RingData = { name?: string; slug?: string }

  const getPillar = (pillars: unknown): PillarData | undefined => {
    if (Array.isArray(pillars)) return pillars[0]
    if (pillars && typeof pillars === 'object') return pillars as PillarData
    return undefined
  }

  const getRings = (questRings: unknown): RingData[] => {
    if (!Array.isArray(questRings)) return []
    return questRings.map(qr => {
      const rings = (qr as { rings?: unknown }).rings
      if (Array.isArray(rings)) return rings[0] as RingData
      return rings as RingData
    }).filter(Boolean)
  }

  // Get user's active quests
  const { data: activeQuests } = await supabase
    .from('quest_participation')
    .select(`
      id,
      quest_id,
      status,
      crew_name,
      quests (
        id
      )
    `)
    .eq('user_id', profile?.id)
    .eq('status', 'in_progress')

  // Get quest progress for active quests
  const activeQuestData: Array<{
    questId: string
    progress: { completed: number; total: number }
    crewName?: string
  }> = []

  if (activeQuests && activeQuests.length > 0) {
    const questIds = activeQuests.map(q => q.quest_id).filter(Boolean)
    const participationIds = activeQuests.map(q => q.id)

    // Get total steps per quest
    const { data: steps } = await supabase
      .from('quest_steps')
      .select('quest_id')
      .in('quest_id', questIds)

    // Get completed progress events
    const { data: progressEvents } = await supabase
      .from('quest_progress_events')
      .select('quest_participation_id, quest_step_id')
      .in('quest_participation_id', participationIds)
      .eq('event_type', 'step_completed')

    // Build progress data
    for (const participation of activeQuests) {
      const questId = participation.quest_id
      if (!questId) continue
      const totalSteps = steps?.filter(s => s.quest_id === questId).length || 0
      const completedSteps = progressEvents?.filter(e => e.quest_participation_id === participation.id).length || 0
      activeQuestData.push({
        questId,
        progress: { completed: completedSteps, total: totalSteps },
        crewName: participation.crew_name || undefined
      })
    }
  }

  // Get all available quests at user's site
  let questsQuery = supabase
    .from('quests')
    .select(`
      id,
      title,
      short_summary,
      difficulty,
      estimated_weeks,
      pillars (
        name,
        slug,
        color_hex
      ),
      quest_rings (
        rings (
          name,
          slug
        )
      )
    `)
    .eq('is_active', true)
    .order('title')

  if (siteId) {
    questsQuery = questsQuery.eq('site_id', siteId)
  }

  const { data: quests } = await questsQuery

  // Transform quests for the browser component
  const transformedQuests = (quests || []).map(quest => ({
    id: quest.id,
    title: quest.title,
    shortSummary: quest.short_summary || undefined,
    difficulty: quest.difficulty || 1,
    estimatedWeeks: quest.estimated_weeks || undefined,
    pillar: getPillar(quest.pillars),
    rings: getRings(quest.quest_rings)
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-primary mb-2">QUEST BROWSER</h1>
            <p className="text-muted-foreground text-sm">
              {transformedQuests.length} experiences to level up your skills
            </p>
          </div>
          {activeQuestData.length > 0 && (
            <div className="text-right">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Active</div>
              <div className="text-2xl font-bold font-mono text-primary">{activeQuestData.length}</div>
            </div>
          )}
        </div>

        {/* Active Quests Summary */}
        {activeQuestData.length > 0 && (
          <div className="hud-border bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Your Active Quests
                </h2>
                <p className="text-sm text-foreground">
                  You have {activeQuestData.length} quest{activeQuestData.length !== 1 ? 's' : ''} in progress
                </p>
              </div>
              <Link
                href="#active"
                className="text-xs font-mono text-primary hover:text-primary/80 transition-colors"
              >
                View Progress →
              </Link>
            </div>
          </div>
        )}

        {/* Quest Browser */}
        <QuestBrowser
          quests={transformedQuests}
          pillars={(pillars || []).map(p => ({ id: p.id, name: p.name, slug: p.slug }))}
          rings={(rings || []).map(r => ({ id: r.id, name: r.name, slug: r.slug }))}
          activeQuests={activeQuestData}
        />
      </div>
    </DashboardLayout>
  )
}
