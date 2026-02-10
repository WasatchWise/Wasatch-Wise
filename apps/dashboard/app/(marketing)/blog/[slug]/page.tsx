import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `https://wasatchwise.com/blog/${post.slug}`;

  return {
    title: `${post.title} | WasatchWise`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WasatchWise',
      url: 'https://wasatchwise.com',
    },
    mainEntityOfPage: `https://wasatchwise.com/blog/${post.slug}`,
  };

  return (
    <article className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/blog"
          className="text-sm text-orange-500 hover:text-orange-600 transition-colors mb-8 inline-block"
        >
          &larr; Back to Blog
        </Link>

        <header className="mb-10">
          <time className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            {post.title}
          </h1>
          <p className="text-gray-600">By {post.author}</p>
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
        </header>

        <div className="prose prose-lg prose-gray prose-headings:text-gray-900 prose-a:text-orange-500 hover:prose-a:text-orange-600 max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
