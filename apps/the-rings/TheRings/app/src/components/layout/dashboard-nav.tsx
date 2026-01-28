'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/quests', label: 'Quests', icon: '🎯' },
  { href: '/portfolio', label: 'Portfolio', icon: '📁' },
  { href: '/badges', label: 'Badges', icon: '🏆' },
  { href: '/cyclone', label: 'Cyclone', icon: '🌪️' },
  { href: '/sessions', label: 'Sessions', icon: '📅' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border/30 bg-card/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-mono text-xs px-4 py-2 border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

