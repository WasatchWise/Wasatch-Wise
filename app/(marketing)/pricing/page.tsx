import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      name: "DAROS Briefing",
      tagline: "60-Minute Board-Ready Briefing",
      priceRange: "$6,300 - $15,000",
      description: "Fast-track board approval with data-driven AI risk assessment",
      features: [
        {
          level: "Starter ($6,300)",
          items: ["Stakeholder Matrix", "Controls Snapshot", "30/60/90 Action Plan"]
        },
        {
          level: "Standard ($9,500)",
          items: ["+ Top 10 Vendor Inventory", "Safe Harbor Guidance", "2 Follow-ups"]
        },
        {
          level: "Enterprise ($15,000)",
          items: ["+ Vendor Risk Map", "Parent/Teacher Comms", "Measurement Baseline"]
        }
      ],
      cta: "Book Discovery Call",
      popular: false
    },
    {
      name: "30-Day Implementation Sprint",
      tagline: "Policy + Training + Infrastructure",
      priceRange: "$12,999 - $35,499",
      description: "Complete governance foundation delivered in one month",
      features: [
        {
          level: "Starter ($12,999)",
          items: ["AI Use Policy", "1 Admin Workshop", "Staff Safe-Harbor Guidance"]
        },
        {
          level: "Standard ($20,499)",
          items: ["+ Teacher Training", "Parent Outreach", "Vendor Vetting Workflow"]
        },
        {
          level: "Enterprise ($35,499)",
          items: ["+ Board Session", "Incident Playbook", "Procurement Templates"]
        }
      ],
      cta: "Start Your Sprint",
      popular: true
    },
    {
      name: "Ongoing Support",
      tagline: "Sustained Monthly Partnership",
      priceRange: "$6,300 - $20,000/mo",
      description: "Keep pace with AI evolution and maintain compliance",
      features: [
        {
          level: "Light (10 hrs/mo)",
          items: ["$6,300/month", "Policy updates", "Quarterly check-ins"]
        },
        {
          level: "Standard (20 hrs/mo)",
          items: ["$14,600/month", "+ Monthly training", "Priority support"]
        },
        {
          level: "Enterprise (30 hrs/mo)",
          items: ["$20,000/month", "+ Dedicated advisor", "Custom deliverables"]
        }
      ],
      cta: "Schedule Consultation",
      popular: false
    }
  ];

  const workshops = [
    { name: "Virtual Lunch & Learn", price: "$2,500", duration: "60 min", desc: "Quick awareness boost" },
    { name: "Virtual Workshop", price: "$4,500", duration: "2 hours", desc: "Deep-dive training" },
    { name: "On-Site Full Day", price: "$17,999 + travel", duration: "8 hours", desc: "Immersive experience" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Governance <span className="text-orange-500">Built for Reality</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your entry point. Scale as you grow. We meet districts where they are—
            from board briefings to multi-year partnerships.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p>⚡ Most districts start with the <span className="font-semibold"> DAROS Briefing</span></p>
            <p className="italic mt-2">"If ethical scope, I don't discount outcomes." — All pricing reflects true cost & value.</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative ${tier.popular ? 'ring-2 ring-orange-500 shadow-xl scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mb-4">{tier.tagline}</CardDescription>
                <div className="text-3xl font-bold text-orange-500 mb-2">{tier.priceRange}</div>
                <p className="text-sm text-gray-700">{tier.description}</p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="border-t border-gray-200 pt-3">
                      <div className="font-semibold text-sm text-gray-900 mb-2">{feature.level}</div>
                      <ul className="space-y-2">
                        {feature.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <Link href={`/contact?service=${encodeURIComponent(tier.name)}`}>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workshops Add-Ons */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-orange-500">Workshops</span> (Add-On or Standalone)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Card key={workshop.name} className="hover:border-orange-500 transition-colors">
                <CardHeader>
                  <CardTitle className="font-bold text-lg mb-2">{workshop.name}</CardTitle>
                  <div className="text-2xl font-bold text-orange-500 mb-1">{workshop.price}</div>
                  <CardDescription className="text-sm text-gray-600 mb-3">{workshop.duration}</CardDescription>
                  <p className="text-sm text-gray-700">{workshop.desc}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-600 space-y-2">
          <p>💡 <strong>Terms:</strong> 30% upfront, 40% on delivery, 30% at 60-day check-in. Minimum engagement: $2,000. On-site work: $2K/day + $1K for travel.</p>
          <p>🔄 <strong>Quick scope</strong> - I don't discount outcomes. Most districts transition from Briefing → Sprint → Ongoing partnership.</p>
        </div>
      </div>
    </div>
  );
}
