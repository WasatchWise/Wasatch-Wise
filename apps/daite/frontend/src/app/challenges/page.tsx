'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BadgeDisplay } from '@/components/BadgeDisplay'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { 
  Brain, 
  ShieldCheck, 
  MessageCircle, 
  HeartHandshake, 
  TrendingUp, 
  Star, 
  Users,
  Award,
  Coins,
  CheckCircle
} from 'lucide-react'
import { ChallengeModal } from '@/components/ChallengeModal'

interface Challenge {
  id: string
  name: string
  description: string
  category: string
  token_cost: number
  token_reward: number
  badge?: {
    id: string
    name: string
    icon_name?: string
    color?: string
  }
  questions: any[]
}

interface UserBadge {
  id: string
  badge: {
    id: string
    name: string
    description: string
    category: string
    icon_name?: string
    color?: string
  }
  awarded_at: string
}

export default function ChallengesPage() {
  const router = useRouter()
  const client = useSupabaseClient()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    if (!client) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUserId(user.id)

        // Load challenges
        const { data: challengesData } = await client
          .from('challenges')
          .select(`
            id,
            name,
            description,
            category,
            token_cost,
            token_reward,
            questions,
            badge_id,
            badges (
              id,
              name,
              icon_name,
              color
            )
          `)
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (challengesData) {
          setChallenges(challengesData.map(c => ({
            ...c,
            badge: (c.badges as any)?.[0] || null
          })))
        }

        // Load user badges
        const { data: badgesData } = await client
          .from('user_badges')
          .select(`
            id,
            awarded_at,
            badges (
              id,
              name,
              description,
              category,
              icon_name,
              color
            )
          `)
          .eq('user_id', user.id)
          .eq('is_visible', true)
          .order('awarded_at', { ascending: false })

        if (badgesData) {
          setUserBadges(badgesData.map(b => ({
            ...b,
            badge: (b.badges as any) || null
          })))
        }

        // Load token balance
        const { data: balance } = await client
          .from('token_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        setTokenBalance(balance?.balance || 0)
      } catch (error) {
        console.error('Error loading challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [client, router])

  const handleStartChallenge = async (challenge: Challenge) => {
    if (tokenBalance < challenge.token_cost) {
      alert(`You need ${challenge.token_cost} tokens to take this challenge. You have ${tokenBalance}.`)
      return
    }

    if (!client || !currentUserId) return

    // Deduct tokens
    const { error: tokenError } = await client
      .from('token_balances')
      .update({ balance: tokenBalance - challenge.token_cost })
      .eq('user_id', currentUserId)

    if (tokenError) {
      alert('Failed to start challenge. Please try again.')
      return
    }

    // Record transaction
    await client
      .from('token_transactions')
      .insert({
        user_id: currentUserId,
        transaction_type: 'spend',
        amount: -challenge.token_cost,
        balance_after: tokenBalance - challenge.token_cost,
        context_type: 'challenge',
        context_id: challenge.id,
        description: `Challenge: ${challenge.name}`
      })

    setTokenBalance(prev => prev - challenge.token_cost)
    setSelectedChallenge(challenge)
  }

  const handleChallengeComplete = () => {
    // Reload data to show new badges
    window.location.reload()
  }

  const categoryIcons: Record<string, any> = {
    emotional_intelligence: Brain,
    conflict_management: ShieldCheck,
    communication: MessageCircle,
    empathy: HeartHandshake,
    growth: TrendingUp,
    accountability: Star,
    community: Users
  }

  const categoryLabels: Record<string, string> = {
    emotional_intelligence: 'Emotional Intelligence',
    conflict_management: 'Conflict Management',
    communication: 'Communication',
    empathy: 'Empathy',
    growth: 'Growth',
    accountability: 'Accountability',
    community: 'Community'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Challenges & Badges
            </h1>
            <p className="text-slate-400">
              Complete challenges to earn badges and showcase your growth
            </p>
          </div>

          {/* Token Balance */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-slate-400">Your Token Balance</p>
                      <p className="text-2xl font-bold">{tokenBalance}</p>
                    </div>
                  </div>
                  <Badge variant="primary">Available</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Badges */}
          {userBadges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
              <Card>
                <CardContent className="p-6">
                  <BadgeDisplay 
                    badges={userBadges.map(ub => ({
                      id: ub.badge.id,
                      name: ub.badge.name,
                      description: ub.badge.description,
                      category: ub.badge.category,
                      icon_name: ub.badge.icon_name,
                      color: ub.badge.color,
                      awarded_at: ub.awarded_at
                    }))}
                    size="lg"
                    showNames={true}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Available Challenges */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Challenges</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No challenges available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => {
                  const CategoryIcon = categoryIcons[challenge.category] || Award
                  const hasBadge = userBadges.some(ub => ub.badge.id === challenge.badge?.id)
                  
                  return (
                    <Card key={challenge.id} hover>
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${
                            challenge.badge?.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                            challenge.badge?.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                            challenge.badge?.color === 'pink' ? 'from-pink-500/20 to-pink-600/20' :
                            'from-purple-500/20 to-purple-600/20'
                          }`}>
                            <CategoryIcon className="w-6 h-6 text-purple-400" />
                          </div>
                          {hasBadge && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Earned
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{challenge.name}</CardTitle>
                        <CardDescription>{categoryLabels[challenge.category]}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-300">{challenge.description}</p>
                        
                        {challenge.badge && (
                          <div className="p-3 bg-slate-700/30 rounded-lg">
                            <p className="text-xs text-slate-400 mb-2">Earn this badge:</p>
                            <div className="flex items-center gap-2">
                              <BadgeDisplay 
                                badges={[{
                                  id: challenge.badge.id,
                                  name: challenge.badge.name,
                                  description: '',
                                  category: '',
                                  icon_name: challenge.badge.icon_name,
                                  color: challenge.badge.color
                                }]}
                                size="sm"
                              />
                              <span className="text-sm font-medium">{challenge.badge.name}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Coins className="w-4 h-4" />
                              <span>{challenge.token_cost}</span>
                            </div>
                            {challenge.token_reward > 0 && (
                              <div className="flex items-center gap-1 text-green-400">
                                <Coins className="w-4 h-4" />
                                <span>+{challenge.token_reward}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant={hasBadge ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => handleStartChallenge(challenge)}
                            disabled={hasBadge || tokenBalance < challenge.token_cost}
                          >
                            {hasBadge ? 'Completed' : 'Start Challenge'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Challenge Modal */}
          <ChallengeModal
            challenge={selectedChallenge}
            isOpen={!!selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
            onComplete={handleChallengeComplete}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

