'use client';

import { Hero } from '@/components/marketing/Hero';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { CTASection } from '@/components/marketing/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <CTASection />
    </>
  );
}

