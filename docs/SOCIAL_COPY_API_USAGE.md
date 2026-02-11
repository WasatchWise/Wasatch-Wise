# Social Copy API — Usage
**Endpoint:** `/api/generate-social-copy`  
**Purpose:** Generate LinkedIn post + Twitter thread from any blog post.

---

## Quick Test (GET)
```bash
# Local dev (run dashboard first: pnpm dev:dashboard)
curl "http://localhost:3000/api/generate-social-copy?slug=5-questions-superintendents-must-ask-before-ai"

# Production (after deploy)
curl "https://wasatchwise.com/api/generate-social-copy?slug=5-questions-superintendents-must-ask-before-ai"
```

## POST
```bash
curl -X POST https://wasatchwise.com/api/generate-social-copy \
  -H "Content-Type: application/json" \
  -d '{"blogSlug": "ferpa-vs-coppa-ai-in-schools"}'
```

## Response
```json
{
  "linkedin": "...",
  "twitter": ["Tweet 1", "Tweet 2", ...],
  "slug": "5-questions-superintendents-must-ask-before-ai",
  "title": "The 5 Questions Every Superintendent Must Ask Before Adopting AI Tools",
  "blogUrl": "https://wasatchwise.com/blog/5-questions-superintendents-must-ask-before-ai"
}
```

## Available Slugs
- `5-questions-superintendents-must-ask-before-ai`
- `ferpa-vs-coppa-ai-in-schools`
- `why-your-district-needs-ai-governance-now`
