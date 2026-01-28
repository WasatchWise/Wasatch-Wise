# HCI TripKit Evaluation - Claude Chrome Extension Prompt

**Use this with your Claude Chrome Extension to evaluate all TripKits**

---

## 🎯 Main Evaluation Prompt

Copy and paste this into Claude when viewing each TripKit page:

```
I'm evaluating this TripKit for content depth, value proposition, and instructional design. Please analyze this page thoroughly:

## CONTENT DEPTH ANALYSIS

1. **Deep Dive Stories:**
   - How many "Deep Dive Stories" or narrative content sections are visible on this page?
   - List all story titles you can see
   - Are these full-length articles or just brief summaries?
   - What's the approximate word count/reading time for each story?
   - Are stories accessible/clickable or just listed?

2. **Content Quality:**
   - Does this feel like a curated guidebook with rich narratives, or just a destination list?
   - Is there engaging storytelling, or generic descriptions?
   - Does content show expertise and curation, or feel automated?
   - Is there a personal voice (Dan's perspective)?

## VALUE PROPOSITION

**TripKit Details:**
- Price: [CHECK PAGE FOR PRICE]
- Destinations: [CHECK PAGE FOR COUNT]
- Deep Dive Stories: [COUNT FROM ABOVE]

**Evaluation:**
1. Is the price justified by the content depth shown?
2. Would you pay this amount for what's currently visible?
3. What's missing that would make it worth the price?
4. How does value compare to similar products?
5. Rate value proposition: 1-10 (10 = excellent value)

## INSTRUCTIONAL DESIGN ASSESSMENT

1. Are there learning objectives listed?
2. Is there a "What You'll Learn" section?
3. Are there educational themes or curriculum alignment?
4. Does it teach something beyond "places to visit"?
5. Is there structured educational content?
6. Rate instructional design: 1-10 (10 = excellent)

## DYNAMIC CONTENT EVALUATION

1. Are there interactive elements (progress tracking, notes, wishlist)?
2. Is there video or audio content?
3. Are there resource centers or additional materials?
4. Does it feel dynamic and engaging, or static?
5. Rate dynamic content: 1-10 (10 = very dynamic)

## SPECIFIC CONTENT CHECKS

**For Morbid Misdeeds (TK-015):**
- Is the Ted Bundy story visible and accessible?
- Is the Elizabeth Smart story visible and accessible?
- Are other true crime stories from Notebook LM curation present?
- Do stories have full content or just summaries?

**For Movie Madness (TK-038):**
- Are film location stories visible?
- Do stories explain the movies filmed there?
- Is there narrative content about the filming process?

## ISSUES FOUND

List any specific problems:
- Missing content
- Stories not displaying
- Content truncated
- Broken links
- Access issues

## RECOMMENDATIONS

Provide specific, actionable recommendations to:
1. Increase content depth
2. Improve value proposition
3. Enhance instructional design
4. Make content more dynamic
5. Fix any display issues

## OVERALL VERDICT

- Content Depth Score: [1-10]
- Value Proposition Score: [1-10]
- Instructional Design Score: [1-10]
- Dynamic Content Score: [1-10]
- **Overall Viability: [Viable / Needs Work / Not Viable]**

**Would you pay the asking price for this TripKit as-is?** [Yes/No/Maybe]

**What would make it worth the price?** [Specific improvements]
```

---

## 📋 Quick Evaluation Checklist

For each TripKit, check:

- [ ] Deep dive stories visible (count them)
- [ ] Stories have full content (not just summaries)
- [ ] Curated content present (Ted Bundy, etc. for TK-015)
- [ ] Instructional design elements visible
- [ ] Dynamic/interactive features working
- [ ] Value matches price
- [ ] Would pay for this? (Yes/No)

---

## 🔍 TripKit-Specific Prompts

### For Morbid Misdeeds (TK-015):

```
This is the Morbid Misdeeds TripKit. I spent significant time curating content in Notebook LM including:
- Ted Bundy story
- Elizabeth Smart story
- Other true crime narratives

Please verify:
1. Are these stories visible on this page?
2. Can you access the full Ted Bundy story?
3. Can you access the full Elizabeth Smart story?
4. Do stories show full content or just summaries?
5. Is the curated Notebook LM content actually displayed?

If stories are missing or truncated, that's a critical issue.
```

### For Movie Madness (TK-038):

```
This TripKit should have 13 deep dive stories about film locations. Please:
1. Count how many stories are visible
2. List the story titles
3. Check if stories are accessible/clickable
4. Verify stories have full content about the movies
5. Assess if content is engaging and worth the price
```

---

## 📊 Evaluation Results Template

### TripKit: [CODE] - [NAME]

**URL:** `/tripkits/[slug]/view`

**Findings:**
- Deep Dive Stories Found: [COUNT]
- Story Titles: [LIST]
- Full Content: [Yes/No]
- Curated Content Visible: [Yes/No]

**Scores:**
- Content Depth: [1-10]
- Value Proposition: [1-10]
- Instructional Design: [1-10]
- Dynamic Content: [1-10]

**Issues:**
- [List problems]

**Recommendations:**
- [List improvements]

**Verdict:** [Viable/Needs Work/Not Viable]

---

**Start with Morbid Misdeeds (TK-015) to verify Ted Bundy and Elizabeth Smart stories are visible!**
