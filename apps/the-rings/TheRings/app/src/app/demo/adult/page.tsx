import Link from 'next/link'

export default function AdultDemo() {
  const profile = {
    name: 'Sarah',
    interests: ['AI/Tech', 'Yoga', 'Photography'],
    memberSince: 'Oct 2025',
  }

  const myClasses = [
    { name: 'AI Tools for Work', progress: 60, nextSession: 'Thursday 7 PM' },
    { name: 'Yoga Flow', progress: 40, nextSession: 'Tomorrow 6 AM' },
  ]

  const socialEvents = [
    {
      name: 'Speed Friending',
      date: 'This Friday 7 PM',
      desc: 'Meet 10 new people in 30 minutes. Not dating, just connection.',
      spots: 6,
      vibe: 'casual',
    },
    {
      name: 'Paint & Sip with Craft & Crush',
      date: 'Saturday 7 PM',
      desc: 'Wine, canvas, and good conversation.',
      spots: 4,
      vibe: 'creative',
    },
    {
      name: 'Tech Talk Tuesday',
      date: 'Next Tuesday 6:30 PM',
      desc: 'Discuss AI, gadgets, and the future. Beginners welcome.',
      spots: 12,
      vibe: 'nerdy',
    },
  ]

  const dateNights = [
    {
      name: 'Cooking Class for Couples',
      date: 'Friday 6 PM',
      desc: 'Learn to make pasta together.',
      spots: 3,
    },
    {
      name: 'Partner Yoga',
      date: 'Saturday 9 AM',
      desc: 'Stretch and connect.',
      spots: 5,
    },
  ]

  const peopleYouMightLike = [
    { name: 'Mike R.', shared: 'AI Tools class, Photography', lastSeen: 'Yesterday' },
    { name: 'Jennifer K.', shared: 'Yoga, Speed Friending attendee', lastSeen: 'This week' },
    { name: 'Carlos M.', shared: 'Tech Talk regular', lastSeen: 'Today' },
  ]

  const rings = [
    { name: 'Self', level: 45 },
    { name: 'Brain', level: 62 },
    { name: 'Body', level: 55 },
    { name: 'Scene', level: 38 },
    { name: 'Community', level: 28 },
  ]

  const volunteerOpportunities = [
    { role: 'Youth Mentor (TechNest)', commitment: '2 hrs/week', need: 'High' },
    { role: 'Event Setup Helper', commitment: 'As needed', need: 'Medium' },
    { role: 'Photography for Events', commitment: '1 event/month', need: 'High' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f3f0' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#2c3e50' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#2c3e50' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#8e44ad' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#2c3e50' }}>
              Adult View
            </span>
          </div>
          <div className="flex items-center gap-2">
            {profile.interests.map((interest, i) => (
              <span key={i} className="text-sm px-3 py-1 rounded-full font-[family-name:var(--font-playfair)]" style={{ backgroundColor: '#8e44ad20', color: '#8e44ad' }}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Ring Progress */}
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#2c3e50' }}>
            Your Growth This Month
          </h2>
          <div className="flex gap-4">
            {rings.map((ring) => (
              <div key={ring.name} className="flex-1 text-center p-3 rounded-lg" style={{ backgroundColor: '#f8f6f3' }}>
                <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#8e44ad' }}>{ring.level}</div>
                <div className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider mt-1" style={{ color: '#666' }}>{ring.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Social Events */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#8e44ad' }}>
                Meet People
              </h2>
              <div className="space-y-4">
                {socialEvents.map((event, i) => (
                  <div key={i} className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: '#8e44ad', backgroundColor: '#f8f6f3' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-[family-name:var(--font-playfair)] text-lg" style={{ color: '#2c3e50' }}>{event.name}</div>
                        <div className="text-sm" style={{ color: '#8e44ad' }}>{event.date}</div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-[family-name:var(--font-oswald)] uppercase" style={{ backgroundColor: '#e5e5e5', color: '#666' }}>
                        {event.vibe}
                      </span>
                    </div>
                    <div className="text-sm mb-3" style={{ color: '#555' }}>{event.desc}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#27ae60' }}>{event.spots} spots left</span>
                      <button className="text-sm px-4 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#8e44ad', color: 'white' }}>
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Nights */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#c0392b' }}>
                Date Nights & Couples
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {dateNights.map((event, i) => (
                  <div key={i} className="border-2 p-4 rounded-lg" style={{ borderColor: '#c0392b30', backgroundColor: '#fdf6f5' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base mb-1" style={{ color: '#2c3e50' }}>{event.name}</div>
                    <div className="text-sm mb-2" style={{ color: '#c0392b' }}>{event.date}</div>
                    <div className="text-sm mb-3" style={{ color: '#555' }}>{event.desc}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#27ae60' }}>{event.spots} couples left</span>
                      <button className="text-sm px-4 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#c0392b', color: 'white' }}>
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Classes */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#2c3e50' }}>
                My Learning
              </h2>
              <div className="space-y-5">
                {myClasses.map((cls, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#2c3e50' }}>{cls.name}</span>
                      <span className="text-sm" style={{ color: '#8e44ad' }}>{cls.nextSession}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cls.progress}%`, backgroundColor: '#2980b9' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#2980b9', color: 'white' }}>
                Browse All Classes
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* People You Might Like */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#2c3e50' }}>
                People with Similar Interests
              </h2>
              <div className="space-y-4">
                {peopleYouMightLike.map((person, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#8e44ad' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#2c3e50' }}>{person.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>Shared: {person.shared}</div>
                    <div className="text-sm mt-1" style={{ color: '#8e44ad' }}>Seen {person.lastSeen}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm mt-4 italic" style={{ color: '#888' }}>
                Names visible only if both opt-in to connections.
              </p>
            </div>

            {/* Volunteer */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#2c3e50' }}>
                Give Back
              </h2>
              <div className="space-y-4">
                {volunteerOpportunities.map((opp, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: '#f8f6f3' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#2c3e50' }}>{opp.role}</div>
                    <div className="text-sm" style={{ color: '#666' }}>{opp.commitment}</div>
                    <div className="text-sm mt-1" style={{ color: opp.need === 'High' ? '#c0392b' : '#666' }}>
                      Need: {opp.need}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#27ae60', color: 'white' }}>
                Sign Up to Volunteer
              </button>
            </div>

            {/* Privacy Note */}
            <div className="p-5 rounded-lg" style={{ backgroundColor: '#f0f0f0' }}>
              <div className="text-sm" style={{ color: '#555' }}>
                <strong style={{ color: '#2c3e50' }}>Your privacy matters.</strong> Profile details are only shared with people you connect with. You control visibility.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#999' }}>
          This is a simulated adult view showing classes, social events, and community connection with privacy controls.
        </div>
      </main>
    </div>
  )
}
