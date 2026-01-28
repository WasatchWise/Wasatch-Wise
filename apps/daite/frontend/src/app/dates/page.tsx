'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { Calendar, MapPin, Clock, Users, Sparkles } from 'lucide-react'
import { ConciergeServiceModal } from '@/components/ConciergeServiceModal'

const mockDates = [
  {
    id: '1',
    matchName: 'Alex',
    title: 'Coffee & Conversation',
    description: 'A cozy morning chat at our favorite local cafe, discussing life and building friendship.',
    date: '2025-01-20',
    time: '10:00 AM',
    location: 'The Philosopher\'s Café, Downtown',
    status: 'planned',
    suggestedBy: 'CYRAiNO'
  },
  {
    id: '2',
    matchName: 'Jordan',
    title: 'Park Playdate',
    description: 'Kids play while we chat and build community. Perfect for connecting as parents.',
    date: '2025-01-22',
    time: '2:00 PM',
    location: 'Riverside Park Playground',
    status: 'pending',
    suggestedBy: 'You'
  },
]

const dateIdeas = [
  {
    title: 'Sunset Hiking Trail',
    description: 'Moderate difficulty, 2 hours, beautiful views',
    compatibility: 95
  },
  {
    title: 'Bookstore Browsing',
    description: 'Cozy afternoon discovering new reads together',
    compatibility: 92
  },
  {
    title: 'Park Playdate',
    description: 'Kids play while parents connect and chat',
    compatibility: 88
  },
  {
    title: 'Music Jam Session',
    description: 'Bring instruments, create together, build musical friendship',
    compatibility: 90
  },
]

export default function DatesPage() {
  const router = useRouter()
  const client = useSupabaseClient()
  const [dates, setDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showDatePlanning, setShowDatePlanning] = useState(false)
  const [selectedDateForPlanning, setSelectedDateForPlanning] = useState<any>(null)

  useEffect(() => {
    if (!client) return

    const loadDates = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await client.auth.getUser()
        if (!user) {
          router.push('/')
          return
        }
        setCurrentUserId(user.id)

        // Fetch planned dates
        const { data: datesData, error } = await client
          .from('planned_dates')
          .select(`
            id,
            date_type,
            scheduled_at,
            duration_minutes,
            status,
            confirmed_by_both,
            venue_id,
            location_details,
            cy_suggested,
            planned_by_user_id,
            other_user_id,
            venues (
              name,
              address,
              city
            ),
            matches!inner (
              user_1_id,
              user_2_id
            )
          `)
          .or(`planned_by_user_id.eq.${user.id},other_user_id.eq.${user.id}`)
          .in('status', ['planned', 'confirmed'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })

        if (error) throw error

        if (datesData) {
          // Get other user details
          const datesWithUsers = await Promise.all(
            datesData.map(async (date) => {
              const otherUserId = date.planned_by_user_id === user.id 
                ? date.other_user_id 
                : date.planned_by_user_id

              const { data: otherUser } = await client
                .from('users')
                .select('pseudonym')
                .eq('id', otherUserId)
                .single()

              return {
                ...date,
                otherUser: otherUser || { pseudonym: 'Anonymous' },
                venue: date.venues || null
              }
            })
          )

          setDates(datesWithUsers)
        }
      } catch (error) {
        console.error('Error loading dates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDates()
  }, [client, router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe mb-20 md:mb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Plan Your Gatherings
          </h1>
          <p className="text-slate-400">
            Let CYRAiNO help you plan meaningful experiences—playdates, jam sessions, coffee, events, and more
          </p>
        </div>

        {/* Upcoming Dates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Gatherings</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : dates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No upcoming dates</p>
              <p className="text-slate-500 text-sm mb-6">Plan your first gathering with a match!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dates.map((date) => (
                <Card key={date.id} hover>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {date.date_type === 'first' ? 'First Gathering' : 
                           date.date_type === 'follow_up' ? 'Follow-up Gathering' : 
                           'Special Occasion'}
                        </CardTitle>
                        <p className="text-sm text-purple-400 mt-1">With {date.otherUser?.pseudonym || 'Anonymous'}</p>
                      </div>
                      <Badge variant={date.status === 'confirmed' ? 'success' : 'warning'}>
                        {date.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(date.scheduled_at).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(date.scheduled_at).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                        {date.duration_minutes && ` • ${date.duration_minutes} min`}
                      </div>
                      {(date.venue || date.location_details) && (
                        <div className="flex items-center text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          {date.venue?.name || date.location_details || 'Location TBD'}
                          {date.venue?.city && `, ${date.venue.city}`}
                        </div>
                      )}
                    </div>
                    
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="text-xs text-slate-500">
                          {date.cy_suggested ? 'Suggested by CYRAiNO' : 'Planned by you'}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDateForPlanning(date)
                              setShowDatePlanning(true)
                            }}
                            title="Get date planning help"
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                          {!date.confirmed_by_both && (
                            <Button variant="primary" size="sm">
                              {date.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
                            </Button>
                          )}
                        </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* AI Date Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">AI Gathering Suggestions</h2>
            <Badge variant="info" className="flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by CYRAiNO
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dateIdeas.map((idea, index) => (
              <Card key={index} hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <Badge variant="success">{idea.compatibility}%</Badge>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-4">{idea.description}</p>
                  
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      Plan This Gathering
                    </Button>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Date Planning Assistant Modal */}
        <ConciergeServiceModal
          serviceType="date_planning"
          isOpen={showDatePlanning}
          onClose={() => {
            setShowDatePlanning(false)
            setSelectedDateForPlanning(null)
          }}
          contextData={{
            match: selectedDateForPlanning,
            date: selectedDateForPlanning
          }}
        />
      </div>
      </div>
    </ProtectedRoute>
  )
}

