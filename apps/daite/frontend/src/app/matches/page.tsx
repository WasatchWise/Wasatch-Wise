'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { Heart, MessageCircle, Calendar, Star, Search } from 'lucide-react'
import { ConciergeServiceModal } from '@/components/ConciergeServiceModal'

interface Match {
  id: string
  user_1_id: string
  user_2_id: string
  relationship_stage: string
  created_at: string
  otherUser: {
    pseudonym: string
    agentName: string
  }
  discovery: {
    narrative_excerpt?: string
    compatibility_highlights?: any
  }
  compatibility: number
  sharedValues: string[]
}

export default function MatchesPage() {
  const router = useRouter()
  const client = useSupabaseClient()
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showCompatibilityDeepDive, setShowCompatibilityDeepDive] = useState(false)
  const [selectedMatchForDeepDive, setSelectedMatchForDeepDive] = useState<Match | null>(null)

  useEffect(() => {
    if (!client) return

    const loadMatches = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUserId(user.id)

        // Fetch matches
        const { data: matchesData, error } = await client
          .from('matches')
          .select(`
            id,
            user_1_id,
            user_2_id,
            relationship_stage,
            created_at,
            discovery_id,
            discoveries (
              narrative_excerpt,
              compatibility_highlights
            )
          `)
          .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (matchesData) {
          // Get user details for each match
          const matchesWithUsers = await Promise.all(
            matchesData.map(async (match) => {
              const otherUserId = match.user_1_id === user.id ? match.user_2_id : match.user_1_id
              
              const [userResult, agentResult] = await Promise.all([
                client
                  .from('users')
                  .select('pseudonym')
                  .eq('id', otherUserId)
                  .single(),
                client
                  .from('cyraino_agents')
                  .select('name')
                  .eq('user_id', otherUserId)
                  .single()
              ])

              // Handle discoveries as array (Supabase relationship queries return arrays)
              const discovery = Array.isArray(match.discoveries) ? match.discoveries[0] : match.discoveries
              const compatibility = (discovery as any)?.compatibility_highlights?.score || 
                                 (discovery as any)?.compatibility_highlights?.compatibilityScore || 85

              return {
                id: match.id,
                user_1_id: match.user_1_id,
                user_2_id: match.user_2_id,
                relationship_stage: match.relationship_stage,
                created_at: match.created_at,
                otherUser: {
                  pseudonym: userResult.data?.pseudonym || 'Anonymous',
                  agentName: agentResult.data?.name || 'CYRAiNO'
                },
                discovery: discovery || {},
                compatibility: typeof compatibility === 'number' ? compatibility : 85,
                sharedValues: (discovery as any)?.compatibility_highlights?.sharedValues || []
              }
            })
          )

          setMatches(matchesWithUsers)
        }
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [client, router])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const mutualMatches = matches.filter(m => m.relationship_stage === 'matched' || m.relationship_stage === 'dating')
  const avgCompatibility = matches.length > 0
    ? Math.round(matches.reduce((acc, m) => acc + m.compatibility, 0) / matches.length)
    : 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Connections
            </h1>
            <p className="text-slate-400">
              Meaningful connections discovered through CYRAiNO conversations
            </p>
          </div>

          {/* Match Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Matches</p>
                  <p className="text-3xl font-bold">{loading ? '...' : matches.length}</p>
                </div>
                <Heart className="w-8 h-8 text-pink-400" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Mutual Matches</p>
                  <p className="text-3xl font-bold">{loading ? '...' : mutualMatches.length}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg. Compatibility</p>
                  <p className="text-3xl font-bold">{loading ? '...' : avgCompatibility}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
              </CardContent>
            </Card>
          </div>

          {/* Matches Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No connections yet</p>
              <p className="text-slate-500 text-sm mb-6">Start discovering to find your people!</p>
              <Link href="/discover">
                <Button variant="primary">Start Discovering</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
            <Card
              key={match.id}
              hover
              onClick={() => setSelectedMatch(match.id)}
              className={selectedMatch === match.id ? 'ring-2 ring-purple-500' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{match.otherUser.pseudonym}</CardTitle>
                    <p className="text-sm text-purple-400 mt-1">Matched with {match.otherUser.agentName}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(match.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {match.compatibility}%
                    </div>
                    <Badge variant={match.relationship_stage === 'matched' ? 'success' : 'warning'} className="mt-2">
                      {match.relationship_stage}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Poetic Narrative */}
                {match.discovery.narrative_excerpt && (
                  <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-slate-200 italic leading-relaxed">
                      &ldquo;{match.discovery.narrative_excerpt}&rdquo;
                    </p>
                  </div>
                )}
                
                {/* Shared Values */}
                {match.sharedValues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Shared Values</p>
                    <div className="flex flex-wrap gap-2">
                      {match.sharedValues.map((value, idx) => (
                        <Badge key={idx} variant="primary">{value}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Link href={`/messages?match=${match.id}`} className="flex-1">
                    <Button variant="primary" className="w-full" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                  <Link href={`/dates?match=${match.id}`}>
                    <Button variant="secondary" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Plan Date
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMatchForDeepDive(match)
                      setShowCompatibilityDeepDive(true)
                    }}
                    title="Compatibility Deep Dive"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}

          {/* Compatibility Deep Dive Modal */}
          <ConciergeServiceModal
            serviceType="compatibility_deep_dive"
            isOpen={showCompatibilityDeepDive}
            onClose={() => {
              setShowCompatibilityDeepDive(false)
              setSelectedMatchForDeepDive(null)
            }}
            contextData={{
              match: selectedMatchForDeepDive,
              discovery: selectedMatchForDeepDive?.discovery
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

