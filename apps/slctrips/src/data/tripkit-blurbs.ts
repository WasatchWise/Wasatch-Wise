/**
 * TripKit Info Blurbs
 *
 * Quick, scannable facts and trivia for each TripKit.
 * Maxim-style: punchy, interesting, easy to read on mobile.
 */

export interface Blurb {
  id: string;
  icon?: string;
  title: string;
  content: string;
  category: 'science' | 'history' | 'celebrity' | 'trivia' | 'local' | 'tip';
  destinationSlug?: string; // Optional: tie to specific destination
}

export const tripkitBlurbs: Record<string, Blurb[]> = {
  // ============================================
  // TK-002: SKI UTAH
  // ============================================
  'TK-002': [
    // Snow Science
    {
      id: 'ski-snow-1',
      title: 'The 7% Rule',
      content: 'Utah powder averages just 7% water content. Colorado\'s is 12-15%. Less water = lighter snow = why you float instead of sink.',
      category: 'science',
    },
    {
      id: 'ski-snow-2',
      title: 'Lake Effect Magic',
      content: 'The Great Salt Lake acts like a giant humidifier. Cold storms sweep across, pick up moisture, and dump an extra 10% snow on the Wasatch. Free powder.',
      category: 'science',
    },
    {
      id: 'ski-snow-3',
      title: '45 Feet Per Year',
      content: 'Little Cottonwood Canyon averages 547 inches annually. That\'s 45 feet. The canyon\'s shape funnels storms straight into Alta and Snowbird like a snow magnet.',
      category: 'science',
    },
    {
      id: 'ski-snow-4',
      title: 'Why It Stays Light',
      content: 'Utah\'s cold, dry continental air keeps snow from getting heavy. By the time storms cross the Nevada desert, they\'ve lost moisture but kept the cold. Perfect recipe.',
      category: 'science',
    },

    // History
    {
      id: 'ski-history-1',
      title: 'Alta: 1939',
      content: 'Alta opened with a single-person chairlift and $1.50 tickets. It was America\'s second ski resort. Today it\'s one of three U.S. resorts that still bans snowboarders.',
      category: 'history',
    },
    {
      id: 'ski-history-2',
      title: 'Before the Skiers',
      content: 'Little Cottonwood was a silver mining hub in the 1870s. Alta had 26 saloons and a population of 5,000. The avalanches that killed 67 miners are why we study them now.',
      category: 'history',
    },
    {
      id: 'ski-history-3',
      title: '2002 Changed Everything',
      content: 'The Salt Lake Olympics put Utah skiing on the global map. $1.5 billion in infrastructure. Snowbasin and Deer Valley hosted events. Tourism doubled within five years.',
      category: 'history',
    },
    {
      id: 'ski-history-4',
      title: 'The Interconnect',
      content: 'Six Wasatch resorts are linked by backcountry routes. Experts can ski from Park City to Snowbird in a day—25,000 vertical feet across 15 miles of terrain.',
      category: 'history',
    },

    // Celebrity
    {
      id: 'ski-celeb-1',
      title: 'Sundance\'s Backyard',
      content: 'Robert Redford bought Sundance Resort in 1969 for $500,000. He wanted to protect it from developers. Now it hosts the world\'s biggest indie film festival.',
      category: 'celebrity',
    },
    {
      id: 'ski-celeb-2',
      title: 'Where the Pros Train',
      content: 'Ted Ligety, Lindsey Vonn, and the U.S. Ski Team train at Park City. The mountain has hosted more Olympic athletes than any other U.S. resort.',
      category: 'celebrity',
    },
    {
      id: 'ski-celeb-3',
      title: 'Deer Valley\'s Guest List',
      content: 'Deer Valley limits daily skiers to 7,500. That exclusivity attracts Oprah, the Kardashians, and half of Hollywood every January. Valet parking for your skis.',
      category: 'celebrity',
    },

    // Local Knowledge
    {
      id: 'ski-local-1',
      title: 'The Secret: Ski Weekdays',
      content: 'Saturday lift lines at Snowbird can hit 20 minutes. Tuesday? Walk right on. Locals know: powder days happen all week, not just weekends.',
      category: 'local',
    },
    {
      id: 'ski-local-2',
      title: 'The Canyon Rule',
      content: 'Big Cottonwood = Solitude and Brighton. Little Cottonwood = Alta and Snowbird. Both canyons close for avalanche control. Check UDOT before you drive.',
      category: 'local',
    },
    {
      id: 'ski-local-3',
      title: 'UTA Ski Bus',
      content: '$5 round trip from downtown SLC to Snowbird. No parking hassle, no canyon stress. Runs every 15 minutes on powder days. Locals\' secret weapon.',
      category: 'tip',
    },

    // Trivia
    {
      id: 'ski-trivia-1',
      title: 'Greatest Snow on Earth',
      content: 'It\'s trademarked. Utah owns the phrase "Greatest Snow on Earth" and will sue anyone who uses it. Even Ringling Brothers had to back off.',
      category: 'trivia',
    },
    {
      id: 'ski-trivia-2',
      title: 'Snowbird\'s Tram',
      content: 'The Aerial Tram climbs 2,900 vertical feet in 10 minutes. It holds 125 people and runs even when winds hit 50 mph. Built by the same Swiss company that makes Disneyland\'s rides.',
      category: 'trivia',
    },
    {
      id: 'ski-trivia-3',
      title: 'Brighton: No Crowds',
      content: 'Brighton is 100% night skiing capable—the largest night skiing terrain in Utah. After 4pm, it\'s practically empty. Full moon nights are legendary.',
      category: 'trivia',
    },
  ],

  // ============================================
  // TK-055: GOLF
  // ============================================
  'TK-055': [
    // Science
    {
      id: 'golf-science-1',
      title: 'The Altitude Advantage',
      content: 'At 5,000 feet, your ball travels 10% farther. Less air resistance. Your 150-yard 7-iron becomes a 165-yard club. Adjust accordingly.',
      category: 'science',
    },
    {
      id: 'golf-science-2',
      title: 'Desert Air = Distance',
      content: 'Dry Utah air is less dense than humid coastal air. That means even more distance. Some courses play 15% longer than their yardage suggests.',
      category: 'science',
    },

    // History
    {
      id: 'golf-history-1',
      title: 'Utah\'s First Course',
      content: 'Salt Lake Country Club opened in 1899. Nine holes carved into the foothills. Membership cost $25. Now there\'s a 10-year waitlist.',
      category: 'history',
    },

    // Local
    {
      id: 'golf-local-1',
      title: 'Twilight Rates',
      content: 'Most Utah courses drop prices 40-50% after 3pm in summer. With daylight until 9pm, that\'s a full round at half price.',
      category: 'tip',
    },
    {
      id: 'golf-local-2',
      title: 'The Monday Secret',
      content: 'Many private courses open to public play on Mondays. Membership-quality greens, public-course prices. Call ahead.',
      category: 'local',
    },

    // Trivia
    {
      id: 'golf-trivia-1',
      title: 'Red Rock Golf',
      content: 'Sand Hollow in St. George is carved into ancient lava flows and red sandstone. It\'s been called "the most visually stunning course in America."',
      category: 'trivia',
    },
  ],

  // ============================================
  // TK-024: BREWERY TRAIL
  // ============================================
  'TK-024': [
    // History
    {
      id: 'brew-history-1',
      title: 'Before Prohibition',
      content: 'Utah had 13 breweries by 1900. German immigrants brought lager recipes. Prohibition killed them all. The craft revival started in 1986 with Wasatch Brewery.',
      category: 'history',
    },
    {
      id: 'brew-history-2',
      title: 'The 3.2 Beer Era',
      content: 'Until 2019, Utah grocery stores could only sell 3.2% beer. Breweries made "Utah versions" of everything. Now it\'s 5% and the old recipes are collectors\' items.',
      category: 'history',
    },

    // Local
    {
      id: 'brew-local-1',
      title: 'The Zion Curtain Is Dead',
      content: 'Remember when bartenders had to mix drinks behind a wall? Gone since 2017. Utah liquor laws are still weird, but they\'re getting better.',
      category: 'local',
    },
    {
      id: 'brew-local-2',
      title: 'Brewery Hours',
      content: 'Utah breweries can serve until 1am, but most kitchens close at 10pm. Eat before you drink, or order early.',
      category: 'tip',
    },

    // Trivia
    {
      id: 'brew-trivia-1',
      title: 'Polygamy Porter',
      content: '"Why have just one?" Wasatch Brewing\'s Polygamy Porter is Utah\'s bestselling craft beer. The label features a guy with multiple wives. Mormons were not amused.',
      category: 'trivia',
    },
    {
      id: 'brew-trivia-2',
      title: 'Epic\'s Big Bet',
      content: 'Epic Brewing opened in 2010 making only high-alcohol beers—illegal to sell in Utah stores. They shipped out of state and built a cult following. Smart.',
      category: 'trivia',
    },
  ],

  // ============================================
  // TK-005: SECRET SPRINGS
  // ============================================
  'TK-005': [
    // Science
    {
      id: 'springs-science-1',
      title: 'Where the Heat Comes From',
      content: 'Groundwater seeps 2+ miles underground, heated by Earth\'s core at 50°F per mile. Pop back up through faults and you\'ve got a hot spring.',
      category: 'science',
    },
    {
      id: 'springs-science-2',
      title: 'Mineral Content',
      content: 'Utah springs are loaded with sulfur, magnesium, and calcium. Great for your skin. Terrible for your silver jewelry. Leave the rings at home.',
      category: 'science',
    },

    // History
    {
      id: 'springs-history-1',
      title: 'The Pony Express Knew',
      content: 'Stagecoach stations were built near hot springs for a reason. Warm water in winter, natural baths for travelers. Some of those springs still flow.',
      category: 'history',
    },

    // Local
    {
      id: 'springs-local-1',
      title: 'Dawn Patrol',
      content: 'The popular springs get mobbed by noon. Show up at sunrise. You\'ll have Mystic Hot Springs or Fifth Water to yourself.',
      category: 'tip',
    },
    {
      id: 'springs-local-2',
      title: 'Flash Flood Season',
      content: 'July-September monsoons can turn Fifth Water Creek into a raging river in 20 minutes. Check weather. If it\'s storming upstream, get out.',
      category: 'local',
    },

    // Trivia
    {
      id: 'springs-trivia-1',
      title: 'Mystic\'s School Buses',
      content: 'Those converted school buses at Mystic Hot Springs aren\'t random—they\'re Airbnb rentals. Sleep in a bus, soak under the stars. Very Utah.',
      category: 'trivia',
    },
  ],

  // ============================================
  // TK-045: 250 UNDER $25
  // ============================================
  'TK-045': [
    // Tips
    {
      id: 'budget-tip-1',
      title: 'Free Days Exist',
      content: 'Utah State Parks offer free days throughout the year. National Parks have five free entrance days. Mark your calendar.',
      category: 'tip',
    },
    {
      id: 'budget-tip-2',
      title: 'The Library Secret',
      content: 'Salt Lake County Library cards include free passes to Tracy Aviary, Discovery Gateway, and Utah Museum of Fine Arts. Free. With your library card.',
      category: 'local',
    },

    // Trivia
    {
      id: 'budget-trivia-1',
      title: 'Bonneville Salt Flats',
      content: 'Completely free. No entrance fee. No rangers. Just 30,000 acres of surreal white landscape. Sunrise or sunset for photos.',
      category: 'trivia',
    },
  ],

  // ============================================
  // TK-000: UTAH UNLOCKED (Free TripKit)
  // ============================================
  'TK-000': [
    // Local
    {
      id: 'utah-local-1',
      title: 'The Five Life Zones',
      content: 'Drive from St. George to Brian Head and you\'ll pass through five climate zones—desert to alpine. That\'s like driving from Mexico to Canada in 90 minutes.',
      category: 'science',
    },
    {
      id: 'utah-local-2',
      title: '29 Counties, 29 Vibes',
      content: 'Utah has 29 counties and each one feels different. Moab is not Salt Lake. Cedar City is not Logan. That\'s the point.',
      category: 'local',
    },

    // History
    {
      id: 'utah-history-1',
      title: '1847',
      content: '"This is the place." Brigham Young said it looking over the Salt Lake Valley. 148 pioneers had just crossed 1,300 miles of wilderness. They stayed.',
      category: 'history',
    },

    // Trivia
    {
      id: 'utah-trivia-1',
      title: 'The Mighty Five',
      content: 'Utah is the only state with five national parks: Zion, Bryce, Arches, Canyonlands, Capitol Reef. Arizona has three. California has nine but they\'re spread across 164,000 square miles.',
      category: 'trivia',
    },
  ],
};

// Helper function to get blurbs for a TripKit
export function getBlurbsForTripKit(code: string): Blurb[] {
  return tripkitBlurbs[code] || [];
}

// Helper to get random blurbs
export function getRandomBlurbs(code: string, count: number = 3): Blurb[] {
  const blurbs = getBlurbsForTripKit(code);
  const shuffled = [...blurbs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper to get blurbs by category
export function getBlurbsByCategory(code: string, category: Blurb['category']): Blurb[] {
  return getBlurbsForTripKit(code).filter(b => b.category === category);
}
