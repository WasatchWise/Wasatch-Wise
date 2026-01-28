'use client'

import { Badge } from '@/components/ui/Badge'
import { 
  Brain, 
  ShieldCheck, 
  MessageCircle, 
  HeartHandshake, 
  TrendingUp, 
  Star, 
  Users,
  Award
} from 'lucide-react'

interface BadgeData {
  id: string
  name: string
  description: string
  category: string
  icon_name?: string
  color?: string
  awarded_at?: string
}

interface BadgeDisplayProps {
  badges: BadgeData[]
  size?: 'sm' | 'md' | 'lg'
  showNames?: boolean
  maxDisplay?: number
}

const iconMap: Record<string, any> = {
  brain: Brain,
  'shield-check': ShieldCheck,
  'message-circle': MessageCircle,
  'heart-handshake': HeartHandshake,
  'trending-up': TrendingUp,
  star: Star,
  users: Users,
  award: Award
}

const colorMap: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  pink: 'from-pink-500 to-pink-600',
  amber: 'from-amber-500 to-amber-600',
  gold: 'from-yellow-500 to-yellow-600',
  teal: 'from-teal-500 to-teal-600'
}

export function BadgeDisplay({ 
  badges, 
  size = 'md', 
  showNames = false,
  maxDisplay 
}: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayBadges.map((badge) => {
        const Icon = iconMap[badge.icon_name || 'award'] || Award
        const colorClass = colorMap[badge.color || 'purple'] || 'from-purple-500 to-purple-600'
        
        return (
          <div
            key={badge.id}
            className="group relative flex items-center gap-2"
            title={badge.name}
          >
            <div className={`
              ${sizeClasses[size]} 
              rounded-full 
              bg-gradient-to-br ${colorClass}
              flex items-center justify-center
              shadow-lg
              ring-2 ring-slate-800
              transition-transform group-hover:scale-110
            `}>
              <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
            </div>
            {showNames && (
              <span className="text-xs text-slate-400 font-medium">
                {badge.name}
              </span>
            )}
          </div>
        )
      })}
      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-xs text-slate-500">
          +{badges.length - maxDisplay} more
        </div>
      )}
    </div>
  )
}

