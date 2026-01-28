import { Button } from '@/components/shared/Button';

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-12 sm:pt-16 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
          AI Governance + AI Literacy
          <br />
          <span className="text-orange-500">Built for K-12 Reality</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
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
        <div className="mt-8 sm:mt-12">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-3 sm:mb-4">
            What you get in 90 days
          </p>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-lg border border-orange-100 bg-white/80 p-3 sm:p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Board-ready governance</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Policy, tool vetting, and safe-harbor guidance aligned to FERPA.
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white/80 p-3 sm:p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Deep teacher training</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Evaluation, bias detection, and assessment redesign—not just prompts.
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-white/80 p-3 sm:p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Community trust</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Clear communication that works for rural, Title I, and suburban contexts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

