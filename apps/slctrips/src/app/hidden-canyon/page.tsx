'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HiddenCanyonPage() {
  // Load TikTok embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-gray-900">
        {/* Hero Section - Matches TikTok Hook */}
        <section className="relative py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              22 Minutes from Downtown SLC
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Hidden Canyon Most Salt Lakers Walk Past Every Day
            </h1>

            <p className="text-xl text-emerald-100/80 mb-8 max-w-2xl mx-auto">
              You saw the TikTok. Now here&apos;s everything you need to explore Miller Park Bird Refuge
              &mdash; the secret urban canyon hiding in plain sight.
            </p>
          </div>
        </section>

        {/* TikTok Embed */}
        <section className="py-8 px-4">
          <div className="max-w-lg mx-auto">
            <blockquote
              className="tiktok-embed"
              cite="https://www.tiktok.com/@slctrips/video/7519024941371510071"
              data-video-id="7519024941371510071"
              style={{ maxWidth: '605px', minWidth: '325px' }}
            >
              <section>
                <a target="_blank" title="@slctrips" href="https://www.tiktok.com/@slctrips?refer=embed" rel="noopener noreferrer">@slctrips</a> 22 MINUTES!!! You&apos;d never guess this hidden canyon is in the middle of Salt Lake City Locals walk by every day and miss it. Would you hike it? <a title="SaltLakeCity" target="_blank" href="https://www.tiktok.com/tag/SaltLakeCity?refer=embed" rel="noopener noreferrer">#SaltLakeCity</a> <a title="HiddenGems" target="_blank" href="https://www.tiktok.com/tag/HiddenGems?refer=embed" rel="noopener noreferrer">#HiddenGems</a> <a title="MillerPark" target="_blank" href="https://www.tiktok.com/tag/MillerPark?refer=embed" rel="noopener noreferrer">#MillerPark</a> <a title="UtahHikes" target="_blank" href="https://www.tiktok.com/tag/UtahHikes?refer=embed" rel="noopener noreferrer">#UtahHikes</a> <a title="UrbanEscape" target="_blank" href="https://www.tiktok.com/tag/UrbanEscape?refer=embed" rel="noopener noreferrer">#UrbanEscape</a> <a title="SecretTrail" target="_blank" href="https://www.tiktok.com/tag/SecretTrail?refer=embed" rel="noopener noreferrer">#SecretTrail</a> <a title="NatureInTheCity" target="_blank" href="https://www.tiktok.com/tag/NatureInTheCity?refer=embed" rel="noopener noreferrer">#NatureInTheCity</a> <a title="SLCAdventures" target="_blank" href="https://www.tiktok.com/tag/SLCAdventures?refer=embed" rel="noopener noreferrer">#SLCAdventures</a> <a title="TikTokTravel" target="_blank" href="https://www.tiktok.com/tag/TikTokTravel?refer=embed" rel="noopener noreferrer">#TikTokTravel</a> <a title="slctrips" target="_blank" href="https://www.tiktok.com/tag/slctrips?refer=embed" rel="noopener noreferrer">#slctrips</a> <a target="_blank" title="original sound - SLC Trips - SLCTrips" href="https://www.tiktok.com/music/original-sound-SLC-Trips-7519025074049960759?refer=embed" rel="noopener noreferrer">♬ original sound - SLC Trips - SLCTrips</a>
              </section>
            </blockquote>
          </div>
        </section>

        {/* The Details */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-white mb-6">What You Need to Know</h2>

              <div className="space-y-6 text-emerald-100/90">
                <div className="flex gap-4">
                  <div className="text-3xl">📍</div>
                  <div>
                    <h3 className="font-semibold text-white">Location</h3>
                    <p>Miller Park Bird Refuge, ~900 S 1500 E, Salt Lake City</p>
                    <p className="text-sm text-emerald-200/60 mt-1">22 minutes from downtown, 13 min from the airport</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">🥾</div>
                  <div>
                    <h3 className="font-semibold text-white">The Trail</h3>
                    <p>Easy walking paths wind through a hidden riparian canyon. Feels like you teleported out of the city.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">🦅</div>
                  <div>
                    <h3 className="font-semibold text-white">Wildlife</h3>
                    <p>Bird refuge = actual birds. Bring binoculars. Early morning is best for sightings.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <h3 className="font-semibold text-white">Cost</h3>
                    <p className="text-emerald-300 font-semibold">Free. Always.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">🅿️</div>
                  <div>
                    <h3 className="font-semibold text-white">Parking</h3>
                    <p>Street parking available along 900 S. Small lot at the park entrance.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl">⏱️</div>
                  <div>
                    <h3 className="font-semibold text-white">Time Needed</h3>
                    <p>30-60 minutes for a relaxed walk. Longer if you&apos;re birding.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Local Tips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-emerald-100">
                  <span className="font-semibold text-white">Best time:</span> Early morning or golden hour.
                  Fewer people, better light, more birds.
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-emerald-100">
                  <span className="font-semibold text-white">Combine with:</span> Grab coffee at
                  9th & 9th district (5 min away) before or after.
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-emerald-100">
                  <span className="font-semibold text-white">Summer:</span> Shaded canyon stays
                  cooler than the city. Good escape from the heat.
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-emerald-100">
                  <span className="font-semibold text-white">Dogs:</span> Allowed on leash.
                  Please clean up &mdash; it&apos;s a bird refuge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want More Hidden Gems Like This?
            </h2>
            <p className="text-emerald-100/80 mb-8">
              We&apos;ve mapped 1,600+ spots around Salt Lake that most people never find.
              Get our free guide to the best hidden destinations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
              >
                Explore 1,600+ Destinations
              </Link>
              <Link
                href="/tripkits/utah-unlocked"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-colors"
              >
                Get Free TripKit
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Map Link */}
        <section className="py-8 px-4 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <a
              href="https://maps.google.com/?q=Miller+Park+Bird+Refuge+Salt+Lake+City"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <span className="text-2xl">🗺️</span>
              <span>Open in Google Maps</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
