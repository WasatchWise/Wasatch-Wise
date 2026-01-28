'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface QuestCardProps {
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
  isActive?: boolean
  progress?: {
    completed: number
    total: number
  }
  crewName?: string
}

export function QuestCard({
  id,
  title,
  shortSummary,
  difficulty = 1,
  estimatedWeeks,
  pillar,
  rings = [],
  isActive = false,
  progress,
  crewName
}: QuestCardProps) {
  const getPillarStyles = (slug?: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      wellness: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
        glow: 'hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]'
      },
      technest: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
      },
      creative: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.3)]'
      },
      civic: {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        glow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]'
      }
    }
    return styles[slug || ''] || {
      bg: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/30',
      glow: 'hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]'
    }
  }

  const pillarStyles = getPillarStyles(pillar?.slug)
  const progressPercent = progress?.total ? Math.round((progress.completed / progress.total) * 100) : 0

  return (
    <Link href={`/quests/${id}`} className="block group">
      <div className={`
        relative overflow-hidden rounded-lg border ${pillarStyles.border} ${pillarStyles.bg}
        p-4 h-full transition-all duration-300
        hover:border-opacity-60 ${pillarStyles.glow}
        ${isActive ? 'ring-1 ring-primary/50' : ''}
      `}>
        {/* Pillar indicator stripe */}
        <div className={`absolute top-0 left-0 w-1 h-full ${pillarStyles.text.replace('text-', 'bg-')}`} />

        <div className="pl-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className={`${pillarStyles.text} ${pillarStyles.border} text-[10px] font-mono`}>
              {pillar?.name || 'General'}
            </Badge>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-yellow-400">
                {'★'.repeat(difficulty)}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {'☆'.repeat(5 - difficulty)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-sm mb-1 group-hover:${pillarStyles.text} transition-colors line-clamp-2`}>
            {title}
          </h3>

          {/* Summary */}
          {shortSummary && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {shortSummary}
            </p>
          )}

          {/* Progress bar for active quests */}
          {isActive && progress && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className={pillarStyles.text}>{progressPercent}%</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${pillarStyles.text.replace('text-', 'bg-')} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              {estimatedWeeks && (
                <span className="font-mono">{estimatedWeeks}w</span>
              )}
              {crewName && (
                <span className="font-mono truncate max-w-20">{crewName}</span>
              )}
            </div>
          </div>

          {/* Rings */}
          {rings.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/20">
              {rings.slice(0, 3).map((ring, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono px-1.5 py-0.5 bg-background/50 text-muted-foreground rounded"
                >
                  {ring.name}
                </span>
              ))}
              {rings.length > 3 && (
                <span className="text-[9px] font-mono text-muted-foreground">
                  +{rings.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
