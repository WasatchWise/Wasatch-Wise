import { Button } from '@/components/shared/Button';

export function SolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
            The Solution
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            90-Day Governance + Training Protocol
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A proven framework to move from scattered AI usage to clear governance and
            deep teacher readiness—without overwhelming your team.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 1-4: Governance</h3>
            <p className="text-gray-700 mb-4">
              Board-approved AI use policy, FERPA-safe workflows, and clear
              guidance that reduces the teacher verification burden.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Policy drafting & board approval</li>
              <li>✓ Tool vetting & data safeguards</li>
              <li>✓ Admin + teacher communication plan</li>
            </ul>
          </div>
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 5-8: Deep Literacy</h3>
            <p className="text-gray-700 mb-4">
              Training that moves beyond prompting to evaluation, bias detection,
              and assessment redesign.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ PD sessions for admin + teachers</li>
              <li>✓ AI evaluation + bias checklists</li>
              <li>✓ Assessment redesign playbooks</li>
            </ul>
          </div>
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-3">Weeks 9-12: Trust + Verification</h3>
            <p className="text-gray-700 mb-4">
              Compliance verification, district-wide reporting, and a support plan
              that works for rural, suburban, and Title I contexts.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Cognitive Audit assessment</li>
              <li>✓ Compliance verification & reporting</li>
              <li>✓ Ongoing support roadmap</li>
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

