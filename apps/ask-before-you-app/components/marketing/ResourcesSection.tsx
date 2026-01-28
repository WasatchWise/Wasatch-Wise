import { Button } from '@/components/shared/Button';

export function ResourcesSection() {
  return (
    <section id="resources" className="py-12 sm:py-16 md:py-20 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
            Resources
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Tools that reveal what your district is really facing
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Start with free guidance and an AI readiness check, then follow up with a
            tailored audit that maps policy and training gaps.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="rounded-xl border border-orange-100 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">AI Readiness Quiz</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              A quick assessment that surfaces policy gaps, shadow AI risk, and training
              depth in minutes.
            </p>
            <Button href="/tools/ai-readiness-quiz" variant="primary" size="md">
              Take the Quiz
            </Button>
          </div>
          <div className="rounded-xl border border-orange-100 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">WiseBot</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Get concise answers on governance, evaluation, bias, and assessment redesign.
            </p>
            <Button href="/tools/wisebot" variant="outline" size="md">
              Ask a Question
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
