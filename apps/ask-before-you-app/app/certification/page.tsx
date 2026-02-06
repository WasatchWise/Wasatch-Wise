'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { getStoredPersona } from '@/lib/persona'

const MODULES = [
  {
    id: 0,
    title: 'Foundations',
    subtitle: 'The Why Behind Privacy',
    duration: '10 min',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
    badge: 'Privacy Guardian',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    hoverGradient: 'from-rose-400 via-pink-400 to-fuchsia-400',
    glowColor: 'rose',
    description: 'Real breach stories. Why privacy became your job.',
  },
  {
    id: 1,
    title: 'Document Anatomy',
    subtitle: 'The Traffic Light System',
    duration: '8 min',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z"/>
      </svg>
    ),
    badge: 'Classification Specialist',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    hoverGradient: 'from-cyan-400 via-teal-400 to-emerald-400',
    glowColor: 'teal',
    description: '6 checkpoints. Green, Yellow, or Red in seconds.',
  },
  {
    id: 2,
    title: 'DPA Workflow',
    subtitle: 'From Request to Approval',
    duration: '12 min',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
      </svg>
    ),
    badge: 'DPA Detective',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    hoverGradient: 'from-amber-400 via-orange-400 to-red-400',
    glowColor: 'orange',
    description: '3-hour struggles → 10-minute victories.',
  },
  {
    id: 3,
    title: 'Registry Ninja',
    subtitle: 'Advanced Search Mastery',
    duration: '12 min',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    ),
    badge: 'Registry Ninja',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    hoverGradient: 'from-violet-400 via-purple-400 to-indigo-400',
    glowColor: 'purple',
    description: 'Wildcards. Boolean. Find the unfindable.',
  },
  {
    id: 4,
    title: 'Crisis Mastery',
    subtitle: 'When Things Go Wrong',
    duration: '10 min',
    icon: (
      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    ),
    badge: 'DPA Master',
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    hoverGradient: 'from-red-400 via-rose-400 to-pink-400',
    glowColor: 'red',
    description: 'Shadow IT. Breaches. Vendor pressure. Handled.',
  },
]

const STATS = [
  { value: 50, label: 'Minutes', suffix: '' },
  { value: 95, label: 'Time Saved', suffix: '%' },
  { value: 77, label: 'Saved/Agreement', prefix: '$', suffix: 'K' },
  { value: 5, label: 'Badges', suffix: '' },
]

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{prefix}{count}{suffix}</span>
}

export default function CertificationPage() {
  const [selectedState] = useState('UT')
  const [hoveredModule, setHoveredModule] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [persona, setPersona] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    setPersona(getStoredPersona())
  }, [mounted])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#050508] text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Floating Particles */}
          {mounted && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Status Badge */}
            <div 
              className={`inline-flex items-center gap-3 px-5 py-2.5 mb-6 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 backdrop-blur-xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">Free Certification • No Account Required</span>
            </div>

            {/* Persona one-liner */}
            {persona && (
              <p className="text-sm text-cyan-200/90 max-w-xl mx-auto mb-10">
                {persona === 'educator' && <>As an educator, start with <strong>Module 1</strong> (Foundations) and work through in order.</>}
                {persona === 'administrator' && <>As an administrator, you might also want <Link href="/ecosystem" className="underline hover:text-white">State laws & procedures</Link> first—then come back here for the DPA workflow.</>}
                {persona === 'parent' && <>As a parent, the <Link href="/learn#apps" className="underline hover:text-white">Understand apps</Link> section on the hub is a great start; this certification is aimed at educators and admins.</>}
                {persona === 'student' && <>As a student, the <Link href="/learn#apps" className="underline hover:text-white">Knowledge hub</Link> explains what to ask and what your rights are; this course is for educators and admins.</>}
                {persona === 'just_learning' && <>Start with <strong>Module 1</strong> (Foundations) to get the big picture.</>}
              </p>
            )}

            {/* Main Title */}
            <h1 
              className={`text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <span className="block text-white mb-2">Master Student</span>
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Data Privacy
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-fuchsia-400/20 blur-2xl" />
              </span>
            </h1>

            <p 
              className={`text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              From uncertainty to{' '}
              <span className="text-white font-semibold">professional confidence</span>.
              <br className="hidden md:block" />
              <span className="text-gray-500">50 minutes. 5 modules. Complete mastery.</span>
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Link
                href={`/certification/module/0?state=${selectedState}`}
                className="group relative px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(139,92,246,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl" />
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Certification
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/ecosystem"
                className="group px-10 py-5 rounded-2xl font-semibold text-gray-300 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
              >
                Explore State Resources
              </Link>
            </div>

            {/* Stats */}
            <div 
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500"
                >
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Journey */}
        <section className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Your{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Learning Path
                </span>
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Five modules. Each earns you a badge. Complete them all to become certified.
              </p>
            </div>

            {/* Module Cards - 3x2 Grid */}
            <div className="grid md:grid-cols-3 gap-5">
              {MODULES.map((module, i) => (
                <div
                  key={module.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  style={{
                    transitionDelay: `${i * 50}ms`
                  }}
                >
                  {/* Glow Effect */}
                  <div 
                    className={`absolute -inset-[1px] bg-gradient-to-br ${module.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}
                  />
                  
                  {/* Card */}
                  <div 
                    className={`relative h-full p-7 rounded-3xl bg-gradient-to-br ${module.gradient} overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1`}
                    style={{
                      transform: hoveredModule === module.id ? 'perspective(1000px) rotateX(2deg)' : 'perspective(1000px) rotateX(0deg)',
                    }}
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </div>

                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className="p-2.5 rounded-xl bg-white/20 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {module.icon}
                        </div>
                        <span className="px-3 py-1.5 bg-black/20 rounded-full text-xs font-bold backdrop-blur-sm">
                          {module.duration}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white/60 mb-1 tracking-wide">MODULE {module.id}</div>
                      <h3 className="text-xl font-bold mb-1 tracking-tight">{module.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{module.subtitle}</p>
                      <p className="text-white/60 text-sm leading-relaxed">{module.description}</p>

                      {/* Badge */}
                      <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                        <span className="text-yellow-300">★</span>
                        {module.badge}
                      </div>

                      {/* Start module + Take Quiz */}
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/certification/module/${module.id}?state=${selectedState}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-sm font-semibold backdrop-blur-sm transition-all"
                        >
                          Start module
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                        <Link
                          href={`/certification/quiz/${module.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium backdrop-blur-sm transition-all"
                        >
                          Take Quiz
                        </Link>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {/* Toolkit Card */}
              <Link
                href="/certification/toolkit"
                className="group relative"
              >
                <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500" />
                
                <div className="relative h-full p-7 rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  
                  <div className="relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/20 text-white mb-5 inline-block group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-white/60 mb-1 tracking-wide">RESOURCES</div>
                    <h3 className="text-xl font-bold mb-1 tracking-tight">Toolkit</h3>
                    <p className="text-white/70 text-sm mb-4">Everything you need</p>
                    <p className="text-white/60 text-sm leading-relaxed">Templates, checklists, scripts, and quick reference guides.</p>
                    
                    <div className="mt-5 flex flex-wrap gap-2">
                      {['Templates', 'Checklists', 'Scripts'].map(item => (
                        <span key={item} className="px-2.5 py-1 bg-black/20 rounded-full text-xs font-medium backdrop-blur-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-16 rounded-[2rem] overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20" />
              <div className="absolute inset-[1px] rounded-[2rem] bg-[#050508]/90 backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem]" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Ready to Become
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Certified?
                  </span>
                </h2>
                <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                  Join education professionals across the country who&apos;ve mastered student data privacy.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={`/certification/module/0?state=${selectedState}`}
                    className="group inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                  >
                    Start Now — It&apos;s Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/certification/certificate"
                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    View certificate →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600 text-sm">
              Built on the{' '}
              <a href="https://privacy.a4l.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                SDPC Framework
              </a>
              {' '}•{' '}
              <a href="https://a4l.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                A4L Community
              </a>
            </p>
          </div>
        </footer>

        {/* Global Styles for Animations */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            50% { transform: translateY(-100vh) translateX(20px); }
          }
        `}</style>
      </div>
    </>
  )
}
