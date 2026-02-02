/**
 * Normalize a potentially-relative image src into a format accepted by `next/image`.
 *
 * `next/image` requires either:
 * - an absolute URL (http/https), or
 * - a root-relative URL starting with "/"
 *
 * We frequently store relative paths in the DB (e.g. "./assets/...") which will
 * crash the dev server if passed directly to `next/image`.
 */
export function normalizeImageSrc(input?: string | null): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Already acceptable
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;

  // Protocol-relative URLs (rare)
  if (raw.startsWith('//')) return `https:${raw}`;

  // Common bad formats coming from DB/content
  if (raw.startsWith('./')) {
    return `/${raw.slice(2)}`;
  }

  // "assets/..." without a leading slash
  if (raw.startsWith('assets/')) {
    return `/${raw}`;
  }

  // Last resort: make it root-relative to avoid `next/image` runtime crash.
  // This may still 404 if the asset doesn't exist, but it won't take the app down.
  return `/${raw}`;
}


