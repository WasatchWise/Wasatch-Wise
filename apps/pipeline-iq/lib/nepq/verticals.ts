/**
 * NEPQ Vertical Intelligence System
 *
 * Complete playbook for each vertical with:
 * - Psychology of every stakeholder
 * - Personal fears (not just business concerns)
 * - Wedge questions that open conversations
 * - Math that makes them lose sleep
 * - Timing triggers
 * - Email sequences
 */

export type VerticalType =
  | 'multifamily'
  | 'senior_living'
  | 'hotel'
  | 'medical'
  | 'student_housing'
  | 'corporate_office'
  | 'mixed_use'
  | 'retail'
  | 'industrial'

export type RoleType =
  | 'developer'
  | 'owner'
  | 'gc'
  | 'property_manager'
  | 'administrator'
  | 'it_director'
  | 'facilities_manager'
  | 'director_of_nursing'
  | 'director_of_sales'
  | 'ceo'
  | 'cfo'
  | 'architect'
  | 'engineer'

export interface RolePsychology {
  role: RoleType
  title: string
  businessConcerns: string[]
  personalFears: string[]
  whatKeepsThemUp: string
  whenVulnerable: string[]
  bestContactTime: string
  decisionAuthority: 'final' | 'influencer' | 'recommender'
}

export interface WedgeQuestion {
  question: string
  target: RoleType[]
  stage: 'awareness' | 'consideration' | 'decision'
  followUp?: string
  consequence?: string
  deeperConsequence?: string
}

export interface PainMath {
  scenario: string
  variables: Record<string, string>
  calculation: string
  impact: string
  punchline: string
}

export interface TimingTrigger {
  signal: string
  meaning: string
  action: string
  urgency: 'immediate' | 'this_week' | 'this_month'
}

export interface EmailTemplate {
  day: number
  type: 'wedge' | 'math' | 'story' | 'fear' | 'competitive' | 'exit'
  subject: string
  body: string
  variables: string[] // placeholders like {firstName}, {propertyName}, etc.
}

export interface VerticalIntelligence {
  type: VerticalType
  name: string
  marketReality: string[]
  roles: RolePsychology[]
  wedgeQuestions: WedgeQuestion[]
  painMath: PainMath[]
  timingTriggers: TimingTrigger[]
  emailSequence: EmailTemplate[]
  techNeeds: {
    need: string
    whyItMatters: string
    nepqQuestion: string
  }[]
  competitiveWedges: string[]
  cheatCode: {
    insight: string
    line: string
  }
}

// ===========================================
// MULTIFAMILY
// ===========================================
export const MULTIFAMILY: VerticalIntelligence = {
  type: 'multifamily',
  name: 'Multifamily / Apartments',

  marketReality: [
    'Highest volume construction segment',
    'Every city is building apartments',
    'Residents expect smart home and fiber as standard',
    'One bad Google review about wifi tanks lease-up',
    'Move-in day is the single point of failure'
  ],

  roles: [
    {
      role: 'developer',
      title: 'Developer / Owner',
      businessConcerns: ['ROI', 'lease-up speed', 'exit valuation', 'construction timeline'],
      personalFears: [
        'Looking stupid to investors',
        'LP calling about slow lease-up',
        'Building the property nobody wants',
        'Being the cautionary tale'
      ],
      whatKeepsThemUp: 'What if I spent $40M and the market shifted?',
      whenVulnerable: [
        '60-90 days before CO',
        'When competing building advertises better amenities',
        'When lease-up is slower than proforma'
      ],
      bestContactTime: '7-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'gc',
      title: 'General Contractor',
      businessConcerns: ['Timeline', 'budget', 'no callbacks', 'coordination'],
      personalFears: [
        'Owner blaming them when something goes wrong',
        'Getting fired from the next project',
        'Name attached to a problem building'
      ],
      whatKeepsThemUp: 'What did I miss? What\'s going to bite me at punch list?',
      whenVulnerable: [
        'When low-voltage sub is unresponsive or behind',
        '30 days before CO when everything crashes together',
        'After a callback on a previous project'
      ],
      bestContactTime: '6-7am local (before jobsite)',
      decisionAuthority: 'influencer'
    },
    {
      role: 'property_manager',
      title: 'Property Manager',
      businessConcerns: ['Lease-up speed', 'resident satisfaction', 'low maintenance', 'renewals'],
      personalFears: [
        'Getting blamed for slow lease-up',
        'Fielding angry resident calls',
        'Looking incompetent to ownership',
        'Being the face of infrastructure problems they didn\'t create'
      ],
      whatKeepsThemUp: 'I\'m going to be the face of this building\'s problems and I didn\'t even build it',
      whenVulnerable: [
        'First week of move-ins when everything breaks',
        'When reviews start coming in',
        'When ownership asks about lease-up numbers'
      ],
      bestContactTime: '9-10am local',
      decisionAuthority: 'recommender'
    }
  ],

  wedgeQuestions: [
    {
      question: 'Who\'s responsible if the wifi doesn\'t work on move-in day?',
      target: ['developer', 'gc', 'property_manager'],
      stage: 'awareness',
      followUp: 'Because usually nobody owns it until it breaks.',
      consequence: 'What happens to your Google reviews when residents can\'t get online?',
      deeperConsequence: 'What does a 5% vacancy rate cost you annually on a 200-unit property?'
    },
    {
      question: 'What\'s your plan when residents start asking about smart home features and fiber - is that speced yet?',
      target: ['developer', 'gc'],
      stage: 'awareness',
      consequence: 'What happens to your lease-up rate if the building down the street has fiber and you don\'t?'
    },
    {
      question: 'Has your low-voltage sub done a density analysis for 200 units all streaming 4K simultaneously?',
      target: ['gc', 'developer'],
      stage: 'consideration',
      followUp: 'Or did they just pull the same spec from the last building?'
    },
    {
      question: 'Do you have their cell number, or just the office line?',
      target: ['gc', 'property_manager'],
      stage: 'consideration',
      followUp: 'When something goes wrong at 6pm on move-in day, who picks up?'
    }
  ],

  painMath: [
    {
      scenario: 'Move-in delay impact',
      variables: {
        units: '200',
        avgRent: '$1,850/month',
        delayedUnits: '10%',
        delayWeeks: '2'
      },
      calculation: '200 × 0.10 × ($1,850 ÷ 4) × 2 = $18,500',
      impact: '$18,500 lost in just two weeks from 10% delayed move-ins',
      punchline: 'The difference between good and bad low-voltage is $40K. That\'s 0.1% of your budget determining whether people tweet about loving or hating their new apartment.'
    },
    {
      scenario: 'Vacancy from bad reviews',
      variables: {
        units: '200',
        avgRent: '$1,850/month',
        vacancyRate: '5%',
        months: '3'
      },
      calculation: '200 × 0.05 × $1,850 × 3 = $55,500',
      impact: '$55,500 lost from 5% vacancy over 3 months',
      punchline: 'One bad Google review mentioning wifi costs more than the infrastructure upgrade.'
    }
  ],

  timingTriggers: [
    {
      signal: 'Permit pulled',
      meaning: '6-12 months out, still making decisions',
      action: 'Email Developer about technology amenity differentiation',
      urgency: 'this_month'
    },
    {
      signal: 'GC announced',
      meaning: 'Subs being selected now',
      action: 'Email GC about low-voltage coordination',
      urgency: 'immediate'
    },
    {
      signal: 'Job posting for Property Manager',
      meaning: '90 days from CO, getting nervous',
      action: 'Email Developer + PM about move-in readiness',
      urgency: 'this_week'
    },
    {
      signal: 'Competitor building opens',
      meaning: 'They\'re watching and comparing',
      action: 'Reference competitor amenities in outreach',
      urgency: 'immediate'
    },
    {
      signal: 'Bad review on nearby building mentioning wifi',
      meaning: 'Fear is fresh',
      action: 'Screenshot it, send it: "Making sure you\'re not in the same spot"',
      urgency: 'immediate'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {propertyName}',
      body: `Hey {firstName},

Random question - who's on the hook if the wifi doesn't work on move-in day at {propertyName}?

Asking because we just finished {nearbyProperty} and the PM told me the previous building she managed was a nightmare for 6 months because nobody asked that question until it was too late.

Anyway - not trying to sell you anything. Just saw your project and it reminded me of that conversation.

- Mike`,
      variables: ['firstName', 'propertyName', 'nearbyProperty']
    },
    {
      day: 4,
      type: 'math',
      subject: 're: Quick question about {propertyName}',
      body: `Hey {firstName},

One more thought on {propertyName} -

At {unitCount} units and {avgRent}/month, a 2-week move-in delay on just 10% of units is ~$18K in lost rent. The difference between "fine" and "great" low-voltage is maybe $40K total.

Might be worth a 15-minute call just to sanity-check whoever you've got speced. Happy to look at their plans and tell you if anything looks off. No charge, no pitch.

- Mike`,
      variables: ['firstName', 'propertyName', 'unitCount', 'avgRent']
    },
    {
      day: 10,
      type: 'exit',
      subject: 'Closing the loop',
      body: `Hey {firstName},

I'll assume {propertyName} is all buttoned up on the technology side.

If anything changes or you want a second set of eyes on plans, I'm around. We're already doing {nearbyProject} so we're in the area anyway.

Good luck with the build.

- Mike`,
      variables: ['firstName', 'propertyName', 'nearbyProject']
    }
  ],

  techNeeds: [
    {
      need: 'High-density wifi',
      whyItMatters: 'Move-in day when everyone connects simultaneously',
      nepqQuestion: 'Can every unit stream 4K while the clubhouse hosts an event?'
    },
    {
      need: 'Smart home ready',
      whyItMatters: 'Resident expectations, lease-up differentiation',
      nepqQuestion: 'When a prospect asks about smart locks and thermostats, what\'s your answer?'
    },
    {
      need: 'Fiber infrastructure',
      whyItMatters: 'Future-proofing, marketing advantage',
      nepqQuestion: 'Is your building fiber-ready or are you already obsolete?'
    },
    {
      need: 'Managed network',
      whyItMatters: 'Tech support, diagnostics, resident satisfaction',
      nepqQuestion: 'When a resident says the internet is slow, can you see what\'s happening in real-time?'
    }
  ],

  competitiveWedges: [
    'Has your current low-voltage sub done a density analysis for {unitCount} units all streaming 4K simultaneously? Or did they just pull the same spec from the last building?',
    'Do you have their cell number, or just the office line? When something goes wrong at 6pm on move-in day, who picks up?',
    'What\'s their experience with amenity spaces? The clubhouse, pool area, and fitness center all have different requirements than the units.'
  ],

  cheatCode: {
    insight: 'The real decision-maker for move-in success is often the Property Manager who gets hired 90 days before CO. They inherit problems they didn\'t create and become the face of them.',
    line: 'You\'re spending $35M on this building. The difference between good and bad low-voltage is $40K. That\'s 0.1% of your budget determining whether people tweet about loving or hating their new apartment.'
  }
}

// ===========================================
// SENIOR LIVING
// ===========================================
export const SENIOR_LIVING: VerticalIntelligence = {
  type: 'senior_living',
  name: 'Senior Living / Assisted Living',

  marketReality: [
    '10,000 Americans turn 65 every day',
    'Senior living construction is exploding',
    'Families are MORE demanding - they research everything',
    'Technology is becoming a differentiator, not nice-to-have',
    'Telehealth went from "maybe someday" to "required" in 18 months'
  ],

  roles: [
    {
      role: 'owner',
      title: 'Owner/Operator',
      businessConcerns: ['Occupancy rate', 'NOI', 'reputation', 'regulatory compliance'],
      personalFears: [
        'A headline: "Resident Dies After System Failure"',
        'One incident destroying 30-year reputation',
        'Being the executive who let it happen'
      ],
      whatKeepsThemUp: 'Are we one failure away from a news story?',
      whenVulnerable: [
        'After a competitor has an incident',
        'After a state inspection finds issues',
        'When touring a new property with better technology'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'administrator',
      title: 'Administrator',
      businessConcerns: ['Staff efficiency', 'resident satisfaction', 'family complaints', 'state survey readiness'],
      personalFears: [
        'Getting blamed for something they don\'t control',
        'A family member screaming at them in the lobby',
        'Being on duty when something goes wrong'
      ],
      whatKeepsThemUp: 'The state surveyor is coming next month. What did I miss?',
      whenVulnerable: [
        'Right after a difficult family interaction',
        'Right after a state survey',
        'When a competing facility opens nearby'
      ],
      bestContactTime: '10-11am local',
      decisionAuthority: 'influencer'
    },
    {
      role: 'director_of_nursing',
      title: 'Director of Nursing',
      businessConcerns: ['Care quality', 'staff communication', 'emergency response', 'telehealth reliability'],
      personalFears: [
        'A resident declining because they couldn\'t reach a doctor in time',
        'Being held responsible for a clinical failure that was really infrastructure',
        'A telehealth call dropping during an emergency'
      ],
      whatKeepsThemUp: 'Can I trust these systems when it matters?',
      whenVulnerable: [
        'After a near-miss',
        'When a telehealth call drops',
        'When a family asks about technology'
      ],
      bestContactTime: '2-3pm local',
      decisionAuthority: 'recommender'
    }
  ],

  wedgeQuestions: [
    {
      question: 'When a family tours your facility and asks about telehealth and video calling capabilities, what do you tell them?',
      target: ['administrator', 'owner'],
      stage: 'awareness',
      followUp: 'Because that question comes up on almost every tour now.',
      consequence: 'When a family is choosing between you and the facility down the street, and they ask about telehealth reliability... what do you tell them?',
      deeperConsequence: 'What\'s the lifetime value of one resident? 2.5 years at $5,500/month is $165,000. What\'s it worth to not lose them over something preventable?'
    },
    {
      question: 'If a resident needs an emergency telehealth consult at 2 AM, what\'s the backup if the system goes down?',
      target: ['director_of_nursing', 'administrator'],
      stage: 'awareness',
      consequence: 'What happens when a telehealth appointment with a cardiologist drops mid-consultation?'
    },
    {
      question: 'Is your current infrastructure compatible with the remote patient monitoring devices families are asking about?',
      target: ['administrator', 'owner'],
      stage: 'consideration',
      followUp: 'Because CMS is starting to incentivize remote monitoring.'
    }
  ],

  painMath: [
    {
      scenario: 'Lost resident from bad tour',
      variables: {
        monthlyRate: '$5,500',
        avgStay: '2.5 years',
        lostMoveIns: '10/year'
      },
      calculation: '$5,500 × 30 months × 10 = $1,650,000',
      impact: '$1,650,000/year lost from 10 move-ins where family sensed you were behind the times',
      punchline: 'Your low-voltage infrastructure costs maybe $60K on a 100-bed facility. One lost move-in costs $165K. The math isn\'t complicated.'
    },
    {
      scenario: 'Bad Google review impact',
      variables: {
        residentLTV: '$165,000',
        lostFromReview: '5-10 move-ins'
      },
      calculation: '$165,000 × 7.5 (average) = $1,237,500',
      impact: 'One bad Google review mentioning "outdated" can cost $825K - $1.65M',
      punchline: 'You\'re not selling to the resident. You\'re selling to the guilty daughter who needs to feel okay about this decision. Technology is how you give her permission to choose you.'
    }
  ],

  timingTriggers: [
    {
      signal: 'New facility announced',
      meaning: '12-18 months out, decisions being made',
      action: 'Email owner/developer about telehealth readiness',
      urgency: 'this_month'
    },
    {
      signal: 'Administrator job posting',
      meaning: 'Leadership change, new eyes on old problems',
      action: 'Email new administrator about technology gaps',
      urgency: 'this_week'
    },
    {
      signal: 'State survey results published',
      meaning: 'They\'re thinking about compliance',
      action: 'Email after results drop with compliance angle',
      urgency: 'immediate'
    },
    {
      signal: 'CMS policy announcement',
      meaning: 'Regulatory pressure',
      action: 'Email about new requirements and infrastructure implications',
      urgency: 'this_week'
    },
    {
      signal: 'Competitor facility opens',
      meaning: 'They\'re comparing themselves',
      action: 'Ask how they\'re differentiating on technology',
      urgency: 'immediate'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {facilityName}',
      body: `Hey {firstName},

Random question - when families tour {facilityName} and ask about telehealth and video calling, what do you show them?

I ask because we just finished a project at {nearbyFacility} and their Administrator told me that question comes up on almost every tour now. She said before the upgrade, her staff would fumble it. Now it's a selling point.

Anyway - curious how you're handling it. No pitch, just genuinely curious what you're seeing in your market.

- Mike`,
      variables: ['firstName', 'facilityName', 'nearbyFacility']
    },
    {
      day: 4,
      type: 'story',
      subject: 're: Quick question about {facilityName}',
      body: `Hey {firstName},

One more thought -

CMS has been quietly rolling out telehealth reimbursement requirements that have infrastructure implications. A lot of facilities built before 2020 aren't wired for it.

Might be worth a 15-minute call just to make sure {facilityName} is ahead of it. We've done a few assessments for other operators - no charge, no pitch. Just a sanity check.

- Mike`,
      variables: ['firstName', 'facilityName']
    },
    {
      day: 10,
      type: 'fear',
      subject: 'Saw this about {competitorFacility}',
      body: `Hey {firstName},

{competitorIncidentDescription}

Not trying to scare you - just saw this and thought of our earlier conversation. This stuff has a way of becoming the story, even when everything else is great.

If you ever want a second set of eyes on your infrastructure, I'm around. We're already working at {nearbyFacility} so we're in the area.

- Mike`,
      variables: ['firstName', 'competitorFacility', 'competitorIncidentDescription', 'nearbyFacility']
    },
    {
      day: 17,
      type: 'exit',
      subject: 'Closing the loop',
      body: `Hey {firstName},

I'll assume {facilityName} is all set on the technology side.

If anything changes or you're ever planning a refresh, keep my info. We specialize in senior living and understand the clinical side, not just the cables.

Best of luck with everything.

- Mike`,
      variables: ['firstName', 'facilityName']
    }
  ],

  techNeeds: [
    {
      need: 'Telehealth-ready rooms',
      whyItMatters: 'Medicare reimbursement, specialist access, family peace of mind',
      nepqQuestion: 'Are your rooms wired for the telehealth requirements CMS is rolling out?'
    },
    {
      need: 'Nurse call integration',
      whyItMatters: 'Response time documentation, liability protection',
      nepqQuestion: 'Does your current system timestamp response times for survey documentation?'
    },
    {
      need: 'Wander management',
      whyItMatters: 'Dementia care, family peace of mind, liability',
      nepqQuestion: 'What happens when a memory care resident makes it to the parking lot?'
    },
    {
      need: 'Family video calling',
      whyItMatters: 'Emotional connection, move-in differentiator',
      nepqQuestion: 'Can families video call directly to Mom\'s room, or just the front desk?'
    },
    {
      need: 'Emergency backup',
      whyItMatters: 'Life safety, critical system uptime',
      nepqQuestion: 'If power goes out and your generator kicks in, does the nurse call system stay up?'
    }
  ],

  competitiveWedges: [
    'When was the last time your low-voltage system was evaluated against current telehealth requirements? A lot of facilities are finding out their 2018 infrastructure doesn\'t meet 2024 Medicare standards.',
    'Is your current vendor certified in healthcare environments? HIPAA isn\'t just about software - it\'s about the physical layer too.',
    'Does your current vendor understand nurse call integration, or do they just run cables?'
  ],

  cheatCode: {
    insight: 'The real decision-maker is often the adult daughter. She\'s 45-60, overwhelmed, guilty, and researching everything. When she walks in and the administrator shows her how Mom can video call anytime from her room and it WORKS seamlessly... that\'s the moment the decision is made.',
    line: 'You\'re not selling to the resident. You\'re selling to the guilty daughter who needs to feel okay about this decision. Technology is how you give her permission to choose you.'
  }
}

// ===========================================
// HOTELS
// ===========================================
export const HOTEL: VerticalIntelligence = {
  type: 'hotel',
  name: 'Hotels / Hospitality',

  marketReality: [
    'Hotels are a technology arms race',
    'Guest expectations are set by their home setup (usually better)',
    'Conference/event business is make-or-break',
    'Brand standards (PIPs) are getting stricter on technology',
    'One viral tweet can tank bookings for months'
  ],

  roles: [
    {
      role: 'developer',
      title: 'Developer/Owner',
      businessConcerns: ['ROI', 'brand compliance', 'guest satisfaction scores', 'RevPAR'],
      personalFears: [
        'Building a hotel that doesn\'t meet brand standards',
        'Getting a PIP that costs millions',
        'Hotel getting kicked out of the flag'
      ],
      whatKeepsThemUp: 'What if Marriott pulls our flag?',
      whenVulnerable: [
        'During brand inspection',
        'When satisfaction scores drop',
        'When competitor opens nearby'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'property_manager',
      title: 'General Manager',
      businessConcerns: ['Guest satisfaction', 'TripAdvisor scores', 'staff efficiency', 'event bookings'],
      personalFears: [
        'Being on duty when something goes viral',
        'The angry guest who won\'t stop',
        'Getting blamed for infrastructure decisions they didn\'t make'
      ],
      whatKeepsThemUp: 'What\'s going to show up on TripAdvisor tomorrow?',
      whenVulnerable: [
        'After a bad review',
        'After a conference group complains',
        'When corporate is visiting'
      ],
      bestContactTime: '10-11am local',
      decisionAuthority: 'influencer'
    },
    {
      role: 'director_of_sales',
      title: 'Director of Sales',
      businessConcerns: ['Booking events', 'keeping groups happy', 'repeat business'],
      personalFears: [
        'The keynote that doesn\'t work',
        'The CEO whose presentation fails',
        'Losing a corporate account to competitor'
      ],
      whatKeepsThemUp: 'If that presentation fails, I lose the account.',
      whenVulnerable: [
        'Right before a big event',
        'After losing a booking to competitor',
        'When client asks about AV capabilities'
      ],
      bestContactTime: '9-10am local',
      decisionAuthority: 'recommender'
    },
    {
      role: 'it_director',
      title: 'IT Director / Chief Engineer',
      businessConcerns: ['Uptime', 'bandwidth', 'security', 'vendor management'],
      personalFears: [
        'Being called at 2 AM',
        'Being blamed for vendor failures',
        'No budget but full responsibility'
      ],
      whatKeepsThemUp: 'What\'s going to break during the sold-out weekend?',
      whenVulnerable: [
        'After an outage',
        'When they know the system is aging',
        'When corporate mandates upgrade with no resources'
      ],
      bestContactTime: '7-8am local',
      decisionAuthority: 'recommender'
    }
  ],

  wedgeQuestions: [
    {
      question: 'When you\'ve got a 200-person conference in the ballroom and everyone connects, what happens to the guest rooms above it?',
      target: ['property_manager', 'it_director'],
      stage: 'awareness',
      consequence: 'When the keynote speaker\'s presentation won\'t load, who do they blame?',
      deeperConsequence: 'What\'s a corporate account worth over 10 years? What\'s it cost to lose one over infrastructure?'
    },
    {
      question: 'What\'s your plan when Marriott\'s 2025 technology standards drop and your low-voltage doesn\'t meet spec?',
      target: ['developer', 'owner'],
      stage: 'awareness',
      followUp: 'Because properties we work with got early notice and are scrambling.'
    },
    {
      question: 'When a guest tweets "Worst wifi ever at {hotelName}" and it goes viral, who takes the call from corporate?',
      target: ['property_manager'],
      stage: 'awareness'
    }
  ],

  painMath: [
    {
      scenario: 'Lost corporate account',
      variables: {
        avgEventValue: '$25,000',
        eventsPerYear: '4',
        relationshipYears: '5'
      },
      calculation: '$25,000 × 4 × 5 = $500,000',
      impact: 'One lost corporate account from a failed presentation = $500K over 5 years',
      punchline: 'Your low-voltage infrastructure costs $150K on a 200-room property. One lost corporate account costs more than that.'
    },
    {
      scenario: 'Viral negative tweet',
      variables: {
        lostBookings: '100',
        avgBookingValue: '$300'
      },
      calculation: '100 × $300 = $30,000',
      impact: '$30,000+ lost from ONE viral tweet about bad wifi',
      punchline: 'One viral tweet about bad wifi costs more than the infrastructure upgrade.'
    }
  ],

  timingTriggers: [
    {
      signal: 'New hotel announced',
      meaning: '18-24 months out, specs being written',
      action: 'Email developer about brand standards',
      urgency: 'this_month'
    },
    {
      signal: 'GM job posting',
      meaning: 'New leadership, fresh eyes',
      action: 'Email new GM about infrastructure assessment',
      urgency: 'this_week'
    },
    {
      signal: 'Brand PIP announced',
      meaning: 'Forced to upgrade',
      action: 'Offer help meeting new standards',
      urgency: 'immediate'
    },
    {
      signal: 'Large event announced',
      meaning: 'High stakes coming',
      action: 'Offer pre-event stress test',
      urgency: 'this_week'
    },
    {
      signal: 'Bad TripAdvisor review mentioning technology',
      meaning: 'Pain is fresh',
      action: 'Screenshot, reference in outreach',
      urgency: 'immediate'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {hotelName} events',
      body: `Hey {firstName},

Quick question - when you've got a 200-person conference in the ballroom and everyone connects, what happens to the guest rooms above it?

Asking because we just finished a project at {nearbyHotel} where that exact scenario was killing their TripAdvisor scores. Guests were complaining about wifi, not realizing it was the event downstairs crushing the bandwidth.

Not sure if that's an issue at {hotelName} - just curious how you're handling it.

- Mike`,
      variables: ['firstName', 'hotelName', 'nearbyHotel']
    },
    {
      day: 4,
      type: 'story',
      subject: 're: Quick question about {hotelName} events',
      body: `Hey {firstName},

Quick story -

Talked to a Director of Sales at a property last month who told me she lost a $40K corporate account because a presentation froze during a keynote. Client said "We'll try the new Marriott down the street next time."

That's a $200K+ account over 5 years, gone because of a $30K infrastructure gap.

Might be worth a quick infrastructure stress-test before your next big event season. We do them free - no pitch, just data.

- Mike`,
      variables: ['firstName', 'hotelName']
    },
    {
      day: 10,
      type: 'competitive',
      subject: '2025 brand standards',
      body: `Hey {firstName},

Heads up - {brandName} is rolling out updated technology standards for 2025. A few properties we work with got early notice and are scrambling.

Happy to compare your current spec against what's coming if you want a head start. No charge.

- Mike`,
      variables: ['firstName', 'brandName']
    },
    {
      day: 17,
      type: 'exit',
      subject: 'Closing the loop on {hotelName}',
      body: `Hey {firstName},

I'll assume {hotelName} is all set on infrastructure.

If you're ever planning an upgrade or want a stress-test before a big event, keep my info. We specialize in hospitality and understand the brand requirements.

Best of luck with the busy season.

- Mike`,
      variables: ['firstName', 'hotelName']
    }
  ],

  techNeeds: [
    {
      need: 'Ballroom/event wifi',
      whyItMatters: 'Conferences, weddings, presentations',
      nepqQuestion: 'What happens when 200 devices connect in the ballroom simultaneously?'
    },
    {
      need: 'Guest room bandwidth',
      whyItMatters: 'Streaming expectations, satisfaction scores',
      nepqQuestion: 'Can every room stream 4K while the ballroom has an event?'
    },
    {
      need: 'IPTV/Casting',
      whyItMatters: 'Modern expectation, brand standards',
      nepqQuestion: 'Can guests cast from their phone to the TV, or is it still HDMI only?'
    },
    {
      need: 'Conference AV',
      whyItMatters: 'Corporate events, repeat business',
      nepqQuestion: 'Is your AV setup plug-and-play, or does every presenter need a technology call?'
    },
    {
      need: 'Network segmentation',
      whyItMatters: 'Security, PCI compliance',
      nepqQuestion: 'Is your guest network fully segmented from your POS and PMS systems?'
    }
  ],

  competitiveWedges: [
    'When was the last time your infrastructure was stress-tested for a full-capacity event? A lot of hotels are finding out their 2019 install doesn\'t handle 2024 device density.',
    'Does your current vendor guarantee response time in your contract? What\'s the SLA if they don\'t pick up during a live event?',
    'Is your current vendor certified by Marriott/Hilton/{brand}? Because brand inspectors are starting to check.'
  ],

  cheatCode: {
    insight: 'Events are the high-margin business. Everything else is commoditized. The hotel with bulletproof AV and wifi gets the corporate accounts. The hotel where the presentation freezes loses them.',
    line: 'Rooms are a commodity. Events are the margin. Your infrastructure determines which one you\'re selling.'
  }
}

// ===========================================
// MEDICAL / HEALTHCARE
// ===========================================
export const MEDICAL: VerticalIntelligence = {
  type: 'medical',
  name: 'Medical / Healthcare',

  marketReality: [
    'HIPAA isn\'t optional - it\'s existential',
    'Telehealth went from future to NOW overnight',
    'Downtime in clinical setting can mean death',
    'Insurance, liability, and compliance are the real drivers',
    'Nobody cheapskates on medical infrastructure (if they understand risk)'
  ],

  roles: [
    {
      role: 'administrator',
      title: 'Hospital Administrator / CEO',
      businessConcerns: ['Regulatory compliance', 'liability exposure', 'operational efficiency', 'reputation'],
      personalFears: [
        'A breach that makes the news',
        'A death that traces to system failure',
        'Being the executive named in the lawsuit'
      ],
      whatKeepsThemUp: 'Are we one incident away from a headline?',
      whenVulnerable: [
        'After a HIPAA audit',
        'After a competitor has an incident',
        'After an internal near-miss'
      ],
      bestContactTime: '7-8am local',
      decisionAuthority: 'final'
    },
    {
      role: 'it_director',
      title: 'IT Director / CIO',
      businessConcerns: ['Security', 'uptime', 'integration', 'vendor management'],
      personalFears: [
        'Being blamed for a breach',
        'Being responsible for a system they didn\'t design',
        'Guaranteeing something they know is fragile'
      ],
      whatKeepsThemUp: 'When this breaks, it\'s my name on it.',
      whenVulnerable: [
        'After an incident',
        'When they know there\'s a vulnerability but can\'t get budget',
        'During audit prep'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'influencer'
    },
    {
      role: 'owner',
      title: 'Practice Owner (clinics)',
      businessConcerns: ['Patient experience', 'efficiency', 'costs', 'liability'],
      personalFears: [
        'A lawsuit',
        'A breach that destroys the practice',
        'Having to close over something preventable'
      ],
      whatKeepsThemUp: 'I\'m a doctor, not an IT person. What am I missing?',
      whenVulnerable: [
        'After hearing about another practice breach',
        'After a near-miss',
        'When IT person leaves'
      ],
      bestContactTime: '7-8am or 12-1pm local',
      decisionAuthority: 'final'
    }
  ],

  wedgeQuestions: [
    {
      question: 'If your low-voltage vendor was breached tomorrow, would your cyber liability insurance cover it? Have you verified their certification?',
      target: ['administrator', 'owner'],
      stage: 'awareness',
      consequence: 'Because the liability chain matters more than most practices realize.',
      deeperConsequence: '60% of small practices close within 6 months of a major breach.'
    },
    {
      question: 'When was the last time your physical layer was audited for HIPAA compliance?',
      target: ['it_director', 'administrator'],
      stage: 'awareness',
      followUp: 'Because OCR is starting to look at more than just software.'
    },
    {
      question: 'If a telehealth call dropped during a critical consultation and something went wrong, who\'s liable?',
      target: ['owner', 'administrator'],
      stage: 'awareness'
    }
  ],

  painMath: [
    {
      scenario: 'HIPAA violation',
      variables: {
        tier: 'Tier 4 (Willful Neglect)',
        perViolation: '$50,000+',
        annualMax: '$1,500,000+'
      },
      calculation: 'Fines + Legal ($500K-$2M) + Notification ($50-100/patient) + Reputation (incalculable)',
      impact: 'Total breach cost for 10,000 patients: $1.5M - $5M+',
      punchline: '60% of small practices close within 6 months of a major breach. A $50K infrastructure investment vs. practice closure isn\'t a hard decision.'
    },
    {
      scenario: 'Practice closure risk',
      variables: {
        practiceValue: '$2M',
        closureRate: '60%',
        timeframe: '6 months'
      },
      calculation: 'Practice value × closure probability = $1.2M expected loss',
      impact: '$1.2M expected loss from inadequate infrastructure',
      punchline: 'I\'m not the cheapest option. But I\'m the option you can defend in a deposition.'
    }
  ],

  timingTriggers: [
    {
      signal: 'New facility announced',
      meaning: 'Compliance baked in from start',
      action: 'Email about HIPAA-certified infrastructure',
      urgency: 'this_month'
    },
    {
      signal: 'HIPAA audit scheduled',
      meaning: 'Anxiety is high',
      action: 'Offer pre-audit infrastructure review',
      urgency: 'immediate'
    },
    {
      signal: 'OCR guidance update',
      meaning: 'New requirements',
      action: 'Email about implications for physical layer',
      urgency: 'this_week'
    },
    {
      signal: 'Competitor breach',
      meaning: 'Fear is fresh',
      action: 'Reference incident, offer assessment',
      urgency: 'immediate'
    },
    {
      signal: 'EHR migration announced',
      meaning: 'Everything in flux',
      action: 'Perfect time to audit physical layer',
      urgency: 'this_week'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick HIPAA question about {practiceName}',
      body: `Hey {firstName},

Random question - when was the last time your physical network layer was included in a HIPAA audit?

I ask because OCR has been expanding their scope beyond software. A practice we work with got flagged for network segmentation issues last quarter - something their IT vendor said was "fine."

Not trying to scare you - just something I've been seeing more of lately. Curious if it's on your radar.

- Mike`,
      variables: ['firstName', 'practiceName']
    },
    {
      day: 4,
      type: 'fear',
      subject: 're: Quick HIPAA question',
      body: `Hey {firstName},

One more thought -

Do you know if your low-voltage vendor carries cyber liability that names you as additionally insured?

If a breach traces to their work (unsegmented network, improper access controls, etc.), the liability chain matters. A lot of practices assume their vendor is covered. Most aren't.

Might be worth a 15-minute call to review your current setup against what OCR is looking for. No pitch - just a sanity check.

- Mike`,
      variables: ['firstName']
    },
    {
      day: 10,
      type: 'story',
      subject: 'What happened at {competitorPractice}',
      body: `Hey {firstName},

Don't know if you heard about {competitorPractice} - they got hit with a $400K fine for a breach that traced back to their network infrastructure.

Their IT vendor wasn't HIPAA-certified. The segmentation was wrong. They didn't have documentation.

Just a heads up. If you ever want a second set of eyes on your setup, I'm around.

- Mike`,
      variables: ['firstName', 'competitorPractice']
    },
    {
      day: 17,
      type: 'exit',
      subject: 'Closing the loop',
      body: `Hey {firstName},

I'll assume {practiceName} is all buttoned up on the compliance side.

If anything changes or you're planning an expansion, keep my info. We specialize in healthcare infrastructure and understand the regulatory side, not just the cables.

Best of luck.

- Mike`,
      variables: ['firstName', 'practiceName']
    }
  ],

  techNeeds: [
    {
      need: 'Network segmentation',
      whyItMatters: 'HIPAA requirement, breach containment',
      nepqQuestion: 'Is your medical device network fully segmented from your guest wifi and admin systems?'
    },
    {
      need: 'Telehealth infrastructure',
      whyItMatters: 'Reimbursement, patient access, specialist consults',
      nepqQuestion: 'Are your exam rooms wired for the telehealth requirements CMS is mandating?'
    },
    {
      need: 'Redundancy/failover',
      whyItMatters: 'Uptime guarantee, patient safety',
      nepqQuestion: 'If your primary internet goes down during a procedure, what\'s your failover?'
    },
    {
      need: 'Physical security',
      whyItMatters: 'Access control, controlled substance areas, HIPAA',
      nepqQuestion: 'Who has access to your server room? Is it logged?'
    },
    {
      need: 'Nurse call/emergency',
      whyItMatters: 'Patient safety, response time documentation',
      nepqQuestion: 'Does your nurse call system timestamp response times for Joint Commission?'
    }
  ],

  competitiveWedges: [
    'Is your current low-voltage vendor HIPAA-certified? Not just saying they are - actually certified with documentation you could show an auditor?',
    'When was the last time your vendor provided a physical layer security audit? Because OCR is asking for those now.',
    'Does your vendor carry cyber liability insurance that names you as additionally insured? If they\'re breached and it traces to their work, who pays?'
  ],

  cheatCode: {
    insight: 'Nobody in healthcare wants to be the cheapest option. They want to be defensible. When the lawsuit comes - and it will - they need to be able to say: "We used a HIPAA-certified vendor. We had documentation. We did everything we were supposed to do."',
    line: 'I\'m not the cheapest option. But I\'m the option you can defend in a deposition. That\'s worth something.'
  }
}

// ===========================================
// STUDENT HOUSING
// ===========================================
export const STUDENT_HOUSING: VerticalIntelligence = {
  type: 'student_housing',
  name: 'Student Housing',

  marketReality: [
    'Purpose-built student housing is $10B+ industry',
    'Internet is not an amenity - it\'s like water and electricity',
    'Students will destroy your reputation on social media in hours',
    'Parents are co-signers and decision influencers',
    'Move-in day is a single point of failure'
  ],

  roles: [
    {
      role: 'developer',
      title: 'Developer/Owner',
      businessConcerns: ['Occupancy', 'lease-up speed', 'per-bed revenue', 'parent satisfaction'],
      personalFears: [
        'Building the property students warn each other about',
        'Being the "avoid this place" post on Reddit',
        'Property that can\'t fill beds'
      ],
      whatKeepsThemUp: 'What if we build it and they don\'t come?',
      whenVulnerable: [
        '60-90 days before fall lease-up',
        'When competitor opens nearby',
        'When social media starts buzzing about problems'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'gc',
      title: 'General Contractor',
      businessConcerns: ['Hitting move-in day', 'no callbacks', 'no punch list delays'],
      personalFears: [
        'Being blamed for spec issues',
        'Getting fired from next project',
        'CO delay'
      ],
      whatKeepsThemUp: 'What\'s going to bite me at punch list?',
      whenVulnerable: [
        '30 days before CO',
        'When everything crashes together'
      ],
      bestContactTime: '6-7am local',
      decisionAuthority: 'influencer'
    },
    {
      role: 'property_manager',
      title: 'Property Manager',
      businessConcerns: ['Move-in day execution', 'resident satisfaction', 'renewals', 'online reviews'],
      personalFears: [
        'Being the face of 400 angry students and parents',
        'Phone blowing up for a week',
        'Inheriting infrastructure problems'
      ],
      whatKeepsThemUp: 'Move-in day is going to be chaos.',
      whenVulnerable: [
        'Two weeks before move-in',
        'Immediately after move-in day problems',
        'When reviews start rolling in'
      ],
      bestContactTime: '9-10am local',
      decisionAuthority: 'recommender'
    }
  ],

  wedgeQuestions: [
    {
      question: 'What\'s your plan for move-in day when 400 students and 400 parents are all trying to connect simultaneously?',
      target: ['developer', 'gc', 'property_manager'],
      stage: 'awareness',
      followUp: 'Because standard specs assume 2 devices per unit. Student housing is 7-10 per bed.',
      consequence: 'What happens to your Google reviews when students can\'t game on move-in day?',
      deeperConsequence: 'What does a 5% vacancy from bad reputation cost on a 400-bed property annually?'
    },
    {
      question: 'Has anyone stress-tested the network for move-in day density?',
      target: ['developer', 'gc'],
      stage: 'awareness',
      followUp: 'Or is it just speced for normal occupancy?'
    },
    {
      question: 'What\'s your playbook if wifi goes down the first day and 400 students start posting about it?',
      target: ['property_manager'],
      stage: 'awareness'
    }
  ],

  painMath: [
    {
      scenario: 'Move-in day device density',
      variables: {
        beds: '400',
        devicesPerStudent: '5',
        devicesPerParent: '2',
        total: '2,800'
      },
      calculation: '400 beds × 7 devices = 2,800 simultaneous connections on Day 1',
      impact: '2,800 devices hitting the network in 4 hours',
      punchline: 'Your network is sized for normal occupancy. Move-in day is 3x that.'
    },
    {
      scenario: 'Vacancy from bad reputation',
      variables: {
        beds: '400',
        rentPerBed: '$850/month',
        vacancyRate: '5%',
        recoveryTime: '2-3 years'
      },
      calculation: '400 × $850 × 12 × 0.05 = $204,000/year',
      impact: '$204K/year lost from 5% vacancy. $612K over 3-year reputation recovery.',
      punchline: 'You\'re spending $45M on this property. The difference between move-in day being a TikTok disaster and seamless is about $60K. That\'s 0.13% of your budget.'
    }
  ],

  timingTriggers: [
    {
      signal: 'New project announced',
      meaning: 'Specs being written',
      action: 'Email developer about density requirements',
      urgency: 'this_month'
    },
    {
      signal: '90 days before fall semester',
      meaning: 'Move-in day pressure building',
      action: 'Ask if network is ready for 2,800 devices',
      urgency: 'this_week'
    },
    {
      signal: '30 days before move-in',
      meaning: 'Last chance',
      action: 'Offer stress test before move-in',
      urgency: 'immediate'
    },
    {
      signal: 'Competitor bad move-in',
      meaning: 'Fear is fresh',
      action: 'Reference competitor disaster',
      urgency: 'immediate'
    },
    {
      signal: 'Leasing slow',
      meaning: 'Desperation',
      action: 'Tech amenities as lease-up differentiator',
      urgency: 'this_week'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {propertyName} move-in day',
      body: `Hey {firstName},

Quick question - has anyone stress-tested {propertyName}'s network for move-in day?

I ask because standard multifamily specs assume maybe 2 devices per unit. Student housing on move-in day is more like 7-10 devices per bed - students plus parents all connecting at once.

We just did a property at {university} where the developer didn't catch this until two weeks before move-in. It was a scramble.

Not sure where you're at with {propertyName} - just wanted to flag it in case.

- Mike`,
      variables: ['firstName', 'propertyName', 'university']
    },
    {
      day: 4,
      type: 'fear',
      subject: 're: Quick question about {propertyName}',
      body: `Hey {firstName},

One more thought on {propertyName} -

{redditLinkOrDescription}

This property opened last fall. Within 24 hours of move-in, this was everywhere. They spent the whole year trying to recover their reputation. Still sitting at 60% occupancy.

Move-in day is a single point of failure for student housing. Might be worth a 15-minute call just to sanity-check the spec.

- Mike`,
      variables: ['firstName', 'propertyName', 'redditLinkOrDescription']
    },
    {
      day: 10,
      type: 'competitive',
      subject: 'The gaming question students are asking',
      body: `Hey {firstName},

One thing I'm seeing more of - students touring properties and specifically asking about:

- Hardwired ethernet in bedrooms
- NAT type for gaming consoles
- Guaranteed bandwidth per bed

If your leasing team doesn't have confident answers to these, you're losing the gamers to whoever does. And gamers talk to each other.

Just a heads up. Happy to provide a "technology amenity" sheet your leasing team can use.

- Mike`,
      variables: ['firstName']
    },
    {
      day: 17,
      type: 'exit',
      subject: 'Closing the loop',
      body: `Hey {firstName},

I'll assume {propertyName} is all set for move-in day.

If anything changes or you're planning another project, keep my info. We specialize in student housing and understand the density requirements, not just standard multifamily specs.

Good luck with the lease-up.

- Mike`,
      variables: ['firstName', 'propertyName']
    }
  ],

  techNeeds: [
    {
      need: 'High-density wifi',
      whyItMatters: 'Move-in day, gaming, streaming',
      nepqQuestion: 'Can every room game and stream simultaneously?'
    },
    {
      need: 'Wired ethernet in units',
      whyItMatters: 'Gaming needs, reliability, competitive edge',
      nepqQuestion: 'Do you have hardwired options for students who game competitively?'
    },
    {
      need: 'Guaranteed bandwidth per bed',
      whyItMatters: 'Expectation setting, marketing',
      nepqQuestion: 'What\'s your guaranteed bandwidth per bed? Students are asking.'
    },
    {
      need: 'Gaming optimization',
      whyItMatters: 'Low latency, NAT type, console compatibility',
      nepqQuestion: 'Have you tested the network for NAT type and gaming console compatibility?'
    },
    {
      need: 'Move-in day capacity',
      whyItMatters: 'Surge handling',
      nepqQuestion: 'Is your network sized for normal occupancy or move-in day chaos?'
    }
  ],

  competitiveWedges: [
    'Has your low-voltage contractor ever done purpose-built student housing? It\'s not the same as multifamily - the density requirements are completely different.',
    'What\'s their plan for move-in day? Have they stress-tested for 2,800 simultaneous connections?',
    'Can they guarantee sub-20ms latency for gaming? Because students check that now.'
  ],

  cheatCode: {
    insight: 'Move-in day is the only day that matters. Everything else can be fixed. Move-in day cannot be undone. The TikToks are permanent. The Google reviews are permanent. The Reddit threads are permanent.',
    line: 'You get one chance at move-in day. One. Every student has a phone and a social media account. The first 24 hours determines your reputation for the next 3 years.'
  }
}

// ===========================================
// CORPORATE OFFICE
// ===========================================
export const CORPORATE_OFFICE: VerticalIntelligence = {
  type: 'corporate_office',
  name: 'Corporate Office',

  marketReality: [
    'Return-to-office creating renovation waves',
    'Hybrid work means conference rooms are critical',
    'Companies downsizing footprint but upgrading quality',
    'IT teams demanding more control and reliability',
    '"Experience" is a selling point for attracting talent'
  ],

  roles: [
    {
      role: 'developer',
      title: 'Developer/Owner (spec office)',
      businessConcerns: ['Lease-up', 'tenant quality', 'rental rates per SF'],
      personalFears: [
        'Building a commodity',
        'Being the "B building" in the submarket',
        'Tenants leaving for newer building'
      ],
      whatKeepsThemUp: 'What differentiates this building?',
      whenVulnerable: [
        'When competing building opens',
        'When occupancy drops',
        'When major tenant doesn\'t renew'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'cfo',
      title: 'Corporate Tenant Decision-Maker',
      businessConcerns: ['Employee productivity', 'talent attraction', 'hybrid work enablement'],
      personalFears: [
        '10-year lease on outdated building',
        'Being blamed for bad office move',
        'Employee complaints'
      ],
      whatKeepsThemUp: 'Are people going to want to come to this office?',
      whenVulnerable: [
        'During building tours',
        'When comparing to competitors',
        'When employees complain'
      ],
      bestContactTime: '10-11am local',
      decisionAuthority: 'final'
    },
    {
      role: 'it_director',
      title: 'IT Director (tenant side)',
      businessConcerns: ['Reliability', 'bandwidth', 'security', 'vendor coordination'],
      personalFears: [
        'Inheriting bad infrastructure decisions',
        'Getting blamed for building problems',
        'Conference rooms that don\'t work'
      ],
      whatKeepsThemUp: 'The CEO\'s meeting is tomorrow and the conference room AV is glitchy.',
      whenVulnerable: [
        'After a failed meeting',
        'When negotiating tenant improvement',
        'When CEO experiences technology problem'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'influencer'
    },
    {
      role: 'facilities_manager',
      title: 'Facilities Manager (building)',
      businessConcerns: ['Tenant satisfaction', 'system uptime', 'vendor management'],
      personalFears: [
        'Angry tenant calls',
        'Can\'t fix something',
        'Losing tenant over preventable issue'
      ],
      whatKeepsThemUp: 'What\'s going to break tomorrow?',
      whenVulnerable: [
        'After tenant complaint',
        'During lease renewal negotiations',
        'When system fails'
      ],
      bestContactTime: '7-8am local',
      decisionAuthority: 'recommender'
    }
  ],

  wedgeQuestions: [
    {
      question: 'When a prospective tenant asks "What\'s your building\'s technology infrastructure?" what\'s your answer?',
      target: ['developer', 'facilities_manager'],
      stage: 'awareness',
      followUp: 'Because tenants are asking now. It\'s becoming a differentiator.',
      consequence: 'What happens when they compare you to the building down the street that markets "technology-forward infrastructure"?'
    },
    {
      question: 'When your CEO\'s board presentation freezes in the main conference room, who gets the call?',
      target: ['it_director', 'cfo'],
      stage: 'awareness',
      consequence: 'How many meetings have to fail before it becomes a lease decision?'
    },
    {
      question: 'Is the building\'s infrastructure something you control, or something you have to work around?',
      target: ['it_director'],
      stage: 'consideration'
    }
  ],

  painMath: [
    {
      scenario: 'Conference room disruptions',
      variables: {
        execHourlyCost: '$300',
        meetingSize: '10 people',
        disruptionTime: '30 min',
        frequencyPerMonth: '8'
      },
      calculation: '$300 × 10 × 0.5 × 8 = $12,000/month',
      impact: '$144,000/year in executive time wasted on AV issues',
      punchline: 'Nobody notices when the conference room works. Everyone notices when it doesn\'t. And the people who notice are the people who make lease decisions.'
    },
    {
      scenario: 'Lost tenant',
      variables: {
        rentPerSF: '$40',
        tenantSF: '50,000',
        leaseYears: '10'
      },
      calculation: '$40 × 50,000 × 10 = $20,000,000',
      impact: '$20M lease lost over "outdated" building',
      punchline: 'The $150K difference between "basic" and "exceptional" infrastructure is a rounding error on a $20M lease.'
    }
  ],

  timingTriggers: [
    {
      signal: 'New building announced',
      meaning: 'Specs being written',
      action: 'Email developer about technology differentiation',
      urgency: 'this_month'
    },
    {
      signal: 'Major tenant move announced',
      meaning: 'TI budget exists',
      action: 'Offer conference room AV consultation',
      urgency: 'this_week'
    },
    {
      signal: 'Return-to-office announcement',
      meaning: 'Companies investing in space',
      action: 'Ask if space is ready for hybrid work',
      urgency: 'this_week'
    },
    {
      signal: 'Competitor building opens',
      meaning: 'Comparison anxiety',
      action: 'Reference competitor\'s technology marketing',
      urgency: 'immediate'
    },
    {
      signal: 'Lease expiration approaching',
      meaning: 'Decisions imminent',
      action: 'Offer building assessment',
      urgency: 'this_month'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {buildingName}',
      body: `Hey {firstName},

Quick question - when tenants tour {buildingName} and ask about technology infrastructure, what do you show them?

I ask because I'm seeing more corporate tenants specifically asking about:
- Conference room AV reliability
- Building-wide connectivity
- Cell coverage in parking structures

It's becoming a differentiator, not just a checkbox.

Curious how you're positioning {buildingName} on the technology side.

- Mike`,
      variables: ['firstName', 'buildingName']
    },
    {
      day: 4,
      type: 'story',
      subject: 're: Quick question about {buildingName}',
      body: `Hey {firstName},

Quick story -

We worked with a building where a major tenant's CEO had his board presentation freeze three times in one meeting. The conference room AV was "fine" - just not reliable.

They didn't renew. $18M lease, lost over conference room AV.

I know that's an extreme example. But these stories are becoming more common as hybrid work puts more pressure on conference room technology.

If you ever want to audit the conference room experience at {buildingName}, I'm happy to do a walkthrough. No charge.

- Mike`,
      variables: ['firstName', 'buildingName']
    },
    {
      day: 10,
      type: 'competitive',
      subject: 'Saw {competitorBuilding} marketing',
      body: `Hey {firstName},

Saw {competitorBuilding} is marketing "technology-forward infrastructure" and "seamless hybrid work."

Not sure if that's affecting your prospects, but I'm seeing tenants specifically ask to compare.

If you want to match or beat their positioning, happy to talk about what it would take.

- Mike`,
      variables: ['firstName', 'competitorBuilding']
    },
    {
      day: 17,
      type: 'exit',
      subject: 'Closing the loop on {buildingName}',
      body: `Hey {firstName},

I'll assume {buildingName} is all set on infrastructure.

If you're ever planning upgrades or have a tenant requesting TI, keep my info. We specialize in commercial office and understand what tenants are actually asking for.

Good luck with the leasing.

- Mike`,
      variables: ['firstName', 'buildingName']
    }
  ],

  techNeeds: [
    {
      need: 'Conference room AV',
      whyItMatters: 'Meetings, presentations, hybrid work',
      nepqQuestion: 'Can remote employees join seamlessly or is every meeting a technology support call?'
    },
    {
      need: 'Structured cabling',
      whyItMatters: 'Future-proofing, tenant density, reliability',
      nepqQuestion: 'Is your cabling ready for 10GB to the desk when tenants start asking?'
    },
    {
      need: 'Building-wide wifi',
      whyItMatters: 'Mobility, common areas, tenant satisfaction',
      nepqQuestion: 'What\'s the building\'s wifi story for common areas and amenities?'
    },
    {
      need: 'DAS (cell coverage)',
      whyItMatters: 'Cell coverage in parking and stairwells',
      nepqQuestion: 'How\'s cell coverage in the basement and stairwells?'
    },
    {
      need: 'Access control',
      whyItMatters: 'Security, tenant management',
      nepqQuestion: 'Can tenants manage their own access or does everything go through you?'
    }
  ],

  competitiveWedges: [
    'The building down the street is marketing "technology-forward infrastructure." What\'s your answer when tenants compare?',
    'Is your landlord responsible for conference room AV, or is that in your TI? Because if it\'s the landlord\'s spec, you might be inheriting their bad decisions.',
    'Do you have any say in the building\'s infrastructure, or are you just dealing with whatever\'s there?'
  ],

  cheatCode: {
    insight: 'The conference room is the most important room in the building. It\'s where deals get done. It\'s where boards meet. It\'s where the CEO is when something breaks. It\'s the most visible, highest-stakes technology in the building.',
    line: 'Nobody notices when the conference room works. Everyone notices when it doesn\'t. And the people who notice are the people who make the lease decisions.'
  }
}

// ===========================================
// MIXED USE
// ===========================================
export const MIXED_USE: VerticalIntelligence = {
  type: 'mixed_use',
  name: 'Mixed-Use Development',

  marketReality: [
    'Growing because cities want density',
    'Each component has different requirements',
    'Complexity creates opportunity for specialists',
    'One failure affects whole development\'s reputation',
    'Developers often underestimate technology complexity'
  ],

  roles: [
    {
      role: 'developer',
      title: 'Developer',
      businessConcerns: ['Delivering all components on time', 'coordinating multiple user types', 'maximizing value'],
      personalFears: [
        'One component dragging down others',
        'Complexity overwhelming the team',
        'Being the developer with the messy mixed-use'
      ],
      whatKeepsThemUp: 'How do I coordinate residential, retail, and office without something falling through the cracks?',
      whenVulnerable: [
        'When complexity becomes visible',
        'When timelines slip',
        'When one component affects another'
      ],
      bestContactTime: '8-9am local',
      decisionAuthority: 'final'
    },
    {
      role: 'gc',
      title: 'General Contractor',
      businessConcerns: ['Coordinating different specs', 'avoiding conflicts', 'hitting milestones'],
      personalFears: [
        'Same system speced differently for three uses',
        'Rework and change orders',
        'Being blamed for coordination failures'
      ],
      whatKeepsThemUp: 'The retail wants one thing, residential wants another, and nobody told me they share a riser.',
      whenVulnerable: [
        'When scope conflicts emerge',
        'When low-voltage sub doesn\'t understand mixed-use'
      ],
      bestContactTime: '6-7am local',
      decisionAuthority: 'influencer'
    }
  ],

  wedgeQuestions: [
    {
      question: 'Who\'s coordinating the low-voltage across retail, residential, and office?',
      target: ['developer', 'gc'],
      stage: 'awareness',
      followUp: 'Because they have completely different requirements and they\'re sharing infrastructure.',
      consequence: 'What happens when you discover at rough-in that retail and residential were speced to use the same riser?',
      deeperConsequence: 'A riser conflict discovered at rough-in is $50K+ in rework. Finding it now is free.'
    },
    {
      question: 'Is your riser sized for all three uses, or just the first one speced?',
      target: ['gc', 'developer'],
      stage: 'consideration'
    },
    {
      question: 'How are you segmenting the retail POS network from residential?',
      target: ['gc', 'developer'],
      stage: 'consideration'
    }
  ],

  painMath: [
    {
      scenario: 'Riser conflict discovered late',
      variables: {
        reworkCost: '$50,000+',
        redundancyCost: '$100,000+',
        delayCost: '$200,000+/month'
      },
      calculation: 'Rework + Redundancy + Delay = $350,000+',
      impact: '$350K+ from coordination failures',
      punchline: 'Mixed-use looks like one building but it\'s three different specs that share infrastructure. Without coordination, you\'re building three buildings\' worth of problems on top of each other.'
    }
  ],

  timingTriggers: [
    {
      signal: 'Mixed-use project announced',
      meaning: 'Complexity not yet appreciated',
      action: 'Email about coordination challenges',
      urgency: 'this_month'
    },
    {
      signal: 'GC selected',
      meaning: 'Subcontractors being chosen',
      action: 'Offer to coordinate across components',
      urgency: 'immediate'
    },
    {
      signal: 'Design development phase',
      meaning: 'Specs being written',
      action: 'Flag potential conflicts early',
      urgency: 'this_week'
    }
  ],

  emailSequence: [
    {
      day: 0,
      type: 'wedge',
      subject: 'Quick question about {projectName} coordination',
      body: `Hey {firstName},

Quick question - who's coordinating low-voltage across retail, residential, and office at {projectName}?

I ask because I've seen mixed-use projects where each component was speced in isolation and conflicts emerged at rough-in. Different riser requirements, different security needs, different bandwidth profiles - all trying to share infrastructure.

Not saying that's the case here. Just curious how you're handling the coordination.

- Mike`,
      variables: ['firstName', 'projectName']
    },
    {
      day: 4,
      type: 'story',
      subject: 're: Quick question about {projectName}',
      body: `Hey {firstName},

Quick story -

We consulted on a mixed-use last year where the retail low-voltage sub didn't know the residential sub was planning to use the same riser. Found out at rough-in. $80K rework.

Then the office tenant's IT team wanted their network completely segmented from both - which nobody had planned for.

Mixed-use is three buildings pretending to be one. Without coordination, you get three buildings' worth of problems.

If you want a second set of eyes on the coordination, I'm happy to take a look. No charge.

- Mike`,
      variables: ['firstName', 'projectName']
    },
    {
      day: 10,
      type: 'exit',
      subject: 'Closing the loop on {projectName}',
      body: `Hey {firstName},

I'll assume {projectName} is all coordinated on the low-voltage side.

If anything changes or you're planning another mixed-use, keep my info. It's our specialty - understanding how retail, residential, and office interact, not just how they work in isolation.

Good luck with the project.

- Mike`,
      variables: ['firstName', 'projectName']
    }
  ],

  techNeeds: [
    {
      need: 'Shared risers',
      whyItMatters: 'Different capacity needs, future-proofing',
      nepqQuestion: 'Is your riser sized for all three uses, or just the first one speced?'
    },
    {
      need: 'Network segmentation',
      whyItMatters: 'Security between uses, compliance',
      nepqQuestion: 'How are you segmenting the retail POS network from residential?'
    },
    {
      need: 'Converged systems',
      whyItMatters: 'Parking, access control, directories',
      nepqQuestion: 'Will residents, office tenants, and retail share access control, or three different systems?'
    },
    {
      need: 'Parking complexity',
      whyItMatters: 'Different validation, access levels',
      nepqQuestion: 'Can residential, office, and retail parking all coexist without conflicts?'
    }
  ],

  competitiveWedges: [
    'Has your low-voltage sub done mixed-use before? It\'s not the same as doing each component separately.',
    'Who\'s responsible for the interfaces between retail, residential, and office? Because that\'s where things break.',
    'Is there one set of drawings or three? Because if it\'s three, nobody\'s coordinating.'
  ],

  cheatCode: {
    insight: 'Mixed-use is where generalist contractors fail. They know multifamily OR retail OR office. They don\'t know how to make them coexist. That complexity is the opportunity.',
    line: 'You\'re not building a mixed-use project. You\'re building three projects that share infrastructure. If your low-voltage contractor doesn\'t understand that, you\'re going to find out during construction - at change order prices.'
  }
}

// ===========================================
// VERTICAL LOOKUP
// ===========================================
export const VERTICALS: Record<VerticalType, VerticalIntelligence> = {
  multifamily: MULTIFAMILY,
  senior_living: SENIOR_LIVING,
  hotel: HOTEL,
  medical: MEDICAL,
  student_housing: STUDENT_HOUSING,
  corporate_office: CORPORATE_OFFICE,
  mixed_use: MIXED_USE,
  retail: MULTIFAMILY, // Placeholder - uses multifamily as base
  industrial: MULTIFAMILY, // Placeholder - uses multifamily as base
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export function getVerticalIntelligence(vertical: VerticalType): VerticalIntelligence {
  return VERTICALS[vertical] || MULTIFAMILY
}

export function detectVerticalFromProjectType(projectTypes: string[]): VerticalType {
  const typeMap: Record<string, VerticalType> = {
    'multifamily': 'multifamily',
    'apartment': 'multifamily',
    'apartments': 'multifamily',
    'residential': 'multifamily',
    'senior living': 'senior_living',
    'assisted living': 'senior_living',
    'nursing home': 'senior_living',
    'memory care': 'senior_living',
    'hotel': 'hotel',
    'hospitality': 'hotel',
    'motel': 'hotel',
    'resort': 'hotel',
    'medical': 'medical',
    'healthcare': 'medical',
    'hospital': 'medical',
    'clinic': 'medical',
    'medical office': 'medical',
    'student housing': 'student_housing',
    'student': 'student_housing',
    'dormitory': 'student_housing',
    'dorm': 'student_housing',
    'office': 'corporate_office',
    'corporate': 'corporate_office',
    'commercial office': 'corporate_office',
    'mixed-use': 'mixed_use',
    'mixed use': 'mixed_use',
    'retail': 'retail',
    'shopping': 'retail',
    'industrial': 'industrial',
    'warehouse': 'industrial',
  }

  for (const type of projectTypes) {
    const normalized = type.toLowerCase().trim()
    if (typeMap[normalized]) {
      return typeMap[normalized]
    }
    // Partial matching
    for (const [key, vertical] of Object.entries(typeMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return vertical
      }
    }
  }

  return 'multifamily' // Default
}

export function getRolePsychology(vertical: VerticalType, role: RoleType): RolePsychology | undefined {
  const intel = getVerticalIntelligence(vertical)
  return intel.roles.find(r => r.role === role)
}

export function getWedgeQuestionsForRole(vertical: VerticalType, role: RoleType): WedgeQuestion[] {
  const intel = getVerticalIntelligence(vertical)
  return intel.wedgeQuestions.filter(q => q.target.includes(role))
}

export function getEmailSequence(vertical: VerticalType): EmailTemplate[] {
  const intel = getVerticalIntelligence(vertical)
  return intel.emailSequence
}

export function getTimingTriggers(vertical: VerticalType): TimingTrigger[] {
  const intel = getVerticalIntelligence(vertical)
  return intel.timingTriggers
}
