'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, LayoutDashboard, Users, Mail, Zap, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getHCITracker } from '@/lib/hci/metrics'
import { triggerHaptic, isIOS } from '@/lib/ios/optimizations'

const navigation = [
  {
    name: 'Dashboard',
    href: '/projects',
    icon: LayoutDashboard,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Mail,
  },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const handleNavClick = (href: string) => {
    const tracker = getHCITracker()
    tracker.trackInteraction('mobile_navigate', { page: href })
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Logo - Always visible */}
      <Link 
        href="/projects" 
        className="flex items-center space-x-2 flex-shrink-0"
        onClick={() => getHCITracker().trackInteraction('click_logo')}
      >
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          GrooveLeads
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => getHCITracker().trackInteraction('nav_click', { page: item.href })}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Search - Responsive */}
      <div className={cn(
        "flex-1 transition-all duration-200",
        searchFocused ? "max-w-full" : "max-w-xs md:max-w-2xl",
        "mx-2 md:mx-4"
      )}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, contacts..."
            onFocus={() => {
              setSearchFocused(true)
              getHCITracker().trackInteraction('open_search')
            }}
            onBlur={() => setSearchFocused(false)}
            className="h-9 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        onClick={() => {
          if (isIOS()) triggerHaptic('medium')
          setMobileMenuOpen(!mobileMenuOpen)
          getHCITracker().trackInteraction('toggle_mobile_menu')
        }}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-card border-l shadow-lg">
            <div className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isIOS()) triggerHaptic('light')
                  handleNavClick(item.href)
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent active:bg-accent'
                )}
              >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
