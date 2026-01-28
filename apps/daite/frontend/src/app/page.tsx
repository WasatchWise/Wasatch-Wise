'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Auth } from '../components/Auth'
import Image from 'next/image'
import Link from 'next/link'

function HomeContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check for auth messages/errors from URL
    const error = searchParams?.get('error')
    const message = searchParams?.get('message')
    if (error) {
      setAuthMessage(`Error: ${error}`)
      setShowAuth(true)
    } else if (message) {
      setAuthMessage(message)
      setShowAuth(true)
    }

    // Check for existing session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user)
          window.location.href = '/dashboard'
        }
      })
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          window.location.href = '/dashboard'
        }
      })
      
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [searchParams])

  const daiteTypes = [
    { prefix: 'Play', color: 'from-emerald-400 to-teal-400', description: 'Playdates & family connections' },
    { prefix: 'Jam', color: 'from-amber-400 to-orange-400', description: 'Music sessions & collaborations' },
    { prefix: 'Mate', color: 'from-rose-400 to-pink-400', description: 'Friendships that last' },
    { prefix: 'Create', color: 'from-violet-400 to-purple-400', description: 'Creative collaborators' },
    { prefix: 'Sweat', color: 'from-red-400 to-orange-400', description: 'Fitness & adventure partners' },
    { prefix: 'Trail', color: 'from-green-400 to-emerald-400', description: 'Hiking & outdoor adventures' },
    { prefix: 'Taste', color: 'from-yellow-400 to-amber-400', description: 'Foodies & culinary explorers' },
    { prefix: 'Game', color: 'from-blue-400 to-indigo-400', description: 'Gaming & board game nights' },
    { prefix: 'Soul', color: 'from-pink-400 to-rose-400', description: 'Deeper connections' },
    { prefix: 'Read', color: 'from-cyan-400 to-blue-400', description: 'Book clubs & literary minds' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % daiteTypes.length)
        setIsAnimating(false)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [daiteTypes.length])

  const currentType = daiteTypes[currentIndex]

  if (showAuth) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowAuth(false)}
              className="text-stone-400 hover:text-white mb-4"
            >
              ← Back
            </button>
            <div className="flex items-center justify-center mb-4">
              <Image 
                src="/cyraino.png" 
                alt="CYRAiNO" 
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover mr-4 ring-4 ring-rose-500/30"
              />
              <h1 className="text-5xl font-light tracking-tight">DAiTE</h1>
            </div>
            <p className="text-stone-400">Your Personal CYRAiNO</p>
          </div>
          <Auth />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-xl border-b border-stone-900" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 touch-manipulation min-h-[44px] min-w-[44px] items-center justify-center">
            <span className="text-xl sm:text-2xl">🌸</span>
            <span className="text-lg sm:text-xl font-light tracking-tight">DAiTE</span>
          </Link>
          <button 
            onClick={() => setShowAuth(true)}
            className="px-4 sm:px-5 py-2 bg-white/10 active:bg-white/20 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero with rotating DAiTE types */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-20" style={{ paddingTop: 'calc(5rem + env(safe-area-inset-top))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className={`absolute top-1/3 left-1/3 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-[120px] transition-all duration-1000 bg-gradient-to-r ${currentType.color} opacity-20`} 
          />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-rose-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center w-full px-4">
          {/* CYRAiNO Logo */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="relative">
              <Image 
                src="/cyraino.png" 
                alt="CYRAiNO" 
                width={100}
                height={100}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover ring-2 sm:ring-4 ring-rose-500/20 shadow-2xl shadow-rose-500/10"
              />
            </div>
          </div>

          {/* Rotating DAiTE type */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center h-16 sm:h-20 md:h-24 overflow-hidden">
              <div 
                className={`
                  transition-all duration-200 ease-out
                  ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
                `}
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-none">
                  <span className={`bg-gradient-to-r ${currentType.color} bg-clip-text text-transparent`}>
                    {currentType.prefix}
                  </span>
                  <span className="text-white">DAiTE</span>
                </span>
              </div>
            </div>
            
            {/* Description that changes with type */}
            <p 
              className={`
                text-sm sm:text-base md:text-lg text-stone-400 mt-3 sm:mt-4 px-2 transition-all duration-200
                ${isAnimating ? 'opacity-0' : 'opacity-100'}
              `}
            >
              {currentType.description}
            </p>
          </div>

          {/* Main tagline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-stone-300 mb-4 sm:mb-6 leading-tight sm:leading-relaxed px-2">
            Helping humans
            <span className="block text-white">embrace.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-stone-500/80 font-light max-w-xl mx-auto mb-4 sm:mb-6 px-2 italic">
            DAiTE (抱いて) means &quot;embrace&quot; in Japanese—a name that emerged naturally, as if it was always meant to be.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-stone-500 font-light max-w-2xl mx-auto mb-8 sm:mb-12 px-2">
            Your CYRAiNO discovers meaningful connections through real conversation—not algorithms, not swipes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => setShowAuth(true)}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-stone-900 rounded-full font-medium 
                       hover:bg-rose-100 active:bg-rose-50 transition-all duration-300 flex items-center justify-center gap-3 min-h-[44px] touch-manipulation"
            >
              Create Your CYRAiNO
              <span className="group-hover:translate-x-1 transition-transform hidden sm:inline">→</span>
            </button>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-stone-400 hover:text-white active:text-white transition-colors text-center min-h-[44px] touch-manipulation"
            >
              See how it works
            </a>
          </div>

          {/* Type indicator dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-16 flex-wrap px-4">
            {daiteTypes.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentIndex(i)
                    setIsAnimating(false)
                  }, 200)
                }}
                className={`
                  rounded-full transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center
                  ${i === currentIndex 
                    ? 'bg-white w-8 h-2 sm:w-6 sm:h-2' 
                    : 'bg-stone-700 hover:bg-stone-500 active:bg-stone-400 w-2 h-2'}
                `}
                aria-label={`Switch to ${daiteTypes[i].prefix}DAiTE`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All DAiTE Types Grid */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 border-t border-stone-900" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-rose-400">Find Your People</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 sm:mt-4">Every Kind of DAiTE</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {daiteTypes.map((type, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentIndex(i)
                    setIsAnimating(false)
                  }, 200)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-stone-900/50 border border-stone-800 
                         active:border-stone-600 transition-all duration-300 text-left
                         active:transform active:scale-[0.98] touch-manipulation min-h-[100px] sm:min-h-[120px]"
              >
                <span className={`text-lg sm:text-xl md:text-2xl font-light bg-gradient-to-r ${type.color} bg-clip-text text-transparent block`}>
                  {type.prefix}
                </span>
                <span className="text-lg sm:text-xl md:text-2xl font-light text-stone-600 block">DAiTE</span>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-2 leading-tight">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-24 px-4 sm:px-6 bg-stone-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-rose-400">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 sm:mt-4">How DAiTE Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                number: '01',
                title: 'Create Your CYRAiNO',
                description: 'Share who you are—values, quirks, what you\'re looking for. Your CYRAiNO becomes your advocate.'
              },
              {
                number: '02',
                title: 'Agents Converse',
                description: 'Your CYRAiNO talks with others, finding compatibility through genuine dialogue.'
              },
              {
                number: '03',
                title: 'Discover & Embrace',
                description: 'When something resonates, you get a story—not a percentage—about why this person matters.'
              }
            ].map((step, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-stone-900/50 border border-stone-800">
                <span className="text-3xl sm:text-4xl font-light text-stone-700">{step.number}</span>
                <h3 className="text-lg sm:text-xl font-light mt-3 sm:mt-4 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CYRAiNO Origin */}
      <section className="py-12 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-rose-400">The Name</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 sm:mt-4">Why CYRAiNO</h2>
          </div>
          
          <div className="space-y-6 text-stone-400 font-light leading-relaxed">
            <p className="text-base sm:text-lg max-w-3xl mx-auto px-2">
              Cyrano de Bergerac was a poet who wrote beautiful love letters on behalf of others—eloquent, authentic, speaking what needed to be said even when he couldn&apos;t speak it for himself.
            </p>
            <p className="text-base sm:text-lg max-w-3xl mx-auto px-2">
              Your CYRAiNO does the same: it learns who you are and advocates for you, articulating your values and finding connections that align with what matters to you. Like the poet, it speaks on your behalf—but the connection, the embrace, happens between you and other people.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-stone-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight sm:leading-relaxed px-2">
            <span className="text-white">AI facilitates.</span>
            <br />
            <span className="text-rose-400">Humans connect.</span>
          </p>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-stone-500 max-w-2xl mx-auto px-2">
            CYRAiNO discovers compatibility—but real connections happen between you and other people.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-stone-950 to-stone-900" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 sm:mb-6 px-2">
            Ready for your first
            <span className={`block bg-gradient-to-r ${daiteTypes[currentIndex].color} bg-clip-text text-transparent`}>
              {daiteTypes[currentIndex].prefix}DAiTE?
            </span>
          </h2>
          <button 
            onClick={() => setShowAuth(true)}
            className="mt-6 sm:mt-8 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-rose-500 to-amber-500 
                     text-white rounded-full text-base sm:text-lg font-medium 
                     active:from-rose-400 active:to-amber-400 transition-all 
                     shadow-xl shadow-rose-500/25 touch-manipulation min-h-[44px]"
          >
            Create Your CYRAiNO →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-stone-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <span>🌸</span>
            <span className="font-light">DAiTE</span>
            <span className="text-stone-600">· Helping humans embrace.</span>
          </div>
          <p>© 2025 DAiTE</p>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
