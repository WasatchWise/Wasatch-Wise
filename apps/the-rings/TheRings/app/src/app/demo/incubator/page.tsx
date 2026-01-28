'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function IncubatorDemo() {
  const [selectedDesk, setSelectedDesk] = useState<number | null>(null)

  const coworkingStats = {
    totalDesks: 24,
    available: 8,
    dailyRate: 25,
    monthlyRate: 350,
    todayRevenue: 400,
    monthRevenue: 8750,
  }

  const currentMembers = [
    { name: 'Marcus T.', type: 'Monthly', desk: 'D-7', since: '9:15 AM', focus: 'Software Dev', mentorHours: 2 },
    { name: 'Priya S.', type: 'Daily', desk: 'D-12', since: '10:30 AM', focus: 'UX Design', mentorHours: 0 },
    { name: 'James W.', type: 'Monthly', desk: 'D-3', since: '8:00 AM', focus: 'Marketing', mentorHours: 4 },
    { name: 'Elena R.', type: 'Monthly', desk: 'D-15', since: '11:00 AM', focus: 'Finance', mentorHours: 1 },
  ]

  const kitchenIncubator = {
    currentResident: {
      name: 'Abuelo\'s Kitchen',
      owner: 'Maria Gonzalez',
      concept: 'Authentic Oaxacan cuisine',
      residencyStart: 'Oct 2025',
      residencyEnd: 'Mar 2026',
      weeksRemaining: 18,
      salesThisMonth: 4200,
      youthAssistants: 3,
    },
    schedule: [
      { day: 'Mon-Wed', time: '11 AM - 2 PM', type: 'Lunch Service' },
      { day: 'Thu-Fri', time: '5 PM - 8 PM', type: 'Dinner Pop-up' },
      { day: 'Saturday', time: '10 AM - 1 PM', type: 'Cooking Class' },
    ],
    waitlist: 4,
    nextOpening: 'April 2026',
  }

  const mentorSessions = [
    { mentor: 'Marcus T.', youth: 'Alex K.', topic: 'Python basics', time: '2:00 PM', status: 'scheduled' },
    { mentor: 'James W.', youth: 'Sofia M.', topic: 'Brand identity', time: '3:30 PM', status: 'scheduled' },
    { mentor: 'Elena R.', youth: 'Jordan P.', topic: 'Business math', time: '4:00 PM', status: 'confirmed' },
  ]

  const partnerships = [
    { name: 'Lassonde Institute', type: 'University', benefit: 'Student entrepreneur pipeline, business mentorship', active: true },
    { name: 'SBDC Utah', type: 'Government', benefit: 'Small business resources, grant assistance', active: true },
    { name: 'Local First Utah', type: 'Nonprofit', benefit: 'Local business network, promotion', active: true },
  ]

  const upcomingEvents = [
    { name: 'Pitch Practice Night', date: 'Thursday 6 PM', type: 'workshop', spots: 8 },
    { name: 'Lassonde Office Hours', date: 'Friday 2 PM', type: 'mentorship', spots: 4 },
    { name: 'Food Entrepreneur Panel', date: 'Next Monday 7 PM', type: 'event', spots: 30 },
  ]

  const desks = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    occupied: Math.random() > 0.33,
    type: i < 8 ? 'quiet' : i < 16 ? 'collaborative' : 'phone',
  }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#6366f1' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#1e293b' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#6366f1' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#1e293b' }}>
              Incubator & Coworking
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#6366f120', color: '#6366f1' }}>
              Admin View
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4" style={{ borderColor: '#6366f1' }}>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#64748b' }}>Desks Available</div>
            <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mt-1" style={{ color: '#6366f1' }}>
              {coworkingStats.available}/{coworkingStats.totalDesks}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4" style={{ borderColor: '#10b981' }}>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#64748b' }}>Today's Revenue</div>
            <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mt-1" style={{ color: '#10b981' }}>
              ${coworkingStats.todayRevenue}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4" style={{ borderColor: '#f59e0b' }}>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#64748b' }}>Kitchen Sales</div>
            <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mt-1" style={{ color: '#f59e0b' }}>
              ${kitchenIncubator.currentResident.salesThisMonth}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4" style={{ borderColor: '#ec4899' }}>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#64748b' }}>Mentor Sessions</div>
            <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mt-1" style={{ color: '#ec4899' }}>
              {mentorSessions.length} today
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Coworking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Floor Map */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: '#1e293b' }}>
                  Coworking Floor
                </h2>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: '#e2e8f0' }}></span> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1' }}></span> Occupied
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-8 gap-2 mb-4">
                {desks.map((desk) => (
                  <button
                    key={desk.id}
                    onClick={() => setSelectedDesk(desk.id)}
                    className={`aspect-square rounded-lg text-xs font-[family-name:var(--font-oswald)] transition-all ${
                      selectedDesk === desk.id ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      backgroundColor: desk.occupied ? '#6366f1' : '#e2e8f0',
                      color: desk.occupied ? 'white' : '#64748b',
                    }}
                  >
                    {desk.id}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                <div className="text-center p-2 rounded" style={{ backgroundColor: '#f1f5f9' }}>
                  <div style={{ color: '#64748b' }}>Quiet Zone</div>
                  <div className="font-semibold" style={{ color: '#1e293b' }}>1-8</div>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: '#f1f5f9' }}>
                  <div style={{ color: '#64748b' }}>Collaborative</div>
                  <div className="font-semibold" style={{ color: '#1e293b' }}>9-16</div>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: '#f1f5f9' }}>
                  <div style={{ color: '#64748b' }}>Phone Booths</div>
                  <div className="font-semibold" style={{ color: '#1e293b' }}>17-24</div>
                </div>
              </div>
            </div>

            {/* Current Members */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1e293b' }}>
                Today's Coworkers
              </h2>
              <div className="space-y-3">
                {currentMembers.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-[family-name:var(--font-oswald)] text-sm" style={{ backgroundColor: '#6366f120', color: '#6366f1' }}>
                        {member.desk}
                      </div>
                      <div>
                        <div className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#1e293b' }}>{member.name}</div>
                        <div className="text-sm" style={{ color: '#64748b' }}>{member.focus}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ color: member.type === 'Monthly' ? '#6366f1' : '#64748b' }}>{member.type}</div>
                      {member.mentorHours > 0 && (
                        <div className="text-xs" style={{ color: '#10b981' }}>{member.mentorHours}h mentor this week</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kitchen Incubator */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-5">
                <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                  Kitchen Incubator
                </h2>
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  {kitchenIncubator.waitlist} on waitlist
                </span>
              </div>

              <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-[family-name:var(--font-playfair)] text-xl font-bold" style={{ color: '#92400e' }}>
                      {kitchenIncubator.currentResident.name}
                    </div>
                    <div className="text-sm" style={{ color: '#a16207' }}>{kitchenIncubator.currentResident.owner}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: '#64748b' }}>{kitchenIncubator.currentResident.weeksRemaining} weeks left</div>
                    <div className="text-xs" style={{ color: '#10b981' }}>{kitchenIncubator.currentResident.youthAssistants} youth assistants</div>
                  </div>
                </div>
                <div className="text-sm mb-3" style={{ color: '#78350f' }}>{kitchenIncubator.currentResident.concept}</div>

                <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid #fde68a' }}>
                  {kitchenIncubator.schedule.map((slot, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs font-semibold" style={{ color: '#92400e' }}>{slot.day}</div>
                      <div className="text-xs" style={{ color: '#a16207' }}>{slot.time}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{slot.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm" style={{ color: '#64748b' }}>
                  Next opening: <span className="font-semibold" style={{ color: '#1e293b' }}>{kitchenIncubator.nextOpening}</span>
                </div>
                <button className="text-sm px-4 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                  View Applications
                </button>
              </div>
            </div>

            {/* Mentor Sessions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#ec4899' }}>
                Today's Mentor Sessions
              </h2>
              <div className="space-y-3">
                {mentorSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#fdf2f8' }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)]" style={{ color: '#1e293b' }}>
                        {session.mentor} → {session.youth}
                      </div>
                      <div className="text-sm" style={{ color: '#64748b' }}>{session.topic}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold" style={{ color: '#ec4899' }}>{session.time}</div>
                      <div className="text-xs" style={{ color: session.status === 'confirmed' ? '#10b981' : '#64748b' }}>
                        {session.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #f3e8ff' }}>
                <span className="text-sm" style={{ color: '#64748b' }}>
                  Coworkers have contributed <strong style={{ color: '#ec4899' }}>47 mentor hours</strong> this month
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1e293b' }}>
                Membership Rates
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-[family-name:var(--font-playfair)]" style={{ color: '#1e293b' }}>Day Pass</span>
                    <span className="font-bold text-xl" style={{ color: '#6366f1' }}>${coworkingStats.dailyRate}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#6366f110', border: '2px solid #6366f1' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#1e293b' }}>Monthly</span>
                    <span className="font-bold text-xl" style={{ color: '#6366f1' }}>${coworkingStats.monthlyRate}</span>
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>Includes 2 mentor hours/month</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-[family-name:var(--font-playfair)]" style={{ color: '#1e293b' }}>Kitchen Residency</span>
                    <span className="font-bold" style={{ color: '#f59e0b' }}>$800/mo</span>
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>+ 15% revenue share</div>
                </div>
              </div>
            </div>

            {/* Partnerships */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1e293b' }}>
                Partnerships
              </h2>
              <div className="space-y-4">
                {partnerships.map((partner, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#6366f1' }}>
                    <div className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#1e293b' }}>{partner.name}</div>
                    <div className="text-xs mb-1" style={{ color: '#6366f1' }}>{partner.type}</div>
                    <div className="text-sm" style={{ color: '#64748b' }}>{partner.benefit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1e293b' }}>
                Incubator Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="font-[family-name:var(--font-playfair)]" style={{ color: '#1e293b' }}>{event.name}</div>
                    <div className="text-sm" style={{ color: '#6366f1' }}>{event.date}</div>
                    <div className="text-xs mt-1" style={{ color: '#10b981' }}>{event.spots} spots</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1e293b' }}>
                Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#6366f1', color: 'white' }}>
                  Book a Desk
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                  Kitchen Application
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#ec4899', color: 'white' }}>
                  Become a Mentor
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#10b981', color: 'white' }}>
                  Export Reports
                </button>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="p-5 rounded-xl" style={{ backgroundColor: '#1e293b' }}>
              <div className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
                November Summary
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: '#94a3b8' }}>Coworking</span>
                  <span className="font-semibold" style={{ color: '#6366f1' }}>${coworkingStats.monthRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#94a3b8' }}>Kitchen (40%)</span>
                  <span className="font-semibold" style={{ color: '#f59e0b' }}>${Math.round(kitchenIncubator.currentResident.salesThisMonth * 0.4)}</span>
                </div>
                <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #334155' }}>
                  <span style={{ color: '#e2e8f0' }}>Total</span>
                  <span className="font-bold text-lg" style={{ color: '#10b981' }}>
                    ${coworkingStats.monthRevenue + Math.round(kitchenIncubator.currentResident.salesThisMonth * 0.4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Youth-Adult Connection */}
        <div className="bg-gradient-to-r from-indigo-50 to-pink-50 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-wider mb-2" style={{ color: '#1e293b' }}>
                The Rings Connection
              </h3>
              <p className="font-[family-name:var(--font-playfair)]" style={{ color: '#64748b' }}>
                Coworkers aren't just renting desks—they're part of the ecosystem. Mentor youth, teach workshops,
                hire interns. Kitchen residents employ youth assistants and teach culinary quests.
                Everyone grows together.
              </p>
            </div>
            <div className="text-6xl opacity-50">🔄</div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#94a3b8' }}>
          This is a simulated incubator view showing coworking management, kitchen incubator operations,
          mentor matching, and partnership integrations.
        </div>
      </main>
    </div>
  )
}
