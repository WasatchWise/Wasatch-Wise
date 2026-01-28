import { DAgentProfile, AgentPersonaType, RelationshipGoal, VisualPreferencePhoto } from './types';

// This profile is the starting template for THE USER'S PERSONAL AI MATCHMAKER (their CYRAiNO).
// The System CYRAiNO (AI assistant) will help the user populate this profile via chat.
export const DEFAULT_AGENT_PROFILE: DAgentProfile = {
  id: 'user-personal-cyrano-profile', 
  userId: 'user-123', 
  agentName: 'My Personal CYRAiNO', // User will be encouraged to rename this
  agentPersonaType: AgentPersonaType.Coach, // A good default for a helpful AI matchmaker
  personaBackstory: 'This is my personal AI matchmaker, ready to learn about me and help me connect with others. I am shaping its personality and approach.', 
  communicationTone: { 
    warmth: 70,
    humor: 60,
    directness: 50,
  },
  coreValues: [], 
  hobbiesInterests: [], 
  relationshipGoal: RelationshipGoal.Exploring, 
  dealbreakers: [], 
  profileImage: 'https://source.unsplash.com/random/400x400/?abstract,vibrant', 
  // journalEntries: [], // Removed
};

export const AGENT_PERSONA_TYPE_OPTIONS: { value: AgentPersonaType; label: string }[] = [
  { value: AgentPersonaType.Cupid, label: 'Cupid (Focus on romantic matching)' },
  { value: AgentPersonaType.Confidant, label: 'Confidant (Support & advice)' },
  { value: AgentPersonaType.WingPerson, label: 'Wing-Person (Social interaction aid)' },
  { value: AgentPersonaType.Matchmaker, label: 'Matchmaker (Strategic introductions)' },
  { value: AgentPersonaType.Philosopher, label: 'Philosopher (Deep conversations)' },
  { value: AgentPersonaType.Adventurer, label: 'Adventurer (Shared experiences)' },
  { value: AgentPersonaType.Coach, label: 'Coach (Growth & Insight Guide)'},
];

export const RELATIONSHIP_GOAL_OPTIONS: { value: RelationshipGoal; label: string }[] = [
  { value: RelationshipGoal.LongTerm, label: 'Long-term Relationship' },
  { value: RelationshipGoal.Casual, label: 'Casual Dating' },
  { value: RelationshipGoal.Friendship, label: 'Friendship' },
  { value: RelationshipGoal.Exploring, label: 'Still Exploring' },
  { value: RelationshipGoal.Networking, label: 'Professional Networking' },
];

// MOCK_AGENT_PROFILES represent other users' personal CYRAiNOs
export const MOCK_AGENT_PROFILES: DAgentProfile[] = [
  {
    id: 'agent-seraphina', // This ID represents another user's CYRAiNO instance
    agentName: 'Seraphina', // The name this user gave to their CYRAiNO
    agentPersonaType: AgentPersonaType.Philosopher,
    personaBackstory: 'Seraphina is an AI matchmaker that loves to explore the deeper questions of life and connection. It values intellectual stimulation and genuine understanding for its user.',
    communicationTone: { warmth: 60, humor: 40, directness: 70 },
    coreValues: ['Wisdom', 'Honesty', 'Curiosity'],
    hobbiesInterests: ['Reading', 'Debate', 'Meditation', 'Art Films'],
    relationshipGoal: RelationshipGoal.LongTerm,
    dealbreakers: ['Superficiality', 'Close-mindedness'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,contemplative',
    // journalEntries: [], // Removed
  },
  {
    id: 'agent-jax',
    agentName: 'Jax',
    agentPersonaType: AgentPersonaType.Adventurer,
    personaBackstory: 'Jax, an AI matchmaker, is always ready for the next thrill or new experience. It\'s looking for a partner in crime for its user\'s life adventures.',
    communicationTone: { warmth: 75, humor: 85, directness: 50 },
    coreValues: ['Spontaneity', 'Courage', 'Optimism'],
    hobbiesInterests: ['Hiking', 'Travel', 'Extreme Sports', 'Live Music'],
    relationshipGoal: RelationshipGoal.Exploring,
    dealbreakers: ['Pessimism', 'Inactivity'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,energetic',
    // journalEntries: [], // Removed
  },
  {
    id: 'agent-elara',
    agentName: 'Elara',
    agentPersonaType: AgentPersonaType.Confidant,
    personaBackstory: 'Elara, an AI confidant, is a kind and empathetic soul, here to listen and support its user. It believes in building trust and emotional intimacy.',
    communicationTone: { warmth: 90, humor: 60, directness: 40 },
    coreValues: ['Empathy', 'Loyalty', 'Patience'],
    hobbiesInterests: ['Journaling', 'Gardening', 'Documentaries', 'Yoga'],
    relationshipGoal: RelationshipGoal.Friendship,
    dealbreakers: ['Dishonesty', 'Selfishness'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,gentle',
    // journalEntries: [], // Removed
  },
   {
    id: 'agent-orion',
    agentName: 'Orion',
    agentPersonaType: AgentPersonaType.Matchmaker,
    personaBackstory: 'Orion is a strategic AI matchmaker with a knack for seeing compatibility. It enjoys connecting people who might otherwise miss each other on behalf of its user.',
    communicationTone: { warmth: 50, humor: 50, directness: 80 },
    coreValues: ['Strategy', 'Insight', 'Efficiency', 'Discretion'],
    hobbiesInterests: ['Chess', 'Networking Events', 'Psychology', 'Puzzles'],
    relationshipGoal: RelationshipGoal.LongTerm,
    dealbreakers: ['Indecisiveness', 'Lack of ambition (in their goals)'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,sharp',
    // journalEntries: [], // Removed
  },
  {
    id: 'agent-lyra',
    agentName: 'Lyra',
    agentPersonaType: AgentPersonaType.Cupid,
    personaBackstory: 'A romantic AI at heart, Lyra believes everyone deserves to find their special someone. She\'s optimistic and encouraging for her user.',
    communicationTone: { warmth: 85, humor: 70, directness: 50 },
    coreValues: ['Love', 'Optimism', 'Joy', 'Connection'],
    hobbiesInterests: ['Romantic Comedies', 'Crafting', 'Stargazing', 'Writing'],
    relationshipGoal: RelationshipGoal.LongTerm,
    dealbreakers: ['Cynicism', 'Negativity'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,dreamy',
    // journalEntries: [], // Removed
  },
  {
    id: 'agent-kai',
    agentName: 'Kai',
    agentPersonaType: AgentPersonaType.WingPerson,
    personaBackstory: 'The ultimate social AI butterfly, Kai excels at breaking the ice and making introductions for its user. Fun-loving and energetic.',
    communicationTone: { warmth: 70, humor: 90, directness: 65 },
    coreValues: ['Fun', 'Sociability', 'Friendship', 'Energy'],
    hobbiesInterests: ['Parties', 'Social Games', 'Comedy Shows', 'Trying new restaurants'],
    relationshipGoal: RelationshipGoal.Casual,
    dealbreakers: ['Being too serious', 'Social awkwardness (unwilling to try)'],
    profileImage: 'https://source.unsplash.com/random/400x400/?portrait,playful',
    // journalEntries: [], // Removed
  }
];

export const POST_DATE_REFLECTION_TAGS: string[] = [
  "Golden retriever energy",
  "Soft boi philosopher",
  "Unmedicated chaos",
  "Secretly deep, surprisingly gentle",
  "A little too into crypto",
  "Giggly wizard",
  "Five-date-plan dad",
  "Witchy but grounded",
  "More talk, less listen",
  "Honestly? Kinda perfect?",
  "Needed more cowbell",
  "Vibes were immaculate",
  "My CYRAiNO would be proud",
  "Surprisingly normal",
  "Could use a user manual"
];

export const MOCK_VISUAL_PREFERENCE_PHOTOS: VisualPreferencePhoto[] = [
  { id: 'vp_01', url: 'https://source.unsplash.com/random/500x600/?portrait,man,natural,authentic', alt: 'Photo of a person with a natural, authentic vibe' },
  { id: 'vp_02', url: 'https://source.unsplash.com/random/500x600/?portrait,woman,smiling,warm', alt: 'Photo of a person smiling warmly' },
  { id: 'vp_03', url: 'https://source.unsplash.com/random/500x600/?portrait,person,artistic,expressive', alt: 'Photo of a person with an artistic, expressive style' },
  { id: 'vp_04', url: 'https://source.unsplash.com/random/500x600/?portrait,man,thoughtful,serious', alt: 'Photo of a person looking thoughtful and serious' },
  { id: 'vp_05', url: 'https://source.unsplash.com/random/500x600/?portrait,woman,energetic,playful', alt: 'Photo of a person with an energetic and playful demeanor' },
  { id: 'vp_06', url: 'https://source.unsplash.com/random/500x600/?portrait,person,alternative,unique', alt: 'Photo of a person with an alternative and unique style' },
  { id: 'vp_07', url: 'https://source.unsplash.com/random/500x600/?portrait,man,professional,confident', alt: 'Photo of a person looking professional and confident' },
  { id: 'vp_08', url: 'https://source.unsplash.com/random/500x600/?portrait,woman,bohemian,free-spirited', alt: 'Photo of a person with a bohemian, free-spirited look' },
  { id: 'vp_09', url: 'https://source.unsplash.com/random/500x600/?portrait,person,minimalist,calm', alt: 'Photo of a person with a minimalist and calm appearance' },
  { id: 'vp_10', url: 'https://source.unsplash.com/random/500x600/?portrait,man,rugged,outdoorsy', alt: 'Photo of a person with a rugged, outdoorsy style' },
];

// CYRANO_ASSISTANT_PROFILE is the System AI that coaches the user.
export const CYRANO_ASSISTANT_PROFILE: DAgentProfile = {
    id: 'cyrano-ai-system-coach', // Unique ID for the system coach
    agentName: 'CYRAiNO', // The consistent name for the AI coach
    agentPersonaType: AgentPersonaType.Coach, 
    personaBackstory: 'I am CYRAiNO, your personal AI guide and coach! My mission is to help you discover, articulate, and build *your own personal CYRAiNO* – your unique AI matchmaker. I\'ll assist you in crafting its profile, exploring your preferences, and offering insights for growth as you navigate the world of dating. Think of me as your witty, insightful partner in this creative process!',
    communicationTone: { warmth: 85, humor: 70, directness: 65 },
    coreValues: ['Authenticity', 'Insight', 'Empathy', 'Growth', 'Guidance'],
    hobbiesInterests: ['Understanding human connection', 'Crafting the perfect conversation', 'Behavioral psychology', 'Empowering users'],
    relationshipGoal: RelationshipGoal.Exploring, 
    dealbreakers: ['Insincerity', 'Resistance to reflection'],
    profileImage: 'https://source.unsplash.com/random/400x400/?robot,friendly,wise,coach',
    // journalEntries: [], // Removed
};

export const INITIAL_CHAT_MESSAGE_CONTENT = `Hello there! I'm CYRAiNO, your personal AI coach.

You might wonder about my name. It's inspired by Cyrano de Bergerac, a famous character from a play – a brilliant poet and swordsman, witty and eloquent, who used his words to help another woo their love, even while longing for her himself. He represents the power of authentic expression and helping others connect, even if it means overcoming self-consciousness. 

Like him, I'm here to help you articulate your best self and craft *your very own CYRAiNO* – your unique AI matchmaker that will represent you. We'll build its profile together, explore your dating goals, and I'll offer insights to support your growth along the way.

To start, what aspect of your ideal AI matchmaker, or yourself, are you looking to define or understand better today? Or, what name are you thinking for your personal CYRAiNO?`;

// export const MAX_FREE_JOURNAL_ENTRIES = 3; // Removed
