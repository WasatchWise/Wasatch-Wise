/**
 * Trip Shape: The Long Weekend
 * Fri-Sun, Wasatch Front Only
 *
 * The most common SLCTrips trip shape. You've got 3 days,
 * you're staying downtown or canyon-adjacent, and you want
 * to ski the best snow in America without wasting time.
 */

export const longWeekendSki = {
  id: 'long-weekend-ski',
  name: 'The Long Weekend',
  tagline: 'Fri-Sun, Three Days of Greatest Snow',
  duration: '3 days',

  // Dan's opening - sets the tone
  dansIntro: `
You've got 72 hours. That's enough time to ski three world-class resorts,
eat better than you expected, and still make your Sunday night flight.

Here's what most people get wrong: they try to do too much. They bounce
between canyons, sit in traffic, and spend half their trip in a car
looking at mountains instead of skiing them.

The Long Weekend is about depth, not breadth. Pick your canyon.
Commit to it. Know it like a local by Sunday.

Let's figure out which canyon is yours.
  `.trim(),

  // Decision questions that surface real tension
  decisionQuestions: [
    {
      id: 'challenge',
      question: "Do you want to be humbled or have fun?",
      subtext: "Be honest. There's no wrong answer, but the wrong resort for your mood will ruin your trip.",
      options: [
        {
          value: 'humbled',
          label: 'Humbled',
          description: "I want terrain that scares me a little. I want to earn my turns."
        },
        {
          value: 'fun',
          label: 'Have fun',
          description: "I want to feel good about my skiing. Flow state, not survival mode."
        },
        {
          value: 'both',
          label: 'Both',
          description: "Mix it up. Push myself in the morning, cruise in the afternoon."
        }
      ]
    },
    {
      id: 'crowds',
      question: "Powder or people?",
      subtext: "Fresh snow brings crowds. The best days are also the busiest. What matters more?",
      options: [
        {
          value: 'powder',
          label: 'Powder',
          description: "I'll wait in line for untracked snow. Worth it."
        },
        {
          value: 'people',
          label: 'No crowds',
          description: "I'd rather have good snow with no lines than great snow with everyone else."
        }
      ]
    },
    {
      id: 'morning',
      question: "Early bird or sleep in?",
      subtext: "This determines everything. First chair is 9am. Canyon traffic starts at 7:30am.",
      options: [
        {
          value: 'early',
          label: 'Early bird',
          description: "I'll be in the lift line at 8:45. That's why I'm here."
        },
        {
          value: 'sleep',
          label: 'Sleep in',
          description: "Vacation means vacation. I'll ski 10am-3pm and enjoy it."
        }
      ]
    },
    {
      id: 'comfort',
      question: "Are you okay being cold and uncomfortable for better skiing?",
      subtext: "The best terrain often has the coldest lifts and the longest hikes.",
      options: [
        {
          value: 'yes',
          label: 'Yes',
          description: "Frozen toes are temporary. The memory of that run is forever."
        },
        {
          value: 'no',
          label: 'No',
          description: "I want heated gondolas and a nice lodge. Comfort matters."
        }
      ]
    },
    {
      id: 'vibe',
      question: "What's your vibe?",
      subtext: "The canyons have personalities. So do you.",
      options: [
        {
          value: 'serious',
          label: 'Serious skier',
          description: "I'm here to ski. Talk to me about vertical feet and snow reports."
        },
        {
          value: 'social',
          label: 'Social scene',
          description: "Apres-ski matters. I want to meet people and have stories."
        },
        {
          value: 'zen',
          label: 'Zen mode',
          description: "I want quiet. Trees. Just me and the mountain."
        }
      ]
    }
  ],

  // Guardian zone intros
  guardians: {
    littleCottonwood: {
      name: 'Kael',
      zone: 'Little Cottonwood Canyon',
      intro: `
You're entering Little Cottonwood Canyon. This is Kael's territory.

He doesn't say much. Watched 67 miners die in avalanches here before
skiing was even a thing. Now he watches over Alta and Snowbird—the most
serious snow in the Wasatch. Kael respects people who come prepared and
has no patience for those who don't.

His advice: "Earn it."
      `.trim(),
      resorts: ['Alta', 'Snowbird'],
      character: 'stoic, demanding, rewards effort'
    },
    bigCottonwood: {
      name: 'Maren',
      zone: 'Big Cottonwood Canyon',
      intro: `
Big Cottonwood is Maren's canyon. She's been here longer than the resorts.

Where Little Cottonwood feels like a challenge issued, Big Cottonwood feels
like an invitation. Brighton and Solitude share the same snow but not the
same attitude. Maren knows that the best skiing happens when you stop
trying to prove something.

Her advice: "The mountain gives what you need, not what you think you want."
      `.trim(),
      resorts: ['Brighton', 'Solitude'],
      character: 'welcoming, wise, playful'
    }
  },

  // Persona-based recommendations
  // This is the "Sharp Questions → Personalized Output" flow
  personas: {
    // Example: The Charger
    // Answered: humbled, powder, early, yes-uncomfortable, serious
    charger: {
      id: 'charger',
      name: 'The Charger',
      matchCriteria: {
        challenge: 'humbled',
        crowds: 'powder',
        morning: 'early',
        comfort: 'yes',
        vibe: 'serious'
      },
      recommendation: {
        canyon: 'Little Cottonwood',
        primary: 'Snowbird',
        secondary: 'Alta',
        dansVerdict: `
You're a charger. You want the steeps, the deeps, and you're willing to
work for them. Little Cottonwood is your canyon.

Here's your weekend:

**Friday:** Snowbird. Get your legs under you on Mineral Basin, then
work your way to the Cirque if conditions allow. The tram line will be
long—take Peruvian Express instead and traverse over.

**Saturday:** Alta. This is your day. High Rustler if you're ready.
If not, Catherine's Area has steeps that won't kill you if you fall.
No snowboarders means the snow stays better longer.

**Sunday:** Your call. Chase the better report, or go back to whichever
mountain felt unfinished. Leave by 2pm to make your flight.

One more thing: eat at The Forklift in Alta on Saturday. It's a shipping
container turned restaurant. Trust me.
        `.trim()
      }
    },

    // Example: The Cruiser
    // Answered: fun, people, sleep, no-uncomfortable, social
    cruiser: {
      id: 'cruiser',
      name: 'The Cruiser',
      matchCriteria: {
        challenge: 'fun',
        crowds: 'people',
        morning: 'sleep',
        comfort: 'no',
        vibe: 'social'
      },
      recommendation: {
        canyon: 'Big Cottonwood',
        primary: 'Brighton',
        secondary: 'Solitude',
        dansVerdict: `
You want to have a good time, not prove anything. Big Cottonwood is
your canyon.

Here's your weekend:

**Friday:** Brighton. Roll in around 10am when traffic has cleared.
The groomers off Great Western are wide open and perfectly pitched.
Brighton has the best night skiing in Utah if you've got energy left.

**Saturday:** Solitude. More space, better food, same snow. The
Honeycomb lift accesses terrain that feels bigger than it is.
Après at The Thirsty Squirrel—it's exactly what you'd hope.

**Sunday:** Sleep in hard. Brighton again, afternoon only. Take it
easy, enjoy the views, leave by 2pm with a tan and stories.

Pro tip: Stay downtown, not in the canyon. Better restaurants,
easier logistics, and you're not trapped when UDOT closes the road.
        `.trim()
      }
    },

    // Example: The Explorer
    // Answered: both, powder, early, yes, zen
    explorer: {
      id: 'explorer',
      name: 'The Explorer',
      matchCriteria: {
        challenge: 'both',
        crowds: 'powder',
        morning: 'early',
        comfort: 'yes',
        vibe: 'zen'
      },
      recommendation: {
        canyon: 'Both',
        primary: 'Solitude',
        secondary: 'Alta',
        dansVerdict: `
You're not here to be seen. You're here to disappear into the mountain
for a while.

Here's your weekend:

**Friday:** Solitude. The name isn't marketing—it's accurate.
Honeycomb Canyon for morning challenge, then Headwall Forest when
you want to dial it back. Nobody will bother you.

**Saturday:** Alta. But not the Alta everyone talks about. Skip the
show-off terrain and find Supreme Chair. The trees between Supreme
and Sugarloaf are quiet, deep, and mostly empty.

**Sunday:** Choose based on snow report. If it snowed overnight,
go back to whichever mountain you connected with. If not, try the
other canyon—Brighton's trees are underrated and you'll have them
to yourself.

Pack lunch. Avoid the lodges at peak hours. The mountain is better
when you're not fighting for a table.
        `.trim()
      }
    }
  },

  // Day-by-day logistics (generic, before personalization)
  logistics: {
    friday: {
      title: 'Day 1: Friday',
      arrivalNote: `
Most long weekenders land Thursday night or early Friday morning.
If you're landing Friday AM, here's the math:

- Flight lands: 10:00am
- Bags + rental car: 45 minutes
- Drive to canyon: 35-45 minutes
- Boots on, lift ticket sorted: 30 minutes
- **First chair: ~12:30pm**

That's 3-4 hours of skiing. Worth it. The afternoon light in the
canyons is special, and everyone else is working.
      `.trim()
    },
    saturday: {
      title: 'Day 2: Saturday',
      note: `
This is your big day. Plan accordingly.

**Canyon traffic:** Leave downtown by 7:45am to beat the crush.
By 8:30am, Little Cottonwood backs up to the mouth. Big Cottonwood
is slightly better but not by much.

**UTA Ski Bus:** $5 round trip. Runs every 15 minutes. Park at
the canyon park-and-ride. Zero stress, and you can nap on the way
down. This is the local move.

**Lunch strategy:** Eat early (11am) or late (2pm). The lodges
are chaos from 11:30-1:30pm.
      `.trim()
    },
    sunday: {
      title: 'Day 3: Sunday',
      departureNote: `
Sunday is about execution, not ambition.

**If your flight is 6pm or later:**
Ski until 2pm. Drive to airport. Return car. You'll make it.

**If your flight is before 6pm:**
Morning session only. Leave the mountain by noon.
Don't risk it. Canyons close for avalanche control randomly.
Missing a flight to ski one more run is not the story you want.

**Pro tip:** Many rental shops offer airport drop-off. Ski in
your gear, throw it in the car, drive to the airport, leave the
car with the keys in it. Done.
      `.trim()
    }
  },

  // Printable day cards content
  dayCards: {
    essentials: [
      'Ikon Pass or individual lift tickets (buy online, never at window)',
      'Layers: base layer, mid layer, shell—Utah is dry cold',
      'Sunscreen: 8,000 feet + snow reflection = serious burn',
      'Snacks: Clif bars, nuts—lodge food is expensive',
      'Hand/toe warmers: Little Cottonwood lifts are cold',
      'Phone charger: cold kills batteries'
    ],
    emergencyNumbers: {
      skiPatrol: '911 or resort direct line',
      udotRoadConditions: '511 or cottonwoodcanyons.com',
      utaSkiBus: '801-743-3882'
    },
    localSecrets: [
      'Brighton has 30 minutes more daylight than Snowbird (lower elevation, east-facing)',
      'Solitude\'s Honeycomb Return is a cat track that turns into a powder stash',
      'Alta\'s Sunnyside lift has no line and accesses the same snow as High Rustler',
      'Snowbird Tram is for tourists. Peruvian Express + traverse = same terrain, no wait'
    ]
  }
};

export type TripShapePersona = keyof typeof longWeekendSki.personas;
export type DecisionAnswer = {
  challenge: 'humbled' | 'fun' | 'both';
  crowds: 'powder' | 'people';
  morning: 'early' | 'sleep';
  comfort: 'yes' | 'no';
  vibe: 'serious' | 'social' | 'zen';
};
