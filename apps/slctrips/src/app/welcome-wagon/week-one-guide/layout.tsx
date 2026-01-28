import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Week 1 Welcome Wagon Kit | Salt Lake City Relocation Guide | SLCTrips',
  description: 'Complete Week 1 survival guide for new Utah residents. Essential utilities setup, emergency contacts, DMV info, coffee shops, restaurants, neighborhoods, and action checklist for your first week in Salt Lake City.',
  keywords: [
    'Salt Lake City',
    'Utah relocation',
    'moving to Utah',
    'SLC guide',
    'new resident guide',
    'utilities setup',
    'DMV Utah',
    'Salt Lake City neighborhoods',
    'SLC coffee shops',
    'Utah restaurants',
    'relocation checklist',
    'Welcome Wagon',
  ],
  openGraph: {
    title: 'Week 1 Welcome Wagon Kit | Salt Lake City',
    description: 'Your complete guide to surviving and thriving in your first week in Salt Lake City, Utah.',
    type: 'website',
    url: 'https://slctrips.com/welcome-wagon/week-one-guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Week 1 Welcome Wagon Kit | Salt Lake City',
    description: 'Complete guide for your first week in Salt Lake City, Utah.',
  },
  alternates: {
    canonical: '/welcome-wagon/week-one-guide',
  },
};

export default function WeekOneGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

