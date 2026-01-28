import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface QuestDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function QuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = await params
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

  // Get quest details
  const { data: quest } = await supabase
    .from('quests')
    .select(`
      id,
      title,
      short_summary,
      description_md,
      difficulty,
      estimated_weeks,
      pillars (
        name,
        slug,
        color_hex
      )
    `)
    .eq('id', id)
    .single()

  if (!quest) {
    notFound()
  }

  // Get quest steps
  const { data: steps } = await supabase
    .from('quest_steps')
    .select('*')
    .eq('quest_id', id)
    .order('sort_order')

  // Get quest rings
  const { data: questRings } = await supabase
    .from('quest_rings')
    .select(`
      weight,
      rings (
        id,
        name,
        slug
      )
    `)
    .eq('quest_id', id)

  // Get user's participation in this quest
  const { data: participation } = await supabase
    .from('quest_participation')
    .select('*')
    .eq('quest_id', id)
    .eq('user_id', profile?.id)
    .single()

  // Get completed steps if participating
  let completedStepIds: string[] = []
  if (participation) {
    const { data: progressEvents } = await supabase
      .from('quest_progress_events')
      .select('quest_step_id')
      .eq('quest_participation_id', participation.id)
      .eq('event_type', 'step_completed')

    completedStepIds = progressEvents?.map(e => e.quest_step_id).filter(Boolean) as string[] || []
  }

  // Helper for Supabase nested relations
  const getPillar = (pillars: unknown): { name?: string; slug?: string; color_hex?: string } | undefined => {
    if (Array.isArray(pillars)) return pillars[0]
    if (pillars && typeof pillars === 'object') return pillars as { name?: string; slug?: string; color_hex?: string }
    return undefined
  }

  const getRing = (rings: unknown): { id?: string; name?: string; slug?: string } | undefined => {
    if (Array.isArray(rings)) return rings[0]
    if (rings && typeof rings === 'object') return rings as { id?: string; name?: string; slug?: string }
    return undefined
  }

  const pillar = getPillar(quest.pillars)

  const getPillarStyles = (slug?: string) => {
    const styles: Record<string, { text: string; border: string; bg: string; glow: string }> = {
      wellness: {
        text: 'text-green-400',
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        glow: 'shadow-[0_0_30px_rgba(74,222,128,0.2)]'
      },
      technest: {
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        glow: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]'
      },
      creative: {
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        glow: 'shadow-[0_0_30px_rgba(192,132,252,0.2)]'
      },
      civic: {
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
        glow: 'shadow-[0_0_30px_rgba(250,204,21,0.2)]'
      }
    }
    return styles[slug || ''] || {
      text: 'text-primary',
      border: 'border-primary/30',
      bg: 'bg-primary/10',
      glow: ''
    }
  }

  const getHomagoStyles = (phase?: string) => {
    const styles: Record<string, { text: string; bg: string; label: string; icon: string }> = {
      hanging_out: {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/20',
        label: 'Hanging Out',
        icon: '👀'
      },
      messing_around: {
        text: 'text-orange-400',
        bg: 'bg-orange-500/20',
        label: 'Messing Around',
        icon: '🔧'
      },
      geeking_out: {
        text: 'text-red-400',
        bg: 'bg-red-500/20',
        label: 'Geeking Out',
        icon: '🚀'
      }
    }
    return styles[phase || ''] || { text: 'text-muted-foreground', bg: 'bg-muted', label: 'General', icon: '📝' }
  }

  const pillarStyles = getPillarStyles(pillar?.slug)
  const totalSteps = steps?.length || 0
  const completedCount = completedStepIds.length
  const progressPercent = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0

  // Group steps by HOMAGO phase
  const stepsByPhase = {
    hanging_out: steps?.filter(s => s.homago_phase === 'hanging_out') || [],
    messing_around: steps?.filter(s => s.homago_phase === 'messing_around') || [],
    geeking_out: steps?.filter(s => s.homago_phase === 'geeking_out') || []
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/quests"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
        >
          ← Back to Quest Browser
        </Link>

        {/* Quest Header */}
        <div className={`rounded-lg border ${pillarStyles.border} ${pillarStyles.bg} p-6 ${pillarStyles.glow}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <Badge variant="outline" className={`${pillarStyles.text} ${pillarStyles.border} font-mono text-xs mb-3`}>
                {pillar?.name || 'General'}
              </Badge>
              <h1 className={`font-mono text-2xl md:text-3xl font-bold ${pillarStyles.text} mb-2`}>
                {quest.title}
              </h1>
              <p className="text-muted-foreground">
                {quest.short_summary || 'No description'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-mono text-yellow-400 mb-1">
                {'★'.repeat(quest.difficulty || 1)}
                <span className="text-muted-foreground">{'☆'.repeat(5 - (quest.difficulty || 1))}</span>
              </div>
              {quest.estimated_weeks && (
                <div className="text-xs text-muted-foreground font-mono">
                  ~{quest.estimated_weeks} weeks
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/20">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-foreground">{totalSteps}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-foreground">{questRings?.length || 0}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Rings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-foreground">{quest.estimated_weeks || '?'}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Weeks</div>
            </div>
          </div>
        </div>

        {/* Participation Status */}
        {participation ? (
          <div className="hud-border bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Your Progress
                </h2>
                {participation.crew_name && (
                  <p className="text-sm text-foreground mt-1">Crew: {participation.crew_name}</p>
                )}
              </div>
              <div className={`text-2xl font-bold font-mono ${pillarStyles.text}`}>
                {progressPercent}%
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${pillarStyles.text.replace('text-', 'bg-')} transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2 font-mono">
              {completedCount} of {totalSteps} steps completed
            </div>
          </div>
        ) : (
          <div className="hud-border bg-card/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You are not enrolled in this quest yet.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Talk to staff to join and start your journey.
            </p>
          </div>
        )}

        {/* Ring Activation */}
        {questRings && questRings.length > 0 && (
          <div className="border border-border/30 bg-card/20 p-4 rounded-lg">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Rings Activated
            </h2>
            <div className="flex flex-wrap gap-2">
              {questRings.map((qr, idx) => {
                const ring = getRing(qr.rings)
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${pillarStyles.border} ${pillarStyles.bg}`}
                  >
                    <span className={`text-sm font-mono ${pillarStyles.text}`}>
                      {ring?.name || 'Ring'}
                    </span>
                    {qr.weight && qr.weight > 1 && (
                      <span className="text-xs font-mono text-muted-foreground">
                        ×{qr.weight}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* HOMAGO Journey */}
        {steps && steps.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Your Journey
            </h2>

            {/* HOMAGO Phase Sections */}
            {(['hanging_out', 'messing_around', 'geeking_out'] as const).map(phase => {
              const phaseSteps = stepsByPhase[phase]
              if (phaseSteps.length === 0) return null

              const phaseStyles = getHomagoStyles(phase)
              const phaseCompleted = phaseSteps.filter(s => completedStepIds.includes(s.id)).length
              const phaseTotal = phaseSteps.length

              return (
                <div key={phase} className="space-y-3">
                  {/* Phase Header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${phaseStyles.bg} flex items-center justify-center text-xl`}>
                      {phaseStyles.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-mono font-bold ${phaseStyles.text}`}>
                        {phaseStyles.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {phaseCompleted} of {phaseTotal} completed
                      </div>
                    </div>
                    {participation && phaseCompleted === phaseTotal && (
                      <Badge variant="outline" className="text-green-400 border-green-500/30 text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>

                  {/* Steps */}
                  <div className="ml-5 border-l-2 border-border/30 pl-6 space-y-3">
                    {phaseSteps.map((step, index) => {
                      const isCompleted = completedStepIds.includes(step.id)
                      const isCurrent = participation && !isCompleted &&
                        phaseSteps.slice(0, index).every(s => completedStepIds.includes(s.id)) &&
                        (phase === 'hanging_out' ||
                          stepsByPhase.hanging_out.every(s => completedStepIds.includes(s.id))) &&
                        (phase !== 'geeking_out' ||
                          stepsByPhase.messing_around.every(s => completedStepIds.includes(s.id)))

                      return (
                        <div
                          key={step.id}
                          className={`relative p-4 rounded-lg border transition-all ${
                            isCompleted
                              ? 'border-green-500/30 bg-green-500/5'
                              : isCurrent
                              ? `${pillarStyles.border} ${pillarStyles.bg}`
                              : 'border-border/20 bg-card/10'
                          }`}
                        >
                          {/* Connector dot */}
                          <div className={`absolute -left-[31px] top-5 w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : isCurrent
                              ? `${pillarStyles.text.replace('text-', 'bg-')} ${pillarStyles.border}`
                              : 'bg-background border-border/50'
                          }`}>
                            {isCompleted && (
                              <svg className="w-full h-full text-background p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-medium ${
                                isCompleted ? 'text-green-400' :
                                isCurrent ? pillarStyles.text :
                                'text-foreground'
                              }`}>
                                {step.title}
                              </h3>
                              {step.description_md && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description_md}
                                </p>
                              )}
                            </div>
                            {isCurrent && (
                              <Badge className={`${phaseStyles.bg} ${phaseStyles.text} border-none text-[10px]`}>
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* Full Description */}
        {quest.description_md && (
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              About This Quest
            </h2>
            <div className="border border-border/30 bg-card/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {quest.description_md}
              </p>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
