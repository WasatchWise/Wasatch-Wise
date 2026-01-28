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
    const normalized = `/${raw.slice(2)}`;
    // #region agent log (debug-session)
    if (raw.includes('assets/destinations/')) {
      fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H6',location:'src/lib/normalizeImageSrc.ts:normalizeImageSrc',message:'Normalized next/image src from ./ to /',data:{rawPrefix:raw.slice(0,40),normalizedPrefix:normalized.slice(0,40)},timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion
    return normalized;
  }

  // "assets/..." without a leading slash
  if (raw.startsWith('assets/')) {
    const normalized = `/${raw}`;
    // #region agent log (debug-session)
    if (raw.includes('assets/destinations/')) {
      fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H6',location:'src/lib/normalizeImageSrc.ts:normalizeImageSrc',message:'Normalized next/image src from assets/ to /assets/',data:{rawPrefix:raw.slice(0,40),normalizedPrefix:normalized.slice(0,40)},timestamp:Date.now()})}).catch(()=>{});
    }
    // #endregion
    return normalized;
  }

  // Last resort: make it root-relative to avoid `next/image` runtime crash.
  // This may still 404 if the asset doesn't exist, but it won't take the app down.
  const normalized = `/${raw}`;
  // #region agent log (debug-session)
  if (raw.includes('assets/destinations/')) {
    fetch('http://127.0.0.1:7243/ingest/9934ba6e-ffcf-48d8-922e-9c87005464bd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H6',location:'src/lib/normalizeImageSrc.ts:normalizeImageSrc',message:'Normalized next/image src by prefixing /',data:{rawPrefix:raw.slice(0,40),normalizedPrefix:normalized.slice(0,40)},timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion
  return normalized;
}


