'use client'

import { useState, useCallback, useMemo } from 'react'
import { QuestCard } from './quest-card'
import { QuestFilters, type QuestFilters as FiltersType } from './quest-filters'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Quest {
  id: string
  title: string
  shortSummary?: string
  difficulty?: number
  estimatedWeeks?: number
  pillar?: {
    name?: string
    slug?: string
    colorHex?: string
  }
  rings?: Array<{ name?: string; slug?: string }>
}

interface QuestBrowserProps {
  quests: Quest[]
  pillars: Array<{ id: string; name: string; slug: string }>
  rings: Array<{ id: string; name: string; slug: string }>
  activeQuests?: Array<{
    questId: string
    progress: { completed: number; total: number }
    crewName?: string
  }>
}

export function QuestBrowser({ quests, pillars, rings, activeQuests = [] }: QuestBrowserProps) {
  const [filters, setFilters] = useState<FiltersType>({
    search: '',
    pillar: 'all',
    difficulty: 'all',
    duration: 'all',
    rings: []
  })

  const activeQuestMap = useMemo(() => {
    const map = new Map<string, { progress: { completed: number; total: number }; crewName?: string }>()
    activeQuests.forEach(aq => {
      map.set(aq.questId, { progress: aq.progress, crewName: aq.crewName })
    })
    return map
  }, [activeQuests])

  const filteredQuests = useMemo(() => {
    return quests.filter(quest => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = quest.title.toLowerCase().includes(searchLower)
        const matchesSummary = quest.shortSummary?.toLowerCase().includes(searchLower)
        if (!matchesTitle && !matchesSummary) return false
      }

      // Pillar filter
      if (filters.pillar !== 'all' && quest.pillar?.slug !== filters.pillar) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty !== 'all') {
        const targetDifficulty = parseInt(filters.difficulty)
        if (quest.difficulty !== targetDifficulty) return false
      }

      // Duration filter
      if (filters.duration !== 'all') {
        const weeks = quest.estimatedWeeks || 0
        if (filters.duration === 'short' && weeks > 3) return false
        if (filters.duration === 'medium' && (weeks < 4 || weeks > 6)) return false
        if (filters.duration === 'long' && weeks < 7) return false
      }

      // Rings filter
      if (filters.rings.length > 0) {
        const questRingSlugs = quest.rings?.map(r => r.slug) || []
        const hasMatchingRing = filters.rings.some(ringSlug => questRingSlugs.includes(ringSlug))
        if (!hasMatchingRing) return false
      }

      return true
    })
  }, [quests, filters])

  const handleFiltersChange = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters)
  }, [])

  // Group quests by pillar for better organization
  const groupedQuests = useMemo(() => {
    if (filters.pillar !== 'all') {
      return { [filters.pillar]: filteredQuests }
    }

    const groups: Record<string, Quest[]> = {}
    filteredQuests.forEach(quest => {
      const pillarSlug = quest.pillar?.slug || 'other'
      if (!groups[pillarSlug]) groups[pillarSlug] = []
      groups[pillarSlug].push(quest)
    })
    return groups
  }, [filteredQuests, filters.pillar])

  const pillarOrder = ['wellness', 'technest', 'creative', 'civic', 'other']
  const pillarLabels: Record<string, string> = {
    wellness: 'Wellness',
    technest: 'TechNest',
    creative: 'Creative Studio',
    civic: 'Civic Lab',
    other: 'Other'
  }

  return (
    <div className="grid lg:grid-cols-[280px,1fr] gap-6">
      {/* Filters Sidebar */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="hud-border bg-card/30 p-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Find Quests
          </h2>
          <QuestFilters
            pillars={pillars}
            rings={rings}
            onFiltersChange={handleFiltersChange}
            totalQuests={quests.length}
            filteredCount={filteredQuests.length}
          />
        </div>
      </div>

      {/* Quest Grid */}
      <div className="space-y-8">
        {filteredQuests.length === 0 ? (
          <div className="hud-border bg-card/30 p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground font-mono">
              No quests match your filters
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        ) : filters.pillar === 'all' ? (
          // Show grouped by pillar
          pillarOrder.map(pillarSlug => {
            const pillarQuests = groupedQuests[pillarSlug]
            if (!pillarQuests || pillarQuests.length === 0) return null

            return (
              <section key={pillarSlug}>
                <h3 className={`font-mono text-sm font-bold mb-4 ${
                  pillarSlug === 'wellness' ? 'text-green-400' :
                  pillarSlug === 'technest' ? 'text-cyan-400' :
                  pillarSlug === 'creative' ? 'text-purple-400' :
                  pillarSlug === 'civic' ? 'text-yellow-400' :
                  'text-primary'
                }`}>
                  {pillarLabels[pillarSlug]}
                  <span className="text-muted-foreground font-normal ml-2">
                    ({pillarQuests.length})
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pillarQuests.slice(0, 12).map(quest => {
                    const activeData = activeQuestMap.get(quest.id)
                    return (
                      <QuestCard
                        key={quest.id}
                        id={quest.id}
                        title={quest.title}
                        shortSummary={quest.shortSummary}
                        difficulty={quest.difficulty}
                        estimatedWeeks={quest.estimatedWeeks}
                        pillar={quest.pillar}
                        rings={quest.rings}
                        isActive={!!activeData}
                        progress={activeData?.progress}
                        crewName={activeData?.crewName}
                      />
                    )
                  })}
                </div>
                {pillarQuests.length > 12 && (
                  <p className="text-xs text-muted-foreground font-mono mt-3">
                    + {pillarQuests.length - 12} more quests
                  </p>
                )}
              </section>
            )
          })
        ) : (
          // Show flat grid when filtered to single pillar
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredQuests.map(quest => {
              const activeData = activeQuestMap.get(quest.id)
              return (
                <QuestCard
                  key={quest.id}
                  id={quest.id}
                  title={quest.title}
                  shortSummary={quest.shortSummary}
                  difficulty={quest.difficulty}
                  estimatedWeeks={quest.estimatedWeeks}
                  pillar={quest.pillar}
                  rings={quest.rings}
                  isActive={!!activeData}
                  progress={activeData?.progress}
                  crewName={activeData?.crewName}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
