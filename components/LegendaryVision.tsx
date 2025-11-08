import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

const SectionCard: React.FC<CardProps> = ({ title, description, icon, accentColor = 'bg-dignity-purple/10 text-dignity-purple', children }) => (
  <div className="relative h-full rounded-2xl border border-surface-tertiary bg-surface-primary p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
    {icon && (
      <div className={`mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${accentColor}`}>
        <span role="img" aria-label={title} className="mr-2">
          {icon}
        </span>
        <span>{title}</span>
      </div>
    )}
    {!icon && (
      <h3 className="mb-3 text-xl font-semibold text-secure-slate">{title}</h3>
    )}
    {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
    {children}
  </div>
);

const opportunityHighlights = [
  {
    title: 'The Problem',
    icon: '🍽️',
    accentColor: 'bg-kindness-coral/10 text-kindness-coral',
    bullets: [
      '40M+ Americans struggle with food insecurity today',
      'Existing safety nets create shame and expose personal stories',
      'Helpers nearby lack a safe, simple way to step in',
    ],
  },
  {
    title: 'The Solution',
    icon: '🛡️',
    accentColor: 'bg-shield-blue/10 text-shield-blue',
    bullets: [
      'Privacy-first requests, anonymous fulfillment',
      'Instant coordination across in-person, e-commerce, and gift cards',
      'Every interaction captured, amplified, and reinvested into kindness',
    ],
  },
  {
    title: 'The Vision',
    icon: '🚀',
    accentColor: 'bg-trust-teal/10 text-trust-teal',
    bullets: [
      'The operating system for human kindness',
      '10B+ views of real help stories in year one',
      'Kindness becomes a measurable, tradeable asset across the economy',
    ],
  },
];

const featurePillars = [
  {
    title: 'Smart Commerce Integration',
    icon: '🛒',
    accentColor: 'bg-sanctuary-green/10 text-sanctuary-green',
    tagline: 'Frictionless generosity at scale',
    bullets: [
      'Real-time AI pricing across every major retailer',
      'Anonymous Amazon deliveries, store pick-up, and drone-ready logistics',
      'Gift card pools, corporate wallets, and bulk community buying',
    ],
  },
  {
    title: 'Testimonial & Content Engine',
    icon: '🎥',
    accentColor: 'bg-kindness-coral/10 text-kindness-coral',
    tagline: 'Every thank you becomes a movement',
    bullets: [
      '7 ways to say thanks—video, voice, art, emoji, even silence',
      'AI amplifies emotion while preserving faces and voices',
      '20+ pieces of content per delivery—autopilot virality',
    ],
  },
  {
    title: 'AI Orchestration Layer',
    icon: '🤖',
    accentColor: 'bg-dignity-purple/10 text-dignity-purple',
    tagline: 'Twenty specialists for every act of help',
    bullets: [
      'Need prediction before crises hit',
      'Matching and routing with 95% satisfaction',
      'AR shopping copilots, content editors, safety guardians',
    ],
  },
  {
    title: 'The Karma Economy',
    icon: '💰',
    accentColor: 'bg-trust-teal/10 text-trust-teal',
    tagline: 'Kindness finally has compound interest',
    bullets: [
      'Kindness Credit Score™ becomes the new trust badge',
      'Staking, rewards, and universal basic kindness daily',
      '$HELP tokens recorded on-chain for an immutable kindness ledger',
    ],
  },
  {
    title: 'Multi-Channel Fulfillment',
    icon: '🌐',
    accentColor: 'bg-shield-blue/10 text-shield-blue',
    tagline: 'Any helper, any mode, every time',
    bullets: [
      'Traditional delivery, subscriptions, store pick-up, autonomous options',
      'Helpers choose the format that fits their life',
      'Predictive batching lifts fulfillment 5x across communities',
    ],
  },
];

const impactMetrics = [
  { label: 'Year 1', value: '100K families', detail: 'Colorado becomes the default community care system' },
  { label: 'Year 3', value: '10M users', detail: 'America’s kindness infrastructure with federal partnerships' },
  { label: 'Year 5', value: '$1B revenue', detail: 'Global platform serving 1B deliveries annually' },
  { label: 'Year 10', value: '50B helps', detail: 'Kindness economy reduces global food insecurity by 30%' },
];

const growthRoadmap = [
  {
    phase: 'Phase 1 · Longmont → Colorado',
    timeframe: 'Year 1',
    highlights: ['100K users', '1M deliveries', '$10M revenue', 'Corporate & municipal pilots'],
  },
  {
    phase: 'Phase 2 · Regional Expansion',
    timeframe: 'Years 2-3',
    highlights: ['Mountain West + Midwest roll-out', '10M users', '100M deliveries', '$100M revenue'],
  },
  {
    phase: 'Phase 3 · National Rollout',
    timeframe: 'Years 4-5',
    highlights: ['All 50 states', 'Federal integration', '100M users', '$1B revenue'],
  },
  {
    phase: 'Phase 4 · Global & Metaverse',
    timeframe: 'Years 6-10',
    highlights: ['195 countries', 'Metaverse & HelpChain mainnet', '1B users', '$10B+ revenue'],
  },
];

const revenueStreams = [
  {
    category: 'B2B Services · 60%',
    color: 'text-sanctuary-green',
    streams: [
      'Corporate CSR programs ($5K–$50K/mo)',
      'Government & healthcare contracts ($50K–$500K)',
      'Insurance & hospital partnerships ($100/patient/mo)',
    ],
  },
  {
    category: 'Transaction Flywheel · 25%',
    color: 'text-dignity-purple',
    streams: ['2% of $20B GMV = $400M', 'Gift card markup 3%', 'Premium delivery & tip processing'],
  },
  {
    category: 'Premium Subscriptions · 10%',
    color: 'text-kindness-coral',
    streams: ['Helper Pro $9.99/mo', 'Requester Plus $4.99/mo', 'Enterprise command centers'],
  },
  {
    category: 'Ethical Insights · 5%',
    color: 'text-trust-teal',
    streams: ['Anonymized demand data', 'Kindness Credit Score API', 'AI training & grants'],
  },
];

const teamNeeds = [
  'CTO & VP Engineering to scale AI orchestration',
  'Head of Trust & Safety to safeguard privacy-first infrastructure',
  'Head of Content + Growth to run the testimonial engine',
  'Partnership leaders for corporate, healthcare, and government alliances',
  'Head of Operations to activate helper networks in every city',
];

const advisoryBoard = ['Reid Hoffman · Network effects', 'Melinda Gates · Social impact', 'Patrick Collison · Payments', 'Sara Blakely · From bootstrap to billions', 'MrBeast · Viral content mastery'];

const investmentPlan = [
  {
    round: 'Seed · Now',
    amount: '$5M on $25M valuation',
    focus: ['Build MVP superpowers', 'Prove Colorado scale', 'Launch AI & content foundation'],
  },
  {
    round: 'Series A · Year 1',
    amount: '$25M on $150M',
    focus: ['Regional expansion', 'Predictive AI & orchestration layer', '1M deliveries milestone'],
  },
  {
    round: 'Series B · Year 2',
    amount: '$100M on $1B',
    focus: ['National rollout', 'Content studio', '10M user community'],
  },
  {
    round: 'Series C · Year 3',
    amount: '$500M on $5B',
    focus: ['Global launch', 'HelpChain blockchain', '$100M ARR'],
  },
];

const culturalFlywheel = [
  'Stories inspire helpers → helpers fulfill more requests',
  'Every delivery produces viral content → new users arrive daily',
  'Sponsors and corporate partners fuel Universal Basic Kindness',
  'Kindness Credit Score unlocks real-world benefits and retention',
];

export const LegendaryVision: React.FC = () => {
  return (
    <section className="mt-16 rounded-3xl border border-surface-tertiary bg-surface-primary p-8 shadow-2xl sm:p-10 lg:p-12">
      <header className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full bg-dignity-purple/10 px-4 py-1 text-sm font-semibold text-dignity-purple">
          Legendary Outcome Blueprint
        </span>
        <h2 className="mt-4 text-3xl font-bold leading-tight text-secure-slate sm:text-4xl font-display">
          The $10B Kindness Platform That Changes Everything
        </h2>
        <p className="mt-4 text-base text-gray-600 sm:text-lg">
          The Help List transforms neighbors helping neighbors into a privacy-first, AI-powered infrastructure that makes kindness measurable, tradeable, and viral. Here’s how we scale from three deliveries to a billion lives touched.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {opportunityHighlights.map((item) => (
          <SectionCard key={item.title} title={item.title} icon={item.icon} accentColor={item.accentColor}>
            <ul className="space-y-2 text-sm text-gray-700">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-dignity-purple"></span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>

      <section className="mt-16">
        <h3 className="text-2xl font-bold text-secure-slate font-display">Revolutionary Feature Stack</h3>
        <p className="mt-2 max-w-3xl text-gray-600">
          Five synchronized pillars ensure scale without sacrificing intimacy. Each card is a full product squad and a defensible moat.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featurePillars.map((pillar) => (
            <SectionCard key={pillar.title} title={pillar.title} icon={pillar.icon} accentColor={pillar.accentColor}>
              <p className="mb-3 text-sm font-semibold text-gray-600">{pillar.tagline}</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 text-dignity-purple">▹</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Impact Metrics" description="Compound growth milestones that compound hope." >
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {impactMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl bg-surface-secondary p-4">
                  <dt className="text-sm font-medium text-gray-500">{metric.label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-secure-slate">{metric.value}</dd>
                  <p className="mt-1 text-xs text-gray-600">{metric.detail}</p>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Cultural Flywheel" description="Why every delivery unlocks exponential reach.">
            <ul className="space-y-3 text-sm text-gray-700">
              {culturalFlywheel.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-dignity-purple">∞</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </section>

      <section className="mt-16">
        <h3 className="text-2xl font-bold text-secure-slate font-display">Go To Scale Roadmap</h3>
        <div className="mt-6 space-y-6">
          {growthRoadmap.map((phase) => (
            <div key={phase.phase} className="rounded-2xl border border-surface-tertiary bg-surface-secondary/50 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h4 className="text-xl font-semibold text-secure-slate">{phase.phase}</h4>
                <span className="inline-flex rounded-full bg-dignity-purple/10 px-3 py-1 text-sm font-semibold text-dignity-purple">{phase.timeframe}</span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
                {phase.highlights.map((highlight) => (
                  <li key={highlight} className="rounded-full bg-white px-3 py-1 shadow-sm">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h3 className="text-2xl font-bold text-secure-slate font-display">Monetization Flywheel</h3>
        <p className="mt-2 max-w-2xl text-gray-600">
          Mission-aligned revenue streams where helping more people automatically grows the business.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {revenueStreams.map((bucket) => (
            <div key={bucket.category} className="rounded-2xl border border-surface-tertiary bg-surface-primary p-6 shadow-md">
              <h4 className={`text-lg font-semibold ${bucket.color}`}>{bucket.category}</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {bucket.streams.map((stream) => (
                  <li key={stream} className="flex items-start gap-2">
                    <span className="mt-1 text-dignity-purple">•</span>
                    <span>{stream}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Immediate Team Hiring Plan" description="The first 10 leaders who unlock the kindness economy.">
          <ul className="space-y-3 text-sm text-gray-700">
            {teamNeeds.map((need) => (
              <li key={need} className="flex items-start gap-3">
                <span className="mt-1 text-sanctuary-green">✳︎</span>
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Advisory Council" description="Field generals guiding network effects, social impact, payments, and storytelling.">
          <ul className="space-y-3 text-sm text-gray-700">
            {advisoryBoard.map((advisor) => (
              <li key={advisor} className="flex items-start gap-3">
                <span className="mt-1 text-kindness-coral">★</span>
                <span>{advisor}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <section className="mt-16">
        <h3 className="text-2xl font-bold text-secure-slate font-display">Investment Trajectory</h3>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {investmentPlan.map((round) => (
            <div key={round.round} className="rounded-2xl border border-surface-tertiary bg-surface-primary p-6 shadow-md">
              <div className="flex items-baseline justify-between">
                <h4 className="text-lg font-semibold text-secure-slate">{round.round}</h4>
                <span className="text-sm font-semibold text-dignity-purple">{round.amount}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {round.focus.map((focusItem) => (
                  <li key={focusItem} className="flex items-start gap-2">
                    <span className="mt-1 text-dignity-purple">▸</span>
                    <span>{focusItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 rounded-2xl bg-dignity-purple px-6 py-10 text-white shadow-inner sm:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-semibold sm:text-3xl">Ready to Build the Kindness Economy?</h3>
          <p className="mt-4 text-base text-white/90 sm:text-lg">
            We are raising a $5M seed round, recruiting a world-class technical co-founder, and lining up launch partners across corporate, government, and healthcare. Together we can ensure that in ten years every person on Earth has either helped or been helped through The Help List.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="mailto:wasatch@thehelplist.org" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-dignity-purple shadow-lg transition hover:bg-surface-primary">
              wasatch@thehelplist.org
            </a>
            <span className="text-sm text-white/80">LinkedIn · Twitter · TikTok @TheHelpList</span>
          </div>
          <p className="mt-8 text-sm uppercase tracking-wide text-white/70">Legendary is inevitable. Let’s build it.</p>
        </div>
      </footer>
    </section>
  );
};

export default LegendaryVision;
