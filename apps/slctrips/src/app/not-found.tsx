import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
          <h2 className="text-3xl font-bold mb-4 text-white">Page Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/destinations"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Destinations
            </Link>
            <Link
              href="/guardians"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Meet the Guardians
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
