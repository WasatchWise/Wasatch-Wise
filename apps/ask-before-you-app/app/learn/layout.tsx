/**
 * Force /learn to be dynamically rendered so useSearchParams() in page.tsx
 * does not cause prerender errors during build.
 * @see https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */
export const dynamic = 'force-dynamic';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
