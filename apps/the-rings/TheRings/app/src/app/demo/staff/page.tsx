'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ActivityNotification } from '@/components/ui/activity-ticker'

export default function StaffDemo() {
  const [time, setTime] = useState(new Date())
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const myShift = {
    zone: 'TechNest',
    time: '3:00 PM - 8:00 PM',
    role: 'Lead Facilitator',
  }

  const zones = [
    { id: 'technest', name: 'TechNest', count: 5, color: '#00d4ff', x: 10, y: 10, w: 35, h: 40 },
    { id: 'creative', name: 'Creative Studio', count: 8, color: '#a855f7', x: 55, y: 10, w: 35, h: 40 },
    { id: 'boxing', name: 'Boxing Ring', count: 6, color: '#ef4444', x: 10, y: 55, w: 25, h: 35 },
    { id: 'gaming', name: 'Gaming Arena', count: 12, color: '#22c55e', x: 40, y: 55, w: 25, h: 35 },
    { id: 'zen', name: 'Zen Den', count: 3, color: '#eab308', x: 70, y: 55, w: 20, h: 35 },
  ]

  const inMyZone = [
    { name: 'Marcus J.', age: 14, status: 'active', currentQuest: 'Game Dev Basics', mood: 'focused', tapIn: '3:12 PM' },
    { name: 'Sophia R.', age: 12, status: 'active', currentQuest: 'Intro to Robotics', mood: 'excited', tapIn: '3:05 PM' },
    { name: 'Devon W.', age: 16, status: 'active', currentQuest: 'Streaming Setup', mood: 'chill', tapIn: '3:30 PM' },
    { name: 'Aaliyah M.', age: 13, status: 'idle', currentQuest: null, mood: 'looking around', tapIn: '3:45 PM' },
    { name: 'Tyler K.', age: 15, status: 'active', currentQuest: 'Cybersecurity 101', mood: 'intense', tapIn: '3:08 PM' },
  ]

  const myCrews = [
    { name: 'Code Breakers', members: 6, nextSession: 'Today 4:30 PM', quest: 'Build a Game' },
    { name: 'Bot Squad', members: 4, nextSession: 'Tomorrow 3:30 PM', quest: 'Sumo Robot Battle' },
  ]

  const todaySchedule = [
    { time: '3:00 PM', event: 'Open Lab', zone: 'TechNest', status: 'now' },
    { time: '4:30 PM', event: 'Code Breakers Crew Session', zone: 'TechNest', status: 'upcoming' },
    { time: '6:00 PM', event: 'Esports Practice', zone: 'Gaming Arena', status: 'upcoming' },
    { time: '7:00 PM', event: 'Parent Open House', zone: 'All Zones', status: 'upcoming' },
  ]

  const alerts = [
    { type: 'warning', message: 'Aaliyah M. has been idle for 15 min - consider check-in', priority: 'medium' },
    { type: 'success', message: 'Marcus J. just completed 3rd quest step - acknowledge!', priority: 'low' },
    { type: 'info', message: 'Pickup request: Devon W. - parent arriving in 10 min', priority: 'high' },
  ]

  const recentNotes = [
    { youth: 'Devon W.', note: 'Showed leadership helping new member with OBS setup', by: 'Jamie', time: 'Yesterday' },
    { youth: 'Sophia R.', note: 'Frustrated with servo motors - needs encouragement', by: 'You', time: '2 days ago' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
      {/* Live Activity Notifications */}
      <ActivityNotification />

      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#2d3748' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#2d3748' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#4299e1' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#2d3748' }}>
              Staff View
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-oswald)] text-sm" style={{ color: '#666' }}>
              {time.toLocaleTimeString()}
            </span>
            <span className="font-[family-name:var(--font-oswald)] text-sm font-bold" style={{ color: '#4299e1' }}>{myShift.zone}</span>
            <span className="text-sm" style={{ color: '#666' }}>{myShift.time}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border-l-4 flex items-center justify-between shadow-sm"
                style={{
                  backgroundColor: alert.type === 'warning' ? '#fffbeb' : alert.type === 'success' ? '#f0fff4' : '#ebf8ff',
                  borderColor: alert.type === 'warning' ? '#d69e2e' : alert.type === 'success' ? '#38a169' : '#4299e1'
                }}
              >
                <span
                  className="text-sm font-[family-name:var(--font-playfair)]"
                  style={{ color: alert.type === 'warning' ? '#744210' : alert.type === 'success' ? '#22543d' : '#2a4365' }}
                >
                  {alert.priority === 'high' && '⚡ '}
                  {alert.message}
                </span>
                <button className="text-sm px-3 py-1 rounded font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ backgroundColor: '#e2e8f0', color: '#4a5568' }}>
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map and Youth */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Campus Map */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#2d3748' }}>
                Live Campus Map
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#38a169' }} />
              </h2>
              <div className="relative aspect-[16/10] rounded-lg border-2" style={{ backgroundColor: '#e2e8f0', borderColor: '#cbd5e0' }}>
                {zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                    className={`absolute rounded-lg transition-all hover:scale-[1.02] ${
                      selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''
                    } ${zone.id === 'technest' ? 'ring-2 ring-blue-400' : ''}`}
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.w}%`,
                      height: `${zone.h}%`,
                      backgroundColor: `${zone.color}30`,
                      borderColor: `${zone.color}`,
                      borderWidth: '2px',
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-[family-name:var(--font-oswald)] font-bold uppercase" style={{ color: zone.color }}>
                        {zone.name}
                      </span>
                      <span className="text-xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#2d3748' }}>
                        {zone.count}
                      </span>
                      <span className="text-[10px]" style={{ color: '#666' }}>people</span>
                    </div>
                    {/* Pulsing dots for active zones */}
                    {zone.count > 5 && (
                      <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: zone.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-sm" style={{ color: '#666' }}>
                <span>Total in building: <strong style={{ color: '#2d3748' }}>{zones.reduce((sum, z) => sum + z.count, 0)}</strong></span>
                <span>Your zone highlighted</span>
              </div>
            </div>

            {/* Youth in My Zone */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#2d3748' }}>
                Youth in {myShift.zone} Right Now
              </h2>
              <div className="space-y-3">
                {inMyZone.map((youth) => (
                  <div key={youth.name} className="flex items-center justify-between p-4 border rounded-lg transition-colors"
                    style={{
                      borderColor: youth.status === 'idle' ? '#d69e2e' : '#e2e8f0',
                      backgroundColor: youth.status === 'idle' ? '#fffbeb' : '#f7fafc'
                    }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)] text-base flex items-center gap-2" style={{ color: '#2d3748' }}>
                        {youth.name}
                        {youth.status === 'idle' && (
                          <span className="text-xs px-2 py-0.5 rounded font-[family-name:var(--font-oswald)] uppercase" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                            IDLE
                          </span>
                        )}
                      </div>
                      <div className="text-sm" style={{ color: '#666' }}>
                        Age {youth.age} • {youth.currentQuest || 'No active quest'} • Tapped in {youth.tapIn}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-[family-name:var(--font-oswald)]" style={{ color: youth.status === 'active' ? '#38a169' : '#d69e2e' }}>
                        {youth.mood}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm px-3 py-1 rounded font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#4299e1', color: 'white' }}>
                          Note
                        </button>
                        <button className="text-sm px-3 py-1 rounded font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#805ad5', color: 'white' }}>
                          Check-in
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Crews */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#2d3748' }}>
                My Crews
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {myCrews.map((crew) => (
                  <div key={crew.name} className="p-4 border-2 rounded-lg hover:shadow-md transition-all" style={{ borderColor: '#4299e1', backgroundColor: '#ebf8ff' }}>
                    <div className="font-[family-name:var(--font-oswald)] font-bold text-lg" style={{ color: '#2b6cb0' }}>{crew.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{crew.members} members</div>
                    <div className="font-[family-name:var(--font-playfair)] text-base mt-2" style={{ color: '#2d3748' }}>{crew.quest}</div>
                    <div className="text-sm mt-1" style={{ color: '#4299e1' }}>{crew.nextSession}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#2d3748' }}>
                Today&apos;s Schedule
              </h2>
              <div className="space-y-3">
                {todaySchedule.map((item, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-[family-name:var(--font-oswald)] flex items-center gap-2" style={{ color: item.status === 'now' ? '#2b6cb0' : '#666' }}>
                      {item.time}
                      {item.status === 'now' && (
                        <span className="text-xs px-2 py-0.5 rounded font-[family-name:var(--font-oswald)] uppercase" style={{ backgroundColor: '#c6f6d5', color: '#22543d' }}>
                          NOW
                        </span>
                      )}
                    </div>
                    <div className="font-[family-name:var(--font-playfair)]" style={{ color: item.status === 'now' ? '#2d3748' : '#666', fontWeight: item.status === 'now' ? '500' : '400' }}>
                      {item.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notes */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#2d3748' }}>
                Recent Notes
              </h2>
              <div className="space-y-4">
                {recentNotes.map((note, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#805ad5' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#553c9a' }}>{note.youth}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{note.note}</div>
                    <div className="text-sm mt-1" style={{ color: '#a0aec0' }}>
                      {note.by} • {note.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#2d3748' }}>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#4299e1', color: 'white' }}>
                  + Check In Youth
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#805ad5', color: 'white' }}>
                  + Log Activity Note
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#38a169', color: 'white' }}>
                  + Award Badge
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#d69e2e', color: 'white' }}>
                  + Safety Incident
                </button>
              </div>
            </div>

            {/* Walkie Channel */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-3" style={{ color: '#2d3748' }}>
                Walkie Channel
              </h2>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f0fff4', border: '2px solid #38a169' }}>
                <span className="text-sm font-[family-name:var(--font-oswald)]" style={{ color: '#22543d' }}>All Staff</span>
                <button className="text-sm px-4 py-2 rounded font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ backgroundColor: '#38a169', color: 'white' }}>
                  Ping
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#a0aec0' }}>
          This is a simulated staff view showing zone management, youth tracking, and crew facilitation tools.
        </div>
      </main>
    </div>
  )
}
