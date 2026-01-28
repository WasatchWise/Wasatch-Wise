'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InteractiveMap from '@/components/InteractiveMap';
import DanVideoModal from '@/components/DanVideoModal';
import Image from 'next/image';
import { useState } from 'react';

export default function AboutPage() {
  const [showDanVideo, setShowDanVideo] = useState(false);
  const [userLanguage] = useState('en');

  function showDanIntro() {
    setShowDanVideo(true);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-blue-600/20 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">
              About SLCTrips
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              From a simple Google Map to a comprehensive Utah adventure platform
            </p>
          </div>
        </section>

        {/* Meet Dan Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Dan Image */}
                <div className="w-full md:w-1/2 flex justify-center relative">
                  <div className="relative group">
                    <div className="relative w-full max-w-md aspect-square cursor-pointer" onClick={showDanIntro}>
                      <Image
                        src="/images/danlogo.png"
                        alt="Daniel the Wasatch Sasquatch - Click to watch my introduction!"
                        fill
                        className="object-contain transition-all duration-300 hover:scale-105 hover:drop-shadow-2xl"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    {/* Click indicator */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      🎬 Click to watch Dan&apos;s introduction!
                    </div>
                  </div>
                </div>

                {/* Dan Description */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Meet Dan, the Wasatch Sasquatch
                  </h2>
                  <div className="text-lg text-gray-300 space-y-4 leading-relaxed">
                    <p>
                      I didn&apos;t get the mascot job with the hockey team. The Mammoth had thicker fur and better skates.
                      So now I&apos;m the guide for SLCTrips.com instead.
                    </p>
                    <p>
                      I spent almost twenty years around Liberty Park helping kids make music, videos, and wild ideas come to life.
                      These mountains and canyons raised me as much as any classroom.
                    </p>
                    <p>
                      People call me the Wasatch Sasquatch, but you can call me Dan. I&apos;ll help you find the trails worth walking,
                      the coffee that wakes your soul, and the Utah moments you can&apos;t buy in a gift shop.
                    </p>
                    <p className="text-xl text-yellow-400 font-semibold italic pt-4">
                      Wander wisely, travel kindly, and stay curious.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Where It All Began - Origin Story + Interactive Map */}
        <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4 font-bold text-sm">
                🗺️ THE ORIGIN STORY
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Where It All Began
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                Before SLCTrips became a platform, it started as a simple Google Map—a personal collection of places I loved around Salt Lake City.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                After spending nearly 20 years helping kids make music and videos around Liberty Park, I wanted to share the trails,
                coffee shops, and hidden Utah moments that couldn&apos;t be found in any guidebook. So I made a map. Then I made it public.
                Then{' '}
                <a
                  href="https://www.ksl.com/article/39904312/hit-the-road-salt-lake-man-creates-interactive-trip-planner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-semibold"
                >
                  KSL picked up the story
                </a>
                , and everything changed.
              </p>
              <div className="bg-gray-800/60 border border-yellow-400/30 rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-yellow-400 font-semibold mb-2 text-lg">
                  &quot;This is my guidebook to life in Utah. These are the places that matter.&quot;
                </p>
                <p className="text-gray-400 text-sm">— Dan, the Wasatch Sasquatch</p>
              </div>
            </div>
            <InteractiveMap />
            <div className="max-w-3xl mx-auto text-center mt-12">
              <p className="text-gray-400 mb-4">
                <span className="text-blue-400 font-semibold">This is the original map.</span> Every pin was placed by hand.
                Every category was chosen with care. It&apos;s not perfect—but it&apos;s real.
              </p>
              <p className="text-gray-300 text-lg">
                Today, SLCTrips has grown to <span className="text-yellow-400 font-bold">1,000+ destinations</span>,
                complete TripKits, and 29 county Guardians—but this map is where the dream started.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-gray-800/50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center text-white">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-5xl mb-4">🏔️</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">1,000+ Destinations</h3>
                <p className="text-gray-400">
                  Curated adventures from 30 minutes to 12 hours from SLC Airport
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">TripKits</h3>
                <p className="text-gray-400">
                  Complete adventure packages with routes, tips, and insider knowledge
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🧭</div>
                <h3 className="text-xl font-bold mb-2 text-blue-400">County Guardians</h3>
                <p className="text-gray-400">
                  29 mythical characters guiding you to hidden gems across Utah
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-white">Get In Touch</h2>
              <p className="text-xl text-gray-300 mb-8">
                Have questions or want to partner with us?
              </p>
              <a
                href="mailto:Dan@slctrips.com"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:-translate-y-1 shadow-lg"
              >
                Dan@slctrips.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Dan Video Modal */}
      <DanVideoModal
        isOpen={showDanVideo}
        onClose={() => setShowDanVideo(false)}
        language={userLanguage}
      />
    </>
  );
}
