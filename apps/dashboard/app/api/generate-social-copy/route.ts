import { NextRequest, NextResponse } from 'next/server';
import { generateWithClaude } from '@/lib/ai/claude';
import { getPostBySlug } from '@/lib/blog';

async function runGeneration(blogSlug: string) {
  const post = getPostBySlug(blogSlug);
  if (!post) {
    return NextResponse.json(
      { error: `Blog post not found: ${blogSlug}` },
      { status: 404 }
    );
  }

  const blogUrl = `https://wasatchwise.com/blog/${post.slug}`;

  const linkedInPrompt = `You are a social media strategist for WasatchWise, an AI governance consultancy serving K-12 districts.

BLOG POST TO REPURPOSE:
Title: ${post.title}
Excerpt: ${post.excerpt}

Full content:
${post.content}

TASK: Generate a LinkedIn post (300-500 words) that:
1. Opens with a provocative question or stat from the blog
2. Highlights the most valuable insight (not a summary)
3. Includes 2-3 bullet points with practical takeaways
4. Ends with a clear CTA: "Read the full framework at ${blogUrl}"
5. Uses professional but accessible tone (no buzzwords, no fluff)
6. Includes 3-5 relevant hashtags (#EdTech #K12 #AIGovernance #StudentDataPrivacy #AIGovernance)

OUTPUT: Return ONLY the LinkedIn post text, no meta labels. Put hashtags at the end on their own line.`;

  const twitterPrompt = `You are a content strategist creating a Twitter/X thread for WasatchWise.

BLOG POST TO REPURPOSE:
Title: ${post.title}
Excerpt: ${post.excerpt}

Full content:
${post.content}

TASK: Create a Twitter/X thread (5-7 tweets) that:
1. Tweet 1: Hook with surprising stat or contrarian take
2. Tweets 2-5: One insight per tweet, each self-contained
3. Tweet 6: CTA linking to ${blogUrl}
4. Tweet 7: Ask engagement question

RULES: Each tweet max 280 characters. Use line breaks for readability. No hashtags in thread. Conversational, not corporate.

OUTPUT: Return a JSON array of strings, one string per tweet. Example: ["Tweet 1 text", "Tweet 2 text", ...]`;

  const [linkedin, twitterRaw] = await Promise.all([
    generateWithClaude(linkedInPrompt, {
      contentType: 'social_copy',
      maxTokens: 1024,
    }),
    generateWithClaude(twitterPrompt, {
      contentType: 'social_copy',
      maxTokens: 1024,
    }),
  ]);

  let twitter: string[] = [];
  try {
    const cleaned = twitterRaw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    twitter = Array.isArray(parsed)
      ? parsed.filter((t: unknown) => typeof t === 'string')
      : [];
  } catch {
    twitter = twitterRaw
      .split('\n')
      .map((s) => s.replace(/^[\d.]+\s*/, '').trim())
      .filter((s) => s.length > 0 && s.length <= 280)
      .slice(0, 7);
  }

  return NextResponse.json({
    linkedin,
    twitter,
    slug: post.slug,
    title: post.title,
    blogUrl,
  });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json(
      { error: 'Add ?slug=5-questions-superintendents-must-ask-before-ai' },
      { status: 400 }
    );
  }
  return runGeneration(slug);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blogSlug = body.blogSlug ?? body.slug;

    if (!blogSlug || typeof blogSlug !== 'string') {
      return NextResponse.json(
        { error: 'blogSlug is required' },
        { status: 400 }
      );
    }
    return runGeneration(blogSlug);
  } catch (error) {
    console.error('Social copy generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate social copy' },
      { status: 500 }
    );
  }
}

