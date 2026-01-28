'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Partner {
  name: string;
  tagline: string;
  description: string;
  website: string;
  logo?: string;
  category: 'Media & Publishing' | 'Tourism & Travel' | 'Outdoor & Adventure' | 'Data & Reviews' | 'Government & Parks';
  color: string;
}

const partners: Partner[] = [
  // Media & Publishing
  {
    name: 'Gastronomic SLC',
    tagline: "Utah's Oldest Food Magazine",
    description: 'The definitive source for culinary journalism in Utah. When we feature restaurants and dining experiences, Gastronomic SLC provides expert reviews, chef interviews, and insider knowledge of Utah\'s food scene.',
    website: 'https://gastronomicslc.com/',
    category: 'Media & Publishing',
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'Salt Lake Magazine',
    tagline: 'Utah Life, Culture & Style',
    description: 'Premier lifestyle publication covering arts, culture, dining, and events throughout the Wasatch Front. Their local expertise helps us highlight the best cultural destinations and hidden gems.',
    website: 'https://www.saltlakemagazine.com/',
    category: 'Media & Publishing',
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'Wasatch Magazine',
    tagline: 'Outdoor Adventure & Mountain Living',
    description: 'The authority on outdoor recreation, mountain culture, and adventure sports in the Wasatch Range. Essential reading for understanding Utah\'s outdoor destinations.',
    website: 'https://wasatchmagazine.com/',
    category: 'Media & Publishing',
    color: 'from-green-500 to-teal-600'
  },
  {
    name: 'City Weekly',
    tagline: 'Independent Voice of Utah',
    description: 'Alternative weekly covering nightlife, events, arts, and local culture. Their independent journalism provides honest perspectives on Utah\'s evolving scene.',
    website: 'https://www.cityweekly.net/',
    category: 'Media & Publishing',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    name: 'Salt Lake Tribune',
    tagline: 'Utah\'s Independent News Source',
    description: 'Utah\'s largest newspaper providing comprehensive coverage of state news, events, and attractions. Their journalism helps us stay current on Utah destinations.',
    website: 'https://www.sltrib.com/',
    category: 'Media & Publishing',
    color: 'from-gray-600 to-gray-800'
  },

  // Tourism & Travel
  {
    name: 'Visit Salt Lake',
    tagline: 'Official Salt Lake City Tourism',
    description: 'The official destination marketing organization for Salt Lake City. Their visitor resources and event calendars help us provide accurate, up-to-date information on city attractions.',
    website: 'https://www.visitsaltlake.com/',
    category: 'Tourism & Travel',
    color: 'from-blue-400 to-blue-600'
  },
  {
    name: 'Visit Utah',
    tagline: 'Official Utah State Tourism',
    description: 'Utah\'s official tourism office promoting the Mighty 5 national parks and beyond. We rely on their destination data and seasonal travel information.',
    website: 'https://www.visitutah.com/',
    category: 'Tourism & Travel',
    color: 'from-red-500 to-orange-500'
  },
  {
    name: 'Ski Utah',
    tagline: 'The Greatest Snow on Earth',
    description: 'Official marketing organization for Utah\'s ski industry. Essential resource for our winter sports destinations and mountain resort information.',
    website: 'https://www.skiutah.com/',
    category: 'Tourism & Travel',
    color: 'from-cyan-400 to-blue-500'
  },

  // Outdoor & Adventure
  {
    name: 'AllTrails',
    tagline: 'Trail Maps & Hiking Guides',
    description: 'Comprehensive database of hiking trails with user reviews, photos, and GPS tracks. We reference their trail data for accurate difficulty ratings and conditions.',
    website: 'https://www.alltrails.com/',
    category: 'Outdoor & Adventure',
    color: 'from-green-600 to-emerald-700'
  },
  {
    name: 'The Dyrt',
    tagline: 'Camping & RV Travel',
    description: 'Largest camping resource with reviews and photos of campgrounds across Utah. Critical for our camping and outdoor accommodation recommendations.',
    website: 'https://thedyrt.com/',
    category: 'Outdoor & Adventure',
    color: 'from-amber-600 to-orange-700'
  },
  {
    name: 'Mountain Project',
    tagline: 'Rock Climbing Routes & Beta',
    description: 'Definitive guide to rock climbing in Utah and beyond. We cite their route information for climbing destinations and difficulty ratings.',
    website: 'https://www.mountainproject.com/',
    category: 'Outdoor & Adventure',
    color: 'from-slate-600 to-slate-800'
  },

  // Data & Reviews
  {
    name: 'Google Maps',
    tagline: 'Location Data & Reviews',
    description: 'Primary source for place details, hours, contact information, and millions of user reviews. Powers Dan\'s Score composite ratings.',
    website: 'https://www.google.com/maps',
    category: 'Data & Reviews',
    color: 'from-blue-500 to-green-500'
  },
  {
    name: 'Yelp',
    tagline: 'Local Business Reviews',
    description: 'Extensive database of business reviews and ratings. We combine Yelp data with Google reviews to create the most accurate quality scores.',
    website: 'https://www.yelp.com/',
    category: 'Data & Reviews',
    color: 'from-red-600 to-red-700'
  },
  {
    name: 'Unsplash',
    tagline: 'Beautiful Free Photography',
    description: 'High-quality photography platform. Many of our destination photos come from Unsplash\'s talented photographers who generously share their work.',
    website: 'https://unsplash.com/',
    category: 'Data & Reviews',
    color: 'from-gray-700 to-black'
  },

  // Government & Parks
  {
    name: 'National Park Service',
    tagline: 'America\'s Best Idea',
    description: 'Official source for national park information, permits, and regulations. Critical for accurate details on Utah\'s Mighty 5 and other NPS sites.',
    website: 'https://www.nps.gov/',
    category: 'Government & Parks',
    color: 'from-green-700 to-green-900'
  },
  {
    name: 'Utah State Parks',
    tagline: 'Outdoor Recreation & Conservation',
    description: 'Managing 45+ state parks across Utah. We reference their official information for park hours, fees, and seasonal closures.',
    website: 'https://stateparks.utah.gov/',
    category: 'Government & Parks',
    color: 'from-teal-600 to-teal-800'
  },
  {
    name: 'USDA Forest Service',
    tagline: 'National Forests & Wilderness',
    description: 'Managing Utah\'s national forests including Wasatch-Cache, Uinta-Wasatch-Cache, and more. Essential for backcountry and wilderness information.',
    website: 'https://www.fs.usda.gov/',
    category: 'Government & Parks',
    color: 'from-emerald-700 to-green-800'
  },
  {
    name: 'Bureau of Land Management',
    tagline: 'Public Lands & Recreation',
    description: 'Managing millions of acres of Utah public lands. We cite BLM resources for dispersed camping, off-roading, and remote destinations.',
    website: 'https://www.blm.gov/utah',
    category: 'Government & Parks',
    color: 'from-yellow-700 to-amber-800'
  }
];

const categories = [
  'Media & Publishing',
  'Tourism & Travel',
  'Outdoor & Adventure',
  'Data & Reviews',
  'Government & Parks'
] as const;

export default function ExpertNetworkPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <section className="relative py-20 text-center overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="inline-flex items-center gap-3 mb-6 bg-blue-500/20 border border-blue-500 px-6 py-3 rounded-full">
              <span className="text-4xl">🤝</span>
              <span className="text-blue-400 font-bold text-lg">SLCTrips Expert Network</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              We Are The Switchboard
            </h1>
            <p className="text-2xl font-semibold text-gray-200 mb-4 max-w-3xl mx-auto">
              Not The Destination
            </p>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              SLCTrips connects you to Utah's best experts, publications, and resources. We curate and cite—always giving credit where it's due. When you explore our site, you're tapping into the collective knowledge of these incredible organizations.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-12 bg-gray-800/50 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center text-white">Our Promise</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-bold mb-2 text-blue-400">Always Cite Sources</h3>
                  <p className="text-gray-400 text-sm">
                    Every recommendation includes attribution to the experts who know it best
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔗</div>
                  <h3 className="font-bold mb-2 text-blue-400">Drive Traffic Back</h3>
                  <p className="text-gray-400 text-sm">
                    We link directly to original sources, sending readers to the real experts
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-bold mb-2 text-blue-400">Curate, Don't Create</h3>
                  <p className="text-gray-400 text-sm">
                    We aggregate the best information, but the credit belongs to those who created it
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners by Category */}
        {categories.map((category) => {
          const categoryPartners = partners.filter(p => p.category === category);
          return (
            <section key={category} className="py-16 border-b border-gray-800">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center text-white">{category}</h2>
                <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                  {categoryPartners.map((partner) => (
                    <a
                      key={partner.name}
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${partner.color} flex items-center justify-center text-2xl font-bold text-white`}>
                          {partner.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                            {partner.name}
                          </h3>
                          <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${partner.color} bg-clip-text text-transparent`}>
                            {partner.tagline}
                          </p>
                          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            {partner.description}
                          </p>
                          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors">
                            <span>Visit {partner.name}</span>
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Want to Join Our Expert Network?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              If you're a Utah publication, tourism board, or content creator, we'd love to feature and cite your work.
            </p>
            <a
              href="mailto:hello@slctrips.com?subject=Expert Network Partnership"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all hover:-translate-y-1 shadow-lg"
            >
              Get In Touch →
            </a>
          </div>
        </section>

        {/* Back to Homepage */}
        <section className="py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              ← Back to SLCTrips Home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
