import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { CheckCircle } from 'lucide-react';

export const metadata = genMeta({
  title: 'DAROS Briefing — AI Governance for K-12 Districts',
  description:
    'Your district is already using AI. Are you governing it? 60-minute board-ready briefing. $6,300 starting. Led by the practitioner who took Utah K-12 compliance from 8% to 92%.',
  canonical: 'https://www.wasatchwise.com/daros',
  keywords: [
    'DAROS briefing',
    'AI governance K-12',
    'school district AI',
    '60-minute briefing',
    'board-ready AI assessment',
  ],
});

const TIERS = [
  { name: 'Essential', price: '$6,300', features: ['Stakeholder Matrix', 'Controls Snapshot', '30/60/90 Action Plan'] },
  { name: 'Professional', price: '$9,800', features: ['+ Top 10 Vendor Inventory', 'Safe Harbor Guidance', '2 Follow-ups'] },
  { name: 'Enterprise', price: '$15,000', features: ['+ Vendor Risk Map', 'Parent/Teacher Comms', 'Measurement Baseline'] },
];

export default function DarosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Your District Is Already Using AI. Are You Governing It?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            90 Day Protocol · 60 Minute Briefing · 8% to 92%
          </p>
          <p className="text-2xl font-bold text-orange-500 mb-8">$6,300 Starting At</p>
          <Link href="/daros/contact">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-lg font-semibold">
              Schedule Your 60-Minute Briefing
            </Button>
          </Link>
        </div>

        {/* The Problem */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>The Problem</CardTitle>
            <CardDescription>
              Teachers and staff are using AI tools every day. Many were never vetted. No DPAs. No policy.
              Shadow AI is growing, and the board is asking questions you cannot yet answer.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* What You Get */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h2>
          <ul className="space-y-3">
            {['Data-driven AI risk assessment', 'Board-ready controls snapshot', '30/60/90 day action plan', 'Vendor inventory (Professional+)', 'Safe harbor guidance'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Tiers */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => (
            <Card key={tier.name}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <div className="text-2xl font-bold text-orange-500">{tier.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/daros/contact" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-orange-500 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to govern AI responsibly?</h2>
          <p className="text-orange-100 mb-6">
            Book a 60-minute briefing. No commitment required.
          </p>
          <Link href={process.env.NEXT_PUBLIC_BOOKING_URL || '/contact'}>
            <Button className="bg-white text-orange-600 hover:bg-orange-50">
              Schedule Your Briefing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
