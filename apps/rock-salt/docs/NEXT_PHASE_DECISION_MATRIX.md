# Next Phase Decision Matrix

**Use this after Launch & Validation (Option D)** to decide what to build next based on real data and feedback.

---

## Option C: Spider Hold & Booking

**Build when:**

- At least **5 published riders** and **5 venues with a saved capability profile**.  
- At least **2–3 venue owners** have used compatibility (browse or rider detail).  
- **Multiple users** (artists or venues) ask “how do I request a date?” or “can we book through this?”  
- No critical bugs in publish/profile/compatibility in the last week.

**Action:** Proceed with 48-hour Spider Hold, date request flow, and confirmation workflow. See Phase 5 in original roadmap.

---

## Option E: Polish & Optimization

**Build when:**

- Supply is growing but **booking demand is not yet clear**.  
- Users report **confusion** (e.g. “what does compatibility mean?”, “where do I go after publishing?”).  
- You want **higher completion** (e.g. more riders published, more full venue profiles).  
- You want **retention** (e.g. “new rider matching your venue” nudges, better search/filters).

**Actions (pick 1–2):**

- In-app copy and tooltips (compatibility, profile completeness).  
- Notifications or email: “New rider published that matches your venue.”  
- Search or filter improvements on `/book/spider-riders`.  
- Onboarding flow tweaks (e.g. one optional “tour” after first publish).

---

## Tune Compatibility Algorithm

**Do when:**

- Venues or artists say **“the score doesn’t match reality”** (e.g. we’re compatible but it says partial, or we’re not but it says excellent).  
- You have **concrete examples** (rider X, venue Y, expected vs. shown).  
- Same type of feedback appears **more than once**.

**Actions:**

- Adjust weights in `lib/compatibility/score.ts` (financial, stage, technical, age, hospitality, backline).  
- Add or clarify “unknown” messaging when venue profile is incomplete.  
- Consider optional “override” or “reason” for venues (e.g. “we can do 18+ sometimes”) in a later phase.

---

## Improve Onboarding

**Do when:**

- **Drop-off** is high at a specific step (rider wizard or venue capability wizard).  
- Users say **“I didn’t know what to do next”** after publishing or saving profile.  
- **Invite-to-first-action** rate is low (many sign up, few publish or fill profile).

**Actions:**

- Short explainer or checklist on dashboard (“Publish your first rider” / “Complete your venue profile”).  
- Email sequence: after signup, “Claim your band” → “Publish your rider” (with links).  
- Simplify one step (e.g. fewer required fields, or smarter defaults).

---

## Pause New Features

**Do when:**

- **Critical bugs** (publish, profile save, compatibility) are not under control.  
- **Stability** is more important than new capability (e.g. first paid or high-profile users).  
- You need to **focus on recruitment** and feedback instead of building.

**Action:** Fix bugs, improve docs and support, keep recruitment and validation going. Revisit this matrix in 2–4 weeks.

---

## Quick Reference

| If you see… | Then consider… |
|-------------|----------------|
| “How do we request a date?” repeated | Option C (booking) |
| Good supply, unclear demand | Option E (polish) + keep recruiting |
| “Compatibility is wrong” with examples | Tune algorithm |
| High drop-off or “didn’t know what to do” | Improve onboarding |
| Bugs or instability | Pause features, fix first |
| Strong supply + engagement + “want to book” | Option C (booking) |

---

*Return to [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) when preparing the next launch or a major release.*
