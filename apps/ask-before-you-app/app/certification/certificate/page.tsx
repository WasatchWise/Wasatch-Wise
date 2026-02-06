'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { QUIZ_BY_MODULE, isCertificationComplete, CERT_STORAGE_KEY_PREFIX } from '@/lib/certification/quiz-questions'

const CERT_NAME_KEY = 'abya_certificate_name'

export default function CertificatePage() {
  const [complete, setComplete] = useState(false)
  const [name, setName] = useState('')
  const [savedName, setSavedName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setComplete(isCertificationComplete())
    setSavedName(typeof window !== 'undefined' ? localStorage.getItem(CERT_NAME_KEY) || '' : '')
  }, [mounted])

  const handleSaveName = () => {
    if (typeof window === 'undefined') return
    const trimmed = name.trim()
    if (trimmed) {
      localStorage.setItem(CERT_NAME_KEY, trimmed)
      setSavedName(trimmed)
    }
  }

  if (!mounted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </>
    )
  }

  if (!complete) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#050508] text-white">
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Complete All Module Quizzes</h1>
            <p className="text-gray-400 mb-8">
              Pass the quiz for each of the 5 modules (80% or higher) to unlock your certificate.
            </p>
            <div className="grid gap-3 text-left">
              {QUIZ_BY_MODULE.map((m) => {
                const passed =
                  typeof window !== 'undefined' &&
                  localStorage.getItem(`${CERT_STORAGE_KEY_PREFIX}${m.moduleId}`) === 'true'
                return (
                  <Link
                    key={m.moduleId}
                    href={`/certification/quiz/${m.moduleId}`}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <span>Module {m.moduleId}: {m.moduleTitle}</span>
                    {passed ? <span className="text-emerald-400">✓ Passed</span> : <span className="text-gray-500">Take quiz →</span>}
                  </Link>
                )
              })}
            </div>
            <Link href="/certification" className="inline-block mt-8 text-gray-400 hover:text-white text-sm">
              ← Back to Certification
            </Link>
          </div>
        </div>
      </>
    )
  }

  const displayName = savedName || name.trim() || 'Certified Professional'
  const completionDate = typeof window !== 'undefined' ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#050508] text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {!savedName ? (
            <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-sm font-medium text-gray-400 mb-2">Your name (for the certificate)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  onClick={handleSaveName}
                  className="px-5 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 font-semibold"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">Certificate for <strong className="text-white">{savedName}</strong>. <button type="button" onClick={() => { localStorage.removeItem(CERT_NAME_KEY); setSavedName(''); setName(''); }} className="text-violet-400 hover:underline">Change</button></p>
          )}

          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-orange-500/10 p-8 sm:p-12 text-center">
            <p className="text-amber-400 text-sm font-semibold tracking-wide mb-2">ASK BEFORE YOU APP</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">NDPA Certification</h1>
            <p className="text-gray-300 mb-6">Student Data Privacy — SDPC-Aligned</p>
            <p className="text-xl sm:text-2xl font-semibold text-white mb-2">{displayName}</p>
            <p className="text-gray-400 text-sm mb-8">Completed {completionDate}</p>
            <ul className="text-left inline-block text-sm text-gray-400 space-y-1 mb-8">
              {QUIZ_BY_MODULE.map((m) => (
                <li key={m.moduleId}>✓ {m.moduleTitle}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500">Built on the SDPC framework • privacy.a4l.org • Ask Before You App</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-medium"
            >
              Print / Save as PDF
            </button>
            <Link href="/certification" className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 font-medium">
              Back to Certification
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
