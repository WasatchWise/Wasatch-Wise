import type { Metadata } from 'next'
import EventsCalendarClient from './EventsCalendarClient'
import { getEvents } from '@/lib/supabase/queries'

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date()
  const month = now.toLocaleString('en-US', { month: 'long' })
  const year = now.getFullYear()
  const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return {
    title: `${month} ${year} Local Show Calendar | Updated ${today} | The RockSalt`,
    description: `Local show calendar for ${month} ${year}. Find upcoming concerts, shows, and live music events across Utah. Updated ${today}.`,
  }
}

export default async function EventsPage() {
  const events = await getEvents(200) // Get more for the calendar
  return <EventsCalendarClient initialEvents={events} />
}
