'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { checkVibeCheckEligibility, runVibeCheck, type VibeCheckEligibility } from '@/services/vibeCheck'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Zap, Clock, Coins, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { CONNECTION_TYPES, ConnectionType } from './ConnectionTypesSelector'

interface VibeCheckModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (discoveries: any[]) => void
}

export function VibeCheckModal({ isOpen, onClose, onComplete }: VibeCheckModalProps) {
  const client = useSupabaseClient()
  const [eligibility, setEligibility] = useState<VibeCheckEligibility | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [vibeCheckType, setVibeCheckType] = useState<'standard' | 'extended'>('standard')
  const [selectedConnectionType, setSelectedConnectionType] = useState<string | null>(null)
  const [userConnectionTypes, setUserConnectionTypes] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen || !client) return

    const loadEligibility = async () => {
      setChecking(true)
      try {
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          onClose()
          return
        }
        setUserId(user.id)

        // Get user's connection types
        const { data: profile } = await client
          .from('user_profiles')
          .select('looking_for')
          .eq('user_id', user.id)
          .single()

        const types = (profile?.looking_for as string[]) || []
        setUserConnectionTypes(types)
        
        // Auto-select first connection type if user has preferences
        if (types.length > 0 && !selectedConnectionType) {
          setSelectedConnectionType(types[0])
        }

        const elig = await checkVibeCheckEligibility(user.id, vibeCheckType)
        setEligibility(elig)
      } catch (error) {
        console.error('Error checking eligibility:', error)
      } finally {
        setChecking(false)
      }
    }

    loadEligibility()
  }, [client, isOpen, vibeCheckType, selectedConnectionType, onClose])

  const handleRunVibeCheck = async () => {
    if (!userId || !eligibility?.canRun) return

    setRunning(true)
    setResult(null)

    try {
      const result = await runVibeCheck(userId, vibeCheckType, selectedConnectionType || undefined)
      setResult(result)

      if (result.success && result.discoveries) {
        setTimeout(() => {
          onComplete(result.discoveries || [])
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error running vibe check:', error)
      setResult({
        success: false,
        error: 'Failed to run vibe check'
      })
    } finally {
      setRunning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Run Vibe Check
            </CardTitle>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {checking ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-slate-400">Checking eligibility...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {result.success ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-400">Vibe Check Complete!</p>
                      <p className="text-sm text-slate-300">{result.message}</p>
                    </div>
                  </div>
                  {result.discoveries && result.discoveries.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Found {result.discoveries.length} potential connection(s)</p>
                      <p className="text-xs text-slate-500">Check your Discoveries page to see them!</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400">Vibe Check Failed</p>
                    <p className="text-sm text-slate-300">{result.error || result.message}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Connection Type Selection */}
              {userConnectionTypes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    What type of connection are you checking for?
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    Select a specific connection type to find matches for that relationship, or leave unselected for general compatibility.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedConnectionType(null)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedConnectionType === null
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm font-semibold">All Types</span>
                      <p className="text-xs text-slate-400 mt-1">General compatibility</p>
                    </button>
                    {userConnectionTypes.map((typeValue) => {
                      const type = CONNECTION_TYPES.find(t => t.value === typeValue)
                      if (!type) return null
                      const Icon = type.icon
                      return (
                        <button
                          key={typeValue}
                          onClick={() => setSelectedConnectionType(typeValue)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedConnectionType === typeValue
                              ? `border-purple-500 bg-gradient-to-br ${type.color} bg-opacity-20`
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${selectedConnectionType === typeValue ? 'text-purple-400' : 'text-slate-400'}`} />
                            <span className="text-sm font-semibold">{type.label}</span>
                          </div>
                          <p className="text-xs text-slate-400">{type.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Vibe Check Type Selection */}
              <div>
                <p className="text-sm font-medium mb-3">Vibe Check Type</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setVibeCheckType('standard')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      vibeCheckType === 'standard'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Standard</span>
                      <Badge variant="primary">10 tokens</Badge>
                    </div>
                    <p className="text-xs text-slate-400">3 candidate matches</p>
                  </button>
                  <button
                    onClick={() => setVibeCheckType('extended')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      vibeCheckType === 'extended'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Extended</span>
                      <Badge variant="primary">20 tokens</Badge>
                    </div>
                    <p className="text-xs text-slate-400">5 candidate matches</p>
                  </button>
                </div>
              </div>

              {/* Eligibility Status */}
              {eligibility && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">Token Balance</span>
                    </div>
                    <span className="font-semibold">
                      {eligibility.tokenBalance || 0} / {eligibility.tokensNeeded}
                    </span>
                  </div>

                  {eligibility.weeklyCount !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="text-sm">Weekly Vibe Checks</span>
                      </div>
                      <span className="font-semibold">
                        {eligibility.weeklyCount} / {eligibility.weeklyLimit}
                      </span>
                    </div>
                  )}

                  {eligibility.cooldownHours && eligibility.cooldownHours > 0 && (
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">Cooldown</span>
                      </div>
                      <span className="font-semibold">
                        {Math.ceil(eligibility.cooldownHours)}h remaining
                      </span>
                    </div>
                  )}

                  {eligibility.reasons.length > 0 && (
                    <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-400 mb-2">Requirements Not Met:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                        {eligibility.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRunVibeCheck}
                  disabled={!eligibility?.canRun || running}
                  className="flex-1"
                >
                  {running ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Vibe Check...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Vibe Check
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

