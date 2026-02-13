import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { generateMetadata as genMeta } from '@/lib/utils/seo';
import { EmailCapture } from '@/components/shared/EmailCapture';

export const metadata = genMeta({
  title: 'Blog — AI Governance Insights for K-12 Leaders',
  description:
    'Practical AI governance insights for school district leaders — policy frameworks, training strategies, vendor vetting, FERPA compliance, and shadow AI prevention.',
  canonical: 'https://www.wasatchwise.com/blog',
  keywords: [
    'AI governance blog',
    'K-12 AI policy',
    'school district AI training',
    'FERPA AI compliance',
    'education AI insights',
  ],
});

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-lg text-gray-600 mb-12">
          AI governance insights for K-12 leaders.
        </p>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post, idx) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <time className="text-sm text-gray-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors mt-1 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>

                {/* Email capture after second post */}
                {idx === 1 && (
                  <div className="mt-10 mb-4">
                    <EmailCapture
                      source="blog_listing"
                      heading="Get These Insights in Your Inbox"
                      description="Weekly AI governance tips for school leaders. Practical, no fluff."
                      incentive="Join 150+ district leaders staying ahead of AI."
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16">
          <EmailCapture
            source="blog_bottom"
            heading="Never Miss an Update"
            description="Subscribe for weekly AI governance insights, policy templates, and district success stories."
            buttonText="Subscribe Free"
          />
        </div>
      </div>
    </div>
  );
}
