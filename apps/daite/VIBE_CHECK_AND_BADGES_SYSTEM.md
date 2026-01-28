# Vibe Check & Badges System Documentation

## 🎯 Vibe Check System - Your Bread and Butter

### What is a Vibe Check?

A **Vibe Check** is the core matching mechanism where:
1. **User initiates** a vibe check (costs tokens)
2. **CYRAiNO agents** have conversations with other users' agents
3. **AI evaluates** compatibility, safety, and connection potential
4. **Discoveries** are created when agents find a "YES" match
5. **Users see** poetic narratives explaining why the connection matters

### Vibe Check Qualification Requirements

A user qualifies for a vibe check when they meet **ALL** of these criteria:

#### ✅ Required:
1. **Has a CYRAiNO Agent** - Must have created their personal AI agent
2. **Sufficient Tokens** - 10 tokens for standard, 20 for extended
3. **Profile Completeness** - At least 30% profile completion score
4. **Active Account** - Account status must be 'active'

#### ⏱️ Timing Restrictions:
5. **Weekly Limit** - Maximum 3 vibe checks per week (resets weekly)
6. **Cooldown Period** - 24 hours between vibe checks
7. **No Pending Checks** - Can't start new one if one is already processing

### Vibe Check Flow

```
User clicks "Run Vibe Check"
    ↓
System checks eligibility
    ↓
Deducts tokens (10 or 20)
    ↓
Creates vibe_check record (status: 'processing')
    ↓
Finds 3-5 candidate users (with agents, not already matched)
    ↓
For each candidate:
    ├─ Fetch both agents' profiles
    ├─ Run agent-to-agent conversation via Gemini
    ├─ Store conversation in agent_conversations table
    ├─ If matchDecision = "YES":
    │   └─ Create discovery with narrative
    └─ Continue to next candidate
    ↓
Update vibe_check (status: 'completed', discoveries_count)
    ↓
If no discoveries found:
    └─ Refund tokens (100% refund)
    ↓
User sees results on Discoveries page
```

### Vibe Check Types

- **Standard** (10 tokens): 3 candidate matches
- **Extended** (20 tokens): 5 candidate matches

### Token Refund Policy

- **100% refund** if no discoveries found
- **0% refund** if at least 1 discovery found
- Refund happens automatically via database function

---

## 🏆 Badges & Challenges System

### Badge Categories

1. **Emotional Intelligence** - Self-awareness, emotional regulation
2. **Conflict Management** - Healthy conflict resolution skills
3. **Communication** - Authentic, clear communication
4. **Empathy** - Understanding and compassion for others
5. **Growth** - Personal development and learning
6. **Accountability** - Reliability and follow-through
7. **Community** - Building meaningful connections

### How Badges Work

1. **Earn Badges** by completing challenges
2. **Display on Profile** - Badges show on discovery cards
3. **Showcase Growth** - Demonstrate emotional intelligence, conflict skills, etc.
4. **Token Costs** - Challenges cost tokens (typically 5 tokens)
5. **Token Rewards** - Earn tokens back when you pass (typically 10 tokens)

### Challenge System

#### Challenge Structure:
- **Questions** - Scenario-based or self-awareness questions
- **Scoring** - Each answer has a score (0-10)
- **Passing** - Need 70% or higher to pass
- **Rewards**:
  - Badge awarded (if challenge has one)
  - Token reward (if configured)
  - Badge appears on profile

#### Example Challenge: Emotional Intelligence Assessment
- **Cost**: 5 tokens
- **Reward**: 10 tokens + "Emotional Navigator" badge
- **Questions**: 
  - Scenario: "Your match cancels last minute. How do you respond?"
  - Self-awareness: "When you feel stressed, you typically..."

### Badge Display

Badges appear:
- ✅ On discovery cards (shows user's earned badges)
- ✅ On user profiles
- ✅ In challenges page (shows which you've earned)
- ✅ Can be hidden by user (is_visible flag)

### Database Tables

1. **`badges`** - Available badges (definitions)
2. **`challenges`** - Challenges users can take
3. **`user_badges`** - Badges awarded to users
4. **`challenge_attempts`** - User challenge completions

---

## 🎨 UI Components

### VibeCheckModal
- Shows eligibility status
- Displays token balance, weekly count, cooldown
- Allows selection of standard vs extended
- Runs vibe check and shows results

### ChallengeModal
- Multi-question challenge interface
- Progress bar
- Answer selection
- Score calculation and badge awarding

### BadgeDisplay
- Shows badges with icons and colors
- Responsive sizing (sm, md, lg)
- Optional name display
- Max display limit with "+X more"

---

## 📊 Database Functions

### `check_vibe_check_limits(p_user_id UUID)`
- Validates all vibe check requirements
- Returns boolean (true if can run)

### `award_badge(p_user_id, p_badge_id, p_awarded_via, p_challenge_id)`
- Awards a badge to a user
- Prevents duplicates
- Returns badge award ID

### `complete_challenge(p_user_id, p_challenge_id, p_score, p_answers)`
- Processes challenge completion
- Awards badge if passed (70%+)
- Awards token rewards
- Returns success status

---

## 🚀 Next Steps

1. **Run Badge Schema**: Execute `database/badges-and-challenges.sql` in Supabase
2. **Test Vibe Checks**: Create test users with agents and run vibe checks
3. **Create More Challenges**: Add challenges for each badge category
4. **Badge Integration**: Ensure badges show on all profile views
5. **Analytics**: Track badge completion rates and popular challenges

---

## 💡 Concierge Services Ideas

Beyond challenges, consider:
- **Profile Review** - AI reviews profile and suggests improvements (tokens)
- **Message Coaching** - Get AI suggestions for messages (tokens)
- **Date Planning Assistance** - CYRAiNO helps plan perfect dates (tokens)
- **Compatibility Deep Dive** - Extended analysis of a match (tokens)
- **Photo Review** - Get feedback on photos before posting (tokens)

All concierge services should:
- Cost tokens
- Provide real value
- Be optional/opt-in
- Enhance the user experience

