/**
 * First-visit modal content by brand/entry point.
 * Aligned with Brand Matrix: docs/content/SABRINA_MATRIX_FIRST_VISIT_MODALS.md
 */

export type FirstVisitModalSlug = 'wasatchwise' | 'adult-ai-academy';

export interface FirstVisitModalContent {
  slug: FirstVisitModalSlug;
  headline: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export const FIRST_VISIT_MODAL_CONFIG: Record<FirstVisitModalSlug, FirstVisitModalContent> = {
  wasatchwise: {
    slug: 'wasatchwise',
    headline: 'AI governance for school districts',
    body: 'Stop worrying about AI compliance. Build trust with parents, protect student data, and empower teachers—in 90 days.',
    primaryCta: { label: 'Book a Cognitive Audit', href: '/contact' },
    secondaryCta: { label: 'Take the AI Readiness Quiz', href: '/tools/ai-readiness-quiz' },
  },
  'adult-ai-academy': {
    slug: 'adult-ai-academy',
    headline: 'Practical AI literacy for adults',
    body: "Whether you're upskilling, hesitant to try AI, or ready to go beyond the basics. Built for real people—no jargon.",
    primaryCta: { label: 'Get Started', href: '/contact?service=Adult%20AI%20Academy' },
    secondaryCta: { label: 'Take Free Assessment', href: '/tools/ai-readiness-quiz' },
  },
};

const PATH_TO_SLUG: Record<string, FirstVisitModalSlug> = {
  '/': 'wasatchwise',
  '/adult-ai-academy': 'adult-ai-academy',
};

export function getModalSlugForPath(pathname: string): FirstVisitModalSlug | null {
  if (pathname === '/adult-ai-academy' || pathname.startsWith('/adult-ai-academy/')) {
    return 'adult-ai-academy';
  }
  if (pathname === '/') {
    return 'wasatchwise';
  }
  return null;
}

export function getModalContentForPath(pathname: string): FirstVisitModalContent | null {
  const slug = getModalSlugForPath(pathname);
  return slug ? FIRST_VISIT_MODAL_CONFIG[slug] : null;
}
