'use client'

import { cn } from '@/lib/utils'

interface CycloneRing {
  id: string
  name: string
  slug: string
  level: number
  maxLevel: number
}

interface CycloneProps {
  rings: CycloneRing[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

// Colors mapped to ring order (Self at center, Ether at outer)
const ringColors: Record<string, { base: string; glow: string; gradient: string }> = {
  self: { base: '#e85d3b', glow: '#ff7f5f', gradient: '#ff9166' },
  brain: { base: '#f4c542', glow: '#ffe066', gradient: '#ffd700' },
  body: { base: '#7ecce5', glow: '#a5e5f7', gradient: '#5bc0de' },
  bubble: { base: '#4a90d9', glow: '#6eb5ff', gradient: '#3498db' },
  scene: { base: '#9b59b6', glow: '#bb77d6', gradient: '#8e44ad' },
  neighborhood: { base: '#e67e22', glow: '#f39c12', gradient: '#d35400' },
  community: { base: '#27ae60', glow: '#2ecc71', gradient: '#1abc9c' },
  world: { base: '#3498db', glow: '#5dade2', gradient: '#2980b9' },
  ether: { base: '#8e44ad', glow: '#a569bd', gradient: '#9b59b6' },
}

export function Cyclone({ rings, className, size = 'md', animated = true }: CycloneProps) {
  // Sort rings by the correct order (Self at center, Ether at outer)
  const sortedRings = [...rings].sort((a, b) => {
    const order = ['self', 'brain', 'body', 'bubble', 'scene', 'neighborhood', 'community', 'world', 'ether']
    return order.indexOf(a.slug) - order.indexOf(b.slug)
  })

  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96',
  }

  const viewBoxSize = 400
  const centerX = viewBoxSize / 2
  const centerY = viewBoxSize / 2
  const maxRadius = 180
  const minRadius = 20
  const ringWidth = (maxRadius - minRadius) / sortedRings.length

  return (
    <div className={cn('relative mx-auto', sizeClasses[size], className)}>
      <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full">
        <defs>
          {/* Glow filters for each ring */}
          {sortedRings.map((ring) => {
            const colors = ringColors[ring.slug] || { base: '#666', glow: '#888', gradient: '#777' }
            return (
              <filter key={`glow-${ring.slug}`} id={`glow-${ring.slug}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feFlood floodColor={colors.glow} floodOpacity="0.8"/>
                <feComposite in2="coloredBlur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            )
          })}

          {/* Radial gradient for center glow */}
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor={ringColors.self.glow} stopOpacity="1" />
            <stop offset="50%" stopColor={ringColors.self.base} stopOpacity="0.5" />
            <stop offset="100%" stopColor={ringColors.self.base} stopOpacity="0" />
          </radialGradient>

          {/* Pulse animation */}
          <style>
            {`
              @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes glow-pulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
              }
              .ring-pulse {
                animation: pulse 3s ease-in-out infinite;
              }
              .ring-rotate {
                transform-origin: center;
                animation: rotate 60s linear infinite;
              }
              .ring-glow {
                animation: glow-pulse 2s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Background circles for depth */}
        <circle
          cx={centerX}
          cy={centerY}
          r={maxRadius + 10}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Rings - drawn from outer (Ether) to inner (Self) */}
        {[...sortedRings].reverse().map((ring, index) => {
          const colors = ringColors[ring.slug] || { base: '#666', glow: '#888', gradient: '#777' }
          const isLit = ring.level > 0
          const intensity = ring.level / ring.maxLevel

          // Calculate ring radius (reversed because we draw outer first)
          const ringIndex = sortedRings.length - 1 - index
          const outerRadius = maxRadius - ringIndex * ringWidth
          const innerRadius = outerRadius - ringWidth + 2

          // Arc for the progress indicator
          const circumference = 2 * Math.PI * ((outerRadius + innerRadius) / 2)
          const progressLength = circumference * intensity
          const progressRadius = (outerRadius + innerRadius) / 2

          return (
            <g key={ring.id}>
              {/* Ring background */}
              <circle
                cx={centerX}
                cy={centerY}
                r={progressRadius}
                fill="none"
                stroke={isLit ? colors.base : 'rgba(255,255,255,0.1)'}
                strokeWidth={ringWidth - 4}
                opacity={isLit ? 0.3 : 0.15}
              />

              {/* Ring progress arc */}
              {isLit && (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={progressRadius}
                  fill="none"
                  stroke={colors.glow}
                  strokeWidth={ringWidth - 4}
                  strokeDasharray={`${progressLength} ${circumference}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${centerX} ${centerY})`}
                  opacity={0.6 + intensity * 0.4}
                  filter={intensity > 0.5 ? `url(#glow-${ring.slug})` : undefined}
                  className={animated && isLit ? 'ring-glow' : ''}
                  style={{
                    transition: 'stroke-dasharray 1s ease-out',
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              )}

              {/* Level marker dot */}
              {isLit && intensity > 0.1 && (
                <circle
                  cx={centerX + progressRadius * Math.cos((intensity * 360 - 90) * Math.PI / 180)}
                  cy={centerY + progressRadius * Math.sin((intensity * 360 - 90) * Math.PI / 180)}
                  r={4}
                  fill={colors.glow}
                  filter={`url(#glow-${ring.slug})`}
                  className={animated ? 'ring-pulse' : ''}
                  style={{ animationDelay: `${index * 0.3}s` }}
                />
              )}
            </g>
          )
        })}

        {/* Center core */}
        <circle
          cx={centerX}
          cy={centerY}
          r={minRadius}
          fill="url(#centerGlow)"
          className={animated ? 'ring-pulse' : ''}
        />

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="fill-white font-mono text-xs font-bold"
          style={{ fontSize: '10px' }}
        >
          THE
        </text>
        <text
          x={centerX}
          y={centerY + 8}
          textAnchor="middle"
          className="fill-white font-mono text-xs font-bold"
          style={{ fontSize: '12px' }}
        >
          RINGS
        </text>
      </svg>

      {/* Ring labels - circular layout */}
      <div className="absolute inset-0 pointer-events-none">
        {sortedRings.map((ring, index) => {
          const colors = ringColors[ring.slug]
          const isLit = ring.level > 0
          const angle = (index * 40) - 90 // Spread labels around
          const labelRadius = size === 'sm' ? 110 : size === 'md' ? 160 : 210
          const x = 50 + (labelRadius / (size === 'sm' ? 2.4 : size === 'md' ? 3.6 : 4.8)) * Math.cos(angle * Math.PI / 180)
          const y = 50 + (labelRadius / (size === 'sm' ? 2.4 : size === 'md' ? 3.6 : 4.8)) * Math.sin(angle * Math.PI / 180)

          return (
            <div
              key={ring.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={cn(
                  'font-mono text-[8px] uppercase tracking-wider whitespace-nowrap',
                  isLit ? 'opacity-100' : 'opacity-40'
                )}
                style={{ color: isLit ? colors?.glow : 'rgba(255,255,255,0.5)' }}
              >
                {ring.name}
              </div>
              <div
                className="font-mono text-[10px] font-bold"
                style={{ color: isLit ? colors?.glow : 'rgba(255,255,255,0.3)' }}
              >
                {ring.level}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compact version for cards/thumbnails
export function CycloneMini({ rings, className }: { rings: CycloneRing[], className?: string }) {
  const sortedRings = [...rings].sort((a, b) => {
    const order = ['self', 'brain', 'body', 'bubble', 'scene', 'neighborhood', 'community', 'world', 'ether']
    return order.indexOf(a.slug) - order.indexOf(b.slug)
  })

  return (
    <div className={cn('relative w-16 h-16', className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {sortedRings.map((ring, index) => {
          const colors = ringColors[ring.slug] || { base: '#666', glow: '#888', gradient: '#777' }
          const isLit = ring.level > 0
          const intensity = ring.level / ring.maxLevel
          const radius = 45 - index * 4.5
          const circumference = 2 * Math.PI * radius
          const progress = circumference * intensity

          return (
            <circle
              key={ring.id}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={isLit ? colors.glow : 'rgba(255,255,255,0.1)'}
              strokeWidth="3"
              strokeDasharray={isLit ? `${progress} ${circumference}` : undefined}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              opacity={isLit ? 0.5 + intensity * 0.5 : 0.2}
            />
          )
        })}
      </svg>
    </div>
  )
}
