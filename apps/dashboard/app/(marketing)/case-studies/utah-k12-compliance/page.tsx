import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

// CONFIRMED by John: 41 districts + 116 charters = 157 LEAs total.
// Timeline: 6-year statewide transformation (started at 8% when John joined).
const DISTRICT_COUNT = 157;
const TIMELINE = '6 years';

export const metadata = genMeta({
  title: 'How Utah Elevated K-12 Data Privacy Compliance from 8% to 92%',
  description: `Case study: Utah's K-12 data privacy transformation across ${DISTRICT_COUNT} districts and charters. The challenge, the approach, and the results.`,
  canonical: 'https://www.wasatchwise.com/case-studies/utah-k12-compliance',
  keywords: ['Utah K-12', 'data privacy compliance', '8% to 92%', 'school district', 'FERPA'],
});

export default function UtahK12CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            How Utah Elevated K-12 Data Privacy Compliance from 8% to 92%
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><strong>8%</strong> Starting</span>
            <span><strong>92%</strong> Final</span>
            <span><strong>{DISTRICT_COUNT}</strong> Districts &amp; Charters</span>
            <span><strong>{TIMELINE}</strong></span>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Challenge</h2>
          <p className="text-gray-700 leading-relaxed">
            Utah K-12 faced a compliance gap. Districts and charters were responsible for student
            data privacy under FERPA and state law, but adoption of required controls was low.
            Visibility across {DISTRICT_COUNT} LEAs was limited, and many lacked the resources to
            implement governance effectively.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Approach</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A five-pillar approach drove the transformation:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Clear requirements:</strong> Standards and controls defined in plain language</li>
            <li><strong>Support and training:</strong> Guidance and resources for districts</li>
            <li><strong>Monitoring and feedback:</strong> Regular check-ins and progress tracking</li>
            <li><strong>Vendor alignment:</strong> Working with EdTech providers on DPAs and compliance</li>
            <li><strong>Sustained focus:</strong> Consistent attention over a multi-year effort</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">The Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Metric</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Before</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">After</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Compliance rate</td>
                  <td className="border border-gray-200 px-4 py-2">8%</td>
                  <td className="border border-gray-200 px-4 py-2">92%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">LEAs in scope</td>
                  <td className="border border-gray-200 px-4 py-2" colSpan={2}>{DISTRICT_COUNT}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Lessons</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Clarity beats complexity. Simple, actionable requirements get adopted.</li>
            <li>Support matters. Districts need guidance, not just mandates.</li>
            <li>Consistency over time drives results. One-off efforts do not.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About WasatchWise</h2>
          <p className="text-gray-700 leading-relaxed">
            WasatchWise was founded by the practitioner who led this transformation. We bring the
            same approach to AI governance: practical, clear, and built on what actually works
            in K-12.
          </p>
        </section>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to transform your district?</h3>
          <p className="text-gray-600 mb-4">Schedule a DAROS Briefing.</p>
          <Link href="/daros">
            <Button className="bg-orange-500 hover:bg-orange-600">Schedule DAROS Briefing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
