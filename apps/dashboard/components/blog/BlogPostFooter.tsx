import Link from 'next/link';
import { EmailCapture } from '@/components/shared/EmailCapture';

const BLOG_POSTS = [
  { slug: 'shadow-ai-in-k12-what-administrators-need-to-know', title: 'Shadow AI in K-12' },
  { slug: 'how-to-create-ai-governance-policy-school-district', title: 'How to Create an AI Governance Policy' },
  { slug: 'ferpa-vs-coppa-ai-in-schools', title: 'FERPA vs COPPA' },
  { slug: 'why-your-district-needs-ai-governance-now', title: 'Why Your District Needs AI Governance Now' },
  { slug: '5-questions-superintendents-must-ask-before-ai', title: '5 Questions Superintendents Must Ask' },
];

interface BlogPostFooterProps {
  currentSlug: string;
}

export function BlogPostFooter({ currentSlug }: BlogPostFooterProps) {
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== currentSlug).slice(0, 3);

  return (
    <footer className="mt-16 pt-8 border-t border-gray-200 space-y-12">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Governance Starter Kit</h3>
        <p className="text-gray-600 text-sm mb-4">
          Get three professional documents ready to customize: AI Policy Template, Vendor Vetting
          Checklist, and Board Presentation Template. $79 one-time.
        </p>
        <Link
          href="/starter-kit"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm"
        >
          Get the Starter Kit – $79
        </Link>
      </div>

      <EmailCapture
        source="blog"
        heading="Get our free AI Readiness Quiz"
        description="Assess your district's AI readiness in 2 minutes. Get a personalized score and actionable next steps."
        buttonText="Get the Quiz"
        incentive="We'll send the quiz link and weekly AI governance insights."
      />

      {otherPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Posts</h3>
          <ul className="space-y-2">
            {otherPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-orange-600 hover:text-orange-700 text-sm"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  );
}
