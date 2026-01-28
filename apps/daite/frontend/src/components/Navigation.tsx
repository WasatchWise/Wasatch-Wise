'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Home, Search, Heart, MessageCircle, Calendar, Settings, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'

import { Award } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/discover', icon: Search, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/dates', icon: Calendar, label: 'Dates' },
  { href: '/challenges', icon: Award, label: 'Challenges' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const client = useSupabaseClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (client) {
      client.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })

      client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
    }
  }, [client])

  const handleLogout = async () => {
    if (client) {
      await client.auth.signOut()
      router.push('/')
      router.refresh()
    }
  }
  
  return (
    <>
      {/* Top Navigation - Desktop */}
      <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Image 
                src="/cyraino.png" 
                alt="CYRAiNO" 
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DAiTE
              </div>
            </Link>
            
            {/* Navigation Items - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-w-[60px] touch-manipulation
                  ${isActive 
                    ? 'text-purple-400 bg-purple-600/10' 
                    : 'text-slate-400 active:bg-slate-800/50'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

