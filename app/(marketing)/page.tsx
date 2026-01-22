'use client';

import { Hero } from '@/components/marketing/Hero';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { MethodologySection } from '@/components/marketing/MethodologySection';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { CaseStudiesSection } from '@/components/marketing/CaseStudiesSection';
import { ResourcesSection } from '@/components/marketing/ResourcesSection';
import { CTASection } from '@/components/marketing/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <MethodologySection />
      <ProblemSection />
      <SolutionSection />
      <CaseStudiesSection />
      <ResourcesSection />
      <CTASection />
    </>
  );
}

