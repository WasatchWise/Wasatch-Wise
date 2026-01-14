import { Button } from '@/components/shared/Button';

export function SolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-blue-600 font-semibold mb-2">
            The Solution
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            90-Day Compliance Protocol
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A proven framework to go from zero AI governance to full compliance
            in 90 days—without overwhelming your team.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 1-4: Governance</h3>
            <p className="text-gray-700 mb-4">
              Board-approved AI use policy, FERPA compliance framework, and
              clear guidelines for teachers.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Policy drafting & board approval</li>
              <li>✓ Legal review & compliance check</li>
              <li>✓ Communication strategy</li>
            </ul>
          </div>
          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 5-8: Onboarding</h3>
            <p className="text-gray-700 mb-4">
              Teacher training, tool evaluation process, and pilot program with
              early adopters.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Professional development sessions</li>
              <li>✓ Tool approval workflow</li>
              <li>✓ Pilot program launch</li>
            </ul>
          </div>
          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 9-12: Audit</h3>
            <p className="text-gray-700 mb-4">
              Full district audit, compliance verification, and ongoing support
              framework.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Cognitive Audit assessment</li>
              <li>✓ Compliance verification</li>
              <li>✓ Annual retainer setup</li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <Button href="/contact" variant="primary" size="lg">
            Get Started with Cognitive Audit
          </Button>
        </div>
      </div>
    </section>
  );
}

