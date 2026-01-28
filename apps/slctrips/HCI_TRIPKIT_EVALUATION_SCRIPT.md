# HCI TripKit Evaluation Script for Claude Chrome Extension

**Purpose:** Comprehensive evaluation of all TripKits to assess content depth, value proposition, and instructional design  
**Method:** Use Claude Chrome Extension to analyze each TripKit page  
**Date:** January 2025

---

## 🎯 Evaluation Framework

### Core Questions to Answer:

1. **Content Depth:** Does this TripKit have deep dives, stories, curated content beyond just destination lists?
2. **Value Proposition:** Is the content worth the asking price?
3. **Instructional Design:** Is there educational value, learning objectives, structured content?
4. **Dynamic Content:** Are there stories, narratives, multimedia beyond static lists?
5. **Curated Quality:** Does it include the curated content you created (e.g., Ted Bundy, Elizabeth Smart for Morbid Misdeeds)?

---

## 📋 Evaluation Checklist for Each TripKit

### Test 1: Content Depth Assessment

**Navigate to:** `/tripkits/[slug]/view`

**Questions:**
- [ ] Are there "Deep Dive Stories" visible on the page?
- [ ] How many deep dive stories are present? (Count them)
- [ ] Do stories include rich content (not just summaries)?
- [ ] Are stories linked to specific destinations?
- [ ] Is there narrative content beyond destination descriptions?

**Expected:** Each TripKit should have 5-15 deep dive stories with full content

---

### Test 2: Curated Content Verification

**For Morbid Misdeeds (TK-015) specifically:**
- [ ] Is Ted Bundy story present and accessible?
- [ ] Is Elizabeth Smart story present and accessible?
- [ ] Are other curated true crime stories visible?
- [ ] Do stories have full content (not truncated)?

**For other TripKits:**
- [ ] Are the curated stories from Notebook LM present?
- [ ] Is the content you spent time curating actually visible?

---

### Test 3: Value Proposition Analysis

**Evaluate:**
- [ ] Price vs. content depth (is $14.99 justified?)
- [ ] Number of destinations vs. price
- [ ] Presence of deep dives vs. price
- [ ] Instructional design elements vs. price
- [ ] Overall "worth it" score (1-10)

**Formula:**
```
Value Score = (Content Depth × 0.4) + (Destination Count × 0.2) + (Stories × 0.3) + (Instructional Design × 0.1)
```

---

### Test 4: Instructional Design Assessment

**Check for:**
- [ ] Learning objectives listed
- [ ] Educational themes present
- [ ] Structured content organization
- [ ] "What You'll Learn" sections
- [ ] Curriculum alignment (if applicable)
- [ ] Assessment or reflection prompts

**Expected:** TripKits should have clear educational value beyond just "places to visit"

---

### Test 5: Dynamic Content Evaluation

**Look for:**
- [ ] Video content
- [ ] Audio/voiceover options
- [ ] Interactive elements
- [ ] Progress tracking
- [ ] Notes/annotation features
- [ ] Resource center or additional materials

**Expected:** TripKits should feel dynamic, not static lists

---

### Test 6: Content Quality Review

**Assess:**
- [ ] Writing quality (engaging vs. generic)
- [ ] Story depth (detailed narratives vs. brief summaries)
- [ ] Unique angles (what makes this special?)
- [ ] Research depth (does it show expertise?)
- [ ] Personal voice (does it feel curated by Dan?)

---

## 🔍 Step-by-Step Evaluation Process

### Phase 1: Access Verification

1. Sign in as admin@wasatchwise.com
2. Navigate to `/tripkits` page
3. Verify all 11 TripKits are listed
4. Click each TripKit to verify access

### Phase 2: Content Audit (Use Claude Extension)

For each TripKit, use Claude Chrome Extension to:

1. **Navigate to TripKit view page:** `/tripkits/[slug]/view`
2. **Ask Claude to analyze:**
   ```
   I'm evaluating this TripKit for content depth and value. Please:
   
   1. Count how many "Deep Dive Stories" are visible on this page
   2. List the titles of all deep dive stories
   3. Assess if stories have full content or just summaries
   4. Evaluate the overall content depth (1-10 scale)
   5. Check if there's instructional design content
   6. Assess if this TripKit is worth the price based on content
   7. Provide specific recommendations to improve value
   ```

3. **Document findings** in the evaluation template below

### Phase 3: Specific Content Checks

**For Morbid Misdeeds (TK-015):**
- Navigate to `/tripkits/morbid-misdeeds/view`
- Ask Claude: "Are the Ted Bundy and Elizabeth Smart stories visible and accessible on this page?"
- Check if stories have full content or are truncated
- Verify curated content from Notebook LM is present

**For Movie Madness (TK-038):**
- Navigate to `/tripkits/movie-madness/view`
- Verify access works
- Check for deep dive stories about film locations
- Assess content depth

---

## 📊 Evaluation Template

### TripKit: [CODE] - [NAME]

**Price:** $[PRICE]  
**Destinations:** [COUNT]  
**Deep Dive Stories Found:** [COUNT]  
**Story Titles:** [LIST]

**Content Depth Score:** [1-10]
- Stories present: [Yes/No]
- Full content vs. summaries: [Full/Summary/None]
- Narrative quality: [1-10]
- Curated content visible: [Yes/No]

**Value Proposition Score:** [1-10]
- Price justified: [Yes/No]
- Content worth price: [Yes/No]
- Would you pay: [Yes/No]

**Instructional Design Score:** [1-10]
- Learning objectives: [Present/Missing]
- Educational value: [High/Medium/Low]
- Structured content: [Yes/No]

**Dynamic Content Score:** [1-10]
- Interactive elements: [List]
- Multimedia: [List]
- Progress tracking: [Yes/No]

**Issues Found:**
- [List specific problems]

**Recommendations:**
- [List specific improvements]

**Overall Verdict:** [Viable/Needs Work/Not Viable]

---

## 🎯 Specific Evaluation Prompts for Claude

### Prompt 1: Content Depth Analysis
```
I'm evaluating this TripKit page for content depth. Please analyze:

1. How many "Deep Dive Stories" or narrative content sections are visible?
2. Are these stories full-length articles or just brief summaries?
3. What's the word count/reading time for the stories?
4. Is there rich, detailed content or just basic descriptions?
5. Does this feel like a curated guidebook or just a destination list?

Provide a content depth score (1-10) and specific examples of what's present or missing.
```

### Prompt 2: Value Assessment
```
Evaluate if this TripKit is worth the price:

Price: $[PRICE]
Destinations: [COUNT]
Deep Dive Stories: [COUNT]

Questions:
1. Is the price justified by the content depth?
2. Would you pay this amount for what's shown?
3. What's missing that would make it worth the price?
4. How does it compare to similar products?
5. What specific improvements would increase value?

Provide a value score (1-10) and actionable recommendations.
```

### Prompt 3: Instructional Design Review
```
Assess the instructional design and educational value:

1. Are there learning objectives listed?
2. Is there structured educational content?
3. Are there "What You'll Learn" sections?
4. Is there curriculum alignment?
5. Does it teach something beyond "places to visit"?

Provide an instructional design score (1-10) and recommendations for improvement.
```

### Prompt 4: Curated Content Verification (Morbid Misdeeds)
```
For this Morbid Misdeeds TripKit, please check:

1. Is the Ted Bundy story visible and accessible?
2. Is the Elizabeth Smart story visible and accessible?
3. Are other true crime stories from Notebook LM curation present?
4. Do stories have full content or just summaries?
5. Is the curated content you spent time on actually visible to users?

List what's present and what's missing.
```

---

## 📝 Evaluation Workflow

### Step 1: Setup
1. Open Chrome with Claude extension
2. Sign in to SLCTrips as admin@wasatchwise.com
3. Open this evaluation script in a side panel

### Step 2: For Each TripKit (11 total)

1. Navigate to: `https://www.slctrips.com/tripkits/[slug]/view`
2. Use Claude extension to analyze the page
3. Run the evaluation prompts above
4. Document findings in template
5. Take screenshots of issues

### Step 3: Compile Results

1. Create summary document
2. Rank TripKits by viability
3. List critical issues
4. Provide improvement roadmap

---

## 🎯 Expected Findings Based on Your Feedback

### Likely Issues:

1. **Deep Dive Stories Not Visible**
   - Stories exist in database but may not be displaying
   - Need to check TripKitViewer component

2. **Content Truncated**
   - Stories may show summaries only, not full content
   - Need to verify content_markdown is being rendered

3. **Missing Curated Content**
   - Notebook LM content may not be linked/displayed
   - Ted Bundy, Elizabeth Smart stories may not be accessible

4. **Static Feel**
   - TripKits may feel like lists, not dynamic guides
   - Missing interactive elements

5. **No Instructional Design**
   - May lack learning objectives
   - May not show educational value

---

## 🔧 Quick Fixes to Check

1. **Verify Deep Dive Stories Display:**
   - Check if `deep_dive_stories` table is being queried
   - Verify stories are rendered in TripKitViewer
   - Check if content_markdown is being displayed

2. **Check Story Links:**
   - Verify stories link to destination pages
   - Check if stories are accessible from TripKit view

3. **Content Rendering:**
   - Verify markdown is being rendered
   - Check if full content vs. summaries are shown

---

## 📊 Success Criteria

**A Viable TripKit Should Have:**
- ✅ 5+ deep dive stories with full content
- ✅ Curated narratives (not just destination lists)
- ✅ Instructional design elements
- ✅ Dynamic, engaging content
- ✅ Clear value proposition
- ✅ Worth the asking price

**Current State (Based on Your Feedback):**
- ❌ Missing deep dive content visibility
- ❌ Curated content (Ted Bundy, etc.) not accessible
- ❌ Feels static, not dynamic
- ❌ Not worth the price as-is

---

## 🚀 Next Steps After Evaluation

1. **Document all findings** from Claude analysis
2. **Identify missing content** (stories not displaying)
3. **Fix display issues** (make stories visible)
4. **Enhance content depth** (add more stories/narratives)
5. **Improve instructional design** (add learning objectives)
6. **Make dynamic** (add interactive elements)
7. **Re-evaluate** after fixes

---

**Ready to start evaluation?** Use Claude Chrome Extension on each TripKit page and run through these prompts!
