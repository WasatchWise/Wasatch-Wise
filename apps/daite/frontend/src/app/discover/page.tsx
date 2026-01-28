'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProfileCardSkeleton } from '@/components/LoadingSkeleton'
import { VibeCheckModal } from '@/components/VibeCheckModal'
import { BadgeDisplay } from '@/components/BadgeDisplay'
import { ProfileConnectionTypes } from '@/components/ProfileConnectionTypes'
import { Sparkles, Zap, Loader2 } from 'lucide-react'

interface DiscoverProfile {
  id: string
  user_id: string
  pseudonym: string
  agentName: string
  persona: string
  values: string[]
  interests: string[]
  connectionTypes?: string[]
  compatibility?: number
  badges?: Array<{
    id: string
    name: string
    description: string
    category: string
    icon_name?: string
    color?: string
  }>
}

export default function DiscoverPage() {
  const router = useRouter()
  const client = useSupabaseClient()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeSearches: 0,
    potentialMatches: 0,
    vibeChecksToday: 0
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!client) return

    const loadDiscoverData = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUserId(user.id)

        // Get user's existing matches to exclude them
        const { data: existingMatches } = await client
          .from('matches')
          .select('user_1_id, user_2_id')
          .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
          .eq('is_active', true)

        const excludedUserIds = new Set([user.id])
        existingMatches?.forEach(match => {
          excludedUserIds.add(match.user_1_id)
          excludedUserIds.add(match.user_2_id)
        })

        // Fetch other users with profiles, agents, and badges
        const { data: usersData } = await client
          .from('users')
          .select(`
            id,
            pseudonym,
            user_profiles (
              bio,
              values,
              looking_for
            ),
            cyraino_agents (
              id,
              name,
              personality_traits
            ),
            user_badges (
              is_visible,
              badges (
                id,
                name,
                description,
                category,
                icon_name,
                color
              )
            )
          `)
          .neq('id', user.id)
          .eq('account_status', 'active')
          .limit(20)

        if (usersData) {
          const discoverProfiles: DiscoverProfile[] = usersData
            .filter(u => !excludedUserIds.has(u.id))
            .map(u => {
              const userBadges = (u.user_badges as any) || []
              const visibleBadges = userBadges
                .filter((ub: any) => ub.is_visible && ub.badges)
                .map((ub: any) => ({
                  id: ub.badges.id,
                  name: ub.badges.name,
                  description: ub.badges.description,
                  category: ub.badges.category,
                  icon_name: ub.badges.icon_name,
                  color: ub.badges.color
                }))

              return {
                id: u.id,
                user_id: u.id,
                pseudonym: u.pseudonym || 'Anonymous',
                agentName: (u.cyraino_agents as any)?.[0]?.name || 'CYRAiNO',
                persona: (u.cyraino_agents as any)?.[0]?.personality_traits?.persona || 
                         (u.user_profiles as any)?.bio || 
                         'A thoughtful person seeking meaningful connections',
                values: (u.user_profiles as any)?.values || [],
                interests: [], // This should be separate from looking_for
                connectionTypes: (u.user_profiles as any)?.looking_for || [],
                compatibility: Math.floor(Math.random() * 20) + 75, // Placeholder until we have real compatibility
                badges: visibleBadges
              }
            })
          
          setProfiles(discoverProfiles)
          setStats({
            activeSearches: discoverProfiles.length,
            potentialMatches: discoverProfiles.length,
            vibeChecksToday: 0 // TODO: Calculate from vibe_checks table
          })
        }
      } catch (error) {
        console.error('Error loading discover data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDiscoverData()
  }, [client, router])

  const [showVibeCheckModal, setShowVibeCheckModal] = useState(false)
  const [selectedProfileForVibeCheck, setSelectedProfileForVibeCheck] = useState<string | null>(null)

  const handleRunVibeCheck = async (profileId: string) => {
    setSelectedProfileForVibeCheck(profileId)
    setShowVibeCheckModal(true)
  }

  const handleVibeCheckComplete = (discoveries: any[]) => {
    // Refresh the discover page to show new discoveries
    // For now, we'll just close the modal and show a message
    setShowVibeCheckModal(false)
    setSelectedProfileForVibeCheck(null)
    // TODO: Navigate to discoveries or show notification
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Discover Connections
            </h1>
            <p className="text-slate-400">
              Find your people—friends, playdates, music partners, community, and more
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Searches</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.activeSearches}</p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Potential Matches</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.potentialMatches}</p>
                </div>
                <div className="p-3 bg-pink-600/20 rounded-lg">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Vibe Checks Today</p>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.vibeChecksToday}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discovery Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-4">No profiles to discover yet</p>
              <p className="text-slate-500 text-sm">Check back later or invite friends to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
            <Card
              key={profile.id}
              hover
              onClick={() => setSelectedProfile(profile.id)}
              className={selectedProfile === profile.id ? 'ring-2 ring-purple-500' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{profile.pseudonym}</CardTitle>
                    <p className="text-sm text-purple-400 mt-1">CYRAiNO: {profile.agentName}</p>
                  </div>
                  <Badge variant="success">
                    {profile.compatibility}% match
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-300 italic">&ldquo;{profile.persona}&rdquo;</p>
                
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">Values</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.values.map((value) => (
                      <Badge key={value} variant="primary">{value}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>

                {/* Connection Types */}
                {profile.connectionTypes && profile.connectionTypes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Looking For</p>
                    <ProfileConnectionTypes 
                      connectionTypes={profile.connectionTypes}
                      size="sm"
                    />
                  </div>
                )}

                {/* Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Badges</p>
                    <BadgeDisplay 
                      badges={profile.badges}
                      size="sm"
                      maxDisplay={3}
                    />
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRunVibeCheck(profile.id)
                    }}
                  >
                    Run Vibe Check
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Navigate to profile detail page
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}
        </div>

        {/* Vibe Check Modal */}
        <VibeCheckModal
          isOpen={showVibeCheckModal}
          onClose={() => {
            setShowVibeCheckModal(false)
            setSelectedProfileForVibeCheck(null)
          }}
          onComplete={handleVibeCheckComplete}
        />
      </div>
    </ProtectedRoute>
  )
}

