'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useOrganization as useUserOrganization } from '@/lib/hooks/useOrganization'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Mail,
  Settings,
  Zap,
} from 'lucide-react'

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
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { organization } = useUserOrganization()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/projects" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            GrooveLeads
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold">{organization?.name || 'Groove Technologies'}</p>
          <p>© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </div>
  )
}
