import Link from 'next/link'

export default function PartnerDemo() {
  const event = {
    name: 'Paint & Sip Night',
    partner: 'Craft & Crush',
    date: 'Friday, November 22',
    time: '7:00 PM - 9:00 PM',
    capacity: 24,
    registered: 20,
    checkedIn: 0,
  }

  const attendees = [
    { name: 'Sarah M.', status: 'registered', partner: 'Coming with Mike R.' },
    { name: 'Mike R.', status: 'registered', partner: 'Coming with Sarah M.' },
    { name: 'Jennifer K.', status: 'registered', partner: null },
    { name: 'Carlos M.', status: 'registered', partner: null },
    { name: 'Helen T.', status: 'registered', partner: 'Coming with Robert T.' },
    { name: 'Robert T.', status: 'registered', partner: 'Coming with Helen T.' },
  ]

  const eventDetails = {
    materials: 'Canvas, paints, brushes (provided)',
    beverages: 'Wine and soft drinks included',
    parking: 'Free in main lot',
    contact: 'events@craftandcrush.com',
  }

  const revenue = {
    ticketPrice: 45,
    registered: 20,
    partnerSplit: 60,
    ringSplit: 40,
  }

  const upcomingPartnerEvents = [
    { name: 'Pottery Basics', partner: 'Craft & Crush', date: 'Dec 6', registered: 12 },
    { name: 'Mixology Night', partner: 'Local Distillery', date: 'Dec 13', registered: 8 },
    { name: 'Holiday Wreath Making', partner: 'Garden Club', date: 'Dec 15', registered: 15 },
  ]

  const feedback = [
    { event: 'Last Paint Night', rating: 4.8, comments: 23, highlight: 'Great instructor, loved the wine selection' },
    { event: 'Craft Fair', rating: 4.5, comments: 18, highlight: 'Well organized, nice variety of vendors' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="border-b-2 sticky top-0 z-50" style={{ backgroundColor: '#ffffff', borderColor: '#1a365d' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider hover:opacity-70" style={{ color: '#1a365d' }}>
              ← Back to Site
            </Link>
            <span style={{ color: '#38a169' }}>|</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-widest uppercase" style={{ color: '#1a365d' }}>
              Partner Event View
            </span>
          </div>
          <div className="text-sm">
            <span style={{ color: '#666' }}>Partner: </span>
            <span className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#1a365d' }}>{event.partner}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Event Header */}
        <div className="bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1" style={{ color: '#1a365d' }}>{event.name}</h1>
              <div style={{ color: '#666' }}>
                {event.date} • {event.time}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#38a169' }}>
                {event.registered}/{event.capacity}
              </div>
              <div className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>Registered</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(event.registered / event.capacity) * 100}%`, backgroundColor: '#38a169' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm" style={{ color: '#666' }}>
              <span>{event.capacity - event.registered} spots remaining</span>
              <span className="font-semibold" style={{ color: '#38a169' }}>{Math.round((event.registered / event.capacity) * 100)}% full</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendees */}
            <div className="bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider" style={{ color: '#1a365d' }}>
                  Attendees
                </h2>
                <span className="text-sm" style={{ color: '#666' }}>
                  {event.checkedIn} checked in
                </span>
              </div>
              <div className="space-y-3">
                {attendees.map((person, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: '#e5e5e5', backgroundColor: '#fafafa' }}>
                    <div>
                      <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#1a365d' }}>{person.name}</div>
                      {person.partner && (
                        <div className="text-sm" style={{ color: '#666' }}>{person.partner}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-[family-name:var(--font-oswald)]" style={{ color: '#d69e2e' }}>{person.status}</span>
                      <button className="text-sm px-4 py-2 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ backgroundColor: '#38a169', color: 'white' }}>
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
                <span className="text-sm" style={{ color: '#666' }}>
                  + {event.registered - attendees.length} more registered
                </span>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1a365d' }}>
                Revenue Breakdown
              </h2>
              <div className="grid grid-cols-2 gap-6 mb-5">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="text-sm" style={{ color: '#666' }}>Ticket Price</div>
                  <div className="text-2xl font-[family-name:var(--font-playfair)] font-bold" style={{ color: '#1a365d' }}>${revenue.ticketPrice}</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                  <div className="text-sm" style={{ color: '#666' }}>Total Revenue</div>
                  <div className="text-2xl font-[family-name:var(--font-playfair)] font-bold" style={{ color: '#38a169' }}>
                    ${revenue.ticketPrice * revenue.registered}
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid #e5e5e5' }}>
                <div className="flex justify-between text-base">
                  <span style={{ color: '#666' }}>Partner ({revenue.partnerSplit}%)</span>
                  <span className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#1a365d' }}>
                    ${Math.round(revenue.ticketPrice * revenue.registered * (revenue.partnerSplit / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span style={{ color: '#666' }}>The Rings ({revenue.ringSplit}%)</span>
                  <span className="font-[family-name:var(--font-playfair)] font-semibold" style={{ color: '#3182ce' }}>
                    ${Math.round(revenue.ticketPrice * revenue.registered * (revenue.ringSplit / 100))}
                  </span>
                </div>
              </div>
            </div>

            {/* Past Event Feedback */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1a365d' }}>
                Past Event Feedback
              </h2>
              <div className="space-y-4">
                {feedback.map((fb, i) => (
                  <div key={i} className="p-4 border rounded-lg" style={{ borderColor: '#e5e5e5', backgroundColor: '#fafafa' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#1a365d' }}>{fb.event}</span>
                      <span className="font-[family-name:var(--font-oswald)] text-lg" style={{ color: '#d69e2e' }}>★ {fb.rating}</span>
                    </div>
                    <div className="text-sm" style={{ color: '#666' }}>
                      {fb.comments} comments • "{fb.highlight}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1a365d' }}>
                Event Details
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm" style={{ color: '#666' }}>Materials</div>
                  <div className="text-base font-[family-name:var(--font-playfair)]" style={{ color: '#1a365d' }}>{eventDetails.materials}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: '#666' }}>Beverages</div>
                  <div className="text-base font-[family-name:var(--font-playfair)]" style={{ color: '#1a365d' }}>{eventDetails.beverages}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: '#666' }}>Parking</div>
                  <div className="text-base font-[family-name:var(--font-playfair)]" style={{ color: '#1a365d' }}>{eventDetails.parking}</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: '#666' }}>Contact</div>
                  <div className="text-base" style={{ color: '#3182ce' }}>{eventDetails.contact}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1a365d' }}>
                Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#3182ce', color: 'white' }}>
                  Send Reminder
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#805ad5', color: 'white' }}>
                  Export Attendee List
                </button>
                <button className="w-full text-left text-sm px-4 py-3 rounded-lg font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-colors" style={{ backgroundColor: '#38a169', color: 'white' }}>
                  Open Check-In Mode
                </button>
              </div>
            </div>

            {/* Upcoming Partner Events */}
            <div className="bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-5" style={{ color: '#1a365d' }}>
                More Partner Events
              </h2>
              <div className="space-y-4">
                {upcomingPartnerEvents.map((evt, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#38a169' }}>
                    <div className="font-[family-name:var(--font-playfair)] text-base" style={{ color: '#1a365d' }}>{evt.name}</div>
                    <div className="text-sm" style={{ color: '#666' }}>
                      {evt.partner} • {evt.date}
                    </div>
                    <div className="text-sm" style={{ color: '#38a169' }}>{evt.registered} registered</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm py-6 font-[family-name:var(--font-playfair)] italic" style={{ color: '#999' }}>
          This is a simulated partner event view showing registration, revenue splits, and event management.
        </div>
      </main>
    </div>
  )
}
