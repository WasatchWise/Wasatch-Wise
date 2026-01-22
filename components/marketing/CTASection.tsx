import { Button } from '@/components/shared/Button';

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
          Ready to Close the Governance + Training Gap?
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 leading-relaxed">
          Start with a free Cognitive Audit. We'll map shadow AI, policy risk,
          and training depth—then show you exactly where to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/tools/ai-readiness-quiz" variant="secondary" size="lg">
            Take Free Quiz (2 min)
          </Button>
          <Button href="/contact" variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-500">
            Book Cognitive Audit
          </Button>
        </div>
        <p className="mt-6 text-sm text-white/80">
          No credit card required • Results in 24 hours
        </p>
      </div>
    </section>
  );
}

