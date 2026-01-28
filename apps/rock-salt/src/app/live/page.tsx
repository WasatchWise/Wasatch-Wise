import { Metadata } from 'next'
import LiveStreamPlayer from '@/components/LiveStreamPlayer'
import Container from '@/components/Container'

export const metadata: Metadata = {
  title: 'Listen Live | The Rock Salt',
  description: 'Live stream of local broadcasts and scheduled shows.',
}

// Use localhost for local development
// In production, you'll want to update this to your streaming server's public URL
const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || 'http://localhost:8000/rocksalt.mp3'

export default function LivePage() {
  return (
    <Container className="py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold text-zinc-100 mb-4">
            Listen Live
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Live stream for local broadcasts and scheduled shows.
          </p>
        </div>

        {/* Live Stream Player */}
        <LiveStreamPlayer
          streamUrl={STREAM_URL}
          title="The Rock Salt Live"
          description="Live stream for local broadcasts and scheduled shows."
        />

        {/* About the Stream */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-950 rounded-md p-6 border border-zinc-800">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              What you will hear
            </h2>
            <ul className="space-y-3 text-zinc-300">
              <li>Local bands and artists</li>
              <li>Independent and underground releases</li>
              <li>Live DJ sets and radio shows</li>
              <li>Premieres and unreleased tracks</li>
            </ul>
          </div>

          <div className="bg-zinc-950 rounded-md p-6 border border-zinc-800">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-4">
              Host a show
            </h2>
            <p className="text-zinc-400 mb-6">
              Contact us for streaming credentials and setup instructions.
            </p>
            <a
              href="mailto:music@therocksalt.com"
              className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-800 text-zinc-200 rounded-md hover:border-amber-500 transition-colors"
            >
              Get in touch
            </a>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-12 border border-zinc-800 rounded-md p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Stream not working
          </h3>
          <ul className="text-zinc-400 space-y-2 text-sm">
            <li>The stream may be offline when no DJ is broadcasting.</li>
            <li>Refresh the page or click play again.</li>
            <li>Ensure your browser allows audio playback.</li>
          </ul>
        </div>
      </div>
    </Container>
  )
}
