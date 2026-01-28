'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ActivityNotification } from '@/components/ui/activity-ticker'

// Animated counter component
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <>{prefix}{displayValue.toLocaleString()}{suffix}</>
}

// Mini sparkline chart
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function BoardMemberDemo() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulated real-time data
  const metrics = {
    currentOccupancy: 127,
    dailyCheckIns: 89,
    activeMembers: 342,
    monthlyRevenue: 47850,
    staffOnDuty: 8,
    eventsToday: 4,
    safetyIncidents: 0,
    parentSatisfaction: 94,
  }

  const programBreakdown = [
    { name: 'Early Childhood', enrolled: 45, capacity: 60, revenue: 12500, trend: [38, 40, 42, 44, 45] },
    { name: 'Youth (10-14)', enrolled: 112, capacity: 150, revenue: 8900, trend: [95, 100, 108, 110, 112] },
    { name: 'Youth (14-18)', enrolled: 89, capacity: 120, revenue: 7200, trend: [78, 82, 85, 87, 89] },
    { name: 'Adult Classes', enrolled: 67, capacity: 100, revenue: 4800, trend: [50, 55, 60, 65, 67] },
    { name: 'Senior Programs', enrolled: 29, capacity: 50, revenue: 1200, trend: [20, 22, 25, 27, 29] },
  ]

  const recentActivity = [
    { time: '2 min ago', event: 'Youth Crew completed "Intro to Boxing" quest', type: 'achievement', icon: '🏆' },
    { time: '5 min ago', event: '3 new family memberships registered', type: 'growth', icon: '📈' },
    { time: '12 min ago', event: 'Paint Night event at 85% capacity', type: 'event', icon: '🎨' },
    { time: '18 min ago', event: 'Senior mentor session with youth crew', type: 'connection', icon: '🤝' },
    { time: '25 min ago', event: 'Parent volunteer logged 2 hours', type: 'community', icon: '💪' },
  ]

  const upcomingDecisions = [
    { item: 'Expand childcare hours to 6am start', impact: '+$3,200/mo revenue', deadline: 'Dec 1', priority: 'high' },
    { item: 'Partner agreement with Craft & Crush', impact: '4 events/month', deadline: 'Nov 30', priority: 'medium' },
    { item: 'Grant application: Youth Workforce Dev', impact: '$75,000', deadline: 'Dec 15', priority: 'high' },
  ]

  const weeklyTrend = [35000, 38000, 42000, 45000, 47850]
  const occupancyTrend = [85, 95, 110, 118, 127]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f6f3' }}>
      {/* Live Activity Notifications */}
      <ActivityNotification />

      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#3d2914' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#3d2914' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#c9a227' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#3d2914' }}>
              Board Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: '#3d2914' }}>
              {time.toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#4a7c59' }}>Live</span>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4a7c59' }} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics with Animations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 border-t-4 shadow-sm relative overflow-hidden" style={{ borderColor: '#3d6b8c' }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <Sparkline data={occupancyTrend} color="#3d6b8c" />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-1" style={{ color: '#666' }}>Current Occupancy</div>
            <div className="text-3xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#3d6b8c' }}>
              <AnimatedNumber value={metrics.currentOccupancy} />
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#4a7c59' }}>
              <span>●</span> Building active
            </div>
          </div>
          <div className="bg-white p-5 border-t-4 shadow-sm relative overflow-hidden" style={{ borderColor: '#c9a227' }}>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-1" style={{ color: '#666' }}>Active Members</div>
            <div className="text-3xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#c9a227' }}>
              <AnimatedNumber value={metrics.activeMembers} />
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#4a7c59' }}>
              <span>▲</span> +12 this week
            </div>
          </div>
          <div className="bg-white p-5 border-t-4 shadow-sm relative overflow-hidden" style={{ borderColor: '#4a7c59' }}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <Sparkline data={weeklyTrend} color="#4a7c59" />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-1" style={{ color: '#666' }}>Monthly Revenue</div>
            <div className="text-3xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>
              <AnimatedNumber value={metrics.monthlyRevenue} prefix="$" />
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#4a7c59' }}>
              <span>▲</span> +8% vs last month
            </div>
          </div>
          <div className="bg-white p-5 border-t-4 shadow-sm relative overflow-hidden" style={{ borderColor: '#4a7c59' }}>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-1" style={{ color: '#666' }}>Safety Incidents</div>
            <div className="text-3xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>{metrics.safetyIncidents}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: '#4a7c59' }}>
              <span>✓</span> 30-day streak
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Program Performance with Trends */}
          <div className="lg:col-span-2 bg-white p-5 shadow-sm">
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#3d2914' }}>
              Program Performance
            </h2>
            <div className="space-y-4">
              {programBreakdown.map((program) => {
                const percentage = (program.enrolled / program.capacity) * 100
                return (
                  <div key={program.name} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-[family-name:var(--font-playfair)] font-medium" style={{ color: '#3d2914' }}>{program.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-16 opacity-50">
                          <Sparkline data={program.trend} color="#3d6b8c" />
                        </div>
                        <span className="text-right min-w-[180px]" style={{ color: '#666' }}>
                          {program.enrolled}/{program.capacity} • ${program.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: percentage > 80 ? '#4a7c59' : percentage > 60 ? '#3d6b8c' : '#c9a227',
                          animation: 'grow 1.5s ease-out'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white p-5 shadow-sm">
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#3d2914' }}>
              Live Activity
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#4a7c59' }} />
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="text-sm border-l-2 pl-3"
                  style={{ borderColor: '#c9a227' }}
                >
                  <div className="flex items-start gap-2" style={{ color: '#3d2914' }}>
                    <span>{activity.icon}</span>
                    <span className="font-[family-name:var(--font-playfair)]">{activity.event}</span>
                  </div>
                  <div className="text-xs ml-6" style={{ color: '#666' }}>{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decisions Needed */}
        <div className="bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#3d2914' }}>
            Decisions Pending Board Approval
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {upcomingDecisions.map((decision, i) => (
              <div
                key={i}
                className="border p-4 rounded transition-all hover:shadow-md"
                style={{ borderColor: decision.priority === 'high' ? '#c9a227' : '#e5e5e5', backgroundColor: '#fafafa' }}
              >
                {decision.priority === 'high' && (
                  <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: '#c9a227' }}>
                    ⚡ High Priority
                  </div>
                )}
                <div className="font-[family-name:var(--font-playfair)] text-sm font-medium mb-2" style={{ color: '#3d2914' }}>{decision.item}</div>
                <div className="text-xs mb-1" style={{ color: '#4a7c59' }}>Impact: {decision.impact}</div>
                <div className="text-xs" style={{ color: '#666' }}>Deadline: {decision.deadline}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Health */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#3d6b8c' }}>
              <AnimatedNumber value={metrics.parentSatisfaction} suffix="%" />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>Parent Satisfaction</div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#c9a227' }}>
              <AnimatedNumber value={23} />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>Active Mentors</div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>
              <AnimatedNumber value={156} />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>Volunteer Hours/Week</div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#8b2635' }}>
              <AnimatedNumber value={8} />
            </div>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>Partner Orgs</div>
          </div>
        </div>

        {/* Campus Events Calendar */}
        <div className="bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: '#3d2914' }}>
              Campus Events Calendar
            </h2>
            <div className="flex gap-2">
              <span className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider px-2 py-1 rounded" style={{ backgroundColor: '#f0f0f0', color: '#666' }}>
                November 2025
              </span>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-[10px] font-[family-name:var(--font-oswald)] uppercase py-1" style={{ color: '#999' }}>
                {day}
              </div>
            ))}
            {/* November 2025 starts on Saturday, so 5 empty cells first */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`empty-${i}`} className="text-xs py-1.5" />
            ))}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const hasEvent = [21, 22, 27, 29].includes(day)
              const isToday = day === 21
              return (
                <div
                  key={day}
                  className={`text-xs py-1.5 rounded cursor-pointer transition-all hover:opacity-80 ${isToday ? 'font-bold' : ''}`}
                  style={{
                    backgroundColor: hasEvent ? (day === 21 ? '#8b2635' : day === 22 ? '#4a7c59' : day === 27 ? '#3d6b8c' : '#c9a227') : isToday ? '#f5f5f5' : 'transparent',
                    color: hasEvent ? 'white' : '#3d2914'
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>

          {/* Upcoming Events List */}
          <div className="border-t pt-4" style={{ borderColor: '#e5e5e5' }}>
            <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-3" style={{ color: '#666' }}>
              Upcoming Events
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#8b2635' }}>21</div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-playfair)] font-medium" style={{ color: '#3d2914' }}>Board Meeting</div>
                  <div className="text-xs" style={{ color: '#666' }}>Today • 6pm–8pm • Conference Room</div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#4a7c59', color: 'white' }}>Now</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#4a7c59' }}>22</div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-playfair)] font-medium" style={{ color: '#3d2914' }}>Family Wellness Day</div>
                  <div className="text-xs" style={{ color: '#666' }}>10am–2pm • Expected: 120 attendees</div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#c9a227', color: 'white' }}>65% RSVP</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#3d6b8c' }}>27</div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-playfair)] font-medium" style={{ color: '#3d2914' }}>Thanksgiving Potluck</div>
                  <div className="text-xs" style={{ color: '#666' }}>12pm–3pm • Expected: 200 attendees</div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#4a7c59', color: 'white' }}>82% RSVP</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#c9a227' }}>29</div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-playfair)] font-medium" style={{ color: '#3d2914' }}>Winter Quest Showcase</div>
                  <div className="text-xs" style={{ color: '#666' }}>4pm–7pm • Expected: 85 attendees</div>
                </div>
                <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#c9a227', color: 'white' }}>45% RSVP</div>
              </div>
            </div>
          </div>

          {/* Event Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t" style={{ borderColor: '#e5e5e5' }}>
            <div className="text-center">
              <div className="text-lg font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#3d6b8c' }}>12</div>
              <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase" style={{ color: '#666' }}>Events This Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>89%</div>
              <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase" style={{ color: '#666' }}>Avg Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#c9a227' }}>$4.2k</div>
              <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase" style={{ color: '#666' }}>Event Revenue</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs py-4 font-[family-name:var(--font-playfair)] italic" style={{ color: '#999' }}>
          Board dashboard displaying real-time operational metrics and strategic decisions
        </div>
      </main>

      <style jsx>{`
        @keyframes grow {
          from { width: 0; }
        }
      `}</style>
    </div>
  )
}
