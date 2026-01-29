'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { getSavedBandsCount } from '@/lib/savedBands'
import Logo from './Logo'
import Container from './Container'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: 'Stream', href: '/live', highlight: true },
    { name: 'Network Map', href: '/spider-network/web', accent: true },
    { name: 'Band Index', href: '/discover' },
    { name: 'Book', href: '/book' },
    { name: 'Musicians', href: '/musicians' },
    { name: 'Venues', href: '/venues' },
    { name: 'Events', href: '/events' },
  ]

  // Update saved bands count on mount and when bands are saved/unsaved
  useEffect(() => {
    const updateCount = () => setSavedCount(getSavedBandsCount())

    // Initial count
    updateCount()

    // Listen for band saved/unsaved events
    window.addEventListener('bandSaved', updateCount)
    window.addEventListener('storage', updateCount) // For cross-tab updates

    return () => {
      window.removeEventListener('bandSaved', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 z-50 backdrop-blur-sm bg-opacity-95">
      <Container>
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <Logo className="w-32 h-auto" priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={
                  item.highlight
                    ? "px-3 py-2 border border-zinc-700 text-zinc-100 font-semibold rounded-md hover:border-amber-500 hover:text-amber-200 transition-colors"
                    : item.accent
                      ? "px-3 py-2 border border-zinc-700 text-zinc-200 font-semibold rounded-md hover:border-amber-500 hover:text-amber-200 transition-colors"
                      : "text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                }
              >
                {item.name}
              </Link>
            ))}

            {/* Discord Icon Link (Desktop) */}
            <a
              href="https://discord.gg/hW4dmajPkS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-[#5865F2] transition-colors"
              title="Join Discord Community"
              aria-label="Join Discord Community"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-2.05-9.12-5.594-13.682a.074.074 0 0 0-.033-.027ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419Z" />
              </svg>
            </a>

            {/* Saved Bands link with badge */}
            <Link
              href="/my-bands"
              className="flex items-center gap-2 text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              Saved Bands
              {savedCount > 0 && (
                <span className="px-2 py-1 bg-zinc-800 text-amber-200 rounded-md text-xs font-bold">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-zinc-300 hover:bg-zinc-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-zinc-800">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={
                    item.highlight
                      ? "px-4 py-2 border border-zinc-700 text-zinc-100 font-semibold rounded-md hover:border-amber-500 hover:text-amber-200 transition-colors"
                      : item.accent
                        ? "px-4 py-2 border border-zinc-700 text-zinc-200 font-semibold rounded-md hover:border-amber-500 hover:text-amber-200 transition-colors"
                        : "text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Discord Link (Mobile) */}
              <a
                href="https://discord.gg/hW4dmajPkS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-2.05-9.12-5.594-13.682a.074.074 0 0 0-.033-.027ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419Z" />
                </svg>
                Discord Community
              </a>

              {/* Saved Bands link with badge (mobile) */}
              <Link
                href="/my-bands"
                className="flex items-center gap-2 text-zinc-300 hover:text-zinc-100 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                Saved Bands
                {savedCount > 0 && (
                  <span className="px-2 py-1 bg-zinc-800 text-amber-200 rounded-md text-xs font-bold">
                    {savedCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
