'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, Loader2, Coins } from 'lucide-react'

interface Challenge {
  id: string
  name: string
  description: string
  questions: any[]
  token_cost: number
  token_reward: number
  badge?: {
    id: string
    name: string
  }
}

interface ChallengeModalProps {
  challenge: Challenge | null
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function ChallengeModal({ challenge, isOpen, onClose, onComplete }: ChallengeModalProps) {
  const client = useSupabaseClient()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  if (!isOpen || !challenge) return null

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!client) return

    setSubmitting(true)
    try {
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      // Calculate score
      let totalScore = 0
      let maxScore = 0
      
      challenge.questions.forEach((question, qIdx) => {
        maxScore += 10 // Assuming max score per question is 10
        const answerIdx = answers[qIdx]
        if (answerIdx !== undefined && question.options[answerIdx]) {
          totalScore += question.options[answerIdx].score || 0
        }
      })

      const percentageScore = Math.round((totalScore / maxScore) * 100)

      // Call the complete_challenge function
      const { data, error } = await client.rpc('complete_challenge', {
        p_user_id: user.id,
        p_challenge_id: challenge.id,
        p_score: percentageScore,
        p_answers: answers
      })

      if (error) throw error

      setResult({
        success: true,
        score: percentageScore,
        passed: percentageScore >= 70,
        badge_awarded: data?.badge_awarded || false,
        tokens_earned: data?.tokens_earned || 0
      })

      if (data?.success) {
        setTimeout(() => {
          onComplete()
          onClose()
        }, 3000)
      }
    } catch (error) {
      console.error('Error submitting challenge:', error)
      setResult({
        success: false,
        error: 'Failed to submit challenge'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const currentQ = challenge.questions[currentQuestion]
  const allAnswered = challenge.questions.every((_, idx) => answers[idx] !== undefined)
  const isLastQuestion = currentQuestion === challenge.questions.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{challenge.name}</CardTitle>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {result ? (
            <div className="space-y-4">
              {result.success && result.passed ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-400">Challenge Passed!</p>
                      <p className="text-sm text-slate-300">Score: {result.score}%</p>
                    </div>
                  </div>
                  {result.badge_awarded && (
                    <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                      <p className="text-sm text-purple-400 mb-2">🎉 You earned a badge!</p>
                      <p className="font-semibold">{challenge.badge?.name}</p>
                    </div>
                  )}
                  {result.tokens_earned > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">Earned {result.tokens_earned} tokens!</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400">Challenge Not Passed</p>
                    <p className="text-sm text-slate-300">Score: {result.score}% (Need 70% to pass)</p>
                    <p className="text-xs text-slate-400 mt-1">You can try again anytime!</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">
                    Question {currentQuestion + 1} of {challenge.questions.length}
                  </span>
                  <Badge variant="primary">
                    {challenge.token_cost} tokens
                  </Badge>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / challenge.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{currentQ.question}</h3>
                
                <div className="space-y-2">
                  {currentQ.options?.map((option: any, optIdx: number) => (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(currentQuestion, optIdx)}
                      className={`
                        w-full p-4 text-left rounded-lg border-2 transition-all
                        ${answers[currentQuestion] === optIdx
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                        }
                      `}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                {currentQuestion > 0 && (
                  <Button variant="ghost" onClick={handlePrevious} className="flex-1">
                    Previous
                  </Button>
                )}
                {!isLastQuestion ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={answers[currentQuestion] === undefined}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Challenge'
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

