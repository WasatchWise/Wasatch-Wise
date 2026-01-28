'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function EventsDemo() {
  const [selectedMonth, setSelectedMonth] = useState('november')

  const events = {
    november: [
      { day: 21, title: 'Board Meeting', time: '6pm–8pm', type: 'governance', attendees: 12, status: 'now' },
      { day: 22, title: 'Family Wellness Day', time: '10am–2pm', type: 'wellness', attendees: 120, status: '65% RSVP' },
      { day: 27, title: 'Thanksgiving Potluck', time: '12pm–3pm', type: 'community', attendees: 200, status: '82% RSVP' },
      { day: 29, title: 'Winter Quest Showcase', time: '4pm–7pm', type: 'showcase', attendees: 85, status: '45% RSVP' },
    ],
    december: [
      { day: 7, title: 'Holiday Craft Fair', time: '10am–4pm', type: 'community', attendees: 150, status: '70% RSVP' },
      { day: 14, title: 'TechNest Game Jam', time: '10am (24hr)', type: 'technest', attendees: 40, status: 'Full' },
      { day: 21, title: 'Winter Solstice Celebration', time: '5pm–8pm', type: 'community', attendees: 100, status: '55% RSVP' },
      { day: 31, title: 'NYE Sleepover Extravaganza', time: '8pm–8am', type: 'featured', attendees: 75, status: '68% RSVP' },
    ],
    january: [
      { day: 4, title: 'Creative Studio Open House', time: '1pm–5pm', type: 'creative', attendees: 60, status: '40% RSVP' },
      { day: 11, title: 'New Year Goal Setting Workshop', time: '10am–12pm', type: 'wellness', attendees: 30, status: '50% RSVP' },
      { day: 18, title: 'MLK Day of Service', time: '9am–3pm', type: 'civic', attendees: 100, status: '35% RSVP' },
      { day: 25, title: 'Family Game Night', time: '6pm–9pm', type: 'community', attendees: 80, status: '25% RSVP' },
    ]
  }

  const typeColors: Record<string, string> = {
    governance: '#3d2914',
    wellness: '#4a7c59',
    community: '#6b4c7a',
    showcase: '#c9a227',
    technest: '#3d6b8c',
    creative: '#8b2635',
    civic: '#6366f1',
    featured: '#c9a227'
  }

  const currentEvents = events[selectedMonth as keyof typeof events]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f6f3' }}>
      {/* Header */}
      <header className="border-b-2 px-4 py-3" style={{ backgroundColor: '#faf9f7', borderColor: '#3d2914' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="font-[family-name:var(--font-oswald)] text-lg font-bold tracking-wider" style={{ color: '#3d2914' }}>
              THE RINGS
            </Link>
            <span className="ml-3 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider px-2 py-1 rounded" style={{ backgroundColor: '#8b2635', color: 'white' }}>
              Events Demo
            </span>
          </div>
          <Link href="/" className="text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider hover:opacity-70" style={{ color: '#3d2914' }}>
            ← Back to Site
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-2" style={{ color: '#3d2914' }}>
            Campus Events Calendar
          </h1>
          <p className="font-[family-name:var(--font-playfair)] text-sm" style={{ color: '#666' }}>
            Programs, workshops, community gatherings, and special events
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {['november', 'december', 'january'].map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className="px-4 py-2 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-all"
              style={{
                backgroundColor: selectedMonth === month ? '#3d2914' : 'transparent',
                color: selectedMonth === month ? '#faf9f7' : '#3d2914',
                border: `1px solid #3d2914`
              }}
            >
              {month} {month === 'january' ? '2026' : '2025'}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#3d6b8c' }}>
              {currentEvents.length}
            </div>
            <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>
              Events This Month
            </div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#4a7c59' }}>
              {currentEvents.reduce((sum, e) => sum + e.attendees, 0)}
            </div>
            <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>
              Expected Attendees
            </div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#c9a227' }}>
              89%
            </div>
            <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>
              Avg Attendance Rate
            </div>
          </div>
          <div className="bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: '#8b2635' }}>
              $4.2k
            </div>
            <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>
              Monthly Revenue
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#3d2914' }}>
            {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} {selectedMonth === 'january' ? '2026' : '2025'}
          </h2>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-[family-name:var(--font-oswald)] uppercase py-2" style={{ color: '#999' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for start of month */}
            {Array.from({ length: selectedMonth === 'november' ? 6 : selectedMonth === 'december' ? 1 : 3 }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square p-1" />
            ))}
            {/* Days of month */}
            {Array.from({ length: selectedMonth === 'november' ? 30 : 31 }, (_, i) => {
              const day = i + 1
              const event = currentEvents.find(e => e.day === day)
              const isToday = selectedMonth === 'november' && day === 21
              return (
                <div
                  key={day}
                  className={`aspect-square p-1 rounded transition-all ${event ? 'cursor-pointer hover:scale-105' : ''}`}
                  style={{
                    backgroundColor: event ? typeColors[event.type] : isToday ? '#f0f0f0' : 'transparent'
                  }}
                >
                  <div className={`text-xs ${event ? 'text-white font-bold' : ''}`} style={{ color: event ? 'white' : '#3d2914' }}>
                    {day}
                  </div>
                  {event && (
                    <div className="text-[8px] text-white truncate mt-0.5 hidden sm:block">
                      {event.title.split(' ')[0]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#3d2914' }}>
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {currentEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-l-4 transition-all hover:shadow-md"
                style={{ borderColor: typeColors[event.type], backgroundColor: '#fafafa' }}
              >
                <div className="text-center flex-shrink-0 w-12">
                  <div className="text-2xl font-bold font-[family-name:var(--font-playfair)]" style={{ color: typeColors[event.type] }}>
                    {event.day}
                  </div>
                  <div className="text-[10px] font-[family-name:var(--font-oswald)] uppercase" style={{ color: '#666' }}>
                    {selectedMonth.slice(0, 3)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-[family-name:var(--font-playfair)] font-medium text-lg" style={{ color: '#3d2914' }}>
                    {event.title}
                  </div>
                  <div className="text-sm" style={{ color: '#666' }}>
                    {event.time} • Expected: {event.attendees} attendees
                  </div>
                </div>
                <div>
                  <span
                    className="text-xs px-3 py-1 rounded font-[family-name:var(--font-oswald)] uppercase"
                    style={{
                      backgroundColor: event.status === 'now' ? '#4a7c59' : event.status === 'Full' ? '#8b2635' : '#c9a227',
                      color: 'white'
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Types Legend */}
        <div className="bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider mb-4" style={{ color: '#3d2914' }}>
            Event Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'wellness', label: 'Wellness' },
              { type: 'technest', label: 'TechNest' },
              { type: 'creative', label: 'Creative Studio' },
              { type: 'civic', label: 'Civic Lab' },
              { type: 'community', label: 'Community' },
              { type: 'showcase', label: 'Showcase' },
              { type: 'governance', label: 'Governance' },
              { type: 'featured', label: 'Featured' },
            ].map((cat) => (
              <div key={cat.type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: typeColors[cat.type] }} />
                <span className="text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider" style={{ color: '#666' }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <p className="font-[family-name:var(--font-playfair)] text-sm mb-4" style={{ color: '#666' }}>
            Want to host an event at Fullmer Legacy Center?
          </p>
          <Link
            href="/#join"
            className="inline-block px-6 py-3 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider transition-all hover:scale-105"
            style={{ backgroundColor: '#c9a227', color: '#3d2914' }}
          >
            Contact Us
          </Link>
        </div>
      </main>
    </div>
  )
}
