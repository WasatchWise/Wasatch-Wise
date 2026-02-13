import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface AAABlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
}

const AAA_BLOG_DIR = path.join(process.cwd(), 'content', 'adult-ai-academy', 'blog');

export function getAllAAAPosts(): AAABlogPost[] {
  if (!fs.existsSync(AAA_BLOG_DIR)) return [];

  const files = fs.readdirSync(AAA_BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const filePath = path.join(AAA_BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '',
      excerpt: data.excerpt ?? '',
      author: data.author ?? 'Adult AI Academy',
      tags: data.tags ?? [],
      content,
    } satisfies AAABlogPost;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAAAPostBySlug(slug: string): AAABlogPost | undefined {
  const filePath = path.join(AAA_BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    author: data.author ?? 'Adult AI Academy',
    tags: data.tags ?? [],
    content,
  };
}
