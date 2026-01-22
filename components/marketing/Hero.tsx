import { Button } from '@/components/shared/Button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          AI Governance + AI Literacy
          <br />
          <span className="text-orange-500">Built for K-12 Reality</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Close the policy gap, end shadow AI, and train teachers beyond
          prompting—while giving administrators the efficiency they want.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button href="/tools/ai-readiness-quiz" variant="primary" size="lg">
            Take Free AI Readiness Quiz
          </Button>
          <Button href="/contact" variant="outline" size="lg">
            Book Cognitive Audit
          </Button>
        </div>
        <div className="mt-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
            What you get in 90 days
          </p>
          <div className="grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-lg border border-orange-100 bg-white/80 p-4">
              <p className="text-sm font-semibold text-gray-900">Board-ready governance</p>
              <p className="text-sm text-gray-600">
                Policy, tool vetting, and safe-harbor guidance aligned to FERPA.
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white/80 p-4">
              <p className="text-sm font-semibold text-gray-900">Deep teacher training</p>
              <p className="text-sm text-gray-600">
                Evaluation, bias detection, and assessment redesign—not just prompts.
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white/80 p-4">
              <p className="text-sm font-semibold text-gray-900">Community trust</p>
              <p className="text-sm text-gray-600">
                Clear communication that works for rural, Title I, and suburban contexts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

