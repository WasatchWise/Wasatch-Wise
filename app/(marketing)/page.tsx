import { Hero } from '@/components/marketing/Hero';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { SolutionSection } from '@/components/marketing/SolutionSection';
import { CTASection } from '@/components/marketing/CTASection';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'AI Governance for School Districts',
  description:
    'Stop worrying about AI compliance. Start building trust with parents, protecting student data, and empowering teachers—all in 90 days.',
});

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

