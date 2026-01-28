import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/version
 * Non-sensitive deployment metadata for QA/debugging.
 */
export async function GET() {
  return NextResponse.json(
    {
      nodeEnv: process.env.NODE_ENV || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelRegion: process.env.VERCEL_REGION || null,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF || null,
      gitRepoSlug: process.env.VERCEL_GIT_REPO_SLUG || null,
      timestamp: new Date().toISOString(),
    },
    { headers: { 'x-api-version': '2025-12-14_v1' } }
  )
}


