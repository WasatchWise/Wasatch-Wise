'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  Target,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  User,
  Clock,
} from 'lucide-react'

interface PsychologyScore {
  conversionProbability: number
  priorityRank: 'A' | 'B' | 'C' | 'D'
  recommendedNEPQFocus: string
  keyInsight: string
  identityThreat: {
    total: number
    roleWeight: number
    visibilityWeight: number
    careerRiskWeight: number
    identityDimension: string
    triggers: string[]
  }
  lossFrame: {
    total: number
    stageWeight: number
    codeRiskWeight: number
    timelinePressureWeight: number
    financialExposureWeight: number
    lossMultiplier: number
    consequenceQuestions: string[]
  }
  selfMonitor: {
    profile: 'high' | 'low' | 'unknown'
    confidence: number
    indicators: string[]
    recommendedFraming: 'prestige' | 'reliability' | 'balanced'
    valuePropsToLead: string[]
    avoidPatterns: string[]
  }
  neurochemical: {
    dopamineState: string
    oxytocinLevel: string
    cortisolLevel: string
    serotoninNeed: string
    optimalApproach: string[]
    warningSignals: string[]
  }
  cognitiveLoad: {
    intrinsicLoad: string
    extraneousLoad: string
    germaneLoad: string
    decisionFatigueRisk: number
    simplificationNeeded: boolean
    recommendations: string[]
  }
}

interface ConsequenceQuestion {
  id: string
  category: string
  question: string
  followUp: string
  intensity: 'soft' | 'medium' | 'hard'
}

interface PsychologyData {
  psychologyScore: PsychologyScore
  consequenceQuestions: ConsequenceQuestion[]
  optimalSequence: {
    name: string
    description: string
    buildStrategy: string
    exitCriteria: string
  } | null
  contact: {
    id: string
    name: string
    title: string
    roleCategory: string
  } | null
}

interface Props {
  projectId: string
}

export function PsychologyScoreCard({ projectId }: Props) {
  const [data, setData] = useState<PsychologyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)

  const fetchPsychologyScore = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/projects/${projectId}/psychology`)

      if (!response.ok) {
        throw new Error('Failed to fetch psychology score')
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchPsychologyScore()
  }, [fetchPsychologyScore])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Analyzing behavioral signals...</span>
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {error || 'Unable to calculate psychology score'}
          </p>
          <Button onClick={fetchPsychologyScore} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  const { psychologyScore, consequenceQuestions, optimalSequence } = data
  const score = psychologyScore

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'A': return 'text-green-500 bg-green-100'
      case 'B': return 'text-blue-500 bg-blue-100'
      case 'C': return 'text-yellow-500 bg-yellow-100'
      case 'D': return 'text-red-500 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const getProfileLabel = (profile: string) => {
    switch (profile) {
      case 'high': return 'High Self-Monitor (Status-Driven)'
      case 'low': return 'Low Self-Monitor (Function-Driven)'
      default: return 'Profile Unknown'
    }
  }

  const getFramingEmoji = (framing: string) => {
    switch (framing) {
      case 'prestige': return '👑'
      case 'reliability': return '🛡️'
      default: return '⚖️'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Brain className="mr-2 h-5 w-5 text-purple-500" />
          Psychology Score
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Conversion Probability</p>
          <p className="text-3xl font-bold text-purple-600">{score.conversionProbability}%</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Priority Rank</p>
          <span className={`text-3xl font-bold px-3 py-1 rounded ${getRankColor(score.priorityRank)}`}>
            {score.priorityRank}
          </span>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Identity Threat</p>
          <p className="text-2xl font-bold text-orange-500">{score.identityThreat.total}</p>
          <p className="text-xs text-muted-foreground">/100</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Loss Frame</p>
          <p className="text-2xl font-bold text-red-500">{score.lossFrame.total}</p>
          <p className="text-xs text-muted-foreground">×{score.lossFrame.lossMultiplier.toFixed(1)} multiplier</p>
        </div>
      </div>

      {/* Key Insight */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Key Insight</p>
            <p className="text-sm text-amber-700 mt-1">{score.keyInsight}</p>
          </div>
        </div>
      </div>

      {/* Self-Monitor Profile */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-blue-800">{getProfileLabel(score.selfMonitor.profile)}</span>
            <span className="text-xl">{getFramingEmoji(score.selfMonitor.recommendedFraming)}</span>
          </div>
          <span className="text-sm text-blue-600">{score.selfMonitor.confidence}% confidence</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {score.selfMonitor.valuePropsToLead.map((prop, i) => (
            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              {prop}
            </span>
          ))}
        </div>
      </div>

      {/* Warning Signals */}
      {score.neurochemical.warningSignals.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Warning Signals</p>
              <ul className="text-sm text-red-700 mt-1 space-y-1">
                {score.neurochemical.warningSignals.map((signal, i) => (
                  <li key={i}>• {signal}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Consequence Questions Toggle */}
      <div className="mb-4">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setShowQuestions(!showQuestions)}
        >
          <span className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Consequence Questions ({consequenceQuestions.length})
          </span>
          {showQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showQuestions && (
          <div className="mt-4 space-y-4">
            {optimalSequence && (
              <div className="p-3 bg-purple-50 rounded-lg text-sm">
                <p className="font-semibold text-purple-800">{optimalSequence.name}</p>
                <p className="text-purple-600 mt-1">{optimalSequence.description}</p>
                <p className="text-purple-500 mt-2 text-xs">
                  <strong>Strategy:</strong> {optimalSequence.buildStrategy}
                </p>
              </div>
            )}

            {consequenceQuestions.map((q, i) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    q.intensity === 'hard' ? 'bg-red-100 text-red-700' :
                    q.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {q.intensity}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {q.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="font-medium text-sm">{q.question}</p>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Follow-up: {q.followUp}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-4 pt-4 border-t">
          {/* Identity Threat Breakdown */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Identity Threat Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Role Weight</p>
                <p className="font-bold">{score.identityThreat.roleWeight}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Visibility</p>
                <p className="font-bold">{score.identityThreat.visibilityWeight}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Career Risk</p>
                <p className="font-bold">{score.identityThreat.careerRiskWeight}</p>
              </div>
            </div>
            {score.identityThreat.triggers.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Identity Triggers:</p>
                <ul className="text-xs space-y-1">
                  {score.identityThreat.triggers.map((t, i) => (
                    <li key={i} className="text-green-700">✓ {t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Loss Frame Breakdown */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Loss Frame Breakdown
            </h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Stage</p>
                <p className="font-bold">{score.lossFrame.stageWeight}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Code Risk</p>
                <p className="font-bold">{score.lossFrame.codeRiskWeight}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Timeline</p>
                <p className="font-bold">{score.lossFrame.timelinePressureWeight}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Financial</p>
                <p className="font-bold">{score.lossFrame.financialExposureWeight}</p>
              </div>
            </div>
          </div>

          {/* Neurochemical State */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              Neurochemical State
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Dopamine</p>
                <p className="font-medium capitalize">{score.neurochemical.dopamineState}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Oxytocin</p>
                <p className="font-medium capitalize">{score.neurochemical.oxytocinLevel.replace(/_/g, ' ')}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Cortisol</p>
                <p className={`font-medium capitalize ${
                  score.neurochemical.cortisolLevel === 'fight_flight' ? 'text-red-500' : ''
                }`}>
                  {score.neurochemical.cortisolLevel.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-muted-foreground">Serotonin Need</p>
                <p className="font-medium capitalize">{score.neurochemical.serotoninNeed.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {score.neurochemical.optimalApproach.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Optimal Approach:</p>
                <ul className="text-xs space-y-1">
                  {score.neurochemical.optimalApproach.map((a, i) => (
                    <li key={i} className="text-blue-700">→ {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cognitive Load */}
          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Cognitive Load Assessment
            </h3>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-xs text-muted-foreground">Decision Fatigue Risk:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    score.cognitiveLoad.decisionFatigueRisk >= 60 ? 'bg-red-500' :
                    score.cognitiveLoad.decisionFatigueRisk >= 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${score.cognitiveLoad.decisionFatigueRisk}%` }}
                />
              </div>
              <span className="text-xs font-bold">{score.cognitiveLoad.decisionFatigueRisk}%</span>
            </div>
            {score.cognitiveLoad.recommendations.length > 0 && (
              <ul className="text-xs space-y-1">
                {score.cognitiveLoad.recommendations.map((r, i) => (
                  <li key={i} className="text-orange-700">⚠ {r}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommended NEPQ Focus */}
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-800">Recommended NEPQ Focus</p>
            <p className="text-sm text-green-700">{score.recommendedNEPQFocus}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
