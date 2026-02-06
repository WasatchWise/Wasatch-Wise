# SLCTrips Launch Rubric — Control Run (Fresh Score)

**Purpose:** Independent re-run of the full launch rubric from scratch. Do **not** look at existing scores in `LAUNCH_RUBRIC_GO_NO_GO.md`. Score only what you see on the live site. Use this as a control to validate the current verdict and catch anything missed.

**Base URL:** Use production (e.g. `https://www.slctrips.com`) or localhost. Record which you used.

**Today:** Groundhog Day — run from fresh so we don’t “see our shadow” (repeat the same assumptions).

---

## HOW TO SCORE

- Each section: **0–100** (0 = critical failure, 100 = no meaningful gaps).
- **Section average** = mean of the 8 section scores, rounded to integer.
- **Readiness bonus** = +10 only if the punch list below is fully verified (no critical blockers); else 0.
- **Overall** = min(100, Section average + Readiness bonus).
- **Verdict:** GO if Overall ≥ 90; NO-GO if < 90.

At the end, fill in the **Scorecard** and compute Overall and Verdict.

---

## SECTION 1: VALUE DENSITY (0–100)

**What it measures:** TripKit content richness, destination count, drive-time clarity, unique angles, “What Dan Packs” / gear utility.

**Do this:**
1. Open **Homepage** → find Featured TripKits carousel. Note: destination counts visible? Variety (e.g. Morbid, Haunted, Valentine’s)?
2. Open **One paid TripKit** (e.g. `/tripkits/haunted-highway` or `/tripkits/valentines-getaways`). Is there **one full destination write-up** (hero, description/summary, Tips from Dan, Guardian)? Or only preview cards?
3. Open **One destination page** from that TripKit or from Destinations. Are drive time and distance from SLC clear? Any “What Dan Packs” or gear links?
4. Open **Utah Unlocked** (free TripKit). Does it feel substantial (destination count, clarity)?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 2: COST JUSTIFICATION (0–100)

**What it measures:** Price vs. perceived value; “earned” vs “thin” feel; per-destination cost implied or stated.

**Do this:**
1. On **2–3 TripKit pages**, note price and destination count. Can you infer “per destination” value?
2. Does the copy explain why it’s worth the price (e.g. replaces research, curated, lifetime updates)?
3. Does anything feel overpriced or vague for the money?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 3: INSTRUCTIONAL INTEGRITY (0–100)

**What it measures:** Clear purpose, progression, completion, next steps; post-purchase clarity.

**Do this:**
1. **Purpose:** On a TripKit page, is it clear what the product is (e.g. “88 adventures. Zero dollars.” or equivalent)?
2. **Next steps:** Is the Buy / Get access CTA obvious?
3. **Post-purchase:** Is it stated what happens after purchase (e.g. “instant access via email with your unique code” or similar)?
4. **Progression/completion:** Is there any hint of “how do I use this” or a checklist after purchase? (If missing, cap this section in the 70s.)

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 4: DAN EXPERIENCE (0–100)

**What it measures:** Mascot personality in copy; chatbot or other interactivity if present.

**Do this:**
1. Homepage: Is “Dan” or mascot present (illustration, copy)?
2. Destination or TripKit page: “Tips from Dan,” “What Dan Packs,” or similar voice?
3. Check for **chatbot**: `/chat`, floating widget, or **in-TripKit chat** (chat may be available only in TripKit context, not site-wide). If found in any context, note it; if none, note “written personality only” and do not penalize below ~65 if copy is consistent.

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 5: FIRST-TIME CLARITY (0–100)

**What it measures:** “What is this? Who is it for? What should I do?” — hero, CTAs, Welcome modal.

**Do this:**
1. Open **Homepage** in an incognito/fresh session if possible. See hero: one clear value prop (e.g. “1 Airport • 1000+ Destinations”)? How many primary CTAs (aim: 2)?
2. Does a Welcome modal or segment (Visiting / New / Local) appear or exist?
3. Is the radial/drive-time map visible and understandable?
4. After scrolling: Is TripKit discovery obvious (carousel)? Or buried?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 6: CONVERSION PATH (0–100)

**What it measures:** Earned vs forced conversion; TripKit discovery; clarity of County Guides vs TripKits vs Destinations.

**Do this:**
1. Can you find TripKits without using the main nav (e.g. carousel, “Get Your TripKit” CTA)?
2. Is “Book Your Adventure” (affiliate) one clear section, or scattered and competing?
3. Are “County Guides” (Guardians), “TripKits,” and “Destinations” distinguishable, or confusing?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 7: ALIGNMENT (AFFILIATES) (0–100)

**What it measures:** Affiliates helpful, disclosed, contextual; not pushy.

**Do this:**
1. Find affiliate content (e.g. Book Your Adventure, Where to Stay, Rent a Car, “What Dan Packs” links).
2. Is disclosure present (e.g. “we may earn,” “partner links”)?
3. Do placements feel contextual or intrusive?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## SECTION 8: PARTNER READINESS (0–100)

**What it measures:** Would you show this to a tourism partner? “Funofficial Partner” / SLC Airport framing; professionalism.

**Do this:**
1. Look for partner/SLC Airport framing (footer, About, or similar).
2. Overall: Would you confidently show this to a tourism board or hotel partner? Any obvious embarrassment (broken images, “County County,” “Hours: Not specified”)?

**Score 0–100:** _____  
**Notes:** _________________________________________________

---

## PUNCH LIST (for Readiness bonus)

Verify each; if any **critical** item fails, Readiness bonus = 0.

- [ ] **Guardian images:** No broken guardian images; placeholders or fallbacks where image missing.
- [ ] **TripKit sample:** At least one paid TripKit has **one full destination write-up** (not just cards).
- [ ] **County bug:** No “County County” or duplicate “County” in guardian headings.
- [ ] **Post-purchase copy:** TripKit purchase flow states what happens after buy (e.g. email + access/code).
- [ ] **Hours:** Destination pages do not show “Hours: Not specified” when empty (hidden or omitted).
- [ ] **Distance “0”:** No “0h 0m” or “0 miles” for SLC Airport; shows “At SLC Airport” or equivalent.
- [ ] **Images loading:** Skeletons or placeholders while images load; no blank holes.

**Readiness bonus:** +10 if all above pass; else 0. _____ (0 or 10)

---

## SCORECARD (fill after run)

| # | Section              | Score (0–100) |
|---|----------------------|---------------|
| 1 | Value Density        | _____         |
| 2 | Cost Justification   | _____         |
| 3 | Instructional Integrity | _____      |
| 4 | Dan Experience       | _____         |
| 5 | First-Time Clarity   | _____         |
| 6 | Conversion Path     | _____         |
| 7 | Alignment (Affiliates) | _____       |
| 8 | Partner Readiness    | _____         |

**Sum of 8:** _____  
**Section average (Sum ÷ 8, rounded):** _____  
**Readiness bonus:** _____ (0 or 10)  
**Overall (average + bonus, max 100):** _____  
**Verdict:** GO / NO-GO (GO if Overall ≥ 90)

---

## CONTROL RUN METADATA

- **Date run:** _______________
- **Base URL:** _______________
- **Runner:** Claude Chrome extension / human / other: _______________
- **Compare to baseline:** LAUNCH_RUBRIC_GO_NO_GO.md had section average 82, bonus 10, overall 92 GO. Record control-run overall here: _____ so we can confirm or flag drift.

---

## CONTROL RUN RESULTS (2026-02-02)

**Date run:** February 2, 2026  
**Base URL:** https://www.slctrips.com (production)  
**Runner:** Claude Chrome extension  

| # | Section | Score |
|---|---------|-------|
| 1 | Value Density | 85 |
| 2 | Cost Justification | 80 |
| 3 | Instructional Integrity | 78 |
| 4 | Dan Experience | 72 |
| 5 | First-Time Clarity | 88 |
| 6 | Conversion Path | 85 |
| 7 | Alignment (Affiliates) | 90 |
| 8 | Partner Readiness | 88 |

**Sum of 8:** 666  
**Section average:** 83  
**Readiness bonus:** 10  
**Overall:** 93  
**Verdict:** GO ✅  

**Comparison to baseline:** Section average 83 (baseline 82), overall 93 (baseline 92). Control run confirms and slightly exceeds baseline; no drift. Site is launch-ready.

**Note — Chatbot:** As of this run, the control checked `/chat` and site-wide widgets (none found). The **chatbot is available in TripKit context** (not at `/chat` or as a global widget). Future runs should check TripKit pages for in-context chat when scoring Dan Experience.
