'use client'

import Link from 'next/link'
import { CycloneMini } from '@/components/ui/cyclone'

export default function ParentDemo() {
  const children = [
    {
      name: 'Emma',
      age: 12,
      status: 'checked-in',
      zone: 'Creative Studio',
      todayHours: 2.5,
      currentQuest: 'Digital Photography',
      mood: 'engaged',
      rings: [
        { id: '1', name: 'Self', slug: 'self', level: 35, maxLevel: 100 },
        { id: '2', name: 'Brain', slug: 'brain', level: 42, maxLevel: 100 },
        { id: '3', name: 'Body', slug: 'body', level: 28, maxLevel: 100 },
        { id: '4', name: 'Bubble', slug: 'bubble', level: 50, maxLevel: 100 },
        { id: '5', name: 'Scene', slug: 'scene', level: 45, maxLevel: 100 },
        { id: '6', name: 'Neighborhood', slug: 'neighborhood', level: 20, maxLevel: 100 },
        { id: '7', name: 'Community', slug: 'community', level: 25, maxLevel: 100 },
        { id: '8', name: 'World', slug: 'world', level: 15, maxLevel: 100 },
        { id: '9', name: 'Ether', slug: 'ether', level: 38, maxLevel: 100 },
      ],
    },
    {
      name: 'Jake',
      age: 8,
      status: 'checked-in',
      zone: 'Early Childhood',
      todayHours: 4,
      currentQuest: null,
      mood: 'playing',
      rings: [
        { id: '1', name: 'Self', slug: 'self', level: 55, maxLevel: 100 },
        { id: '2', name: 'Brain', slug: 'brain', level: 30, maxLevel: 100 },
        { id: '3', name: 'Body', slug: 'body', level: 60, maxLevel: 100 },
        { id: '4', name: 'Bubble', slug: 'bubble', level: 45, maxLevel: 100 },
        { id: '5', name: 'Scene', slug: 'scene', level: 35, maxLevel: 100 },
        { id: '6', name: 'Neighborhood', slug: 'neighborhood', level: 25, maxLevel: 100 },
        { id: '7', name: 'Community', slug: 'community', level: 20, maxLevel: 100 },
        { id: '8', name: 'World', slug: 'world', level: 10, maxLevel: 100 },
        { id: '9', name: 'Ether', slug: 'ether', level: 22, maxLevel: 100 },
      ],
    },
  ]

  const recentArtifacts = [
    { title: 'Sunset Photo', date: 'Today', type: 'image', child: 'Emma' },
    { title: 'Clay Bowl', date: 'Yesterday', type: 'image', child: 'Emma' },
    { title: 'Dance Recital Clip', date: '3 days ago', type: 'video', child: 'Emma' },
  ]

  const staffNotes = [
    {
      from: 'Ms. Rivera',
      about: 'Emma',
      note: 'Emma showed great patience helping a younger member with camera settings. Natural mentor!',
      date: 'Today',
    },
    {
      from: 'Coach Mike',
      about: 'Jake',
      note: 'Jake had a great day! Made two new friends during free play.',
      date: 'Yesterday',
    },
  ]

  const upcomingEvents = [
    { name: 'Parent Open House', date: 'Tonight 7 PM', type: 'family' },
    { name: 'Creative Showcase', date: 'Friday 6 PM', type: 'performance' },
    { name: 'Family Fitness Saturday', date: 'Sat 10 AM', type: 'activity' },
  ]

  const adultClasses = [
    { name: 'Intro to AI Tools', date: 'Thursday 7 PM', spots: 8 },
    { name: 'Yoga Flow', date: 'Mon/Wed 6 AM', spots: 12 },
    { name: 'Paint Night', date: 'Friday 7 PM', spots: 4 },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#48bb78' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#3d2914' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#48bb78' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#3d2914' }}>
              Parent View
            </span>
          </div>
          <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#3d2914' }}>
            The Martinez Family
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Children Status */}
        <div className="grid md:grid-cols-2 gap-6">
          {children.map((child) => (
            <div key={child.name} className="bg-white p-6 shadow-sm rounded-lg border-l-4" style={{ borderColor: '#48bb78' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CycloneMini rings={child.rings} />
                  <div>
                    <div className="font-[family-name:var(--font-playfair)] text-2xl font-bold" style={{ color: '#3d2914' }}>{child.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>Age {child.age}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#48bb78' }} />
                    <span className="text-sm font-[family-name:var(--font-oswald)]" style={{ color: '#48bb78' }}>Checked In</span>
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>{child.zone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                  <div className="text-sm" style={{ color: '#666' }}>Today</div>
                  <div className="font-[family-name:var(--font-playfair)] text-lg font-semibold" style={{ color: '#3d2914' }}>{child.todayHours} hours</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                  <div className="text-sm" style={{ color: '#666' }}>Status</div>
                  <div className="font-[family-name:var(--font-playfair)] text-lg font-semibold" style={{ color: '#48bb78' }}>{child.mood}</div>
                </div>
              </div>
              {child.currentQuest && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <div className="text-sm" style={{ color: '#666' }}>Current Quest</div>
                  <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#3182ce' }}>{child.currentQuest}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ring Progress Comparison */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Ring Progress Comparison
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {children.map((child) => (
                  <div key={child.name}>
                    <div className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-4" style={{ color: '#3182ce' }}>{child.name}</div>
                    <div className="space-y-3">
                      {child.rings.slice(0, 5).map((ring) => (
                        <div key={ring.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-[family-name:var(--font-playfair)]" style={{ color: '#3d2914' }}>{ring.name}</span>
                            <span style={{ color: '#666' }}>{ring.level}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${ring.level}%`, backgroundColor: '#48bb78' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Artifacts */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Recent Loot Drops
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {recentArtifacts.map((artifact, i) => (
                  <div key={i} className="border rounded-lg p-4 text-center" style={{ borderColor: '#e2e8f0', backgroundColor: '#f7fafc' }}>
                    <div className="w-full h-20 rounded-lg mb-3 flex items-center justify-center text-3xl" style={{ backgroundColor: '#e2e8f0' }}>
                      {artifact.type === 'image' ? '📷' : '🎬'}
                    </div>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#3d2914' }}>{artifact.title}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{artifact.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Notes */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Notes from Staff
              </h2>
              <div className="space-y-4">
                {staffNotes.map((note, i) => (
                  <div key={i} className="border-l-4 pl-4" style={{ borderColor: '#48bb78' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-[family-name:var(--font-playfair)] text-base font-semibold" style={{ color: '#48bb78' }}>{note.from}</span>
                      <span className="text-sm" style={{ color: '#666' }}>about {note.about}</span>
                    </div>
                    <div className="text-base" style={{ color: '#3d2914' }}>{note.note}</div>
                    <div className="text-sm mt-2" style={{ color: '#a0aec0' }}>{note.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#d69e2e' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#3d2914' }}>{event.name}</div>
                    <div className="text-sm" style={{ color: '#3182ce' }}>{event.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adult Classes */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Classes for You
              </h2>
              <div className="space-y-4">
                {adultClasses.map((cls, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: '#f7fafc' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#3182ce' }}>{cls.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{cls.date}</div>
                    <div className="text-sm" style={{ color: '#48bb78' }}>{cls.spots} spots left</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#3182ce', color: 'white' }}>
                Browse All Classes
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 shadow-sm rounded-lg">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#4299e1', color: 'white' }}>
                  Message Staff
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#48bb78', color: 'white' }}>
                  Update Pickup Time
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#805ad5', color: 'white' }}>
                  Volunteer Sign-up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#a0aec0' }}>
          This is a simulated parent view showing real-time child status, progress tracking, and family engagement.
        </div>
      </main>
    </div>
  )
}
