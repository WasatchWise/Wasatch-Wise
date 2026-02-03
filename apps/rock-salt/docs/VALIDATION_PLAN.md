# Validation Plan – Spider Network Launch

**Goal:** Learn from real usage so the next phase (booking, polish, or tuning) is data-driven.

---

## 1. Key Metrics to Track

### Leading indicators (track weekly)

| Metric | Definition | Why it matters |
|--------|------------|----------------|
| **Riders published** | Count of spider_riders with status = 'published' | Core supply; without riders, venues have nothing to match. |
| **Venues with profile** | Count of venues with profile_updated_at set (or capability fields filled) | Supply of “matchable” venues. |
| **Compatibility views** | Times a venue owner views rider detail or compatibility breakdown | Interest in matching before booking exists. |
| **Acceptances** | Count of spider_rider_acceptances (when that flow exists) | Intent to work together. |
| **Return visits** | Same user signs in again within 7 days | Stickiness. |

### Lagging indicators (track monthly)

| Metric | Definition | Why it matters |
|--------|------------|----------------|
| **Active artists** | Unique users who published or updated a rider in last 30 days | Sustained supply. |
| **Active venues** | Unique users who updated venue/capability in last 30 days | Sustained demand. |
| **Booking requests** | When Option C is live: count of hold/request events | Conversion from match → intent. |

**Minimum viable tracking:** Use Supabase (count rows in spider_riders, venues with profile_updated_at, spider_rider_acceptances) and optionally Vercel Analytics or a simple event log (e.g. “rider_published”, “venue_profile_saved”) so you can graph trends.

---

## 2. Feedback Questions to Ask Users

Send after ~1–2 weeks of use (or after a key action: e.g. first publish, first profile save).

### Artists (band/manager)

1. What was the main reason you published a Spider Rider? (e.g. “have real riders to send,” “want venues to find me,” “testing the product.”)  
2. Did you share your rider link or PDF with anyone? If yes, how?  
3. What’s one thing that would make you use this every time you book a tour?  
4. What was confusing or missing?

### Venues

1. What was the main reason you filled out (or started) your venue profile?  
2. Have you looked at rider compatibility for your venue? If yes, did the scores feel accurate?  
3. What would make you more likely to “accept” a rider or request a date?  
4. What was confusing or missing?

### Both

- How did you hear about TheRockSalt / Spider Network?  
- Would you recommend this to a peer? (1–10 or Y/N.)

Keep surveys short (3–5 questions); use a Typeform/Google Form or email reply.

---

## 3. Usage Scenarios to Observe

Watch for these in support channels, interviews, or session replays (if you add them):

| Scenario | What to look for |
|----------|-------------------|
| **Artist publishes rider** | Do they complete all 5 steps? Do they use Save Draft? Do they download PDF and share it? |
| **Venue fills capability profile** | Do they complete the wizard or drop off? Do they use Save Draft? Do they return to improve completeness? |
| **Venue browses riders** | Do they use compatibility filters? Do they open rider detail for “partial” or “incompatible” riders (curiosity vs. confusion)? |
| **Artist views compatible venues** | Do they click through to venue? Do they ask “how do I request a date?” (signals need for Option C). |

---

## 4. Red Flags to Watch For

- **No riders published after 2 weeks** → Onboarding or value proposition issue for artists.  
- **Venues don’t fill capability profile** → Friction in wizard or unclear benefit; consider in-app nudges or short explainer.  
- **Compatibility scores feel wrong** → Users say “we’re compatible but it says partial” (or reverse); tune algorithm or clarify messaging.  
- **High drop-off at a specific step** → UX or validation issue; simplify or add help.  
- **“How do I book?” repeated** → Strong signal to prioritize Option C (Spider Hold & booking).  

---

## 5. Success Criteria for Moving to Phase 4 (Option C – Booking)

Use these as gates, not hard requirements; judgment still applies.

- **Supply:** At least **5 published riders** and **5 venues with a saved capability profile**.  
- **Engagement:** At least **3 venue owners** have used compatibility (browse filters or rider detail compatibility).  
- **Feedback:** At least **2 users** (artist or venue) have said they want to “request a date” or “book” through the platform.  
- **Stability:** No critical bugs (e.g. publish failure, PDF not generating, profile not saving) reported in the last week.  

If all four are true, proceeding with Option C (Spider Hold & booking) is well justified. If supply or engagement is low, consider more recruitment or polish (Option E) first.

---

*Next: [USER_RECRUITMENT.md](./USER_RECRUITMENT.md) for who to invite and how.*
