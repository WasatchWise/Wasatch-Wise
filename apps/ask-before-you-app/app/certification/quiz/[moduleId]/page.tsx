'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import {
  getQuizForModule,
  getRequiredCorrect,
  CERT_STORAGE_KEY_PREFIX,
  QUIZ_BY_MODULE,
  isCertificationComplete,
} from '@/lib/certification/quiz-questions'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = parseInt(params.moduleId as string)
  const quiz = getQuizForModule(moduleId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [passed, setPassed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!quiz) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Module not found</h1>
            <Link href="/certification" className="text-violet-400 hover:underline">Back to Certification</Link>
          </div>
        </div>
      </>
    )
  }

  const { questions, moduleTitle } = quiz
  const total = questions.length
  const required = getRequiredCorrect(total)
  const isLastQuestion = currentIndex === total - 1

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected(null)
    if (isLastQuestion) {
      const correct = newAnswers.filter((a, i) => a === questions[i].correctIndex).length
      setPassed(correct >= required)
      setSubmitted(true)
      if (correct >= required && mounted) {
        localStorage.setItem(`${CERT_STORAGE_KEY_PREFIX}${moduleId}`, 'true')
      }
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleRetake = () => {
    setCurrentIndex(0)
    setSelected(null)
    setAnswers([])
    setSubmitted(false)
    setPassed(false)
  }

  const currentQuestion = questions[currentIndex]

  if (submitted) {
    const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length
    const pct = Math.round((correctCount / total) * 100)

    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#050508] text-white">
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className={`rounded-2xl border p-8 text-center ${passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
              <h1 className="text-2xl font-bold mb-2">{passed ? 'Module Complete!' : 'Keep Learning'}</h1>
              <p className="text-gray-300 mb-6">
                You got <strong>{correctCount}</strong> of <strong>{total}</strong> correct ({pct}%).
                {passed ? ` You passed (need ${required}+).` : ` You need ${required} correct to pass (80%).`}
              </p>
              {passed ? (
                <div className="space-y-3">
                  {moduleId < QUIZ_BY_MODULE.length - 1 ? (
                    <Link
                      href={`/certification/quiz/${moduleId + 1}`}
                      className="block w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                    >
                      Next module quiz →
                    </Link>
                  ) : (
                    <Link
                      href="/certification/certificate"
                      className="block w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    >
                      Get your certificate →
                    </Link>
                  )}
                  <Link href={`/certification/module/${moduleId}`} className="block text-sm text-gray-400 hover:text-white">
                    Back to module content
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleRetake}
                    className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold"
                  >
                    Retake quiz
                  </button>
                  <Link href={`/certification/module/${moduleId}`} className="block text-sm text-gray-400 hover:text-white">
                    Review module content
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#050508] text-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/certification" className="text-gray-400 hover:text-white text-sm">← Certification</Link>
            <span className="text-gray-500 text-sm">Question {currentIndex + 1} of {total}</span>
          </div>
          <div className="mb-6 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <h1 className="text-lg text-violet-400 font-medium mb-1">{moduleTitle}</h1>
          <h2 className="text-xl sm:text-2xl font-bold mb-8">{currentQuestion.question}</h2>
          <ul className="space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => setSelected(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                    selected === idx
                      ? 'border-violet-500 bg-violet-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-3 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              {isLastQuestion ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
