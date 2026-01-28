'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Heart, 
  Users, 
  Music, 
  Baby, 
  Dumbbell, 
  Mountain, 
  UtensilsCrossed, 
  Gamepad2, 
  BookOpen,
  HeartHandshake,
  Briefcase,
  Palette
} from 'lucide-react'

export interface ConnectionType {
  value: string
  label: string
  description: string
  icon: any
  color: string
}

export const CONNECTION_TYPES: ConnectionType[] = [
  {
    value: 'dating',
    label: 'Dating',
    description: 'Romantic connections',
    icon: Heart,
    color: 'from-pink-500 to-rose-500'
  },
  {
    value: 'friends',
    label: 'Friends',
    description: 'Platonic friendships',
    icon: Users,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    value: 'playdates',
    label: 'Playdates',
    description: 'Parent connections & kids',
    icon: Baby,
    color: 'from-green-500 to-emerald-500'
  },
  {
    value: 'music_collaboration',
    label: 'Music',
    description: 'Jam sessions & music partners',
    icon: Music,
    color: 'from-purple-500 to-violet-500'
  },
  {
    value: 'fitness_partners',
    label: 'Fitness',
    description: 'Workout & adventure buddies',
    icon: Dumbbell,
    color: 'from-red-500 to-orange-500'
  },
  {
    value: 'hiking_partners',
    label: 'Hiking',
    description: 'Outdoor adventure partners',
    icon: Mountain,
    color: 'from-amber-500 to-yellow-500'
  },
  {
    value: 'foodies',
    label: 'Foodies',
    description: 'Culinary explorers',
    icon: UtensilsCrossed,
    color: 'from-orange-500 to-amber-500'
  },
  {
    value: 'gaming',
    label: 'Gaming',
    description: 'Gaming & board game nights',
    icon: Gamepad2,
    color: 'from-indigo-500 to-blue-500'
  },
  {
    value: 'book_clubs',
    label: 'Book Clubs',
    description: 'Literary connections',
    icon: BookOpen,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    value: 'support_groups',
    label: 'Support',
    description: 'Support & understanding',
    icon: HeartHandshake,
    color: 'from-pink-500 to-purple-500'
  },
  {
    value: 'community',
    label: 'Community',
    description: 'Building community together',
    icon: Users,
    color: 'from-green-500 to-teal-500'
  },
  {
    value: 'networking',
    label: 'Networking',
    description: 'Professional connections',
    icon: Briefcase,
    color: 'from-slate-500 to-gray-500'
  },
  {
    value: 'creative_collaboration',
    label: 'Creative',
    description: 'Creative projects & collaboration',
    icon: Palette,
    color: 'from-violet-500 to-purple-500'
  }
]

interface ConnectionTypesSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  maxSelections?: number
}

export function ConnectionTypesSelector({ 
  selected, 
  onChange, 
  maxSelections 
}: ConnectionTypesSelectorProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      // Remove
      onChange(selected.filter(s => s !== value))
    } else {
      // Add (check max if set)
      if (maxSelections && selected.length >= maxSelections) {
        return // Don't add if at max
      }
      onChange([...selected, value])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">
          What are you looking for? 
          <span className="text-slate-400 font-normal ml-2">
            Select all that apply
          </span>
        </p>
        {maxSelections && (
          <p className="text-xs text-slate-500 mb-3">
            Select up to {maxSelections} (you&apos;ve selected {selected.length})
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CONNECTION_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = selected.includes(type.value)
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleToggle(type.value)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? `border-purple-500 bg-gradient-to-br ${type.color} bg-opacity-20`
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? `bg-gradient-to-br ${type.color}`
                    : 'bg-slate-700'
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {type.label}
                  </p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                    {type.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs text-slate-400">Selected:</span>
          {selected.map((value) => {
            const type = CONNECTION_TYPES.find(t => t.value === value)
            return type ? (
              <Badge key={value} variant="primary">
                {type.label}
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

