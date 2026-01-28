'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface QuestFiltersProps {
  pillars: Array<{ id: string; name: string; slug: string }>
  rings: Array<{ id: string; name: string; slug: string }>
  onFiltersChange: (filters: QuestFilters) => void
  totalQuests: number
  filteredCount: number
}

export interface QuestFilters {
  search: string
  pillar: string
  difficulty: string
  duration: string
  rings: string[]
}

export function QuestFilters({
  pillars,
  rings,
  onFiltersChange,
  totalQuests,
  filteredCount
}: QuestFiltersProps) {
  const [filters, setFilters] = useState<QuestFilters>({
    search: '',
    pillar: 'all',
    difficulty: 'all',
    duration: 'all',
    rings: []
  })

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = <K extends keyof QuestFilters>(key: K, value: QuestFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleRing = (ringSlug: string) => {
    setFilters(prev => ({
      ...prev,
      rings: prev.rings.includes(ringSlug)
        ? prev.rings.filter(r => r !== ringSlug)
        : [...prev.rings, ringSlug]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      pillar: 'all',
      difficulty: 'all',
      duration: 'all',
      rings: []
    })
  }

  const hasActiveFilters = filters.search || filters.pillar !== 'all' ||
    filters.difficulty !== 'all' || filters.duration !== 'all' || filters.rings.length > 0

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Input
          type="search"
          placeholder="Search quests..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="bg-card/50 border-border/50 font-mono text-sm pl-10"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Pillar Tabs */}
      <Tabs value={filters.pillar} onValueChange={(v) => updateFilter('pillar', v)}>
        <TabsList className="w-full bg-card/50 border border-border/30 p-1 h-auto flex-wrap">
          <TabsTrigger
            value="all"
            className="flex-1 min-w-fit data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono text-xs"
          >
            All
          </TabsTrigger>
          {pillars.map(pillar => (
            <TabsTrigger
              key={pillar.id}
              value={pillar.slug}
              className={`flex-1 min-w-fit font-mono text-xs data-[state=active]:bg-opacity-20 ${
                pillar.slug === 'wellness' ? 'data-[state=active]:bg-green-500 data-[state=active]:text-green-400' :
                pillar.slug === 'technest' ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-cyan-400' :
                pillar.slug === 'creative' ? 'data-[state=active]:bg-purple-500 data-[state=active]:text-purple-400' :
                pillar.slug === 'civic' ? 'data-[state=active]:bg-yellow-500 data-[state=active]:text-yellow-400' :
                'data-[state=active]:bg-primary data-[state=active]:text-primary'
              }`}
            >
              {pillar.name.replace(' Studio', '').replace(' Lab', '')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Secondary Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.difficulty} onValueChange={(v) => updateFilter('difficulty', v)}>
          <SelectTrigger className="w-32 bg-card/50 border-border/30 font-mono text-xs h-8">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Any Level</SelectItem>
            <SelectItem value="1" className="font-mono text-xs">★ Beginner</SelectItem>
            <SelectItem value="2" className="font-mono text-xs">★★ Easy</SelectItem>
            <SelectItem value="3" className="font-mono text-xs">★★★ Medium</SelectItem>
            <SelectItem value="4" className="font-mono text-xs">★★★★ Hard</SelectItem>
            <SelectItem value="5" className="font-mono text-xs">★★★★★ Expert</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.duration} onValueChange={(v) => updateFilter('duration', v)}>
          <SelectTrigger className="w-32 bg-card/50 border-border/30 font-mono text-xs h-8">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Any Duration</SelectItem>
            <SelectItem value="short" className="font-mono text-xs">1-3 weeks</SelectItem>
            <SelectItem value="medium" className="font-mono text-xs">4-6 weeks</SelectItem>
            <SelectItem value="long" className="font-mono text-xs">7+ weeks</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 h-8 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ring filters */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Filter by Ring
        </div>
        <div className="flex flex-wrap gap-1">
          {rings.map(ring => (
            <Badge
              key={ring.id}
              variant={filters.rings.includes(ring.slug) ? 'default' : 'outline'}
              className={`cursor-pointer text-[10px] font-mono transition-all ${
                filters.rings.includes(ring.slug)
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'hover:bg-primary/10'
              }`}
              onClick={() => toggleRing(ring.slug)}
            >
              {ring.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs font-mono text-muted-foreground pt-2 border-t border-border/20">
        Showing {filteredCount} of {totalQuests} quests
      </div>
    </div>
  )
}
