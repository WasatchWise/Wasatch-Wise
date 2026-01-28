import { Button } from '@/components/shared/Button';

export function CaseStudiesSection() {
  return (
    <section id="case-studies" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-orange-500 font-semibold mb-2">
            Case Studies
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Strategic briefing examples
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            See how we translate market signals, policy gaps, and training needs into
            credible positioning for district leaders.
          </p>
        </div>
        <div className="max-w-3xl mx-auto rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-2">
            Private strategic briefing
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">Clarion</h3>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
            A detailed brief on the K-12 AI conversation landscape, the shadow AI reality,
            and how to lead with governance-first, teacher-ready design.
          </p>
          <Button href="/clarion" variant="primary" size="md">
            View the Clarion Brief
          </Button>
        </div>
      </div>
    </section>
  );
}
