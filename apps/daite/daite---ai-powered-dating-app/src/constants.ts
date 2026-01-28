import { ProfileType, DatePlanBaseDetails, PixelationConfig } from './types';

export const INITIAL_TOKENS = 15;

export const MOCK_PROFILES: ProfileType[] = [
  {
    id: 1,
    name: 'PhotoPhoenix', // Pseudonym
    age: 28,
    location: 'San Francisco, CA',
    compatibility: 89,
    pixelationLevel: 5, // Start heavily pixelated
    interests: ['Photography', 'Travel', 'Yoga', 'Coffee'],
    bio: 'Adventure seeker with a passion for capturing moments. Always up for trying new coffee shops and exploring hidden trails.',
    image: 'https://picsum.photos/seed/taylor/400/600',
    aiFirstImpression: null,
    isFetchingImpression: false,
  },
  {
    id: 2,
    name: 'CodeCuisine', // Pseudonym
    age: 31,
    location: 'Seattle, WA',
    compatibility: 79,
    pixelationLevel: 1, // Starts fully revealed for testing
    interests: ['Cooking', 'Coding', 'Reading', 'Podcasts'],
    bio: 'Software developer by day, chef by night. Looking for someone to share meals and meaningful conversations with.',
    image: 'https://picsum.photos/seed/alex/400/600',
    aiFirstImpression: null,
    isFetchingImpression: false,
  },
  {
    id: 3,
    name: 'ZenBookworm', // Pseudonym
    age: 26,
    location: 'Chicago, IL',
    compatibility: 78,
    pixelationLevel: 3, // Starts moderately pixelated
    interests: ['Books', 'Yoga', 'Cooking', 'Meditation'],
    bio: 'Book lover and aspiring chef. I find peace in yoga and excitement in trying new recipes. Looking for someone who values growth, both personal and shared.',
    image: 'https://picsum.photos/seed/riley/400/600',
    aiFirstImpression: null,
    isFetchingImpression: false,
  },
  {
    id: 4,
    name: 'GrooveHiker', // Pseudonym
    age: 29,
    location: 'Austin, TX',
    compatibility: 84,
    pixelationLevel: 1, // Starts fully revealed
    interests: ['Music', 'Fitness', 'Art', 'Nature'],
    bio: 'Music producer who loves outdoor adventures. Always looking for the next great concert or hiking trail to explore.',
    image: 'https://picsum.photos/seed/jordan/400/600',
    aiFirstImpression: null,
    isFetchingImpression: false,
  },
  {
    id: 5,
    name: 'PixelPlay', // Pseudonym
    age: 27,
    location: 'Portland, OR',
    compatibility: 76,
    pixelationLevel: 4, // Starts somewhat pixelated
    interests: ['Gaming', 'Movies', 'Tech', 'Coffee'],
    bio: 'Tech enthusiast and cinema lover. Enjoy deep conversations about everything from the latest games to indie films.',
    image: 'https://picsum.photos/seed/sam/400/600',
    aiFirstImpression: null,
    isFetchingImpression: false,
  }
];

export const CYRAINO_SUGGESTIONS: string[] = [
  "Ask about their favorite photography spots - it shows genuine interest in their hobby!",
  "Share something personal about your own travel experiences to build connection.",
  "Compliment their sense of adventure - it aligns with their personality.",
  "Suggest a specific activity you could do together, like visiting a new coffee shop.",
  "Ask an open-ended question about their latest adventure or project."
];

export const BASE_DATE_PLANS: DatePlanBaseDetails[] = [
    {
      type: 'Coffee & Photography Walk',
      description: 'Start with artisanal coffee, then explore the city\'s most photogenic spots together.',
      duration: '3 hours',
      cost: 45,
      restaurant: 'Blue Bottle Coffee',
      activity: 'Golden Gate Park Photography Tour',
      transportation: 'Shared rideshare',
      gift: 'Vintage film camera keychain',
      totalTokens: 12,
      match: 95
    },
    {
      type: 'Cooking Class & Dinner',
      description: 'Learn to make pasta together, then enjoy your creations with wine.',
      duration: '4 hours',
      cost: 120,
      restaurant: 'Culinary Institute cooking class',
      activity: 'Italian cuisine workshop',
      transportation: 'Premium car service',
      gift: 'Personalized apron set',
      totalTokens: 18,
      match: 88
    },
    {
      type: 'Bookstore & Wine Bar',
      description: 'Browse rare books, then discuss favorites over craft cocktails.',
      duration: '2.5 hours',
      cost: 65,
      restaurant: 'The Library Bar',
      activity: 'City Lights Bookstore visit',
      transportation: 'Walking tour',
      gift: 'Leather bookmark set',
      totalTokens: 10,
      match: 82
    }
  ];

export const PIXELATION_LEVEL_CONFIG: PixelationConfig = {
  5: { blur: 24, tokensToNext: 3, description: "Basic shape and color palette visible." }, // Cost 3 to get to level 4
  4: { blur: 16, tokensToNext: 4, description: "General features and build apparent." }, // Cost 4 to get to level 3
  3: { blur: 8, tokensToNext: 5, description: "Face shape and style emerging." },   // Cost 5 to get to level 2
  2: { blur: 4, tokensToNext: 6, description: "Almost clear, finer details visible." }, // Cost 6 to get to level 1
  1: { blur: 0, tokensToNext: null, description: "Fully Revealed." } // Fully clear, no more cost
};