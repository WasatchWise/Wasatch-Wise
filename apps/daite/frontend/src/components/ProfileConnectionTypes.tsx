'use client'

import { ConnectionTypesSelector, CONNECTION_TYPES } from './ConnectionTypesSelector'
import { Badge } from './ui/Badge'

interface ProfileConnectionTypesProps {
  connectionTypes: string[]
  size?: 'sm' | 'md'
  showLabels?: boolean
}

export function ProfileConnectionTypes({ 
  connectionTypes, 
  size = 'md',
  showLabels = true 
}: ProfileConnectionTypesProps) {
  if (!connectionTypes || connectionTypes.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic">
        No connection types specified
      </div>
    )
  }

  const types = connectionTypes
    .map(value => CONNECTION_TYPES.find(t => t.value === value))
    .filter(Boolean) as typeof CONNECTION_TYPES

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => {
        const Icon = type.icon
        return (
          <Badge 
            key={type.value} 
            variant="primary"
            className="flex items-center gap-1.5"
          >
            <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
            {showLabels && <span>{type.label}</span>}
          </Badge>
        )
      })}
    </div>
  )
}

