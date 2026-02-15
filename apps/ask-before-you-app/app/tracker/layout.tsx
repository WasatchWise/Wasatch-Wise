import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'State Privacy Tracker | Ask Before You App',
  description:
    'Interactive 50-state guide to student data privacy laws, AI governance, SDPC membership, and DPA availability. Find your state. Know your landscape. Close the gap.',
}

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
