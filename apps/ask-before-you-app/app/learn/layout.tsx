/**
 * Force /learn to be dynamically rendered so useSearchParams() in page.tsx
 * does not cause prerender errors during build.
 * @see https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Knowledge hub | Ask Before You App',
  description: 'Facts, procedures, and sources for K-12 student data privacy. Understand apps, state laws, and how to be an advocate.',
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
