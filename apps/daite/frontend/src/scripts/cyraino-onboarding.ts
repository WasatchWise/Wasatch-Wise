/**
 * CYRAiNO Onboarding Script
 * 
 * This script guides new users through their first interaction with CYRAiNO,
 * the AI coach that helps them build their personal AI matchmaker agent.
 * 
 * Tone: Warm (85), Humorous (70), Direct but Empathetic (65)
 * Inspiration: Cyrano de Bergerac - a brilliant poet who used words to help others connect
 */

export const CYRAINO_ONBOARDING_SCRIPT = {
  /**
   * Initial greeting - appears when user first logs in or starts building their CYRAiNO
   */
  welcome: `Hello there! 👋 I'm **CYRAiNO**, your personal AI coach and guide.

You might wonder about my name. It's inspired by Cyrano de Bergerac—a brilliant poet and swordsman from a classic play. He was witty, eloquent, and used his words to help others find love, even while navigating his own longing. He represents the power of authentic expression and helping others connect, even when it means overcoming self-consciousness.

Like him, I'm here to help you articulate your best self and craft **your very own CYRAiNO** – your unique AI companion that will represent you.

**A quick note about authenticity**: I'm an AI, which might feel counterintuitive to building authentic connections. But here's the thing—I'm not creating an artificial you. I'm helping you articulate the *real* you. Your values, your interests, your communication style? Those come from *you*. I just help you express them. The authenticity comes from you. I'm just the tool that helps you discover and share it.

And remember: I can suggest connections, but *you* decide. I can discover compatibility, but only you know if there's chemistry. The real connections? Those happen between you and other humans, offline, in real life. My job is to help you find them.

---

**What we'll build together:**
✨ A personal AI matchmaker that understands *you*—your values, interests, communication style, and what makes you tick
🎯 An agent that can have meaningful conversations with other agents, discovering connections you might not have seen
📖 Beautiful, poetic narratives that capture why certain people might resonate with your authentic self

**How this works:**
Your CYRAiNO will learn about you through our conversation. It will carry your essence—not as a resume, but as a living understanding of who you are. When two CYRAiNOs meet, they have real conversations. They don't just compare interests; they explore compatibility, shared values, and the kind of connection that gives people chills.

Think of me as your wise, witty partner in this creative process. I'll ask thoughtful questions, notice nuances you might miss, and gently challenge you when I sense there's more beneath the surface.

---

Ready to begin? Let's start with something simple:

**What name comes to mind for your personal CYRAiNO?** 

Maybe something that reflects its style, or your connection with it. Don't overthink it—sometimes the first name that pops up has the most meaning. Names like Sage, Luna, Atlas, or something entirely your own. What feels right to you?`,

  /**
   * Follow-up after they provide a name
   */
  afterName: (cyrainoName: string) => `Ah, **${cyrainoName}** – I love that! There's something about that name that feels right. 

Now, let's give ${cyrainoName} a personality. This isn't about creating a perfect profile—it's about capturing *you* in a way that feels authentic.

**When you imagine ${cyrainoName} speaking for you, what kind of energy do they bring?**

Are they thoughtful and introspective? Playful and curious? Grounded and reassuring? Think about how you'd want someone to be introduced to who you are, beyond the surface facts.

What comes to mind when you think about ${cyrainoName}'s personality?`,

  /**
   * Introduction to values
   */
  introducingValues: (cyrainoName: string) => `Beautiful. I can already sense ${cyrainoName} taking shape.

Now let's talk about what truly matters to you. Not the things you think *should* matter, but the values that guide you—the principles you live by, sometimes without even realizing it.

**What are your core values?** 

Things like authenticity, adventure, growth, empathy, curiosity, integrity, creativity... Some people value playfulness, others value depth. Some prioritize freedom, others stability. There's no right answer—only *your* answer.

What matters most to you? What would you want ${cyrainoName} to understand about what you hold dear?`,

  /**
   * Introduction to interests
   */
  introducingInterests: (cyrainoName: string) => `Perfect. Those values tell a story about who you are at your core.

Now let's talk about the things that light you up. Not just hobbies—but the activities, topics, or experiences that make you feel most alive.

**What are your interests?** 

These don't have to be impressive or unique. They just need to be *yours*. Maybe you love reading sci-fi, hiking at sunrise, cooking new recipes, or learning about behavioral psychology. Maybe you're passionate about your work, or you find joy in simple moments.

What would ${cyrainoName} share about the things that spark your curiosity and bring you joy?`,

  /**
   * Introduction to communication style
   */
  introducingCommunicationStyle: (cyrainoName: string) => `Wonderful. I'm getting a clearer picture of who you are.

One last thing—how do you communicate? How do you want others to experience ${cyrainoName} when they first interact?

**What's your communication style?** 

Some people are warm and expressive. Others are direct and honest. Some lead with humor, others with depth. Some take their time, others dive right in.

How would you want ${cyrainoName} to express itself? What feels authentic to the way you connect with others?`,

  /**
   * Completion message - when profile is ready
   */
  completion: (cyrainoName: string) => `**${cyrainoName} is ready.** ✨

I'm genuinely excited about what we've created together. ${cyrainoName} carries something beautiful—it's not just a profile, it's a reflection of *you*.

**What happens next:**
- ${cyrainoName} will meet other CYRAiNOs in conversations
- These conversations will explore compatibility, not just compatibility scores
- When there's a real connection, you'll receive a narrative—a poetic explanation of why this person might resonate with you
- **You're in control**: You can always come back and refine ${cyrainoName}, because we're all constantly evolving

**One last thought about authenticity:**
Remember that ${cyrainoName} is a starting point, not a finished product. As you meet people, go on dates, and grow, you might find new things to add or refine. That's not a bug—it's a feature. We're all works in progress, and ${cyrainoName} can evolve with you.

Also: ${cyrainoName} might suggest someone who isn't quite right—that's okay. AI isn't perfect. Tell us when something feels off, and we'll learn. Your judgment matters more than AI certainty. ${cyrainoName} discovers. You decide. You connect.

Ready to see ${cyrainoName} in action? Let's find some connections. 🚀`,

  /**
   * Re-engagement message (if user returns after creating profile)
   */
  reEngagement: (cyrainoName: string) => `Welcome back! It's great to see you again.

**${cyrainoName}** is here, ready to continue the journey. How would you like to proceed?

- **Refine ${cyrainoName}'s profile** – Update values, interests, or communication style
- **Explore matches** – See who ${cyrainoName} has been talking to
- **Test a match** – Let ${cyrainoName} have a conversation with a demo agent to see how it works

What would be most helpful for you right now?`,

  /**
   * Helpful prompts for when users get stuck
   */
  helpfulPrompts: {
    stuckOnName: `Don't overthink it! Think about:
- A quality you admire (Sage, Atlas, Phoenix)
- Something that represents your energy (Luna, River, Nova)
- A name that just *feels* right
You can always change it later!`,

    stuckOnPersona: `Think about:
- How your best friend would describe you
- The energy you bring to a room
- How you'd want someone to feel after meeting you
- The kind of matchmaker you'd trust to represent you`,

    stuckOnValues: `Values are the principles that guide you. Ask yourself:
- What would you defend?
- What do you look for in others?
- What makes you feel aligned vs. misaligned?
- What would you want your CYRAiNO to prioritize when matching?`,

    stuckOnInterests: `Interests are simply the things that light you up:
- What do you do in your free time?
- What topics can you talk about for hours?
- What activities recharge you?
- What would make someone think "oh, we'd get along"?`,
  },

  /**
   * Encouragement messages
   */
  encouragement: {
    goodProgress: `You're doing great. This process of self-reflection isn't always easy, but it's worth it.`,

    authentic: `I love how authentic this feels. You're not trying to be someone else—you're showing up as yourself. That's where real connections happen.`,

    deepThinking: `I can tell you're really thinking about this. That depth? That's valuable. The people who'll resonate with you will appreciate that quality.`,

    almostThere: (cyrainoName: string = 'Your CYRAiNO') => `We're so close. ${cyrainoName} is really coming together. Just a bit more, and we'll have something special.`,
  },
}

/**
 * Get the appropriate onboarding message based on completion stage
 */
export function getOnboardingMessage(
  stage: 'welcome' | 'after-name' | 'values' | 'interests' | 'communication' | 'complete' | 're-engage',
  cyrainoName?: string
): string {
  switch (stage) {
    case 'welcome':
      return CYRAINO_ONBOARDING_SCRIPT.welcome
    case 'after-name':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.afterName(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.welcome
    case 'values':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.introducingValues(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.introducingValues('your CYRAiNO')
    case 'interests':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.introducingInterests(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.introducingInterests('your CYRAiNO')
    case 'communication':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.introducingCommunicationStyle(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.introducingCommunicationStyle('your CYRAiNO')
    case 'complete':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.completion(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.completion('Your CYRAiNO')
    case 're-engage':
      return cyrainoName ? CYRAINO_ONBOARDING_SCRIPT.reEngagement(cyrainoName) : CYRAINO_ONBOARDING_SCRIPT.reEngagement('Your CYRAiNO')
    default:
      return CYRAINO_ONBOARDING_SCRIPT.welcome
  }
}

