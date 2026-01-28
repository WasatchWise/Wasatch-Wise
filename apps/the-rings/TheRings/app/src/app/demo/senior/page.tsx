import Link from 'next/link'

export default function SeniorDemo() {
  const elder = {
    name: 'Robert',
    memberSince: '2025',
    storiesShared: 12,
    youthMentored: 8,
  }

  const youthRequests = [
    {
      from: 'Aaliyah M.',
      age: 13,
      request: 'Interview about growing up in the 1960s for history project',
      crew: 'Civic Lab',
      date: 'Tomorrow 4 PM',
    },
    {
      from: 'Code Breakers Crew',
      members: 6,
      request: 'Share career advice for presentation on "jobs that didn\'t exist"',
      crew: 'TechNest',
      date: 'Friday 3:30 PM',
    },
  ]

  const skillsToShare = [
    { skill: 'Woodworking', interest: 'High', lastTaught: 'Last week' },
    { skill: 'Gardening', interest: 'Medium', lastTaught: '2 weeks ago' },
    { skill: 'Storytelling', interest: 'High', lastTaught: 'Yesterday' },
  ]

  const wellnessClasses = [
    { name: 'Chair Yoga', day: 'Mon/Wed/Fri', time: '9 AM', enrolled: true },
    { name: 'Memory & Mind', day: 'Tuesday', time: '10 AM', enrolled: true },
    { name: 'Gentle Fitness', day: 'Thursday', time: '9 AM', enrolled: false },
  ]

  const upcomingEvents = [
    { name: 'Intergenerational Game Day', date: 'Saturday 2 PM', role: 'Card games host' },
    { name: 'Oral History Recording', date: 'Next Tuesday 11 AM', role: 'Share your story' },
    { name: 'Holiday Craft Fair', date: 'Dec 15', role: 'Woodworking booth' },
  ]

  const recentConnections = [
    { name: 'Marcus J.', type: 'Mentee', note: 'Helped with public speaking', date: 'This week' },
    { name: 'Emma M.', type: 'Story listener', note: 'Recorded your Korea story', date: 'Last week' },
    { name: 'Helen T.', type: 'Peer', note: 'Yoga buddy', date: 'Ongoing' },
  ]

  const storyPrompts = [
    'What was your first job and what did it teach you?',
    'Describe a moment that changed your life direction.',
    'What do you wish you had learned earlier?',
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#3d2914' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider hover:opacity-70" style={{ color: '#3d2914' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#c9a227' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase" style={{ color: '#3d2914' }}>
              Elder View
            </span>
          </div>
          <div className="text-lg font-[family-name:var(--font-playfair)]" style={{ color: '#3d2914' }}>
            Welcome back, {elder.name}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Impact Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 text-center shadow-sm border-t-4" style={{ borderColor: '#3d6b8c' }}>
            <div className="text-4xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#3d6b8c' }}>{elder.storiesShared}</div>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mt-1" style={{ color: '#666' }}>Stories Shared</div>
          </div>
          <div className="bg-white p-6 text-center shadow-sm border-t-4" style={{ borderColor: '#c9a227' }}>
            <div className="text-4xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#c9a227' }}>{elder.youthMentored}</div>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mt-1" style={{ color: '#666' }}>Youth Mentored</div>
          </div>
          <div className="bg-white p-6 text-center shadow-sm border-t-4" style={{ borderColor: '#4a7c59' }}>
            <div className="text-4xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>47</div>
            <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider mt-1" style={{ color: '#666' }}>Hours Given</div>
          </div>
        </div>

        {/* Youth Requests */}
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-6" style={{ color: '#3d2914' }}>
            Youth Are Asking For You
          </h2>
          <div className="space-y-4">
            {youthRequests.map((req, i) => (
              <div key={i} className="border-2 p-5 rounded-lg" style={{ borderColor: '#c9a227', backgroundColor: '#fffdf5' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-[family-name:var(--font-playfair)] text-lg font-semibold" style={{ color: '#3d2914' }}>{req.from}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{req.crew}</div>
                  </div>
                  <div className="text-base font-[family-name:var(--font-oswald)]" style={{ color: '#c9a227' }}>{req.date}</div>
                </div>
                <div className="text-base mb-4" style={{ color: '#444' }}>{req.request}</div>
                <div className="flex gap-3">
                  <button className="text-base px-5 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#4a7c59', color: 'white' }}>
                    Accept
                  </button>
                  <button className="text-base px-5 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#e5e5e5', color: '#666' }}>
                    Suggest Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Where You're Needed
              </h2>
              <div className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded-lg" style={{ borderColor: '#e5e5e5', backgroundColor: '#fafafa' }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)] text-lg" style={{ color: '#3d2914' }}>{event.name}</div>
                      <div className="text-sm" style={{ color: '#666' }}>{event.role}</div>
                    </div>
                    <div className="text-base font-[family-name:var(--font-oswald)]" style={{ color: '#3d6b8c' }}>{event.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills to Share */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Your Skills
              </h2>
              <div className="space-y-4">
                {skillsToShare.map((skill, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border-b" style={{ borderColor: '#e5e5e5' }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)] text-lg" style={{ color: '#3d2914' }}>{skill.skill}</div>
                      <div className="text-sm" style={{ color: '#666' }}>Last taught: {skill.lastTaught}</div>
                    </div>
                    <div className={`text-base font-[family-name:var(--font-oswald)]`} style={{ color: skill.interest === 'High' ? '#4a7c59' : '#c9a227' }}>
                      {skill.interest} interest
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 text-base px-5 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#3d6b8c', color: 'white' }}>
                + Add a Skill to Share
              </button>
            </div>

            {/* Story Prompts */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Story Prompts
              </h2>
              <div className="space-y-4">
                {storyPrompts.map((prompt, i) => (
                  <div key={i} className="p-5 border-2 rounded-lg" style={{ borderColor: '#c9a227', backgroundColor: '#fffdf5' }}>
                    <div className="text-lg font-[family-name:var(--font-playfair)]" style={{ color: '#3d2914' }}>{prompt}</div>
                    <button className="mt-3 text-base font-[family-name:var(--font-oswald)] hover:underline" style={{ color: '#c9a227' }}>
                      Record this story →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Wellness Classes */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Your Wellness
              </h2>
              <div className="space-y-4">
                {wellnessClasses.map((cls, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border-b" style={{ borderColor: '#e5e5e5' }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)] text-lg" style={{ color: '#3d2914' }}>{cls.name}</div>
                      <div className="text-sm" style={{ color: '#666' }}>{cls.day} {cls.time}</div>
                    </div>
                    {cls.enrolled ? (
                      <span className="text-base font-[family-name:var(--font-oswald)]" style={{ color: '#4a7c59' }}>Enrolled</span>
                    ) : (
                      <button className="text-base px-4 py-2 rounded-lg font-[family-name:var(--font-oswald)]" style={{ backgroundColor: '#3d6b8c', color: 'white' }}>
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Connections */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-wider mb-5" style={{ color: '#3d2914' }}>
                Your Connections
              </h2>
              <div className="space-y-4">
                {recentConnections.map((conn, i) => (
                  <div key={i} className="border-l-4 pl-4" style={{ borderColor: '#4a7c59' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-lg" style={{ color: '#3d2914' }}>{conn.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{conn.type} • {conn.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legacy Note */}
            <div className="p-6 border-2 rounded-lg" style={{ borderColor: '#c9a227', backgroundColor: '#fffdf5' }}>
              <div className="text-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-2" style={{ color: '#c9a227' }}>Your Legacy</div>
              <div className="text-base font-[family-name:var(--font-playfair)]" style={{ color: '#3d2914' }}>
                Your stories and skills are shaping the next generation. Thank you for being here.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#999' }}>
          This is a simulated elder view showing youth requests, skill sharing, and legacy building.
        </div>
      </main>
    </div>
  )
}
