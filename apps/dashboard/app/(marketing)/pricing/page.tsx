import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { generateMetadata as genMeta, getServiceSchema, getFAQSchema } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'Pricing — AI Governance Consulting for K-12 Districts',
  description:
    'AI governance packages for school districts. From 60-minute board briefings ($6,300) to full implementation sprints ($12,999-$35,499) and ongoing support.',
  canonical: 'https://www.wasatchwise.com/pricing',
  keywords: [
    'AI governance pricing',
    'school district AI consulting cost',
    'K-12 AI compliance services',
    'education AI policy consultant',
    'FERPA compliance consulting',
  ],
});

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
    { name: "On-Site Full Day", price: "$12,000 + travel", duration: "8 hours", desc: "Immersive in-person experience (travel typically $1K-$2K)" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            AI Governance <span className="text-orange-500">Built for Reality</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your entry point. Scale as you grow. We meet districts where they are—
            from board briefings to multi-year partnerships.
          </p>
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
            <p>⚡ Most districts start with the <span className="font-semibold"> DAROS Briefing</span></p>
            <p className="italic mt-1 sm:mt-2">"If ethical scope, I don't discount outcomes." — All pricing reflects true cost & value.</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
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

        {/* Digital Products */}
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            <span className="text-orange-500">Digital Products</span>
          </h2>
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <h3 className="font-bold text-gray-900">AI Governance Starter Kit</h3>
                <p className="text-sm text-gray-600">
                  3 professional PDFs: Policy Template, Vendor Checklist, Board Presentation Template
                </p>
              </div>
              <Link href="/starter-kit">
                <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto whitespace-nowrap">
                  Buy Now – $79
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Workshops Add-Ons */}
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 leading-tight">
            <span className="text-orange-500">Workshops</span> (Add-On or Standalone)
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

        {/* Not Sure Where to Start? */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Not Sure Where to Start?</h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto text-lg">
            Book a free 30-minute consultation. We'll assess your district's AI readiness
            and recommend the right package — no commitment required.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_BOOKING_URL || '/contact'}
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Free Consultation
          </a>
          <p className="text-orange-200 text-sm mt-4">
            Most districts start with a DAROS Briefing and grow from there.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
          <p>💡 <strong>Terms:</strong> 30% upfront, 40% on delivery, 30% at 60-day check-in. Minimum engagement: $2,000. On-site work: $2K/day + $1K for travel.</p>
          <p>🔄 <strong>Quick scope</strong> - I don't discount outcomes. Most districts transition from Briefing → Sprint → Ongoing partnership.</p>
        </div>

        {/* FAQ for SEO */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                q: 'How long does it take to implement AI governance?',
                a: 'Our 30-Day Implementation Sprint delivers a complete governance foundation in one month — including policy, training, and infrastructure. Most districts see measurable results within the first week.',
              },
              {
                q: 'Do you work with districts outside Utah?',
                a: 'Yes. While our methodology was proven across 157 Utah districts and charter schools, our frameworks apply to any K-12 district in the US. Virtual delivery is available for all services.',
              },
              {
                q: 'What makes WasatchWise different from other AI consultants?',
                a: 'We built our approach inside the system — elevating Utah\'s FERPA compliance from 8% to 92% statewide. We focus on practical governance that actually gets adopted, not theoretical frameworks.',
              },
              {
                q: 'Can we start small and scale up?',
                a: 'Absolutely. Most districts start with a DAROS Briefing ($6,300) to assess their current state, then move to a 30-Day Sprint for implementation. Our Ongoing Support ensures you stay current as AI evolves.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
