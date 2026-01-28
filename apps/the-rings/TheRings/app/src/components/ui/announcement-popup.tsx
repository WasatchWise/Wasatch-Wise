'use client'

import { useState, useEffect } from 'react'

export function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed this announcement
    const dismissed = localStorage.getItem('nye-announcement-dismissed')
    if (dismissed) return

    // Show popup after a brief delay
    const timer = setTimeout(() => setIsOpen(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('nye-announcement-dismissed', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="relative max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300"
        style={{
          backgroundColor: 'var(--boxing-black)',
          border: '4px solid var(--boxing-gold)',
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.3)'
        }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-2xl hover:opacity-70 transition-opacity"
          style={{ color: 'var(--boxing-gold)' }}
        >
          ×
        </button>

        <div className="mb-4">
          <span className="text-4xl">🎉</span>
        </div>

        <p
          className="font-[family-name:var(--font-oswald)] text-xs tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--boxing-gold)' }}
        >
          Announcement
        </p>

        <h2
          className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-4"
          style={{ color: 'var(--boxing-cream)' }}
        >
          New Year's Eve<br />Sleepover Extravaganza
        </h2>

        <p
          className="font-[family-name:var(--font-playfair)] text-sm mb-6"
          style={{ color: 'var(--boxing-sepia)' }}
        >
          More details to come!
        </p>

        <a
          href="#join"
          onClick={handleDismiss}
          className="inline-block px-6 py-3 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--boxing-gold)',
            color: 'var(--boxing-black)'
          }}
        >
          Join Our Mailing List
        </a>
      </div>
    </div>
  )
}
