import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">
              Our Partners
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SLCTrips curates and cites—driving traffic to Utah's best publications, tourism boards, and outdoor experts.
              We're building a network that celebrates authentic exploration.
            </p>
          </div>
        </section>

        {/* Funofficial Partner */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/60 border-2 border-blue-500 rounded-xl p-8">
                <a
                  href="https://slcairport.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row items-center gap-6 hover:opacity-80 transition-opacity"
                >
                  <Image
                    src="/images/AirportLogo.png"
                    alt="Salt Lake City International Airport"
                    width={200}
                    height={96}
                    className="h-24 w-auto"
                    priority
                  />
                  <div className="text-center md:text-left flex-1">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">
                      ✨ Funofficial Partner
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Salt Lake City International Airport</h2>
                    <p className="text-gray-400">
                      The gateway to everywhere. From SLC Airport, you're just 30 minutes to 12+ hours from 1000+ incredible destinations.
                    </p>
                  </div>
                </a>
                <p className="text-gray-500 text-sm italic mt-6 text-center">
                  (Want to make it official? <a href="mailto:Dan@slctrips.com" className="text-blue-400 hover:text-blue-300 underline">Dan@slctrips.com</a>)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Expert Network Preview */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center">
                <span className="text-4xl mb-4 block">🤝</span>
                <h2 className="text-3xl font-bold mb-4 text-white">SLCTrips Expert Network</h2>
                <p className="text-xl text-gray-300 mb-6">
                  We curate and cite—always giving credit where it's due. Our network includes 15+ trusted sources from Utah's best publications, tourism boards, and outdoor experts.
                </p>
                <Link
                  href="/expert-network"
                  className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all hover:-translate-y-1 shadow-lg"
                >
                  View Full Expert Network →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Partner CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-900/20 to-yellow-900/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Want to Partner with SLCTrips?</h2>
              <p className="text-xl text-gray-300 mb-8">
                We're always looking to collaborate with Utah tourism experts, content creators, and local businesses.
              </p>
              <a
                href="mailto:Dan@slctrips.com"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all hover:-translate-y-1 shadow-lg"
              >
                Get in Touch →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
