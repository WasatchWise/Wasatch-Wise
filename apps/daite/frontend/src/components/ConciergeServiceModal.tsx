'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { requestConciergeService, processConciergeService, type ConciergeService } from '@/services/concierge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  Search, 
  Image, 
  Sparkles, 
  Heart, 
  TrendingUp,
  Coins,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ConciergeServiceModalProps {
  serviceType: string
  isOpen: boolean
  onClose: () => void
  contextData?: any
  inputData?: any
}

const serviceIcons: Record<string, any> = {
  profile_review: UserCheck,
  message_coaching: MessageSquare,
  date_planning: Calendar,
  compatibility_deep_dive: Search,
  photo_review: Image,
  conversation_starter: Sparkles,
  relationship_advice: Heart,
  profile_optimization: TrendingUp
}

export function ConciergeServiceModal({ 
  serviceType, 
  isOpen, 
  onClose, 
  contextData,
  inputData 
}: ConciergeServiceModalProps) {
  const client = useSupabaseClient()
  const [service, setService] = useState<ConciergeService | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [userInput, setUserInput] = useState(inputData || {})

  useEffect(() => {
    if (!isOpen || !client) return

    const loadService = async () => {
      try {
        setLoading(true)
        
        // Get service details
        const { data: services } = await client
          .from('concierge_services')
          .select('*')
          .eq('service_type', serviceType)
          .eq('is_active', true)
          .single()

        if (services) {
          setService(services)
        }

        // Get token balance
        const { data: { user } } = await client.auth.getUser()
        if (user) {
          const { data: balance } = await client
            .from('token_balances')
            .select('balance')
            .eq('user_id', user.id)
            .single()

          setTokenBalance(balance?.balance || 0)
        }
      } catch (error) {
        console.error('Error loading service:', error)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [client, isOpen, serviceType])

  const handleRequestService = async () => {
    if (!service) return

    if (tokenBalance < service.token_cost) {
      setError(`You need ${service.token_cost} tokens. You have ${tokenBalance}.`)
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Request the service
      const requestResult = await requestConciergeService(
        service.id,
        userInput,
        contextData
      )

      if (!requestResult.success || !requestResult.requestId) {
        throw new Error(requestResult.error || 'Failed to request service')
      }

      // Process with AI
      const processResult = await processConciergeService(
        requestResult.requestId,
        serviceType,
        userInput,
        contextData
      )

      if (!processResult.success) {
        throw new Error(processResult.error || 'Failed to process service')
      }

      setResult(processResult.output)
      setTokenBalance(prev => prev - service.token_cost)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  const Icon = service ? serviceIcons[serviceType] || Sparkles : Sparkles

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {service && (
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
              )}
              <CardTitle className="text-2xl">
                {service?.name || 'Concierge Service'}
              </CardTitle>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-slate-400">Loading service...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">Error</p>
                <p className="text-sm text-slate-300">{error}</p>
              </div>
            </div>
          ) : result ? (
            <ServiceResult serviceType={serviceType} result={result} />
          ) : service ? (
            <>
              <div>
                <p className="text-slate-300 mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm">Cost</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{service.token_cost} tokens</span>
                    <span className="text-sm text-slate-400">You have: {tokenBalance}</span>
                  </div>
                </div>
              </div>

              {/* Service-specific input fields */}
              {serviceType === 'message_coaching' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Your Message</label>
                  <textarea
                    value={userInput.message || ''}
                    onChange={(e) => setUserInput({ ...userInput, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Type your message here..."
                  />
                </div>
              )}

              {serviceType === 'date_planning' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Preferences</label>
                  <textarea
                    value={userInput.preferences || ''}
                    onChange={(e) => setUserInput({ ...userInput, preferences: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Any preferences? (e.g., 'outdoor activities', 'quiet places', 'kid-friendly')"
                  />
                </div>
              )}

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
                  onClick={handleRequestService}
                  disabled={processing || tokenBalance < service.token_cost}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon className="w-4 h-4 mr-2" />
                      Use Service ({service.token_cost} tokens)
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function ServiceResult({ serviceType, result }: { serviceType: string; result: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-400" />
        <div>
          <p className="font-semibold text-green-400">Service Complete!</p>
          <p className="text-sm text-slate-300">Here are your results:</p>
        </div>
      </div>

      {serviceType === 'profile_review' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Overall Score: {result.overall_score}/100</h3>
          </div>
          {result.strengths && result.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-green-400 mb-2">Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.improvements && result.improvements.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-400 mb-2">Areas to Improve</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.improvements.map((i: string, idx: number) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-400 mb-2">Suggestions</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.suggestions.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {serviceType === 'message_coaching' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Improved Message:</p>
            <p className="text-slate-200 font-medium">{result.improved_message}</p>
          </div>
          {result.why_it_works && (
            <div>
              <h4 className="font-medium mb-2">Why This Works</h4>
              <p className="text-sm text-slate-300">{result.why_it_works}</p>
            </div>
          )}
          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.suggestions.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {serviceType === 'date_planning' && result.suggestions && (
        <div className="space-y-4">
          {result.suggestions.map((suggestion: any, i: number) => (
            <div key={i} className="p-4 bg-slate-700/30 rounded-lg">
              <h4 className="font-semibold mb-2">{suggestion.title}</h4>
              <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
              {suggestion.why_perfect && (
                <p className="text-xs text-purple-400">{suggestion.why_perfect}</p>
              )}
            </div>
          ))}
          {result.conversation_starters && result.conversation_starters.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Conversation Starters</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.conversation_starters.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {serviceType === 'compatibility_deep_dive' && (
        <div className="space-y-4">
          {result.compatibility_breakdown && (
            <div>
              <h4 className="font-medium mb-3">Compatibility Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.compatibility_breakdown).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400 capitalize">{key}</p>
                    <p className="text-2xl font-bold">{value}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.connection_strengths && result.connection_strengths.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Connection Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {result.connection_strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Add more result displays for other service types */}
    </div>
  )
}

