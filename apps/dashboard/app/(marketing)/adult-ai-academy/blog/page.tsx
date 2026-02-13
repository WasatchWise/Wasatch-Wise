import Link from 'next/link';
import { getAllAAAPosts } from '@/lib/aaa-blog';
import { generateMetadata as genMeta } from '@/lib/utils/seo';

export const metadata = genMeta({
  title: 'Blog — Adult AI Academy',
  description:
    'AI literacy for adults and educators: plain-English explainers, prompting tips, and responsible use—from Adult AI Academy.',
});

export default function AAABlogListingPage() {
  const posts = getAllAAAPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-lg text-slate-600 mb-12">
          AI literacy for adults—plain-English explainers, tips, and responsible use.
        </p>

        {posts.length === 0 ? (
          <p className="text-slate-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/adult-ai-academy/blog/${post.slug}`} className="group block">
                  <time className="text-sm text-slate-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-slate-600 transition-colors mt-1 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-slate-500">
          <Link href="/adult-ai-academy" className="text-slate-600 hover:text-slate-700 underline">
            &larr; Back to Adult AI Academy
          </Link>
        </p>
      </div>
    </div>
  );
}
