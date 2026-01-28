'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { COURSE_MODULES } from '@/lib/certification/course-content'

// Badge unlock celebration component
function BadgeUnlockCelebration({ badge, onClose }: { badge: { emoji: string; name: string }; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/30 animate-in zoom-in-95 duration-500">
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="text-8xl mb-6 animate-bounce">{badge.emoji}</div>
          <h2 className="text-3xl font-black text-white mb-2">Badge Unlocked!</h2>
          <p className="text-xl text-amber-400 font-bold mb-6">{badge.name}</p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  )
}

// Progress persistence using localStorage
function useProgress(moduleId: number) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`certification-progress-${moduleId}`)
    if (saved) {
      setCompletedLessons(JSON.parse(saved))
    }
    setLoaded(true)
  }, [moduleId])

  const markComplete = useCallback((lessonId: string) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev
      const updated = [...prev, lessonId]
      localStorage.setItem(`certification-progress-${moduleId}`, JSON.stringify(updated))
      return updated
    })
  }, [moduleId])

  return { completedLessons, markComplete, loaded }
}

// Reading time tracker
function useReadingProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight - winHeight
      const scrolled = window.scrollY
      setScrollProgress(Math.min((scrolled / docHeight) * 100, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollProgress
}

export default function ModulePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const moduleId = parseInt(params.moduleId as string)
  const state = searchParams.get('state') || 'UT'
  
  const [currentLesson, setCurrentLesson] = useState(0)
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false)
  const { completedLessons, markComplete, loaded } = useProgress(moduleId)
  const scrollProgress = useReadingProgress()

  const module = COURSE_MODULES.find(m => m.id === moduleId)
  const isLastModule = moduleId === COURSE_MODULES.length - 1

  if (!module) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Module Not Found</h1>
          <Link href="/certification" className="text-violet-400 hover:underline">
            Return to Course
          </Link>
        </div>
      </div>
    )
  }

  const lesson = module.lessons[currentLesson]
  const isLastLesson = currentLesson === module.lessons.length - 1
  const allLessonsComplete = loaded && module.lessons.every(l => completedLessons.includes(l.id))
  const progressPercent = loaded ? (completedLessons.length / module.lessons.length) * 100 : 0

  const handleMarkComplete = () => {
    markComplete(lesson.id)
    
    // Check if this completes the module
    const willBeComplete = module.lessons.every(l => 
      l.id === lesson.id || completedLessons.includes(l.id)
    )
    
    if (willBeComplete) {
      setShowBadgeUnlock(true)
    }
  }

  const nextLesson = () => {
    handleMarkComplete()
    if (currentLesson < module.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Badge Unlock Celebration */}
      {showBadgeUnlock && (
        <BadgeUnlockCelebration 
          badge={module.badge} 
          onClose={() => setShowBadgeUnlock(false)} 
        />
      )}

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[60]">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-[#050508] text-white">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        {/* Header */}
        <header className="sticky top-1 z-50 bg-[#050508]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-5">
                <Link 
                  href="/certification" 
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Module {module.id}</p>
                  <h1 className="text-base sm:text-lg font-bold text-white">{module.title}</h1>
                </div>
              </div>
              
              {/* Progress */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-sm font-bold text-white">{completedLessons.length}/{module.lessons.length}</p>
                  </div>
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className={`p-2 rounded-xl border transition-all duration-500 ${
                  allLessonsComplete 
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                    : 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/20'
                }`}>
                  <span className="text-xl">{module.badge.emoji}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-28">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Lessons</h3>
                <nav className="space-y-2">
                  {module.lessons.map((l, idx) => {
                    const isActive = idx === currentLesson
                    const isComplete = completedLessons.includes(l.id)
                    
                    return (
                      <button
                        key={l.id}
                        onClick={() => setCurrentLesson(idx)}
                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/5'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                            isComplete 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : isActive 
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'bg-white/10 text-gray-500'
                          }`}>
                            {isComplete ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                              {l.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">Lesson {l.id}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
                
                {/* Badge Preview */}
                <div className={`mt-8 p-5 rounded-2xl border transition-all duration-500 ${
                  allLessonsComplete
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-2xl transition-transform ${allLessonsComplete ? 'animate-bounce' : ''}`}>
                      {module.badge.emoji}
                    </span>
                    <div>
                      <p className="text-xs text-amber-400/70">
                        {allLessonsComplete ? 'Badge Earned!' : 'Complete to Earn'}
                      </p>
                      <p className="text-sm font-bold text-white">{module.badge.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {module.lessons.map((l, idx) => (
                      <div 
                        key={idx} 
                        className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                          completedLessons.includes(l.id)
                            ? 'bg-amber-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Navigation to Other Modules */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-500 mb-3">All Modules</p>
                  <div className="flex flex-wrap gap-2">
                    {COURSE_MODULES.map(m => (
                      <Link
                        key={m.id}
                        href={`/certification/module/${m.id}?state=${state}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          m.id === moduleId
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                        }`}
                        title={m.title}
                      >
                        {m.badge.emoji}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Mobile Lesson Tabs */}
              <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                {module.lessons.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => setCurrentLesson(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      idx === currentLesson
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : completedLessons.includes(l.id)
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {completedLessons.includes(l.id) && '✓ '}
                    {l.id}
                  </button>
                ))}
              </div>

              {/* Lesson Header */}
              <div className="mb-8 sm:mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-4">
                  <span>Lesson {lesson.id}</span>
                  <span className="w-1 h-1 rounded-full bg-violet-400/50" />
                  <span>{module.duration}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">{lesson.title}</h2>
              </div>

              {/* Content */}
              <article className="prose-custom">
                <ReactMarkdown
                  components={{
                    h2: ({children}) => (
                      <h2 className="text-xl sm:text-2xl font-bold text-white mt-12 sm:mt-16 mb-6 flex items-center gap-3">
                        <span className="w-1 h-6 sm:h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full flex-shrink-0" />
                        <span>{children}</span>
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mt-8 sm:mt-10 mb-4">{children}</h3>
                    ),
                    p: ({children}) => (
                      <p className="text-gray-300 leading-relaxed mb-5 text-base sm:text-lg">{children}</p>
                    ),
                    strong: ({children}) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                    em: ({children}) => (
                      <em className="text-gray-400 italic">{children}</em>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="relative my-6 sm:my-8 pl-4 sm:pl-6 py-4 border-l-2 border-violet-500 bg-gradient-to-r from-violet-500/10 to-transparent rounded-r-xl">
                        <div className="text-gray-300 italic text-base sm:text-lg">{children}</div>
                      </blockquote>
                    ),
                    ul: ({children}) => (
                      <ul className="my-4 sm:my-6 space-y-2 sm:space-y-3">{children}</ul>
                    ),
                    ol: ({children}) => (
                      <ol className="my-4 sm:my-6 space-y-2 sm:space-y-3 list-decimal list-inside">{children}</ol>
                    ),
                    li: ({children}) => (
                      <li className="flex items-start gap-3 text-gray-300 text-base sm:text-lg">
                        <span className="w-2 h-2 rounded-full bg-violet-500 mt-2 sm:mt-2.5 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    hr: () => (
                      <hr className="my-10 sm:my-12 border-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    ),
                    table: ({children}) => (
                      <div className="my-6 sm:my-8 overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => (
                      <thead className="bg-white/5 border-b border-white/10">{children}</thead>
                    ),
                    th: ({children}) => (
                      <th className="text-left text-white font-semibold px-4 sm:px-5 py-3 sm:py-4 text-sm">{children}</th>
                    ),
                    td: ({children}) => (
                      <td className="text-gray-300 px-4 sm:px-5 py-3 sm:py-4 border-t border-white/5 text-sm sm:text-base">{children}</td>
                    ),
                    code: ({children}) => (
                      <code className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-sm font-mono">{children}</code>
                    ),
                    a: ({href, children}) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors">{children}</a>
                    ),
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              </article>

              {/* Navigation Footer */}
              <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={prevLesson}
                    disabled={currentLesson === 0}
                    className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {isLastLesson ? (
                    allLessonsComplete ? (
                      isLastModule ? (
                        <Link
                          href="/certification"
                          className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
                        >
                          <span className="text-lg">🎓</span>
                          Complete Course
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      ) : (
                        <Link
                          href={`/certification/module/${moduleId + 1}?state=${state}`}
                          className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
                        >
                          Next Module
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      )
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
                      >
                        Complete & Earn Badge
                        <span className="text-lg group-hover:scale-125 transition-transform">{module.badge.emoji}</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={nextLesson}
                      className="group flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
                    >
                      Next Lesson
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Module Quick Stats - Mobile */}
              <div className="lg:hidden mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{module.badge.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-500">
                        {allLessonsComplete ? 'Completed!' : 'In Progress'}
                      </p>
                      <p className="text-sm font-medium text-white">{module.badge.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {module.lessons.map((l, idx) => (
                      <div 
                        key={idx} 
                        className={`w-6 h-1.5 rounded-full transition-colors ${
                          completedLessons.includes(l.id) ? 'bg-amber-500' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
