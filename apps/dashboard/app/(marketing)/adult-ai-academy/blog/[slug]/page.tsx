import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getAllAAAPosts, getAAAPostBySlug } from '@/lib/aaa-blog';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllAAAPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getAAAPostBySlug(slug);
  if (!post) return {};

  const url = `https://adultaiacademy.com/adult-ai-academy/blog/${post.slug}`;

  return {
    title: `${post.title} — Adult AI Academy`,
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

export default async function AAABlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getAAAPostBySlug(slug);
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
      name: 'Adult AI Academy',
      url: 'https://adultaiacademy.com',
    },
    mainEntityOfPage: `https://adultaiacademy.com/adult-ai-academy/blog/${post.slug}`,
  };

  return (
    <article className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/adult-ai-academy/blog"
          className="text-sm text-slate-600 hover:text-slate-700 transition-colors mb-8 inline-block"
        >
          &larr; Back to Blog
        </Link>

        <header className="mb-10">
          <time className="text-sm text-slate-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            {post.title}
          </h1>
          <p className="text-slate-600">By {post.author}</p>
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
        </header>

        <div className="prose prose-lg prose-gray prose-headings:text-gray-900 prose-a:text-slate-600 hover:prose-a:text-slate-700 max-w-none">
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
