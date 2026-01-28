# HCI TripKit Evaluation - Claude Chrome Extension Script

**Use this with Claude Chrome Extension to evaluate all TripKits**

---

## 🚨 CRITICAL ISSUE DISCOVERED

**Problem:** Deep dive stories are displayed on the **sales page** (`/tripkits/[slug]`) but **NOT in the TripKit viewer** (`/tripkits/[slug]/view`) where users actually spend time after purchase.

**Impact:** Users see stories when deciding to buy, but can't access them after purchase. This is a major value proposition issue.

**Stories That Exist (But May Not Be Visible in Viewer):**
- **TK-015 (Morbid Misdeeds):** 5 stories including Ted Bundy, Elizabeth Smart
- **TK-038 (Movie Madness):** 13 stories
- **TK-024 (Brewery Trail):** 5 stories
- **TK-013 (Unexplained Utah):** 4 stories
- **TK-005 (Secret Springs):** 3 stories

---

## 🎯 EVALUATION PROMPT FOR CLAUDE

**Copy this prompt and use it on each TripKit viewer page:**

```
I'm evaluating this TripKit for content depth, value proposition, and instructional design. Please analyze thoroughly:

## 1. CONTENT DEPTH ASSESSMENT

**Deep Dive Stories:**
- How many "Deep Dive Stories" sections are visible on THIS page?
- List all story titles you can see
- Are stories clickable/accessible from this page?
- Do stories show full content or just summaries?
- What's the reading time/word count for stories?

**Content Quality:**
- Does this feel like a curated guidebook with rich narratives?
- Or just a destination list?
- Is there engaging storytelling?
- Does it show expertise and curation?
- Is there a personal voice (Dan's perspective)?

**Critical Check:**
- Are the curated stories (like Ted Bundy, Elizabeth Smart for Morbid Misdeeds) visible HERE?
- Or are they only on the sales page?

## 2. VALUE PROPOSITION

**TripKit Details:**
- Price: [FIND ON PAGE]
- Destinations: [COUNT ON PAGE]
- Deep Dive Stories Visible: [COUNT FROM ABOVE]

**Questions:**
1. Is the price justified by the content depth shown ON THIS PAGE?
2. Would you pay this amount for what's currently visible HERE?
3. What's missing that would make it worth the price?
4. Rate value proposition: 1-10 (10 = excellent value)

**Note:** If stories are on sales page but not here, that's a CRITICAL issue.

## 3. INSTRUCTIONAL DESIGN

- Are there learning objectives listed?
- Is there a "What You'll Learn" section?
- Educational themes present?
- Does it teach beyond "places to visit"?
- Structured educational content?
- Rate instructional design: 1-10

## 4. DYNAMIC CONTENT

- Interactive elements (progress tracking, notes, wishlist)?
- Video/audio content?
- Resource centers or additional materials?
- Does it feel dynamic and engaging, or static?
- Rate dynamic content: 1-10

## 5. SPECIFIC CONTENT VERIFICATION

**For Morbid Misdeeds (TK-015):**
This TripKit should have these curated stories:
- Ted Bundy in Utah: The Capture, The Escape, The Legacy
- Elizabeth Smart: Kidnapping, Survival, and Becoming a Voice for Others
- Mountain Meadows Massacre
- The Susan Powell Case
- The Hi-Fi Murders

**Please verify:**
- Are these 5 stories visible on THIS page?
- Can you access them?
- Do they have full content?

**For Movie Madness (TK-038):**
- Should have 13 film location stories
- Are they visible on this page?
- Can you access them?

## 6. ISSUES FOUND

**List specific problems:**
- Stories missing from viewer page
- Content truncated
- Broken links
- Access issues
- Other problems

## 7. RECOMMENDATIONS

**To increase value:**
1. [Specific improvement 1]
2. [Specific improvement 2]
3. [Specific improvement 3]

**To improve content depth:**
1. [Specific improvement 1]
2. [Specific improvement 2]

**To enhance instructional design:**
1. [Specific improvement 1]
2. [Specific improvement 2]

## 8. OVERALL VERDICT

**Scores:**
- Content Depth: [1-10] - [REASON]
- Value Proposition: [1-10] - [REASON]
- Instructional Design: [1-10] - [REASON]
- Dynamic Content: [1-10] - [REASON]

**Would you pay the asking price for what's visible on THIS page?** [Yes/No/Maybe]

**What would make it worth the price?** [Specific improvements]

**Overall Viability:** [Viable / Needs Work / Not Viable]
```

---

## 📋 EVALUATION CHECKLIST

### For Each TripKit Viewer Page (`/tripkits/[slug]/view`):

**Content Depth:**
- [ ] Deep dive stories visible? (Count: ___)
- [ ] Stories accessible/clickable?
- [ ] Full content or summaries?
- [ ] Curated content present?

**Value:**
- [ ] Price justified by content shown?
- [ ] Would pay this amount?
- [ ] What's missing?

**Instructional Design:**
- [ ] Learning objectives?
- [ ] Educational value?
- [ ] Structured content?

**Dynamic:**
- [ ] Interactive features?
- [ ] Multimedia?
- [ ] Engaging vs. static?

---

## 🔍 PRIORITY EVALUATION ORDER

**Start with these (highest story count):**

1. **TK-038: Movie Madness** - 13 stories
   - URL: `/tripkits/movie-madness/view`
   - Check: Are all 13 stories visible?

2. **TK-015: Morbid Misdeeds** - 5 stories
   - URL: `/tripkits/morbid-misdeeds/view`
   - **CRITICAL:** Verify Ted Bundy and Elizabeth Smart stories visible

3. **TK-024: Brewery Trail** - 5 stories
4. **TK-013: Unexplained Utah** - 4 stories
5. **TK-005: Secret Springs** - 3 stories

**Then evaluate others:**
6. TK-045: 250 Under $25 (0 stories - may need stories)
7. TK-002: Ski Utah Complete (0 stories)
8. TK-014: Haunted Highway (0 stories)
9. TK-025: Coffee Culture (0 stories)
10. TK-055: Tee Time Golf (0 stories)

---

## 📊 EXPECTED FINDINGS

Based on code analysis:

1. **Stories NOT in Viewer** - Stories only on sales page, not viewer
2. **Missing Curated Content** - Ted Bundy, Elizabeth Smart not accessible after purchase
3. **Static Feel** - Just destination lists, no narratives
4. **Not Worth Price** - Missing the deep dive content that justifies cost
5. **No Instructional Design** - May lack learning objectives

---

## 🎯 SPECIFIC EVALUATION: Morbid Misdeeds

**Stories That Should Be Visible:**
1. Ted Bundy in Utah (16,254 words, 13 min read)
2. Elizabeth Smart (13,991 words, 11 min read)
3. Mountain Meadows Massacre (14,727 words, 12 min read)
4. Susan Powell Case (14,691 words, 12 min read)
5. Hi-Fi Murders (15,437 words, 12 min read)

**Total:** ~75,000 words of curated content

**Claude Prompt:**
```
This Morbid Misdeeds TripKit costs $19.99 and should have 5 deep dive stories:
1. Ted Bundy in Utah
2. Elizabeth Smart
3. Mountain Meadows Massacre
4. Susan Powell Case
5. Hi-Fi Murders

Please verify:
1. Are these stories visible on THIS page?
2. Can you click/access them?
3. Do stories show full content (not just summaries)?
4. If stories are missing, that's CRITICAL - the $19.99 value isn't accessible

This TripKit has ~75,000 words of curated content. Is that content visible and accessible here?
```

---

## 📝 RESULTS TEMPLATE

### TripKit: [CODE] - [NAME]

**URL Evaluated:** `/tripkits/[slug]/view`

**Content Found:**
- Deep Dive Stories Visible: [COUNT]
- Story Titles: [LIST]
- Stories Accessible: [Yes/No]
- Full Content: [Yes/No]

**Scores:**
- Content Depth: [1-10]
- Value Proposition: [1-10]
- Instructional Design: [1-10]
- Dynamic Content: [1-10]

**Critical Issues:**
- [List problems]

**Recommendations:**
- [List improvements]

**Verdict:** [Viable / Needs Work / Not Viable]

---

**Start evaluating now!** Begin with Morbid Misdeeds to verify Ted Bundy and Elizabeth Smart stories are accessible in the viewer.
