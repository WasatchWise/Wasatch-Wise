'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'rocksalt_welcomed'

interface RoleCard {
  id: 'fan' | 'band' | 'venue'
  icon: string
  title: string
  tagline: string
  description: string
  cta: string
  href: string
  color: string
}

const roles: RoleCard[] = [
  {
    id: 'fan',
    icon: '🎸',
    title: "I'm a Fan",
    tagline: 'Gig guide access',
    description: 'Find shows, venue pages, and band entries without the feed layer.',
    cta: 'Open Gig Guide',
    href: '/events',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'band',
    icon: '🎤',
    title: "I'm a Band",
    tagline: 'Booking protocol',
    description: 'Create a Spider Rider with touring terms and generate booking contracts.',
    cta: 'Claim Band',
    href: '/bands',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'venue',
    icon: '🏛️',
    title: "I'm a Venue",
    tagline: 'Booking intake',
    description: 'Review Spider Riders, vet bands, and coordinate booking terms.',
    cta: 'Review Riders',
    href: '/book/spider-riders',
    color: 'from-amber-500 to-orange-600',
  },
]

export default function WelcomeModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has already been welcomed
    const hasBeenWelcomed = localStorage.getItem(STORAGE_KEY)
    if (!hasBeenWelcomed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleRoleSelect = (role: RoleCard) => {
    setSelectedRole(role.id)
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, role.id)
    // Brief delay to show selection, then navigate
    setTimeout(() => {
      setIsOpen(false)
      router.push(role.href)
    }, 300)
  }

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'skipped')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
            Welcome to The Rock Salt
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Utah music index and booking protocol
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-4 p-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`
                group relative text-left p-6 rounded-xl border-2 transition-all duration-200
                ${selectedRole === role.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.01]'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-xl bg-gradient-to-br ${role.color}
                flex items-center justify-center text-3xl mb-4
                group-hover:scale-110 transition-transform
              `}>
                {role.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {role.title}
              </h3>
              <p className={`text-sm font-semibold bg-gradient-to-r ${role.color} bg-clip-text text-transparent mb-3`}>
                {role.tagline}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {role.description}
              </p>

              {/* CTA */}
              <span className={`
                inline-flex items-center gap-1 text-sm font-semibold
                bg-gradient-to-r ${role.color} bg-clip-text text-transparent
                group-hover:gap-2 transition-all
              `}>
                {role.cta}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>

              {/* Selection indicator */}
              {selectedRole === role.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always explore everything from the menu
          </p>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
