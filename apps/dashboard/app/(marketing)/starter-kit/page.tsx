import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarterKitCTA } from './StarterKitCTA';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { FileText } from 'lucide-react';

export const metadata = genMeta({
  title: 'AI Governance Starter Kit for School Districts',
  description:
    'Three professional documents ready to customize: AI Policy Template, Vendor Vetting Checklist, Board Presentation Template. Built by the practitioner who led Utah\'s 8%-to-92% K-12 data privacy transformation.',
  canonical: 'https://www.wasatchwise.com/starter-kit',
  keywords: [
    'AI policy template',
    'school district AI governance',
    'vendor vetting checklist',
    'board presentation AI',
    'K-12 AI compliance',
  ],
});

const INCLUDED_ITEMS = [
  {
    title: 'AI Policy Template',
    pages: 13,
    description: 'Fill-in-the-blank governance policy your district can adopt and customize.',
    icon: FileText,
  },
  {
    title: 'Vendor Vetting Checklist',
    pages: 7,
    description: '20-point scored evaluation framework for assessing AI tools before adoption.',
    icon: FileText,
  },
  {
    title: 'Board Presentation Template',
    pages: 12,
    description: '10-slide outline with speaker notes to present AI governance to your board.',
    icon: FileText,
  },
];

const FAQ = [
  {
    q: 'Are these documents customizable?',
    a: 'Yes. All three PDFs are designed for customization. Add your district name, adjust language to match your policies, and tailor examples to your context.',
  },
  {
    q: 'What format do I receive?',
    a: 'You get PDF files that work in any PDF viewer. The Policy Template and Board Presentation are also structured so you can copy text into Word or Google Docs for editing.',
  },
  {
    q: 'How do I access the files after purchase?',
    a: 'After checkout, you will see download links on the success page and receive an email with the same links. Links are valid for 24 hours. Save the files locally for long-term access.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes. If the Starter Kit does not meet your expectations, contact us within 7 days for a full refund.',
  },
];

export default function StarterKitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            AI Governance Starter Kit for School Districts
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Everything your district needs to start governing AI responsibly. Three professional
            documents, ready to customize.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-4xl font-bold text-orange-500">$79</span>
            <span className="text-gray-500">one-time purchase</span>
          </div>
        </div>

        {/* What's Included */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {INCLUDED_ITEMS.map((item) => (
            <Card key={item.title} className="bg-white border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <item.icon className="w-5 h-5 text-orange-600" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm">
                  {item.pages} pages · {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
          <p className="text-gray-700 text-center italic">
            Built by the practitioner who led Utah&apos;s 8%-to-92% K-12 data privacy
            transformation.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <StarterKitCTA />
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
